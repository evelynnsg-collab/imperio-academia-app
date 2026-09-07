// ─── FIREBASE CONFIG ──────────────────────────────────────────────────────────
import { initializeApp, getApps } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, onSnapshot, serverTimestamp, query, orderBy } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAaNDr6O36T_VCCk1p4iK29npFA2o92JwM",
  authDomain: "imperio-academia.firebaseapp.com",
  projectId: "imperio-academia",
  storageBucket: "imperio-academia.firebasestorage.app",
  messagingSenderId: "583980259345",
  appId: "1:583980259345:web:9425a8afb1325a66b779b0"
};

const fbApp = getApps().find(app => app.name === "[DEFAULT]") || initializeApp(firebaseConfig);
const fbAuth = getAuth(fbApp);
const db = getFirestore(fbApp);

// Auth secundário: cria/redefine contas de alunos sem trocar a sessão do admin/nutri.
const fbSecondaryApp = getApps().find(app => app.name === "imperio-secondary-auth") || initializeApp(firebaseConfig, "imperio-secondary-auth");
const fbSecondaryAuth = getAuth(fbSecondaryApp);

// ─── UPLOAD DE ARQUIVOS (Cloudinary) ───────────────────────────────────────────
// Fotos, GIFs e vídeos de exercícios/evolução agora sobem pro Cloudinary em vez
// do Firebase Storage — mesma ideia (link estável de volta), mas gerenciável
// direto pelo painel do Cloudinary (dfz6xf14).
const CLOUDINARY_CLOUD_NAME = "dfz6xf14";
const CLOUDINARY_UPLOAD_PRESET = "ml_default"; // preset "sem assinatura" configurado no Cloudinary

function uploadToCloudinary(file, onProgress) {
  return new Promise((resolve, reject) => {
    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          resolve({ url: res.secure_url, publicId: res.public_id });
        } catch (e) { reject(new Error("Resposta inválida do Cloudinary")); }
      } else {
        let msg = "Falha no upload (status " + xhr.status + ")";
        try { msg = JSON.parse(xhr.responseText)?.error?.message || msg; } catch(e) {}
        reject(new Error(msg));
      }
    };
    xhr.onerror = () => reject(new Error("Erro de rede no upload"));
    xhr.send(formData);
  });
}

// ─── FIREBASE HELPERS ─────────────────────────────────────────────────────────
// Salva aluno no Firestore
async function salvarAluno(aluno) {
  await setDoc(doc(db, "alunos", aluno.id), aluno);
}
// Busca todos os alunos
async function buscarAlunos() {
  const snap = await getDocs(collection(db, "alunos"));
  return snap.docs.map(d => d.data());
}
// Deleta aluno
async function deletarAluno(id) {
  await deleteDoc(doc(db, "alunos", id));
  // Deleta auth user via Admin SDK não é possível no client —
  // deixamos o registro de auth, mas removemos os dados
}
// Cria conta de aluno no Firebase Auth (email = cpf@imperio.app, senha = cpf)
async function criarContaAluno(cpf, senha) {
  const email = `${cpf}@imperio.app`;
  try {
    await createUserWithEmailAndPassword(fbSecondaryAuth, email, senha || cpf);
  } catch(e) {
    if (e.code !== "auth/email-already-in-use") throw e;
  } finally {
    if (fbSecondaryAuth.currentUser) {
      try { await signOut(fbSecondaryAuth); } catch(e) {}
    }
  }
}
// Corrige o CPF de um aluno: recria o acesso de login com o CPF certo
// (senha redefinida pro novo CPF) e move os dados pro novo documento.
async function migrarCpfAluno(dadosCompletos, cpfAntigo, cpfNovo) {
  await criarContaAluno(cpfNovo, cpfNovo);
  await salvarAluno({ ...dadosCompletos, cpf:cpfNovo, id:cpfNovo });
  if (cpfAntigo && cpfAntigo !== cpfNovo) {
    await deletarAluno(cpfAntigo);
  }
}

export {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  fbAuth,
  db,
  fbSecondaryAuth,
  uploadToCloudinary,
  salvarAluno,
  buscarAlunos,
  deletarAluno,
  criarContaAluno,
  migrarCpfAluno,
};
