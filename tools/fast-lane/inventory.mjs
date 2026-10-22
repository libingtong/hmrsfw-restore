#!/usr/bin/env node
// Fast-lane inventory (HM-48): the pages HM-34's fast lane landed on hmrsfw-vue `restore/fast-lane` (results/*.json) that still
// need the formal gate (recording + replay + interaction compare), grouped by site and identity (`role`). Re-run any time:
// batches landing later are picked up from their results files.
//   node tools/fast-lane/inventory.mjs [--write] [--md] [--ids]
//   --write  also write $RESTORE_STATE/fast-lane/inventory.json (the scheduler reads the live results itself; this is the
//            copy people and other tools look at)
//   --md     markdown summary (counts per site/role, pages without a decided role, blocked-in-batch pages)
//   --ids    one page id per line, in recording order (portal first, then user center by role)
// Output otherwise: one JSON line {total, recordable, groups, batchBlocked, accepted, notInQueue}. No HAR, account or test data.
import { mkdirSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import { TOOL_ROOT } from "../lib/workorders.mjs";
import { fastLaneInventory } from "../lib/fastlane.mjs";

const argv = process.argv.slice(2);
const inv = fastLaneInventory({ toolRoot: TOOL_ROOT });
const ROLE = { general: "普通用户/通用", jobseeker: "求职者", corp: "招聘单位", mentor: "职业导师" };

if (argv.includes("--write")) {
  if (!process.env.RESTORE_STATE) throw new Error("--write needs RESTORE_STATE");
  const dir = path.join(process.env.RESTORE_STATE, "fast-lane");
  mkdirSync(dir, { recursive: true });
  const tmp = path.join(dir, `.inventory.${process.pid}.tmp`);
  writeFileSync(tmp, JSON.stringify({ generatedAt: new Date().toISOString(), ...inv }, null, 1));
  renameSync(tmp, path.join(dir, "inventory.json"));
}
if (argv.includes("--ids")) console.log(inv.pages.filter((p) => p.role).map((p) => p.id).join("\n"));
else if (argv.includes("--md")) {
  const rows = Object.entries(inv.groups).map(([k, n]) => { const [app, role] = k.split("/"); return `| ${app === "portal" ? "门户" : "用户中心"} | ${ROLE[role] || role} | ${n} |`; });
  const nr = inv.pages.filter((p) => !p.role);
  console.log([`待补页面共 ${inv.total} 页，其中可录制 ${inv.recordable} 页，待定身份 ${nr.length} 页。`, "", "| 站点 | 身份 | 页数 |", "| --- | --- | --- |", ...rows, "",
    `批次里已阻塞、不在清单内的页：${inv.batchBlocked.length} 条。`].join("\n"));
} else console.log(JSON.stringify({ total: inv.total, recordable: inv.recordable, groups: inv.groups, batchBlocked: inv.batchBlocked.length, accepted: inv.accepted.length, notInQueue: inv.notInQueue }));
