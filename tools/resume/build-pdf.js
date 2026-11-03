// Prints tools/resume/resume-print.html to assets/resume/Sthitapragna-Kollepara-Resume.pdf
// with headless Microsoft Edge. Run from the site root: node tools/resume/build-pdf.js
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const SITE = path.resolve(__dirname, "../..");
const SRC = path.join(__dirname, "resume-print.html");
const OUT = path.join(SITE, "assets/resume/Sthitapragna-Kollepara-Resume.pdf");
const EDGE = [
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
].find((p) => fs.existsSync(p));
if (!EDGE) throw new Error("Microsoft Edge not found");

execFileSync(EDGE, [
  "--headless=new",
  "--disable-gpu",
  "--no-pdf-header-footer",
  // Time for the web font to arrive before printing.
  "--virtual-time-budget=15000",
  `--print-to-pdf=${OUT}`,
  pathToFileURL(SRC).href,
], { stdio: "inherit" });

console.log(`${path.relative(SITE, OUT)}: ${(fs.statSync(OUT).size / 1024).toFixed(0)} KB`);
