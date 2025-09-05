import { writeFileSync } from "fs";
import { execSync } from "child_process";
const sha = execSync("git rev-parse --short HEAD").toString().trim();
const msg = execSync('git log -1 --pretty=%s').toString().trim();
const now = new Date().toISOString();
writeFileSync("public/status.txt",
`ok
app: urwebs
version: ${sha}
buildTime: ${now}
commit: ${msg}
`);
