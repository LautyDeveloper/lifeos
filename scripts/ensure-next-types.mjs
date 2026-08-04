import fs from "node:fs"
import path from "node:path"

const roots = [
  path.join(process.cwd(), ".next", "types"),
  path.join(process.cwd(), ".next", "dev", "types"),
]

for (const root of roots) {
  const declarationPath = path.join(root, "routes.d.ts")
  const runtimePath = path.join(root, "routes.js")

  if (!fs.existsSync(declarationPath) || fs.existsSync(runtimePath)) {
    continue
  }

  fs.writeFileSync(runtimePath, "export {}\n", "utf8")
}
