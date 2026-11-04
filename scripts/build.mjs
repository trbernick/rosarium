// Copies the web app into www/ for Capacitor and adds the native plugin bundles.
// The repo root stays the GitHub Pages site; www/ is only for the iOS/Android apps.
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const OUT = "www";
rmSync(OUT, { recursive: true, force: true });
mkdirSync(`${OUT}/vendor`, { recursive: true });

for (const f of ["index.html", "manifest.webmanifest", "icons", "fonts"]) {
  cpSync(f, `${OUT}/${f}`, { recursive: true });
}
cpSync("node_modules/@capacitor/core/dist/capacitor.js", `${OUT}/vendor/capacitor.js`);
cpSync("node_modules/@capacitor-community/keep-awake/dist/plugin.js", `${OUT}/vendor/keep-awake.js`);

const html = readFileSync("index.html", "utf8");
const tags = `<script src="vendor/capacitor.js"></script>\n<script src="vendor/keep-awake.js"></script>\n<script>`;
if (!html.includes("\n<script>")) throw new Error("index.html: main <script> tag not found");
writeFileSync(`${OUT}/index.html`, html.replace("\n<script>", "\n" + tags));

console.log("Built www/");
