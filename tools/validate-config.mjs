// Validates a project's restore.config.json against schema/restore.config.schema.json (docs/generic/config-schema.md).
// No dependencies: a JSON Schema validator for the subset of draft 2020-12 the schema uses. A keyword outside that subset
// throws instead of being ignored, so the schema cannot silently grow past what this checks (tests cross-check with ajv).
// On top of the schema it checks what JSON Schema cannot: unique app names/sites and escalation categories, every
// testOrigin host is in recording.allowedHosts, machines without secrets carry no secret-holding role, and (unless
// --no-files) that legacyDist and its entry/vue chunks exist under the data root (default: the config's directory).
// Usage: node tools/validate-config.mjs [restore.config.json] [--schema <file>] [--data-root <dir>] [--no-files]
// Output: one JSON line {ok, config, errors:[{path, message}], warnings:[]}; exit 1 when errors is not empty.
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const SCHEMA_PATH = path.join(ROOT, "schema/restore.config.schema.json");
const ANNOTATIONS = new Set(["$schema", "$id", "$defs", "title", "description"]);
const typeOf = (v) => (v === null ? "null" : Array.isArray(v) ? "array" : Number.isInteger(v) ? "integer" : typeof v);
const isType = (v, t) => typeOf(v) === t || (t === "number" && typeOf(v) === "integer");
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// Returns [{path, message}]; path is a JSON pointer into the data.
export function validate(schema, data, root = schema, at = "") {
  const errs = [];
  const err = (message, p = at) => errs.push({ path: p || "/", message });
  for (const [k, s] of Object.entries(schema)) {
    if (ANNOTATIONS.has(k)) continue;
    switch (k) {
      case "$ref": {
        if (!s.startsWith("#/$defs/")) throw new Error(`unsupported $ref ${s}`);
        const def = root.$defs?.[s.slice(8)];
        if (!def) throw new Error(`unknown $ref ${s}`);
        errs.push(...validate(def, data, root, at));
        break;
      }
      case "type": if (![].concat(s).some((t) => isType(data, t))) err(`must be ${[].concat(s).join("|")}, got ${typeOf(data)}`); break;
      case "const": if (!eq(data, s)) err(`must be ${JSON.stringify(s)}`); break;
      case "enum": if (!s.some((x) => eq(x, data))) err(`must be one of ${s.map((x) => JSON.stringify(x)).join(", ")}`); break;
      case "pattern": if (typeof data === "string" && !new RegExp(s, "u").test(data)) err(`does not match ${s}`); break;
      case "minLength": if (typeof data === "string" && [...data].length < s) err(`shorter than ${s}`); break;
      case "minItems": if (Array.isArray(data) && data.length < s) err(`fewer than ${s} items`); break;
      case "maxItems": if (Array.isArray(data) && data.length > s) err(`more than ${s} items`); break;
      case "uniqueItems": if (s && Array.isArray(data) && new Set(data.map((x) => JSON.stringify(x))).size !== data.length) err("items must be unique"); break;
      case "items": if (Array.isArray(data)) data.forEach((x, i) => errs.push(...validate(s, x, root, `${at}/${i}`))); break;
      case "contains": if (Array.isArray(data) && !data.some((x) => !validate(s, x, root).length)) err(`no item matches ${JSON.stringify(s)}`); break;
      case "required": if (typeOf(data) === "object") for (const r of s) if (!(r in data)) err(`missing required "${r}"`); break;
      case "properties": if (typeOf(data) === "object") for (const [p, ps] of Object.entries(s)) if (p in data) errs.push(...validate(ps, data[p], root, `${at}/${p}`)); break;
      case "additionalProperties": {
        if (typeOf(data) !== "object") break;
        for (const p of Object.keys(data).filter((p) => !(schema.properties && p in schema.properties))) {
          if (s === false) err(`unknown property "${p}"`, `${at}/${p}`);
          else if (typeof s === "object") errs.push(...validate(s, data[p], root, `${at}/${p}`));
        }
        break;
      }
      case "allOf": for (const sub of s) errs.push(...validate(sub, data, root, at)); break;
      case "anyOf": if (!s.some((sub) => !validate(sub, data, root, at).length)) err("matches none of anyOf"); break;
      default: throw new Error(`schema keyword "${k}" is not supported by validate-config.mjs`);
    }
  }
  return errs;
}

// Checks JSON Schema cannot express. Only meaningful on a config that already passed the schema (validateConfigFile
// skips it otherwise). dataRoot = data repo checkout; legacyDist and projectNotes are relative to it.
export const SECRET_ROLES = ["gate", "recorder", "fixer", "arbiter"]; // roles that need HAR, login state or keys
export function semanticCheck(cfg, dataRoot, { files = true } = {}) {
  const errors = [], warnings = [];
  const apps = cfg.apps;
  const dup = (vals) => vals.filter((v, i) => vals.indexOf(v) !== i);
  for (const n of new Set(dup(apps.map((a) => a.name)))) errors.push({ path: "/apps", message: `duplicate app name "${n}"` });
  for (const n of new Set(dup(apps.map((a) => a.site ?? a.name)))) errors.push({ path: "/apps", message: `duplicate app site "${n}"` });
  for (const n of new Set(dup(cfg.escalation.categories.map((c) => c.id)))) errors.push({ path: "/escalation/categories", message: `duplicate category "${n}"` });
  (cfg.machines ?? []).forEach((m, i) => {
    const bad = m.holdsSecrets === false ? (m.roles ?? []).filter((r) => SECRET_ROLES.includes(r)) : [];
    if (bad.length) errors.push({ path: `/machines/${i}/roles`, message: `holdsSecrets is false but roles include ${bad.join(", ")}` });
  });
  const allowed = new Set(cfg.recording.allowedHosts);
  apps.forEach((a, i) => {
    if (a.testOrigin) {
      let host = null;
      try { host = new URL(a.testOrigin).host; } catch {}
      if (!host || !allowed.has(host)) errors.push({ path: `/apps/${i}/testOrigin`, message: `host ${host ?? a.testOrigin} is not in recording.allowedHosts` });
    }
    if (!files) return;
    const dist = path.resolve(dataRoot, a.legacyDist);
    if (!existsSync(dist)) { errors.push({ path: `/apps/${i}/legacyDist`, message: `${a.legacyDist} does not exist` }); return; }
    for (const k of ["entryChunk", "vueChunk"]) if (a[k] && !existsSync(path.join(dist, "assets", a[k]))) errors.push({ path: `/apps/${i}/${k}`, message: `${a.legacyDist}/assets/${a[k]} does not exist` });
  });
  if (files && !existsSync(path.resolve(dataRoot, cfg.projectNotes))) warnings.push(`projectNotes ${cfg.projectNotes} does not exist yet`);
  return { errors, warnings };
}

// dataRoot defaults to the config file's directory (the config sits at the data repo root).
export function validateConfigFile(file, { schemaFile = SCHEMA_PATH, files = true, dataRoot = path.dirname(path.resolve(file)) } = {}) {
  const schema = JSON.parse(readFileSync(schemaFile, "utf8"));
  let cfg;
  try { cfg = JSON.parse(readFileSync(file, "utf8")); } catch (e) { return { ok: false, config: file, errors: [{ path: "/", message: `cannot read JSON: ${e.message}` }], warnings: [] }; }
  const errors = validate(schema, cfg);
  if (errors.length) return { ok: false, config: file, errors, warnings: ["semantic checks skipped: fix the schema errors first"] };
  const sem = semanticCheck(cfg, dataRoot, { files });
  return { ok: !sem.errors.length, config: file, errors: sem.errors, warnings: sem.warnings };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const argv = process.argv.slice(2);
  const opt = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : undefined; };
  const VALUED = new Set(["--schema", "--data-root"]);
  const file = argv.find((a, i) => !a.startsWith("--") && !VALUED.has(argv[i - 1])) ?? path.join(ROOT, "restore.config.json");
  let out;
  try {
    out = validateConfigFile(file, { schemaFile: opt("--schema") ?? SCHEMA_PATH, files: !argv.includes("--no-files"), ...(opt("--data-root") ? { dataRoot: path.resolve(opt("--data-root")) } : {}) });
  } catch (e) { out = { ok: false, config: file, errors: [{ path: "/", message: e.message }], warnings: [] }; }
  process.stdout.write(JSON.stringify(out) + "\n");
  process.exitCode = out.ok ? 0 : 1;
}
