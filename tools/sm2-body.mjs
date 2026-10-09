// SM2 request-body decryption for interaction comparison (plan §4.2/4.3), matching the original frontend
// (sm-crypto sm2.doEncrypt(json, publicKey, cipherMode=1 → C1C3C2)) and the backend (Sm2Util, C1C3C2, "04" prefix optional).
// The private key is read ONLY from the environment (SM2_PRIVATE_KEY); it is never logged or written.
// Library use:  import { decryptBody } from "./sm2-body.mjs";  decryptBody(cipherHex) -> parsed JSON (in memory only)
// Self-test:    node tools/sm2-body.mjs --selftest   (uses a freshly generated throwaway key pair, no real key involved)
import smCrypto from "sm-crypto";
import { pathToFileURL } from "node:url";
const { sm2 } = smCrypto;
const MODE = 1; // C1C3C2, from the original bundle (dE = 1) and backend Sm2Util (Mode.C1C3C2)
export function decryptBody(cipherHex, privateKey = process.env.SM2_PRIVATE_KEY) {
  if (!privateKey) throw new Error("SM2_PRIVATE_KEY is not set");
  const hex = String(cipherHex).replace(/^04/, ""); // sm-crypto expects the ciphertext without the 04 point prefix
  const plain = sm2.doDecrypt(hex, privateKey, MODE);
  if (!plain) throw new Error("SM2 decryption failed (wrong key or not an SM2 ciphertext)");
  try { return JSON.parse(plain); } catch { return plain; }
}
// Canonical form for comparison: sorted keys, so two requests with the same parameters compare equal.
export const canonical = (v) => JSON.stringify(v, (k, x) => (x && typeof x === "object" && !Array.isArray(x) ? Object.fromEntries(Object.keys(x).sort().map((key) => [key, x[key]])) : x));
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href && process.argv.includes("--selftest")) {
  const { privateKey, publicKey } = sm2.generateKeyPairHex();
  const samples = [{ pageNo: 1, pageSize: 10, keyword: "测试", nested: { a: [1, 2], b: null } }, { id: "1903022227748134914" }, {}];
  let ok = 0;
  for (const s of samples) {
    const json = JSON.stringify(s);
    const c1 = sm2.doEncrypt(json, publicKey, MODE), c2 = sm2.doEncrypt(json, publicKey, MODE);
    const differs = c1 !== c2; // SM2 is randomized: same plaintext → different ciphertext
    const d1 = decryptBody(c1, privateKey), d2 = decryptBody("04" + c2, privateKey); // with and without 04 prefix
    const same = canonical(d1) === canonical(s) && canonical(d2) === canonical(s);
    console.log(`sample ${JSON.stringify(Object.keys(s))}: ciphertexts differ=${differs} decrypt+canonical equal=${same}`);
    if (differs && same) ok++;
  }
  let wrongKeyRejected = false; try { decryptBody(sm2.doEncrypt("{}", publicKey, MODE), sm2.generateKeyPairHex().privateKey); } catch { wrongKeyRejected = true; }
  console.log(`wrong key rejected=${wrongKeyRejected}`);
  console.log(ok === samples.length && wrongKeyRejected ? "SELFTEST PASS" : "SELFTEST FAIL");
  process.exitCode = ok === samples.length && wrongKeyRejected ? 0 : 1;
}
