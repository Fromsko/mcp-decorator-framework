import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const args = process.argv.slice(2);
const pkg = args[0];
const type = args[1] || "patch";

const packages = {
  root: "package.json",
  core: "packages/core/package.json",
  math: "packages/plugin-math/package.json",
  filesystem: "packages/plugin-filesystem/package.json",
  http: "packages/plugin-http/package.json",
  memory: "packages/plugin-memory/package.json",
};

function bumpVersion(version, type) {
  const parts = version.split(".").map(Number);
  switch (type) {
    case "major":
      return `${parts[0] + 1}.0.0`;
    case "minor":
      return `${parts[0]}.${parts[1] + 1}.0`;
    case "patch":
    default:
      return `${parts[0]}.${parts[1]}.${parts[2] + 1}`;
  }
}

function updatePackage(pkgPath) {
  const fullPath = resolve(pkgPath);
  const data = JSON.parse(readFileSync(fullPath, "utf8"));
  const oldVersion = data.version;
  const newVersion = bumpVersion(oldVersion, type);
  data.version = newVersion;
  writeFileSync(fullPath, JSON.stringify(data, null, 2) + "\n");
  return { oldVersion, newVersion };
}

function syncCoreDeps(coreVersion) {
  ["math", "filesystem", "http", "memory"].forEach((name) => {
    const pkgPath = packages[name];
    const data = JSON.parse(readFileSync(pkgPath, "utf8"));
    // Use workspace protocol for monorepo - pnpm will convert on publish
    if (data.dependencies && data.dependencies["@mcp-decorator/core"]) {
      data.dependencies["@mcp-decorator/core"] = "workspace:^";
    }
    if (data.peerDependencies && data.peerDependencies["@mcp-decorator/core"]) {
      data.peerDependencies["@mcp-decorator/core"] = `^${coreVersion}`;
    }
    writeFileSync(pkgPath, JSON.stringify(data, null, 2) + "\n");
  });
}

if (pkg === "all") {
  console.log(`Bumping all packages (${type})...\n`);

  Object.entries(packages).forEach(([name, pkgPath]) => {
    const { oldVersion, newVersion } = updatePackage(pkgPath);
    console.log(`[OK] ${name}: ${oldVersion} -> ${newVersion}`);

    if (name === "core") {
      syncCoreDeps(newVersion);
      console.log(`[OK] Synced core@${newVersion} to plugins`);
    }
  });

  console.log("\n[OK] All packages bumped successfully");
} else if (packages[pkg]) {
  const { oldVersion, newVersion } = updatePackage(packages[pkg]);
  console.log(`[OK] ${pkg}: ${oldVersion} -> ${newVersion}`);

  if (pkg === "core") {
    syncCoreDeps(newVersion);
    console.log(`[OK] Synced core@${newVersion} to plugins`);
  }
} else {
  console.error(`[!] Unknown package: ${pkg}`);
  console.error("Available: root, core, math, filesystem, http, memory, all");
  process.exit(1);
}
