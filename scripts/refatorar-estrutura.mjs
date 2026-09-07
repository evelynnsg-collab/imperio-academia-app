import fs from "node:fs";
import path from "node:path";

const appPath = "src/App.jsx";
let src = fs.readFileSync(appPath, "utf8");
const originalLines = src.split("\n").length;
const originalBytes = Buffer.byteLength(src, "utf8");

function requireMarker(text, label) {
  const i = src.indexOf(text);
  if (i < 0) throw new Error(`Marcador não encontrado: ${label}`);
  return i;
}

fs.mkdirSync("src/services", { recursive: true });
fs.mkdirSync("src/data", { recursive: true });

// 1) Move Firebase + Cloudinary + helpers para um módulo de serviço.
if (!fs.existsSync("src/services/backend.js")) {
  const backendStartMarker = "// ─── FIREBASE CONFIG";
  const backendEndMarker = "// ─── IMAGENS REAIS DE EXERCÍCIOS";
  const start = requireMarker(backendStartMarker, "início backend");
  const end = requireMarker(backendEndMarker, "fim backend");
  const backendBlock = src.slice(start, end).trim();

  const backendFile = `${backendBlock}\n\nexport {\n  fbAuth,\n  db,\n  fbSecondaryAuth,\n  uploadToCloudinary,\n  salvarAluno,\n  buscarAlunos,\n  deletarAluno,\n  criarContaAluno,\n  migrarCpfAluno,\n};\n`;
  fs.writeFileSync("src/services/backend.js", backendFile, "utf8");
  src = src.slice(0, start) + src.slice(end);
}

// 2) Move o catálogo fixo de exercícios para arquivo de dados.
if (!fs.existsSync("src/data/exercises.js")) {
  const dataStartMarker = "const BIBLIOTECA_FULL = [";
  const dataEndMarker = "const BIBLIOTECA = BIBLIOTECA_FULL;";
  const start = requireMarker(dataStartMarker, "início catálogo de exercícios");
  const endStart = requireMarker(dataEndMarker, "fim catálogo de exercícios");
  const end = endStart + dataEndMarker.length;
  const dataBlock = src.slice(start, end).trim();

  const dataFile = `// Catálogo fixo de exercícios do IMPÉRIO Academia.\n// Separado do componente principal para manter o App.jsx leve e legível.\n${dataBlock}\n\nexport { BIBLIOTECA_FULL, BIBLIOTECA };\n`;
  fs.writeFileSync("src/data/exercises.js", dataFile, "utf8");
  src = src.slice(0, start) + src.slice(end);
}

// 3) Adiciona os imports dos módulos extraídos logo após os imports principais.
const importAnchor = 'import html2canvas from "html2canvas";';
if (!src.includes('from "./services/backend.js"')) {
  const backendImport = `import {\n  fbAuth,\n  db,\n  fbSecondaryAuth,\n  uploadToCloudinary,\n  salvarAluno,\n  buscarAlunos,\n  deletarAluno,\n  criarContaAluno,\n  migrarCpfAluno,\n} from "./services/backend.js";`;
  src = src.replace(importAnchor, `${importAnchor}\n${backendImport}`);
}
if (!src.includes('from "./data/exercises.js"')) {
  const dataImport = 'import { BIBLIOTECA_FULL, BIBLIOTECA } from "./data/exercises.js";';
  src = src.replace(importAnchor, `${importAnchor}\n${dataImport}`);
}

// Limpeza leve de excesso de linhas vazias criado pelas extrações.
src = src.replace(/\n{4,}/g, "\n\n\n");
fs.writeFileSync(appPath, src, "utf8");

const finalLines = src.split("\n").length;
const finalBytes = Buffer.byteLength(src, "utf8");
const backendLines = fs.readFileSync("src/services/backend.js", "utf8").split("\n").length;
const dataLines = fs.readFileSync("src/data/exercises.js", "utf8").split("\n").length;

console.log(`✅ Refatoração estrutural aplicada.`);
console.log(`App.jsx: ${originalLines} → ${finalLines} linhas (${originalLines-finalLines} linhas removidas do arquivo principal)`);
console.log(`App.jsx: ${originalBytes} → ${finalBytes} bytes`);
console.log(`backend.js: ${backendLines} linhas`);
console.log(`exercises.js: ${dataLines} linhas`);
