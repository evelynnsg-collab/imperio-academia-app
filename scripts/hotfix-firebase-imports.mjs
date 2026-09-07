import fs from "node:fs";

const appPath = "src/App.jsx";
const backendPath = "src/services/backend.js";
let app = fs.readFileSync(appPath, "utf8");
let backend = fs.readFileSync(backendPath, "utf8");

const names = [
  "signInWithEmailAndPassword",
  "signOut",
  "onAuthStateChanged",
  "doc",
  "getDoc",
  "setDoc",
  "updateDoc",
  "deleteDoc",
  "collection",
  "getDocs",
  "onSnapshot",
  "serverTimestamp",
  "query",
  "orderBy",
];

if (!backend.includes("  onAuthStateChanged,\n")) {
  const extra = names.map(n => `  ${n},`).join("\n") + "\n";
  backend = backend.replace("export {\n", "export {\n" + extra);
}
fs.writeFileSync(backendPath, backend, "utf8");

const importStart = 'import {\n  fbAuth,';
const importEnd = '} from "./services/backend.js";';
const start = app.indexOf(importStart);
const end = app.indexOf(importEnd, start);
if (start < 0 || end < 0) throw new Error("Import do backend não encontrado no App.jsx");
const blockEnd = end + importEnd.length;
let block = app.slice(start, blockEnd);
for (const n of names) {
  if (!new RegExp(`\\b${n},`).test(block)) {
    block = block.replace("  fbAuth,\n", `  fbAuth,\n  ${n},\n`);
  }
}
app = app.slice(0, start) + block + app.slice(blockEnd);
fs.writeFileSync(appPath, app, "utf8");
console.log("✅ Imports Firebase restaurados");
