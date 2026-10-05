// styles.css = everything above the H2O block + scratch h2o.css (the H2O block is last in the file).
const fs = require("fs");
const path = require("path");
const F = path.resolve(__dirname, "../../styles.css");
const css = fs.readFileSync(F, "utf8").replace(/\r\n/g, "\n");
const H = css.search(/\/\* =+\n   H2O CONNECT/);
if (H < 0) throw new Error("h2o marker");
const block = fs.readFileSync(__dirname + "/h2o.css", "utf8").replace(/\r\n/g, "\n");
fs.writeFileSync(F, css.slice(0, H).replace(/\s*$/, "\n") + block.replace(/^\s*/, "\n"));
console.log("synced");
