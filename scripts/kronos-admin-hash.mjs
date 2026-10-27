#!/usr/bin/env node
// Prints a KRONOS_ADMIN_PASSWORD_HASH value for the /babo operator panel.
//   node scripts/kronos-admin-hash.mjs            (reads the password from stdin)
// The password itself is never stored anywhere; only this hash goes into the environment.
import { randomBytes, scryptSync } from "node:crypto";

const chunks = [];
for await (const c of process.stdin) chunks.push(c);
const password = Buffer.concat(chunks).toString("utf8").replace(/\r?\n$/, "");
if (password.length < 12) {
  console.error("Use a password of at least 12 characters.");
  process.exit(1);
}
const salt = randomBytes(16);
const hash = scryptSync(password, salt, 32, { N: 16384, r: 8, p: 1 });
console.log(`scrypt$${salt.toString("base64url")}$${hash.toString("base64url")}`);
