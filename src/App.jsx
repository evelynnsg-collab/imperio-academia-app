import { useState, useRef, useEffect, useCallback } from "react";

// ─── FIREBASE CONFIG ──────────────────────────────────────────────────────────
import { initializeApp } from "firebase/app";
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

import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject, listAll } from "firebase/storage";

const fbApp  = initializeApp(firebaseConfig);
const fbAuth = getAuth(fbApp);
const db     = getFirestore(fbApp);
const storage = getStorage(fbApp);

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
    await createUserWithEmailAndPassword(fbAuth, email, senha || cpf);
  } catch(e) {
    if (e.code !== "auth/email-already-in-use") throw e;
  }
}


// ─── IMAGENS REAIS DE EXERCÍCIOS (Free Exercise DB — domínio público) ─────────
const IMG_BASE = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";
const EX_IMGS = {
  // Peito
  "Supino Reto com Barra":      IMG_BASE + "Barbell_Bench_Press_-_Medium_Grip/0.jpg",
  "Supino Inclinado com Halteres": IMG_BASE + "Incline_Dumbbell_Press/0.jpg",
  "Crucifixo com Halteres":     IMG_BASE + "Dumbbell_Flyes/0.jpg",
  "Crossover no Cabo":          IMG_BASE + "Cable_Crossover/0.jpg",
  "Fundos no Paralelo":         IMG_BASE + "Dips_-_Chest_Version/0.jpg",
  // Costas
  "Puxada Frontal na Polia":    IMG_BASE + "Wide-Grip_Lat_Pulldown/0.jpg",
  "Remada Curvada com Barra":   IMG_BASE + "Bent_Over_Barbell_Row/0.jpg",
  "Remada Unilateral com Halter": IMG_BASE + "One-Arm_Dumbbell_Row/0.jpg",
  "Levantamento Terra":         IMG_BASE + "Barbell_Deadlift/0.jpg",
  "Pulldown com Triângulo":     IMG_BASE + "Seated_Cable_Rows/0.jpg",
  // Ombros
  "Desenvolvimento com Halteres": IMG_BASE + "Dumbbell_Shoulder_Press/0.jpg",
  "Elevação Lateral com Halteres": IMG_BASE + "Side_Lateral_Raise/0.jpg",
  "Desenvolvimento Arnold":     IMG_BASE + "Arnold_Dumbbell_Press/0.jpg",
  "Elevação Frontal":           IMG_BASE + "Front_Dumbbell_Raise/0.jpg",
  "Encolhimento (Shrug)":       IMG_BASE + "Dumbbell_Shrug/0.jpg",
  // Bíceps
  "Rosca Direta com Barra":     IMG_BASE + "Barbell_Curl/0.jpg",
  "Rosca Alternada com Halteres": IMG_BASE + "Alternate_Hammer_Curl/0.jpg",
  "Rosca Martelo":              IMG_BASE + "Hammer_Curls/0.jpg",
  "Rosca Concentrada":          IMG_BASE + "Concentration_Curls/0.jpg",
  // Tríceps
  "Tríceps Pulley (Corda)":     IMG_BASE + "Triceps_Pushdown/0.jpg",
  "Tríceps Testa com Barra EZ": IMG_BASE + "EZ-Bar_Skullcrusher/0.jpg",
  "Extensão Overhead com Halter": IMG_BASE + "Dumbbell_One-Arm_Triceps_Extension/0.jpg",
  "Mergulho no Banco":          IMG_BASE + "Bench_Dips/0.jpg",
  // Abdômen
  "Prancha Abdominal":          IMG_BASE + "Plank/0.jpg",
  "Crunch Abdominal":           IMG_BASE + "Crunches/0.jpg",
  "Russian Twist":              IMG_BASE + "Russian_Twist/0.jpg",
  "Elevação de Pernas":         IMG_BASE + "Hanging_Leg_Raise/0.jpg",
  "Abdominal Bicicleta":        IMG_BASE + "Cross-Body_Crunch/0.jpg",
  // Quadríceps
  "Agachamento Livre com Barra": IMG_BASE + "Barbell_Squat/0.jpg",
  "Leg Press 45°":              IMG_BASE + "Leg_Press/0.jpg",
  "Cadeira Extensora":          IMG_BASE + "Leg_Extensions/0.jpg",
  "Avanço (Lunge)":             IMG_BASE + "Barbell_Lunge/0.jpg",
  // Posterior
  "Mesa Flexora":               IMG_BASE + "Lying_Leg_Curls/0.jpg",
  "Stiff com Halteres":         IMG_BASE + "Romanian_Deadlift/0.jpg",
  "Cadeira Flexora":            IMG_BASE + "Seated_Leg_Curl/0.jpg",
  "RDL (Romanian Deadlift)":    IMG_BASE + "Romanian_Deadlift/0.jpg",
  // Glúteos
  "Hip Thrust com Barra":       IMG_BASE + "Barbell_Hip_Thrust/0.jpg",
  "Agachamento Sumô":           IMG_BASE + "Sumo_Deadlift/0.jpg",
  "Elevação Pélvica":           IMG_BASE + "Glute_Ham_Raise/0.jpg",
  "Abdução de Quadril":         IMG_BASE + "Side_Lying_Hip_Abduction/0.jpg",
  // Panturrilha
  "Elevação de Calcanhares em Pé": IMG_BASE + "Standing_Calf_Raises/0.jpg",
  "Elevação de Calcanhares Sentado": IMG_BASE + "Seated_Calf_Raise/0.jpg",
  // Cardio
  "HIIT na Esteira":            IMG_BASE + "Air_Bike/0.jpg",
  "Corrida Leve (Steady State)": IMG_BASE + "Air_Bike/0.jpg",
  "Pular Corda":                IMG_BASE + "Air_Bike/0.jpg",
  // Alongamentos
  "Isquiotibiais":              IMG_BASE + "Lying_Leg_Curls/0.jpg",
  "Quadríceps":                 IMG_BASE + "Standing_Calf_Raises/0.jpg",
  "Peitoral":                   IMG_BASE + "Dumbbell_Flyes/0.jpg",
  "Gato-Vaca (Coluna)":         IMG_BASE + "Plank/0.jpg",
};

// Retorna imagem real para qualquer exercício pelo nome
function getExImg(nome) {
  if (!nome) return null;
  // Busca exata
  if (EX_IMGS[nome]) return EX_IMGS[nome];
  // Busca parcial
  const key = Object.keys(EX_IMGS).find(k =>
    nome.toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().includes(nome.toLowerCase())
  );
  return key ? EX_IMGS[key] : null;
}

// ─── PARSE DESCANSO ("60s","90s","2min","1:30") → segundos ───────────────────
function parseDescanso(str=""){
  const s=str.trim().toLowerCase();
  if(/^\d+$/.test(s))return parseInt(s);
  if(s.endsWith("s"))return parseInt(s);
  if(s.includes("min"))return parseInt(s)*60;
  if(s.includes(":")){const[m,sec]=s.split(":").map(Number);return m*60+(sec||0);}
  return 60;
}

// ─── TIMER DE DESCANSO ────────────────────────────────────────────────────────
const TimerDescanso = ({ segundos, onClose }) => {
  const total=segundos;
  const [restante,setRestante]=useState(total);
  const [rodando,setRodando]=useState(true);
  const intRef=useRef(null);
  useEffect(()=>{
    if(rodando&&restante>0){
      intRef.current=setInterval(()=>setRestante(r=>{
        if(r<=1){clearInterval(intRef.current);setRodando(false);return 0;}
        return r-1;
      }),1000);
    } else { clearInterval(intRef.current); }
    return ()=>clearInterval(intRef.current);
  },[rodando]);
  const pct=restante/total;
  const circ=2*Math.PI*54;
  const dash=circ*(1-pct);
  const cor=restante>total*0.5?T.green:restante>total*0.25?T.yellow:T.red;
  const mm=String(Math.floor(restante/60)).padStart(2,"0");
  const ss=String(restante%60).padStart(2,"0");
  return (
    <div style={{position:"fixed",inset:0,background:"#000E",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:T.card,borderRadius:28,padding:"32px 28px 28px",width:"88%",maxWidth:320,textAlign:"center",border:`1px solid ${cor}44`,boxShadow:`0 0 60px ${cor}22`}}>
        <p style={{margin:"0 0 4px",color:T.text3,fontSize:12,fontWeight:700,letterSpacing:1}}>⏱️ DESCANSO</p>
        <p style={{margin:"0 0 22px",color:T.text,fontSize:14,fontWeight:600}}>{restante===0?"Hora de continuar! 💪":"Descanse e prepare-se"}</p>
        <div style={{position:"relative",display:"inline-flex",marginBottom:22}}>
          <svg width={120} height={120} viewBox="0 0 120 120">
            <circle cx={60} cy={60} r={54} fill="none" stroke={T.card2} strokeWidth={8}/>
            <circle cx={60} cy={60} r={54} fill="none" stroke={cor} strokeWidth={8} strokeLinecap="round"
              strokeDasharray={circ} strokeDashoffset={dash} transform="rotate(-90 60 60)"
              style={{transition:"stroke-dashoffset 0.9s linear,stroke 0.5s"}}/>
          </svg>
          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
            <span style={{fontSize:28,fontWeight:900,color:cor,lineHeight:1}}>{mm}:{ss}</span>
            <span style={{fontSize:10,color:T.text3,marginTop:2}}>{restante===0?"PRONTO!":"restantes"}</span>
          </div>
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>setRodando(r=>!r)} style={{flex:1,background:T.card2,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 0",color:T.text,fontSize:13,fontWeight:700,cursor:"pointer"}}>
            {rodando?"⏸ Pausar":"▶ Continuar"}
          </button>
          <button onClick={onClose} style={{flex:1,background:restante===0?`linear-gradient(135deg,${T.green},#16A34A)`:T.gold,border:"none",borderRadius:12,padding:"12px 0",color:T.bg,fontSize:13,fontWeight:900,cursor:"pointer"}}>
            {restante===0?"💪 Vamos!":"Pular ›"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── ANATOMIA EXERCÍCIO (estilo wireframe) ────────────────────────────────────
const AnatomiaExercicio = ({ nome, cor="#F5C518" }) => {
  const ills = {
    "leg press":(
      <svg viewBox="0 0 280 160" style={{width:"100%",height:"100%",display:"block"}}>
        <rect x="10" y="70" width="260" height="8" rx="4" fill="#2a2a2a"/><rect x="10" y="70" width="12" height="80" rx="4" fill="#333"/>
        <rect x="230" y="30" width="12" height="120" rx="4" fill="#333"/><rect x="180" y="20" width="60" height="10" rx="4" fill="#2a2a2a"/>
        <rect x="180" y="20" width="10" height="55" rx="4" fill="#2a2a2a"/><rect x="210" y="65" width="55" height="14" rx="6" fill="#444"/>
        <circle cx="50" cy="148" r="8" fill="#333" stroke="#444" strokeWidth="2"/><circle cx="220" cy="148" r="8" fill="#333" stroke="#444" strokeWidth="2"/>
        <rect x="20" y="90" width="70" height="18" rx="8" fill="#3a3a3a"/><rect x="16" y="78" width="18" height="30" rx="6" fill="#3a3a3a"/>
        <ellipse cx="80" cy="98" rx="28" ry="16" fill="none" stroke="#888" strokeWidth="1.5" opacity="0.7"/>
        <circle cx="30" cy="84" r="13" fill="none" stroke="#888" strokeWidth="1.5" opacity="0.7"/>
        <line x1="43" y1="84" x2="55" y2="90" stroke="#888" strokeWidth="2" opacity="0.7"/>
        <line x1="65" y1="95" x2="45" y2="115" stroke="#888" strokeWidth="2" opacity="0.5"/>
        <path d="M95 95 Q130 80 175 68" fill="none" stroke={cor} strokeWidth="4" strokeLinecap="round"/>
        <path d="M75 108 Q110 98 175 78" fill="none" stroke={cor} strokeWidth="4" strokeLinecap="round" opacity="0.7"/>
        <ellipse cx="138" cy="83" rx="22" ry="9" fill={cor} opacity="0.25" transform="rotate(-25 138 83)"/>
        <ellipse cx="138" cy="83" rx="14" ry="6" fill={cor} opacity="0.5" transform="rotate(-25 138 83)"/>
        <ellipse cx="98" cy="100" rx="14" ry="10" fill={cor} opacity="0.3"/>
      </svg>
    ),
    "supino":(
      <svg viewBox="0 0 280 160" style={{width:"100%",height:"100%",display:"block"}}>
        <rect x="40" y="95" width="200" height="15" rx="7" fill="#3a3a3a"/>
        <line x1="70" y1="110" x2="65" y2="140" stroke="#444" strokeWidth="6" strokeLinecap="round"/>
        <line x1="210" y1="110" x2="215" y2="140" stroke="#444" strokeWidth="6" strokeLinecap="round"/>
        <line x1="115" y1="95" x2="115" y2="55" stroke="#555" strokeWidth="5" strokeLinecap="round"/>
        <line x1="165" y1="95" x2="165" y2="55" stroke="#555" strokeWidth="5" strokeLinecap="round"/>
        <line x1="108" y1="55" x2="172" y2="55" stroke="#555" strokeWidth="4" strokeLinecap="round"/>
        <line x1="20" y1="70" x2="260" y2="70" stroke="#888" strokeWidth="5" strokeLinecap="round"/>
        <rect x="20" y="55" width="22" height="30" rx="4" fill="#333" stroke="#555" strokeWidth="1.5"/>
        <rect x="238" y="55" width="22" height="30" rx="4" fill="#333" stroke="#555" strokeWidth="1.5"/>
        <ellipse cx="140" cy="86" rx="70" ry="10" fill="none" stroke="#888" strokeWidth="1.5" opacity="0.6"/>
        <circle cx="210" cy="84" r="11" fill="none" stroke="#888" strokeWidth="1.5" opacity="0.7"/>
        <line x1="125" y1="85" x2="85" y2="68" stroke="#888" strokeWidth="2.5" opacity="0.7"/>
        <line x1="85" y1="68" x2="50" y2="70" stroke="#888" strokeWidth="2.5" opacity="0.7"/>
        <line x1="155" y1="85" x2="195" y2="68" stroke="#888" strokeWidth="2.5" opacity="0.7"/>
        <line x1="195" y1="68" x2="230" y2="70" stroke="#888" strokeWidth="2.5" opacity="0.7"/>
        <ellipse cx="125" cy="82" rx="20" ry="8" fill={cor} opacity="0.3"/>
        <ellipse cx="155" cy="82" rx="20" ry="8" fill={cor} opacity="0.3"/>
        <ellipse cx="125" cy="82" rx="12" ry="5" fill={cor} opacity="0.6"/>
        <ellipse cx="155" cy="82" rx="12" ry="5" fill={cor} opacity="0.6"/>
      </svg>
    ),
    "agachamento":(
      <svg viewBox="0 0 280 160" style={{width:"100%",height:"100%",display:"block"}}>
        <line x1="60" y1="20" x2="60" y2="150" stroke="#444" strokeWidth="6" strokeLinecap="round"/>
        <line x1="220" y1="20" x2="220" y2="150" stroke="#444" strokeWidth="6" strokeLinecap="round"/>
        <line x1="60" y1="20" x2="220" y2="20" stroke="#444" strokeWidth="4"/>
        <line x1="70" y1="60" x2="100" y2="72" stroke="#666" strokeWidth="5" strokeLinecap="round"/>
        <line x1="210" y1="60" x2="180" y2="72" stroke="#666" strokeWidth="5" strokeLinecap="round"/>
        <line x1="55" y1="72" x2="225" y2="72" stroke="#999" strokeWidth="5" strokeLinecap="round"/>
        <rect x="56" y="60" width="16" height="24" rx="4" fill="#333" stroke="#555" strokeWidth="1.5"/>
        <rect x="208" y="60" width="16" height="24" rx="4" fill="#333" stroke="#555" strokeWidth="1.5"/>
        <circle cx="140" cy="45" r="13" fill="none" stroke="#888" strokeWidth="1.5" opacity="0.7"/>
        <line x1="140" y1="58" x2="140" y2="90" stroke="#888" strokeWidth="3" strokeLinecap="round" opacity="0.7"/>
        <line x1="105" y1="72" x2="175" y2="72" stroke="#888" strokeWidth="3" strokeLinecap="round" opacity="0.7"/>
        <path d="M140 90 Q110 110 100 140" fill="none" stroke={cor} strokeWidth="5" strokeLinecap="round"/>
        <path d="M140 90 Q170 110 180 140" fill="none" stroke={cor} strokeWidth="5" strokeLinecap="round"/>
        <line x1="100" y1="140" x2="95" y2="155" stroke="#888" strokeWidth="3" opacity="0.6"/>
        <line x1="180" y1="140" x2="185" y2="155" stroke="#888" strokeWidth="3" opacity="0.6"/>
        <ellipse cx="118" cy="112" rx="14" ry="18" fill={cor} opacity="0.3" transform="rotate(15 118 112)"/>
        <ellipse cx="162" cy="112" rx="14" ry="18" fill={cor} opacity="0.3" transform="rotate(-15 162 112)"/>
        <ellipse cx="118" cy="112" rx="8" ry="12" fill={cor} opacity="0.55" transform="rotate(15 118 112)"/>
        <ellipse cx="162" cy="112" rx="8" ry="12" fill={cor} opacity="0.55" transform="rotate(-15 162 112)"/>
        <ellipse cx="140" cy="95" rx="18" ry="10" fill={cor} opacity="0.2"/>
      </svg>
    ),
    "puxada":(
      <svg viewBox="0 0 280 160" style={{width:"100%",height:"100%",display:"block"}}>
        <rect x="10" y="5" width="260" height="8" rx="4" fill="#333"/>
        <rect x="10" y="5" width="10" height="150" rx="3" fill="#2a2a2a"/>
        <rect x="260" y="5" width="10" height="150" rx="3" fill="#2a2a2a"/>
        <circle cx="140" cy="10" r="6" fill="#555"/>
        <line x1="140" y1="16" x2="100" y2="55" stroke="#888" strokeWidth="2"/>
        <line x1="140" y1="16" x2="180" y2="55" stroke="#888" strokeWidth="2"/>
        <line x1="80" y1="55" x2="200" y2="55" stroke="#999" strokeWidth="5" strokeLinecap="round"/>
        <rect x="95" y="118" width="90" height="14" rx="6" fill="#3a3a3a"/>
        <rect x="120" y="132" width="14" height="22" rx="4" fill="#2a2a2a"/>
        <rect x="146" y="132" width="14" height="22" rx="4" fill="#2a2a2a"/>
        <rect x="92" y="114" width="96" height="10" rx="4" fill="#444"/>
        <circle cx="140" cy="72" r="12" fill="none" stroke="#888" strokeWidth="1.5" opacity="0.7"/>
        <line x1="140" y1="84" x2="140" y2="118" stroke="#888" strokeWidth="3" opacity="0.7"/>
        <line x1="100" y1="55" x2="120" y2="78" stroke="#888" strokeWidth="3" opacity="0.7"/>
        <line x1="200" y1="55" x2="160" y2="78" stroke="#888" strokeWidth="3" opacity="0.7"/>
        <ellipse cx="130" cy="96" rx="16" ry="20" fill={cor} opacity="0.25" transform="rotate(-5 130 96)"/>
        <ellipse cx="150" cy="96" rx="16" ry="20" fill={cor} opacity="0.25" transform="rotate(5 150 96)"/>
        <ellipse cx="130" cy="96" rx="9" ry="13" fill={cor} opacity="0.5" transform="rotate(-5 130 96)"/>
        <ellipse cx="150" cy="96" rx="9" ry="13" fill={cor} opacity="0.5" transform="rotate(5 150 96)"/>
        <ellipse cx="118" cy="67" rx="6" ry="9" fill={cor} opacity="0.35" transform="rotate(-30 118 67)"/>
        <ellipse cx="162" cy="67" rx="6" ry="9" fill={cor} opacity="0.35" transform="rotate(30 162 67)"/>
      </svg>
    ),
    "rosca":(
      <svg viewBox="0 0 280 160" style={{width:"100%",height:"100%",display:"block"}}>
        <line x1="40" y1="95" x2="240" y2="95" stroke="#999" strokeWidth="5" strokeLinecap="round"/>
        <rect x="40" y="82" width="20" height="26" rx="4" fill="#333" stroke="#555" strokeWidth="1.5"/>
        <rect x="220" y="82" width="20" height="26" rx="4" fill="#333" stroke="#555" strokeWidth="1.5"/>
        <circle cx="140" cy="22" r="13" fill="none" stroke="#888" strokeWidth="1.5" opacity="0.7"/>
        <line x1="140" y1="35" x2="140" y2="45" stroke="#888" strokeWidth="3" opacity="0.7"/>
        <line x1="140" y1="45" x2="140" y2="115" stroke="#888" strokeWidth="4" opacity="0.6"/>
        <line x1="100" y1="50" x2="180" y2="50" stroke="#888" strokeWidth="3" opacity="0.6"/>
        <path d="M100 50 Q78 70 82 95" fill="none" stroke={cor} strokeWidth="5" strokeLinecap="round"/>
        <path d="M180 50 Q202 70 198 95" fill="none" stroke={cor} strokeWidth="5" strokeLinecap="round"/>
        <line x1="82" y1="95" x2="62" y2="95" stroke="#888" strokeWidth="3" opacity="0.6"/>
        <line x1="198" y1="95" x2="218" y2="95" stroke="#888" strokeWidth="3" opacity="0.6"/>
        <line x1="130" y1="115" x2="120" y2="155" stroke="#888" strokeWidth="3" opacity="0.5"/>
        <line x1="150" y1="115" x2="160" y2="155" stroke="#888" strokeWidth="3" opacity="0.5"/>
        <ellipse cx="85" cy="73" rx="9" ry="16" fill={cor} opacity="0.4" transform="rotate(-15 85 73)"/>
        <ellipse cx="195" cy="73" rx="9" ry="16" fill={cor} opacity="0.4" transform="rotate(15 195 73)"/>
        <ellipse cx="85" cy="73" rx="5" ry="10" fill={cor} opacity="0.7" transform="rotate(-15 85 73)"/>
        <ellipse cx="195" cy="73" rx="5" ry="10" fill={cor} opacity="0.7" transform="rotate(15 195 73)"/>
      </svg>
    ),
    "hip thrust":(
      <svg viewBox="0 0 280 160" style={{width:"100%",height:"100%",display:"block"}}>
        <rect x="30" y="80" width="100" height="18" rx="8" fill="#3a3a3a"/>
        <line x1="50" y1="98" x2="45" y2="130" stroke="#444" strokeWidth="6" strokeLinecap="round"/>
        <line x1="110" y1="98" x2="115" y2="130" stroke="#444" strokeWidth="6" strokeLinecap="round"/>
        <line x1="10" y1="135" x2="270" y2="135" stroke="#333" strokeWidth="2"/>
        <line x1="60" y1="90" x2="220" y2="90" stroke="#999" strokeWidth="5" strokeLinecap="round"/>
        <rect x="60" y="77" width="20" height="26" rx="4" fill="#333" stroke="#555" strokeWidth="1.5"/>
        <rect x="200" y="77" width="20" height="26" rx="4" fill="#333" stroke="#555" strokeWidth="1.5"/>
        <rect x="126" y="84" width="28" height="12" rx="6" fill="#444"/>
        <line x1="45" y1="80" x2="125" y2="80" stroke="#888" strokeWidth="3" opacity="0.6"/>
        <circle cx="130" cy="72" r="12" fill="none" stroke="#888" strokeWidth="1.5" opacity="0.7"/>
        <ellipse cx="140" cy="72" rx="22" ry="14" fill={cor} opacity="0.35" transform="rotate(15 140 72)"/>
        <ellipse cx="140" cy="72" rx="14" ry="9" fill={cor} opacity="0.65" transform="rotate(15 140 72)"/>
        <path d="M155 68 Q175 90 175 125" fill="none" stroke="#888" strokeWidth="4" strokeLinecap="round" opacity="0.7"/>
        <path d="M148 72 Q165 95 165 125" fill="none" stroke={cor} strokeWidth="3" strokeLinecap="round" opacity="0.5"/>
        <line x1="175" y1="125" x2="195" y2="130" stroke="#888" strokeWidth="4" opacity="0.6"/>
        <ellipse cx="167" cy="97" rx="9" ry="20" fill={cor} opacity="0.2" transform="rotate(10 167 97)"/>
      </svg>
    ),
    "prancha":(
      <svg viewBox="0 0 280 160" style={{width:"100%",height:"100%",display:"block"}}>
        <line x1="10" y1="130" x2="270" y2="130" stroke="#333" strokeWidth="2"/>
        <rect x="30" y="124" width="220" height="8" rx="4" fill="#2a3a2a" opacity="0.8"/>
        <line x1="55" y1="108" x2="230" y2="90" stroke="#666" strokeWidth="2" strokeDasharray="4,3" opacity="0.4"/>
        <circle cx="230" cy="86" r="12" fill="none" stroke="#888" strokeWidth="1.5" opacity="0.7"/>
        <line x1="218" y1="89" x2="210" y2="92" stroke="#888" strokeWidth="3" opacity="0.7"/>
        <line x1="210" y1="92" x2="95" y2="108" stroke="#888" strokeWidth="5" strokeLinecap="round" opacity="0.6"/>
        <line x1="190" y1="96" x2="178" y2="122" stroke="#888" strokeWidth="3" opacity="0.6"/>
        <line x1="155" y1="102" x2="143" y2="124" stroke="#888" strokeWidth="3" opacity="0.6"/>
        <line x1="95" y1="108" x2="55" y2="112" stroke="#888" strokeWidth="4" opacity="0.6"/>
        <line x1="55" y1="112" x2="42" y2="124" stroke="#888" strokeWidth="3" opacity="0.5"/>
        <ellipse cx="160" cy="100" rx="35" ry="8" fill={cor} opacity="0.25" transform="rotate(-5 160 100)"/>
        <ellipse cx="158" cy="100" rx="22" ry="5" fill={cor} opacity="0.5" transform="rotate(-5 158 100)"/>
        <ellipse cx="110" cy="107" rx="16" ry="6" fill={cor} opacity="0.2" transform="rotate(-5 110 107)"/>
      </svg>
    ),
    "mesa flexora":(
      <svg viewBox="0 0 280 160" style={{width:"100%",height:"100%",display:"block"}}>
        <rect x="10" y="75" width="220" height="12" rx="5" fill="#3a3a3a"/>
        <line x1="20" y1="87" x2="20" y2="145" stroke="#333" strokeWidth="8" strokeLinecap="round"/>
        <line x1="200" y1="87" x2="200" y2="145" stroke="#333" strokeWidth="8" strokeLinecap="round"/>
        <rect x="12" y="140" width="195" height="8" rx="4" fill="#2a2a2a"/>
        <circle cx="215" cy="100" r="12" fill="#444" stroke="#555" strokeWidth="2"/>
        <circle cx="215" cy="100" r="7" fill="#333"/>
        <circle cx="28" cy="60" r="11" fill="none" stroke="#888" strokeWidth="1.5" opacity="0.7"/>
        <line x1="38" y1="63" x2="60" y2="70" stroke="#888" strokeWidth="2" opacity="0.5"/>
        <line x1="45" y1="70" x2="195" y2="78" stroke="#888" strokeWidth="5" strokeLinecap="round" opacity="0.6"/>
        <path d="M195 78 Q215 65 218 95" fill="none" stroke={cor} strokeWidth="5" strokeLinecap="round"/>
        <ellipse cx="208" cy="78" rx="10" ry="18" fill={cor} opacity="0.35" transform="rotate(-20 208 78)"/>
        <ellipse cx="208" cy="78" rx="6" ry="11" fill={cor} opacity="0.65" transform="rotate(-20 208 78)"/>
      </svg>
    ),
    "cadeira extensora":(
      <svg viewBox="0 0 280 160" style={{width:"100%",height:"100%",display:"block"}}>
        <rect x="20" y="80" width="120" height="18" rx="8" fill="#3a3a3a"/>
        <line x1="30" y1="98" x2="25" y2="145" stroke="#444" strokeWidth="8" strokeLinecap="round"/>
        <line x1="120" y1="98" x2="125" y2="145" stroke="#444" strokeWidth="8" strokeLinecap="round"/>
        <rect x="15" y="50" width="18" height="35" rx="6" fill="#3a3a3a"/>
        <line x1="130" y1="100" x2="230" y2="90" stroke="#888" strokeWidth="4" strokeLinecap="round" opacity="0.7"/>
        <circle cx="240" cy="100" r="14" fill="#444" stroke="#555" strokeWidth="2"/>
        <circle cx="240" cy="100" r="8" fill="#333"/>
        <rect x="115" y="108" width="18" height="10" rx="4" fill="#555"/>
        <circle cx="40" cy="52" r="12" fill="none" stroke="#888" strokeWidth="1.5" opacity="0.7"/>
        <line x1="40" y1="64" x2="40" y2="80" stroke="#888" strokeWidth="3" opacity="0.7"/>
        <line x1="25" y1="70" x2="55" y2="70" stroke="#888" strokeWidth="2.5" opacity="0.5"/>
        <line x1="40" y1="80" x2="80" y2="82" stroke="#888" strokeWidth="3" opacity="0.6"/>
        <line x1="40" y1="80" x2="55" y2="82" stroke="#888" strokeWidth="3" opacity="0.6"/>
        <path d="M80 82 Q120 88 128 105" fill="none" stroke={cor} strokeWidth="5" strokeLinecap="round"/>
        <path d="M55 82 Q100 95 125 112" fill="none" stroke={cor} strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
        <ellipse cx="100" cy="93" rx="20" ry="10" fill={cor} opacity="0.35" transform="rotate(-5 100 93)"/>
        <ellipse cx="100" cy="93" rx="12" ry="6" fill={cor} opacity="0.6" transform="rotate(-5 100 93)"/>
      </svg>
    ),
    "pulley":(
      <svg viewBox="0 0 280 160" style={{width:"100%",height:"100%",display:"block"}}>
        <rect x="10" y="5" width="12" height="150" rx="4" fill="#2a2a2a"/>
        <rect x="258" y="5" width="12" height="150" rx="4" fill="#2a2a2a"/>
        <rect x="10" y="5" width="260" height="8" rx="4" fill="#333"/>
        <circle cx="140" cy="12" r="8" fill="#555"/>
        <line x1="140" y1="20" x2="140" y2="60" stroke="#888" strokeWidth="2.5"/>
        <line x1="140" y1="60" x2="115" y2="72" stroke="#888" strokeWidth="2"/>
        <line x1="140" y1="60" x2="165" y2="72" stroke="#888" strokeWidth="2"/>
        <ellipse cx="140" cy="65" rx="30" ry="8" fill="#555" opacity="0.5"/>
        <circle cx="140" cy="28" r="13" fill="none" stroke="#888" strokeWidth="1.5" opacity="0.7"/>
        <line x1="140" y1="41" x2="140" y2="85" stroke="#888" strokeWidth="3" opacity="0.7"/>
        <line x1="115" y1="72" x2="108" y2="90" stroke="#888" strokeWidth="3" opacity="0.7"/>
        <line x1="165" y1="72" x2="172" y2="90" stroke="#888" strokeWidth="3" opacity="0.7"/>
        <path d="M108 90 Q100 108 108 120" fill="none" stroke={cor} strokeWidth="4" strokeLinecap="round"/>
        <path d="M172 90 Q180 108 172 120" fill="none" stroke={cor} strokeWidth="4" strokeLinecap="round"/>
        <ellipse cx="107" cy="105" rx="7" ry="14" fill={cor} opacity="0.45" transform="rotate(10 107 105)"/>
        <ellipse cx="173" cy="105" rx="7" ry="14" fill={cor} opacity="0.45" transform="rotate(-10 173 105)"/>
        <ellipse cx="107" cy="105" rx="4" ry="9" fill={cor} opacity="0.7" transform="rotate(10 107 105)"/>
        <ellipse cx="173" cy="105" rx="4" ry="9" fill={cor} opacity="0.7" transform="rotate(-10 173 105)"/>
        <line x1="140" y1="85" x2="120" y2="130" stroke="#888" strokeWidth="3" opacity="0.5"/>
        <line x1="140" y1="85" x2="160" y2="130" stroke="#888" strokeWidth="3" opacity="0.5"/>
      </svg>
    ),
  };
  const key=Object.keys(ills).find(k=>nome?.toLowerCase().includes(k));
  const fallback=(
    <svg viewBox="0 0 280 160" style={{width:"100%",height:"100%",display:"block"}}>
      <circle cx="140" cy="28" r="15" fill="none" stroke="#888" strokeWidth="1.5" opacity="0.7"/>
      <line x1="140" y1="43" x2="140" y2="95" stroke="#888" strokeWidth="3" strokeLinecap="round" opacity="0.7"/>
      <line x1="100" y1="58" x2="180" y2="58" stroke="#888" strokeWidth="3" opacity="0.6"/>
      <line x1="100" y1="58" x2="82" y2="88" stroke="#888" strokeWidth="2.5" opacity="0.6"/>
      <line x1="180" y1="58" x2="198" y2="88" stroke="#888" strokeWidth="2.5" opacity="0.6"/>
      <line x1="127" y1="95" x2="115" y2="145" stroke="#888" strokeWidth="3" opacity="0.5"/>
      <line x1="153" y1="95" x2="165" y2="145" stroke="#888" strokeWidth="3" opacity="0.5"/>
      <ellipse cx="140" cy="68" rx="28" ry="22" fill={cor} opacity="0.2"/>
      <ellipse cx="140" cy="68" rx="16" ry="13" fill={cor} opacity="0.4"/>
    </svg>
  );
  return (
    <div style={{width:"100%",height:"100%",background:"linear-gradient(135deg,#0A0A0A,#111)",display:"flex",alignItems:"center",justifyContent:"center"}}>
      {ills[key]||fallback}
    </div>
  );
};

// ─── THEME ────────────────────────────────────────────────────────────────────
const T = {
  bg:"#0A0A0A",bg2:"#111111",card:"#161616",card2:"#1C1C1C",
  border:"#252525",border2:"#2E2E2E",
  yellow:"#F5C518",yellowDim:"#F5C51833",
  red:"#E31B1B",redDim:"#E31B1B22",
  green:"#22C55E",greenDim:"#22C55E22",
  text:"#FFFFFF",text2:"#BBBBBB",text3:"#777777",
  gold:"linear-gradient(135deg,#F5C518,#FFD700)",
};

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Ic = ({ n, size=20, color="currentColor", style={} }) => {
  const p = {
    home:<><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
    dumbbell:<><line x1="6.5" y1="6.5" x2="17.5" y2="17.5"/><path d="M8 6l-4 4 8.5 8.5 4-4"/><path d="M16 8l4 4-8.5 8.5-4-4"/></>,
    leaf:<><path d="M17 8C8 10 5.9 16.17 3.82 22"/><path d="M3.82 22c0-7 8-15 13.46-15 0 2-2 5.5-7 7"/></>,
    user2:<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    credit:<><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></>,
    menu:<><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>,
    x:<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    bell:<><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
    check:<polyline points="20 6 9 17 4 12"/>,
    play:<><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></>,
    star:<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>,
    calendar:<><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
    clock:<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    trophy:<><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></>,
    chart:<><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
    dollar:<><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
    back:<><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>,
    chevR:<polyline points="9 18 15 12 9 6"/>,
    info:<><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></>,
    settings:<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
    logout:<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
    user:<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    heart:<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>,
    plus:<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    edit:<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    trash:<><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></>,
    search:<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    upload:<><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></>,
    image:<><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></>,
    film:<><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></>,
    save:<><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></>,
    whatsapp:null,
  };
  if(n==="whatsapp") return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={style}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
    </svg>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      {p[n]}
    </svg>
  );
};

// ─── SVG EXERCISE ILLUSTRATIONS ───────────────────────────────────────────────
const ExIllust = ({ name, color=T.yellow, size="thumb" }) => {
  const w=size==="hero"?400:88; const h=size==="hero"?200:88; const s=size==="hero"?1.55:0.34;
  const ills = {
    "Leg Press":<g><rect x="20" y="120" width="220" height="12" rx="4" fill="#444"/><rect x="20" y="80" width="12" height="60" rx="4" fill="#555"/><rect x="228" y="40" width="12" height="100" rx="4" fill="#555"/><rect x="50" y="90" width="70" height="14" rx="6" fill="#777"/><rect x="165" y="50" width="65" height="50" rx="6" fill="#666"/><line x1="32" y1="50" x2="180" y2="50" stroke="#555" strokeWidth="6"/><rect x="230" y="40" width="20" height="8" rx="2" fill={color} opacity="0.9"/><rect x="230" y="52" width="20" height="8" rx="2" fill={color} opacity="0.7"/><circle cx="75" cy="68" r="12" fill="#DDD"/><line x1="75" y1="80" x2="75" y2="102" stroke="#DDD" strokeWidth="7" strokeLinecap="round"/><line x1="75" y1="102" x2="165" y2="65" stroke="#DDD" strokeWidth="6" strokeLinecap="round"/></g>,
    "Agachamento":<g><rect x="30" y="20" width="10" height="150" rx="4" fill="#555"/><rect x="215" y="20" width="10" height="150" rx="4" fill="#555"/><rect x="50" y="82" width="155" height="9" rx="4" fill="#888"/><rect x="44" y="75" width="18" height="22" rx="4" fill={color} opacity="0.9"/><rect x="193" y="75" width="18" height="22" rx="4" fill={color} opacity="0.9"/><circle cx="127" cy="52" r="13" fill="#DDD"/><line x1="127" y1="65" x2="127" y2="88" stroke="#DDD" strokeWidth="8" strokeLinecap="round"/><line x1="127" y1="88" x2="100" y2="118" stroke="#DDD" strokeWidth="7" strokeLinecap="round"/><line x1="127" y1="88" x2="154" y2="118" stroke="#DDD" strokeWidth="7" strokeLinecap="round"/></g>,
    "Supino":<g><rect x="55" y="105" width="150" height="16" rx="7" fill="#777"/><rect x="80" y="121" width="12" height="35" rx="4" fill="#555"/><rect x="168" y="121" width="12" height="35" rx="4" fill="#555"/><rect x="40" y="74" width="180" height="9" rx="4" fill="#888"/><rect x="36" y="68" width="20" height="20" rx="4" fill={color} opacity="0.9"/><rect x="204" y="68" width="20" height="20" rx="4" fill={color} opacity="0.9"/><circle cx="128" cy="88" r="12" fill="#DDD"/><line x1="128" y1="100" x2="128" y2="112" stroke="#DDD" strokeWidth="9" strokeLinecap="round"/><line x1="95" y1="78" x2="162" y2="78" stroke="#DDD" strokeWidth="6" strokeLinecap="round"/></g>,
    "Puxada":<g><rect x="20" y="15" width="215" height="12" rx="5" fill="#555"/><rect x="20" y="15" width="12" height="160" rx="4" fill="#444"/><rect x="210" y="40" width="22" height="8" rx="2" fill={color} opacity="0.9"/><rect x="210" y="52" width="22" height="8" rx="2" fill={color} opacity="0.7"/><circle cx="130" cy="22" r="8" fill="#777"/><line x1="80" y1="70" x2="180" y2="70" stroke="#888" strokeWidth="8" strokeLinecap="round"/><circle cx="128" cy="88" r="12" fill="#DDD"/><line x1="128" y1="100" x2="128" y2="122" stroke="#DDD" strokeWidth="8" strokeLinecap="round"/><line x1="78" y1="80" x2="182" y2="80" stroke="#DDD" strokeWidth="6" strokeLinecap="round"/></g>,
    "Rosca":<g><rect x="60" y="108" width="140" height="8" rx="4" fill="#888"/><rect x="52" y="100" width="20" height="24" rx="4" fill={color} opacity="0.9"/><rect x="188" y="100" width="20" height="24" rx="4" fill={color} opacity="0.9"/><circle cx="128" cy="38" r="14" fill="#DDD"/><line x1="128" y1="52" x2="128" y2="95" stroke="#DDD" strokeWidth="10" strokeLinecap="round"/><line x1="128" y1="68" x2="90" y2="80" stroke="#DDD" strokeWidth="7" strokeLinecap="round"/><line x1="90" y1="80" x2="72" y2="112" stroke="#DDD" strokeWidth="7" strokeLinecap="round"/></g>,
    "Prancha":<g><rect x="30" y="152" width="200" height="8" rx="3" fill="#1a3a2a"/><line x1="60" y1="120" x2="200" y2="120" stroke="#DDD" strokeWidth="12" strokeLinecap="round"/><circle cx="55" cy="112" r="13" fill="#DDD"/><line x1="80" y1="120" x2="72" y2="152" stroke="#DDD" strokeWidth="8" strokeLinecap="round"/><line x1="200" y1="120" x2="200" y2="152" stroke="#DDD" strokeWidth="8" strokeLinecap="round"/><line x1="45" y1="108" x2="210" y2="108" stroke={color} strokeWidth="2" strokeDasharray="6,4" opacity="0.7"/></g>,
  };
  const key = Object.keys(ills).find(k => name && name.toLowerCase().includes(k.toLowerCase()));
  const fb = <g><circle cx="128" cy="90" r="50" fill="none" stroke={color} strokeWidth="5" opacity="0.3"/><text x="128" y="82" textAnchor="middle" fill={color} fontSize="28">🏋️</text><text x="128" y="108" textAnchor="middle" fill="#666" fontSize="11">{(name||"").slice(0,14)}</text></g>;
  return (
    <svg width={w} height={h} viewBox="0 0 256 180" style={{ display:"block", background:T.bg2, borderRadius:size==="thumb"?8:0, flexShrink:0 }}>
      <rect width="256" height="180" fill={T.bg2}/>
      <g transform={`scale(${s}) translate(${size==="hero"?"-75":"-8"},${size==="hero"?"-36":"0"})`}>{ills[key]||fb}</g>
    </svg>
  );
};

// ─── SHARED UI ────────────────────────────────────────────────────────────────
const Card = ({ children, style={}, onClick }) => (
  <div onClick={onClick} style={{ background:T.card, borderRadius:16, border:`1px solid ${T.border}`, ...style, cursor:onClick?"pointer":"default" }}>{children}</div>
);
const Btn = ({ children, onClick, color=T.yellow, style={}, small=false, outline=false, danger=false }) => {
  const bg = danger ? T.red : outline ? "transparent" : color;
  const textColor = outline ? (danger ? T.red : color) : (color===T.yellow ? T.bg : T.text);
  const border = outline || danger ? `1px solid ${danger?T.red:color}` : "none";
  return (
    <button onClick={onClick} style={{ background:outline?"transparent":(danger?T.red:`linear-gradient(135deg,${color},${color}DD)`), color:outline?(danger?T.red:color):textColor, border, borderRadius:10, padding:small?"8px 14px":"12px 18px", fontSize:small?12:14, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6, ...style }}>
      {children}
    </button>
  );
};
const YBadge = ({ text, color=T.yellow }) => (
  <span style={{ background:color+"22", color, border:`1px solid ${color}44`, borderRadius:20, padding:"2px 10px", fontSize:11, fontWeight:700, letterSpacing:0.4, flexShrink:0 }}>{text}</span>
);
const Sec = ({ title, action, onAction, children, style={} }) => (
  <div style={{ marginBottom:20, ...style }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
      <span style={{ fontSize:15, fontWeight:800, color:T.text, letterSpacing:-0.3 }}>{title}</span>
      {action && <span onClick={onAction} style={{ fontSize:12, color:T.yellow, cursor:"pointer", fontWeight:700 }}>{action}</span>}
    </div>
    {children}
  </div>
);
const Inp = ({ label, value, onChange, placeholder="", type="text", style={} }) => (
  <div style={{ marginBottom:12 }}>
    {label && <label style={{ fontSize:11, color:T.text3, fontWeight:700, letterSpacing:0.8, display:"block", marginBottom:5 }}>{label}</label>}
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{ width:"100%", background:T.card2, border:`1px solid ${T.border}`, borderRadius:10, padding:"12px 13px", color:T.text, fontSize:14, outline:"none", boxSizing:"border-box", ...style }}/>
  </div>
);
const Textarea = ({ label, value, onChange, placeholder="", rows=3 }) => (
  <div style={{ marginBottom:12 }}>
    {label && <label style={{ fontSize:11, color:T.text3, fontWeight:700, letterSpacing:0.8, display:"block", marginBottom:5 }}>{label}</label>}
    <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={{ width:"100%", background:T.card2, border:`1px solid ${T.border}`, borderRadius:10, padding:"12px 13px", color:T.text, fontSize:14, outline:"none", boxSizing:"border-box", resize:"vertical", fontFamily:"inherit" }}/>
  </div>
);
const Modal = ({ title, onClose, children }) => (
  <div style={{ position:"fixed", inset:0, background:"#000C", zIndex:200, display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
    <div style={{ background:T.card, borderRadius:"20px 20px 0 0", width:"100%", maxWidth:430, maxHeight:"92vh", overflowY:"auto", padding:"0 0 40px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"18px 20px 14px", borderBottom:`1px solid ${T.border}`, position:"sticky", top:0, background:T.card, zIndex:2 }}>
        <span style={{ fontSize:16, fontWeight:800, color:T.text }}>{title}</span>
        <button onClick={onClose} style={{ background:T.card2, border:"none", borderRadius:50, width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}><Ic n="x" size={16} color={T.text3}/></button>
      </div>
      <div style={{ padding:"16px 20px" }}>{children}</div>
    </div>
  </div>
);
const Confirm = ({ msg, onYes, onNo }) => (
  <div style={{ position:"fixed", inset:0, background:"#000C", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
    <div style={{ background:T.card, borderRadius:20, padding:24, width:"100%", maxWidth:340, border:`1px solid ${T.red}44` }}>
      <p style={{ color:T.text, fontSize:15, fontWeight:600, marginBottom:20, textAlign:"center" }}>{msg}</p>
      <div style={{ display:"flex", gap:10 }}>
        <Btn onClick={onNo} outline style={{ flex:1 }}>Cancelar</Btn>
        <Btn onClick={onYes} danger style={{ flex:1 }}>Excluir</Btn>
      </div>
    </div>
  </div>
);


// ─── COMPONENTE DE IMAGEM DO EXERCÍCIO (real + fallback SVG) ─────────────────
const ExImg = ({ nome, musculo, cor, imgUrl, style={} }) => {
  const [imgOk, setImgOk] = useState(true);
  const src = imgUrl || getExImg(nome);
  if (src && imgOk) {
    return (
      <img src={src} alt={nome} onError={()=>setImgOk(false)}
        style={{ width:"100%", height:"100%", objectFit:"cover", display:"block", ...style }}/>
    );
  }
  return <AnatomiaExercicio nome={nome} cor={cor||(GRUPOS_CORES[musculo]||T.yellow)}/>;
};

// ─── BIBLIOTECA DE EXERCÍCIOS (873 exercícios, Free Exercise DB) ──────────────
const GRUPOS_CORES = {
  "Peito":"#E31B1B","Costas":"#9B59B6","Ombros":"#3B82F6","Bíceps":"#22C55E",
  "Tríceps":"#E91E63","Abdômen":"#F39C12","Quadríceps":"#F5C518","Posterior de Coxa":"#FF6B35",
  "Glúteos":"#FF6B35","Panturrilha":"#1ABC9C","Cardio":"#E74C3C","Alongamentos":"#2ECC71",
  "Antebraço":"#8B4513","Adutores":"#20B2AA","Pescoço":"#708090",
};
const GRUPOS_EMOJI = {
  "Peito":"💪","Costas":"🔙","Ombros":"🏋️","Bíceps":"💪","Tríceps":"🤜",
  "Abdômen":"🎯","Quadríceps":"🦵","Posterior de Coxa":"🦵","Glúteos":"🍑",
  "Panturrilha":"🦶","Cardio":"🏃","Alongamentos":"🧘",
  "Antebraço":"✊","Adutores":"🦵","Pescoço":"💆",
};

const BIBLIOTECA_FULL = [
{id:"db_barbell_side_bend",nome:"Flexão Lateral com Barra",nome_en:"",grupo:"Abdômen",principais:["Reto abdominal"],secundarios:["Eretores"],equipamento:"Barra",nivel:"Iniciante",passos:["Stand up straight while holding a barbell placed on the back of your shoulders (slightly below the neck). Your feet should be shoulder width apart. This will be your starting position.", "While keeping your back straight and your head up, bend only at the waist to the right as far as possible. Breathe in as you bend to the side. Then hold for a second and come back up to the starting position as you exhale. Tip: Keep the rest of the body stationary.", "Now repeat the movement but bending to the left instead. Hold for a second and come back to the starting position."],erros:[],cuidados:[],series:"3",reps:"15-20",descanso:"45s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Side_Bend/0.jpg"},
{id:"db_landmine_180s",nome:"Rotação Landmine 180°",nome_en:"",grupo:"Abdômen",principais:["Reto abdominal"],secundarios:["Glúteos", "Eretores"],equipamento:"Barra",nivel:"Iniciante",passos:["Position a bar into a landmine or securely anchor it in a corner. Load the bar to an appropriate weight.", "Raise the bar from the floor, taking it to shoulder height with both hands with your arms extended in front of you. Adopt a wide stance. This will be your starting position.", "Perform the movement by rotating the trunk and hips as you swing the weight all the way down to one side. Keep your arms extended throughout the exercise."],erros:[],cuidados:[],series:"3",reps:"15-20",descanso:"45s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Landmine_180s/0.jpg"},
{id:"db_seated_barbell_twist",nome:"Rotação Sentado com Barra",nome_en:"",grupo:"Abdômen",principais:["Reto abdominal"],secundarios:[],equipamento:"Barra",nivel:"Iniciante",passos:["Start out by sitting at the end of a flat bench with a barbell placed on top of your thighs. Your feet should be shoulder width apart from each other.", "Grip the bar with your palms facing down and make sure your hands are wider than shoulder width apart from each other. Begin to lift the barbell up over your head until your arms are fully extended.", "Now lower the barbell behind your head until it is resting along the base of your neck. This is the starting position."],erros:[],cuidados:[],series:"3",reps:"15-20",descanso:"45s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Barbell_Twist/0.jpg"},
{id:"db_barbell_ab_rollout",nome:"Roda Abdominal com Barra",nome_en:"",grupo:"Abdômen",principais:["Reto abdominal"],secundarios:["Eretores", "Deltóide"],equipamento:"Barra",nivel:"Intermediário",passos:["For this exercise you will need to get into a pushup position, but instead of having your hands of the floor, you will be grabbing on to an Olympic barbell (loaded with 5-10 lbs on each side) instead. This will be your starting position.", "While keeping a slight arch on your back, lift your hips and roll the barbell towards your feet as you exhale. Tip: As you perform the movement, your glutes should be coming up, you should be keeping the abs tight and should maintain your back posture at all times. Also your arms should be staying perpendicular to the floor throughout the movement. If you don't, you will work out your shoulders and back more than the abs.", "After a second contraction at the top, start to roll the barbell back forward to the starting position slowly as you inhale."],erros:[],cuidados:[],series:"3-4",reps:"15-20",descanso:"45s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Ab_Rollout/0.jpg"},
{id:"db_barbell_rollout_from_bench",nome:"Roda Abdominal com Barra no Banco",nome_en:"",grupo:"Abdômen",principais:["Reto abdominal"],secundarios:["Glúteos", "Isquiotibiais"],equipamento:"Barra",nivel:"Intermediário",passos:["Place a loaded barbell on the ground, near the end of a bench. Kneel with both legs on the bench, and take a medium to narrow grip on the barbell. This will be your starting position.", "To begin, extend through the hips to slowly roll the bar forward. As you roll out, flex the shoulder to roll the bar above your head. Ensure that your arms remain extended throughout the movement.", "When the bar has been moved as far forward as possible, return to the starting position."],erros:[],cuidados:[],series:"3-4",reps:"15-20",descanso:"45s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Rollout_from_Bench/0.jpg"},
{id:"db_barbell_ab_rollout___on_knees",nome:"Roda Abdominal com Barra (Joelhos)",nome_en:"",grupo:"Abdômen",principais:["Reto abdominal"],secundarios:["Eretores", "Deltóide"],equipamento:"Barra",nivel:"Avançado",passos:["Hold an Olympic barbell loaded with 5-10lbs on each side and kneel on the floor.", "Now place the barbell on the floor in front of you so that you are on all your hands and knees (as in a kneeling push up position). This will be your starting position.", "Slowly roll the barbell straight forward, stretching your body into a straight position. Tip: Go down as far as you can without touching the floor with your body. Breathe in during this portion of the movement."],erros:[],cuidados:[],series:"4-5",reps:"15-20",descanso:"45s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Ab_Rollout_-_On_Knees/0.jpg"},
{id:"db_press_sit_up",nome:"Press Sit-Up",nome_en:"",grupo:"Abdômen",principais:["Reto abdominal"],secundarios:["Peitoral", "Deltóide"],equipamento:"Barra",nivel:"Avançado",passos:["To begin, lie down on a bench with a barbell resting on your chest. Position your legs so they are secure on the extension of the abdominal bench. This is the starting position.", "While inhaling, tighten your abdominals and glutes. Simultaneously curl your torso as you do when performing a sit-up and press the barbell to an overhead position while exhaling. Tip: Use your arms to push the barbell out as you perform this exercise while still focusing on the abdominal muscles.", "Lower your upper body back down to the starting position while bringing the barbell back down to your torso. Remember to breathe in while lowering the body."],erros:[],cuidados:[],series:"4-5",reps:"15-20",descanso:"45s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Press_Sit-Up/0.jpg"},
{id:"db_dumbbell_side_bend",nome:"Flexão Lateral com Halter",nome_en:"",grupo:"Abdômen",principais:["Reto abdominal"],secundarios:[],equipamento:"Halter",nivel:"Iniciante",passos:["Stand up straight while holding a dumbbell on the left hand (palms facing the torso) as you have the right hand holding your waist. Your feet should be placed at shoulder width. This will be your starting position.", "While keeping your back straight and your head up, bend only at the waist to the right as far as possible. Breathe in as you bend to the side. Then hold for a second and come back up to the starting position as you exhale. Tip: Keep the rest of the body stationary.", "Now repeat the movement but bending to the left instead. Hold for a second and come back to the starting position."],erros:[],cuidados:[],series:"3",reps:"15-20",descanso:"45s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Side_Bend/0.jpg"},
{id:"db_spell_caster",nome:"Spell Caster",nome_en:"",grupo:"Abdômen",principais:["Reto abdominal"],secundarios:["Glúteos", "Deltóide"],equipamento:"Halter",nivel:"Iniciante",passos:["Hold a dumbbell in each hand with a pronated grip. Your feet should be wide with your hips and knees extended. This will be your starting position.", "Begin the movement by pulling both of the dumbbells to one side next to your hip, rotating your torso.", "Keeping your arms straight and the dumbbells parallel to the ground, rotate your torso to swing the weights to your opposite side."],erros:[],cuidados:[],series:"3",reps:"15-20",descanso:"45s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Spell_Caster/0.jpg"},
{id:"db_thigh_abductor",nome:"Thigh Abductor",nome_en:"",grupo:"Abdômen",principais:["Abdutores"],secundarios:["Glúteos"],equipamento:"Máquina",nivel:"Iniciante",passos:["To begin, sit down on the abductor machine and select a weight you are comfortable with. When your legs are positioned properly, grip the handles on each side. Your entire upper body (from the waist up) should be stationary. This is the starting position.", "Slowly press against the machine with your legs to move them away from each other while exhaling.", "Feel the contraction for a second and begin to move your legs back to the starting position while breathing in. Note: Remember to keep your upper body stationary to prevent any injuries from occurring."],erros:[],cuidados:[],series:"3",reps:"15-20",descanso:"45s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Thigh_Abductor/0.jpg"},
{id:"db_ab_crunch_machine",nome:"Crunch na Máquina",nome_en:"",grupo:"Abdômen",principais:["Reto abdominal"],secundarios:[],equipamento:"Máquina",nivel:"Intermediário",passos:["Select a light resistance and sit down on the ab machine placing your feet under the pads provided and grabbing the top handles. Your arms should be bent at a 90 degree angle as you rest the triceps on the pads provided. This will be your starting position.", "At the same time, begin to lift the legs up as you crunch your upper torso. Breathe out as you perform this movement. Tip: Be sure to use a slow and controlled motion. Concentrate on using your abs to move the weight while relaxing your legs and feet.", "After a second pause, slowly return to the starting position as you breathe in."],erros:[],cuidados:[],series:"3-4",reps:"15-20",descanso:"45s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ab_Crunch_Machine/0.jpg"},
{id:"db_cable_crunch",nome:"Crunch na Polia",nome_en:"",grupo:"Abdômen",principais:["Reto abdominal"],secundarios:[],equipamento:"Polia",nivel:"Iniciante",passos:["Kneel below a high pulley that contains a rope attachment.", "Grasp cable rope attachment and lower the rope until your hands are placed next to your face.", "Flex your hips slightly and allow the weight to hyperextend the lower back. This will be your starting position."],erros:[],cuidados:[],series:"3",reps:"15-20",descanso:"45s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crunch/0.jpg"},
{id:"db_cable_judo_flip",nome:"Cable Judo Flip",nome_en:"",grupo:"Abdômen",principais:["Reto abdominal"],secundarios:[],equipamento:"Polia",nivel:"Iniciante",passos:["Connect a rope attachment to a tower, and move the cable to the lowest pulley position. Stand with your side to the cable with a wide stance, and grab the rope with both hands.", "Twist your body away from the pulley as you bring the rope over your shoulder like you're performing a judo flip.", "Shift your weight between your feet as you twist and crunch forward, pulling the cable downward."],erros:[],cuidados:[],series:"3",reps:"15-20",descanso:"45s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Judo_Flip/0.jpg"},
{id:"db_cable_reverse_crunch",nome:"Cable Reverse Crunch",nome_en:"",grupo:"Abdômen",principais:["Reto abdominal"],secundarios:[],equipamento:"Polia",nivel:"Iniciante",passos:["Connect an ankle strap attachment to a low pulley cable and position a mat on the floor in front of it.", "Sit down with your feet toward the pulley and attach the cable to your ankles.", "Lie down, elevate your legs and bend your knees at a 90-degree angle. Your legs and the cable should be aligned. If not, adjust the pulley up or down until they are."],erros:[],cuidados:[],series:"3",reps:"15-20",descanso:"45s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Reverse_Crunch/0.jpg"},
{id:"db_cable_russian_twists",nome:"Cable Russian Twists",nome_en:"",grupo:"Abdômen",principais:["Reto abdominal"],secundarios:[],equipamento:"Polia",nivel:"Iniciante",passos:["Connect a standard handle attachment, and position the cable to a middle pulley position.", "Lie on a stability ball perpendicular to the cable and grab the handle with one hand. You should be approximately arm's length away from the pulley, with the tension of the weight on the cable.", "Grab the handle with both hands and fully extend your arms above your chest. You hands should be directly in-line with the pulley. If not, adjust the pulley up or down until they are."],erros:[],cuidados:[],series:"3",reps:"15-20",descanso:"45s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Russian_Twists/0.jpg"},
{id:"db_cable_seated_crunch",nome:"Cable Seated Crunch",nome_en:"",grupo:"Abdômen",principais:["Reto abdominal"],secundarios:[],equipamento:"Polia",nivel:"Iniciante",passos:["Seat on a flat bench with your back facing a high pulley.", "Grasp the cable rope attachment with both hands (with the palms of the hands facing each other) and place your hands securely over both shoulders. Tip: Allow the weight to hyperextend the lower back slightly. This will be your starting position.", "With the hips stationary, flex the waist so the elbows travel toward the hips. Breathe out as you perform this step."],erros:[],cuidados:[],series:"3",reps:"15-20",descanso:"45s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Seated_Crunch/0.jpg"},
{id:"db_kneeling_cable_crunch_with_alternating_oblique_twi",nome:"Kneeling Cable Crunch With Alternating Oblique Twists",nome_en:"",grupo:"Abdômen",principais:["Reto abdominal"],secundarios:[],equipamento:"Polia",nivel:"Iniciante",passos:["Connect a rope attachment to a high pulley cable and position a mat on the floor in front of it.", "Grab the rope with both hands and kneel approximately two feet back from the tower.", "Position the rope behind your head with your hands by your ears."],erros:[],cuidados:[],series:"3",reps:"15-20",descanso:"45s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kneeling_Cable_Crunch_With_Alternating_Oblique_Twists/0.jpg"},
{id:"db_one_arm_high_pulley_cable_side_bends",nome:"One-Arm High-Pulley Cable Side Bends",nome_en:"",grupo:"Abdômen",principais:["Reto abdominal"],secundarios:[],equipamento:"Polia",nivel:"Iniciante",passos:["Connect a standard handle to a tower. Move cable to highest pulley position.", "Stand with side to cable. With one hand, reach up and grab handle with underhand grip.", "Pull down cable until elbow touches your side and the handle is by your shoulder."],erros:[],cuidados:[],series:"3",reps:"15-20",descanso:"45s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_High-Pulley_Cable_Side_Bends/0.jpg"},
{id:"db_pallof_press",nome:"Pallof Press",nome_en:"",grupo:"Abdômen",principais:["Reto abdominal"],secundarios:["Peitoral", "Deltóide"],equipamento:"Polia",nivel:"Iniciante",passos:["Connect a standard handle to a tower, and—if possible—position the cable to shoulder height. If not, a low pulley will suffice.", "With your side to the cable, grab the handle with both hands and step away from the tower. You should be approximately arm's length away from the pulley, with the tension of the weight on the cable.", "With your feet positioned hip-width apart and knees slightly bent, hold the cable to the middle of your chest. This will be your starting position."],erros:[],cuidados:[],series:"3",reps:"15-20",descanso:"45s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pallof_Press/0.jpg"},
{id:"db_pallof_press_with_rotation",nome:"Pallof Press With Rotation",nome_en:"",grupo:"Abdômen",principais:["Reto abdominal"],secundarios:["Peitoral", "Deltóide"],equipamento:"Polia",nivel:"Iniciante",passos:["Connect a standard handle to a tower, and position the cable to shoulder height.", "With your side to the cable, grab the handle with one hand and step away from the tower. You should be approximately arm's length away from the pulley, with the tension of the weight on the cable. Align outstretched arm with cable.", "With your feet positioned hip-width apart, pull the cable into your chest and grab the handle with your other hand. Both hands should be on the handle at this time."],erros:[],cuidados:[],series:"3",reps:"15-20",descanso:"45s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pallof_Press_With_Rotation/0.jpg"},
{id:"db_clean_deadlift",nome:"Clean Deadlift",nome_en:"",grupo:"Posterior de Coxa",principais:["Isquiotibiais"],secundarios:["Antebraço", "Glúteos"],equipamento:"Barra",nivel:"Iniciante",passos:["Begin standing with a barbell close to your shins. Your feet should be directly under your hips with your feet turned out slightly. Grip the bar with a double overhand grip or hook grip, about shoulder width apart. Squat down to the bar. Your spine should be in full extension, with a back angle that places your shoulders in front of the bar and your back as vertical as possible.", "Begin by driving through the floor through the front of your heels. As the bar travels upward, maintain a constant back angle. Flare your knees out to the side to help keep them out of the bar's path.", "After the bar crosses the knees, complete the lift by driving the hips into the bar until your hips and knees are extended."],erros:[],cuidados:[],series:"3",reps:"10-12",descanso:"75s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Clean_Deadlift/0.jpg"},
{id:"db_clean",nome:"Clean",nome_en:"",grupo:"Posterior de Coxa",principais:["Isquiotibiais"],secundarios:["Panturrilha", "Antebraço"],equipamento:"Barra",nivel:"Intermediário",passos:["With a barbell on the floor close to the shins, take an overhand (or hook) grip just outside the legs. Lower your hips with the weight focused on the heels, back straight, head facing forward, chest up, with your shoulders just in front of the bar. This will be your starting position.", "", "Begin the first pull by driving through the heels, extending your knees. Your back angle should stay the same, and your arms should remain straight. Move the weight with control as you continue to above the knees."],erros:[],cuidados:[],series:"3-4",reps:"10-12",descanso:"75s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Clean/0.jpg"},
{id:"db_good_morning",nome:"Good Morning",nome_en:"",grupo:"Posterior de Coxa",principais:["Isquiotibiais"],secundarios:["Reto abdominal", "Glúteos"],equipamento:"Barra",nivel:"Intermediário",passos:["Begin with a bar on a rack at shoulder height. Rack the bar across the rear of your shoulders as you would a power squat, not on top of your shoulders. Keep your back tight, shoulder blades pinched together, and your knees slightly bent. Step back from the rack.", "Begin by bending at the hips, moving them back as you bend over to near parallel. Keep your back arched and your cervical spine in proper alignment.", "Reverse the motion by extending through the hips with your glutes and hamstrings. Continue until you have returned to the starting position."],erros:[],cuidados:[],series:"3-4",reps:"10-12",descanso:"75s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Good_Morning/0.jpg"},
{id:"db_hanging_bar_good_morning",nome:"Hanging Bar Good Morning",nome_en:"",grupo:"Posterior de Coxa",principais:["Isquiotibiais"],secundarios:["Reto abdominal", "Glúteos"],equipamento:"Barra",nivel:"Intermediário",passos:["Begin with a bar on a rack at about the same height as your stomach. Suspend the bar using chains or suspension straps.", "Bend over underneath the bar and rack the bar across the rear of your shoulders as you would a power squat, not on top of your traps. At the proper height, you should be near parallel to the floor when bent over. Keep your back tight, shoulder blades pinched together, and your knees slightly bent. Keep your back arched and your cervical spine in proper alignment.", "Begin the motion by extending through the hips with your glutes and hamstrings, and you are standing with the weight."],erros:[],cuidados:[],series:"3-4",reps:"10-12",descanso:"75s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hanging_Bar_Good_Morning/0.jpg"},
{id:"db_muscle_snatch",nome:"Muscle Snatch",nome_en:"",grupo:"Posterior de Coxa",principais:["Isquiotibiais"],secundarios:["Glúteos", "Eretores"],equipamento:"Barra",nivel:"Intermediário",passos:["Begin with a loaded barbell held at the mid thigh position with a wide grip. The feet should be directly below the hips, with the feet turned out as needed. Lower the hips, with the chest up and the head looking forward. The shoulders should be just in front of the bar. This will be the starting position.", "Begin the pull by driving through the front of the heels, raising the bar. Transition into the second pull by extending through the hips knees and ankles, driving the bar up as quickly as possible. The bar should be close to the body.", "Continue raising the bar to the overhead position, without rebending the knees."],erros:[],cuidados:[],series:"3-4",reps:"10-12",descanso:"75s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Muscle_Snatch/0.jpg"},
{id:"db_power_clean",nome:"Power Clean",nome_en:"",grupo:"Posterior de Coxa",principais:["Isquiotibiais"],secundarios:["Panturrilha", "Antebraço"],equipamento:"Barra",nivel:"Intermediário",passos:["Stand with your feet slightly wider than shoulder width apart and toes pointing out slightly.", "Squat down and grasp bar with a closed, pronated grip. Your hands should be slightly wider than shoulder width apart outside knees with elbows fully extended.", "Place the bar about 1 inch in front of your shins and over the balls of your feet."],erros:[],cuidados:[],series:"3-4",reps:"10-12",descanso:"75s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Power_Clean/0.jpg"},
{id:"db_power_clean_from_blocks",nome:"Power Clean from Blocks",nome_en:"",grupo:"Posterior de Coxa",principais:["Isquiotibiais"],secundarios:["Quadríceps"],equipamento:"Barra",nivel:"Intermediário",passos:["With a barbell on boxes of the desired height, take a grip just outside the legs. Lower your hips with the weight focused on the heels, back straight, head facing forward, chest up, with your shoulders just in front of the bar. This will be your starting position.", "Begin the first pull by driving through the heels, extending your knees. Your back angle should stay the same, and your arms should remain straight. As the bar approaches the mid-thigh position, begin extending through the hips.", "In a jumping motion, accelerate by extending the hips, knees, and ankles, using speed to move the bar upward. There should be no need to actively pull through the arms to accelerate the weight. At the end of the second pull, the body should be fully extended, leaning slightly back, with the arms still extended."],erros:[],cuidados:[],series:"3-4",reps:"10-12",descanso:"75s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Power_Clean_from_Blocks/0.jpg"},
{id:"db_romanian_deadlift",nome:"Stiff Romeno",nome_en:"",grupo:"Posterior de Coxa",principais:["Isquiotibiais"],secundarios:["Panturrilha", "Glúteos"],equipamento:"Barra",nivel:"Intermediário",passos:["Put a barbell in front of you on the ground and grab it using a pronated (palms facing down) grip that a little wider than shoulder width. Tip: Depending on the weight used, you may need wrist wraps to perform the exercise and also a raised platform in order to allow for better range of motion.", "Bend the knees slightly and keep the shins vertical, hips back and back straight. This will be your starting position.", "Keeping your back and arms completely straight at all times, use your hips to lift the bar as you exhale. Tip: The movement should not be fast but steady and under control."],erros:[],cuidados:[],series:"3-4",reps:"10-12",descanso:"75s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Romanian_Deadlift/0.jpg"},
{id:"db_romanian_deadlift_from_deficit",nome:"Stiff Romeno com Déficit",nome_en:"",grupo:"Posterior de Coxa",principais:["Isquiotibiais"],secundarios:["Antebraço", "Glúteos"],equipamento:"Barra",nivel:"Intermediário",passos:["Begin standing while holding a bar at arm's length in front of you. You can stand on a raised platform to increase the range of motion.", "Begin by flexing the knees slightly, and then flex at the hip, moving your butt back as far as possible, lowering the torso as far as flexibility allows. The back should remain in absolute extension at all times, and the bar should remain in contact with the legs. If done properly, there should be heavy tension felt in the hamstrings.", "Reverse the motion to return to the starting position."],erros:[],cuidados:[],series:"3-4",reps:"10-12",descanso:"75s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Romanian_Deadlift_from_Deficit/0.jpg"},
{id:"db_snatch_deadlift",nome:"Levantamento Terra Snatch",nome_en:"",grupo:"Posterior de Coxa",principais:["Isquiotibiais"],secundarios:["Antebraço", "Glúteos"],equipamento:"Barra",nivel:"Intermediário",passos:["The snatch deadlift strengthens the first pull of the snatch. Begin with a wide snatch grip with the barbell placed on the platform. The feet should be directly under the hips, with the feet turned out. Squat down to the bar, keeping the back in absolute extension with the head facing forward.", "Initiate the movement by driving through the heels, raising the hips. The back angle should remain the same until the bar passes the knees.", "At that point, drive your hips through the bar as you lay back. Return the bar to the platform by reversing the motion."],erros:[],cuidados:[],series:"3-4",reps:"10-12",descanso:"75s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Snatch_Deadlift/0.jpg"},
{id:"db_snatch_pull",nome:"Puxada Snatch",nome_en:"",grupo:"Posterior de Coxa",principais:["Isquiotibiais"],secundarios:["Panturrilha", "Glúteos"],equipamento:"Barra",nivel:"Intermediário",passos:["With a barbell on the floor close to the shins, take a wide snatch grip. Lower your hips with the weight focused on the heels, back straight, head facing forward, chest up, with your shoulders just in front of the bar. This will be your starting position.", "Begin the first pull by driving through the heels, extending your knees. Your back angle should stay the same, and your arms should remain straight. Move the weight with control as you continue to above the knees.", "Next comes the second pull, the main source of acceleration for the pull. As the bar approaches the mid-thigh position, begin extending through the hips. In a jumping motion, accelerate by extending the hips, knees, and ankles, using speed to move the bar upward."],erros:[],cuidados:[],series:"3-4",reps:"10-12",descanso:"75s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Snatch_Pull/0.jpg"},
{id:"db_stiff_legged_barbell_deadlift",nome:"Levantamento Terra Pernas Retas",nome_en:"",grupo:"Posterior de Coxa",principais:["Isquiotibiais"],secundarios:["Glúteos", "Eretores"],equipamento:"Barra",nivel:"Intermediário",passos:["Grasp a bar using an overhand grip (palms facing down). You may need some wrist wraps if using a significant amount of weight.", "Stand with your torso straight and your legs spaced using a shoulder width or narrower stance. The knees should be slightly bent. This is your starting position.", "Keeping the knees stationary, lower the barbell to over the top of your feet by bending at the hips while keeping your back straight. Keep moving forward as if you were going to pick something from the floor until you feel a stretch on the hamstrings. Inhale as you perform this movement."],erros:[],cuidados:[],series:"3-4",reps:"10-12",descanso:"75s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Stiff-Legged_Barbell_Deadlift/0.jpg"},
{id:"db_sumo_deadlift",nome:"Levantamento Terra Sumô",nome_en:"",grupo:"Posterior de Coxa",principais:["Isquiotibiais"],secundarios:["Adutores", "Antebraço"],equipamento:"Barra",nivel:"Intermediário",passos:["Begin with a bar loaded on the ground. Approach the bar so that the bar intersects the middle of the feet. The feet should be set very wide, near the collars. Bend at the hips to grip the bar. The arms should be directly below the shoulders, inside the legs, and you can use a pronated grip, a mixed grip, or hook grip. Relax the shoulders, which in effect lengthens your arms.", "Take a breath, and then lower your hips, looking forward with your head with your chest up. Drive through the floor, spreading your feet apart, with your weight on the back half of your feet. Extend through the hips and knees.", "As the bar passes through the knees, lean back and drive the hips into the bar, pulling your shoulder blades together."],erros:[],cuidados:[],series:"3-4",reps:"10-12",descanso:"75s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sumo_Deadlift/0.jpg"},
{id:"db_sumo_deadlift_with_bands",nome:"Sumo Deadlift with Bands",nome_en:"",grupo:"Posterior de Coxa",principais:["Isquiotibiais"],secundarios:["Adutores", "Antebraço"],equipamento:"Barra",nivel:"Intermediário",passos:["To deadlift with short bands, simply loop them over the bar before you start, and step into them to set up. Ensure that they under the back half of your foot, directly where you are driving into the floor.", "Begin with a bar loaded on the ground. Approach the bar so that the bar intersects the middle of the feet. The feet should be set very wide, near the collars. Bend at the hips to grip the bar. The arms should be directly below the shoulders, inside the legs, and you can use a pronated grip, a mixed grip, or hook grip.", "Take a breath, and then lower your hips, looking forward with your head with your chest up. Drive through the floor, spreading your feet apart, with your weight on the back half of your feet. Extend through the hips and knees."],erros:[],cuidados:[],series:"3-4",reps:"10-12",descanso:"75s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sumo_Deadlift_with_Bands/0.jpg"},
{id:"db_sumo_deadlift_with_chains",nome:"Sumo Deadlift with Chains",nome_en:"",grupo:"Posterior de Coxa",principais:["Isquiotibiais"],secundarios:["Abdutores", "Adutores"],equipamento:"Barra",nivel:"Intermediário",passos:["You can attach the chains to the sleeves of the bar, or just drape the middle over the bar so there is a greater weight increase as you lift. Attempt to keep the ends of the chains away from the plates so you don't hit them when you lower the weight.", "Begin with a bar loaded on the ground. Approach the bar so that the bar intersects the middle of the feet. The feet should be set very wide, near the collars. Bend at the hips to grip the bar. The arms should be directly below the shoulders, inside the legs, and you can use a pronated grip, a mixed grip, or hook grip. Relax the shoulders, which in effect lengthens your arms.", "Take a breath, and then lower your hips, looking forward with your head with your chest up. Drive through the floor, spreading your feet apart, with your weight on the back half of your feet. Extend through the hips and knees."],erros:[],cuidados:[],series:"3-4",reps:"10-12",descanso:"75s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sumo_Deadlift_with_Chains/0.jpg"},
{id:"db_hang_snatch",nome:"Hang Snatch",nome_en:"",grupo:"Posterior de Coxa",principais:["Isquiotibiais"],secundarios:["Reto abdominal", "Panturrilha"],equipamento:"Barra",nivel:"Avançado",passos:["Begin with a wide grip on the bar, with an overhand or hook grip. The feet should be directly below the hips with the feet turned out. Your knees should be slightly bent, and the torso inclined forward. The spine should be fully extended and the head facing forward. The bar should be at the hips. This will be your starting position.", "Aggressively extend through the legs and hips. At peak extension, shrug the shoulders and allow the elbows to flex to the side.", "As you move your feet into the receiving position, forcefully pull yourself below the bar as you elevate the bar overhead. Receive the bar with your body as low as possible and the arms fully extended overhead."],erros:[],cuidados:[],series:"4-5",reps:"10-12",descanso:"75s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hang_Snatch/0.jpg"},
{id:"db_hang_snatch___below_knees",nome:"Hang Snatch - Below Knees",nome_en:"",grupo:"Posterior de Coxa",principais:["Isquiotibiais"],secundarios:["Reto abdominal", "Panturrilha"],equipamento:"Barra",nivel:"Avançado",passos:["Begin with a wide grip on the bar, with an overhand or hook grip. The feet should be directly below the hips with the feet turned out. Your knees should be slightly bent, and the torso inclined forward. The spine should be fully extended and the head facing forward. The bar should be just below the knees. This will be your starting position.", "Aggressively extend through the legs and hips. At peak extension, shrug the shoulders and allow the elbows to flex to the side.", "As you move your feet into the receiving position, forcefully pull yourself below the bar as you elevate the bar overhead. Receive the bar with your body as low as possible and the arms fully extended overhead."],erros:[],cuidados:[],series:"4-5",reps:"10-12",descanso:"75s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hang_Snatch_-_Below_Knees/0.jpg"},
{id:"db_power_snatch",nome:"Power Snatch",nome_en:"",grupo:"Posterior de Coxa",principais:["Isquiotibiais"],secundarios:["Panturrilha", "Glúteos"],equipamento:"Barra",nivel:"Avançado",passos:["Begin with a loaded barbell on the floor. The bar should be close to or touching the shins, and a wide grip should be taken on the bar. The feet should be directly below the hips, with the feet turned out as needed. Lower the hips, with the chest up and the head looking forward. The shoulders should be just in front of the bar. This will be the starting position.", "Begin the first pull by driving through the front of the heels, raising the bar from the ground. The back angle should stay the same until the bar passes the knees.", "Transition into the second pull by extending through the hips knees and ankles, driving the bar up as quickly as possible. The bar should be close to the body. At peak extension, shrug the shoulders and allow the elbows to flex to the side."],erros:[],cuidados:[],series:"4-5",reps:"10-12",descanso:"75s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Power_Snatch/0.jpg"},
{id:"db_reverse_band_sumo_deadlift",nome:"Reverse Band Sumo Deadlift",nome_en:"",grupo:"Posterior de Coxa",principais:["Isquiotibiais"],secundarios:["Abdutores", "Adutores"],equipamento:"Barra",nivel:"Avançado",passos:["Begin with a bar loaded on the floor inside of a power rack. Attach bands to the top of the rack, using either pegs or the frame itself. Attach the other end to the barbell.", "Approach the bar so that the bar intersects the middle of the feet. The feet should be set very wide, near the collars. Bend at the hips to grip the bar. The arms should be directly below the shoulders, inside the legs, and you can use a pronated grip, a mixed grip, or hook grip. Relax the shoulders, which in effect lengthens your arms.", "Take a breath, and then lower your hips, looking forward with your head with your chest up. Drive through the floor, spreading your feet apart, with your weight on the back half of your feet. Extend through the hips and knees."],erros:[],cuidados:[],series:"4-5",reps:"10-12",descanso:"75s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Band_Sumo_Deadlift/0.jpg"},
{id:"db_split_snatch",nome:"Split Snatch",nome_en:"",grupo:"Posterior de Coxa",principais:["Isquiotibiais"],secundarios:["Panturrilha", "Antebraço"],equipamento:"Barra",nivel:"Avançado",passos:["Begin with a loaded barbell on the floor. The bar should be close to or touching the shins, and a wide grip should be taken on the bar. The feet should be directly below the hips, with the feet turned out as needed. Lower the hips, with the chest up and the head looking forward. The shoulders should be just in front of the bar. This will be the starting position.", "Begin the first pull by driving through the front of the heels, raising the bar from the ground. The back angle should stay the same until the bar passes the knees.", "Transition into the second pull by extending through the hips knees and ankles, driving the bar up as quickly as possible. The bar should be close to the body. At peak extension, shrug the shoulders and allow the elbows to flex to the side."],erros:[],cuidados:[],series:"4-5",reps:"10-12",descanso:"75s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Split_Snatch/0.jpg"},
{id:"db_thigh_adductor",nome:"Adução de Coxa",nome_en:"",grupo:"Adutores",principais:["Adutores"],secundarios:["Glúteos", "Isquiotibiais"],equipamento:"Máquina",nivel:"Iniciante",passos:["To begin, sit down on the adductor machine and select a weight you are comfortable with. When your legs are positioned properly on the leg pads of the machine, grip the handles on each side. Your entire upper body (from the waist up) should be stationary. This is the starting position.", "Slowly press against the machine with your legs to move them towards each other while exhaling.", "Feel the contraction for a second and begin to move your legs back to the starting position while breathing in. Note: Remember to keep your upper body stationary and avoid fast jerking motions in order to prevent any injuries from occurring."],erros:[],cuidados:[],series:"3",reps:"12-15",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Thigh_Adductor/0.jpg"},
{id:"db_band_hip_adductions",nome:"Band Hip Adductions",nome_en:"",grupo:"Adutores",principais:["Adutores"],secundarios:[],equipamento:"Elástico",nivel:"Iniciante",passos:["Anchor a band around a solid post or other object.", "Stand with your left side to the post, and put your right foot through the band, getting it around the ankle.", "Stand up straight and hold onto the post if needed. This will be your starting position."],erros:[],cuidados:[],series:"3",reps:"12-15",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Band_Hip_Adductions/0.jpg"},
{id:"db_lateral_bound",nome:"Lateral Bound",nome_en:"",grupo:"Adutores",principais:["Adutores"],secundarios:["Abdutores", "Panturrilha"],equipamento:"Peso corporal",nivel:"Iniciante",passos:["Assume a half squat position facing 90 degrees from your direction of travel. This will be your starting position.", "Allow your lead leg to do a countermovement inward as you shift your weight to the outside leg.", "Immediately push off and extend, attempting to bound to the side as far as possible."],erros:[],cuidados:[],series:"3",reps:"12-15",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lateral_Bound/0.jpg"},
{id:"db_side_leg_raises",nome:"Side Leg Raises",nome_en:"",grupo:"Adutores",principais:["Adutores"],secundarios:[],equipamento:"Peso corporal",nivel:"Iniciante",passos:["Stand next to a chair, which you may hold onto as a support. Stand on one leg. This will be your starting position.", "Keeping your leg straight, raise it as far out to the side as possible, and swing it back down, allowing it to cross the opposite leg.", "Repeat this swinging motion 5-10 times, increasing the range of motion as you do so."],erros:[],cuidados:[],series:"3",reps:"12-15",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Leg_Raises/0.jpg"},
{id:"db_groiners",nome:"Groiners",nome_en:"",grupo:"Adutores",principais:["Adutores"],secundarios:[],equipamento:"Peso corporal",nivel:"Intermediário",passos:["Begin in a pushup position on the floor. This will be your starting position.", "Using both legs, jump forward landing with your feet next to your hands. Keep your head up as you do so.", "Return to the starting position and immediately repeat the movement, continuing for 10-20 repetitions."],erros:[],cuidados:[],series:"3-4",reps:"12-15",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Groiners/0.jpg"},
{id:"db_carioca_quick_step",nome:"Carioca Quick Step",nome_en:"",grupo:"Adutores",principais:["Adutores"],secundarios:["Reto abdominal", "Abdutores"],equipamento:"",nivel:"Iniciante",passos:["Begin with your feet a few inches apart and your left arm up in a relaxed, athletic position.", "With your right foot, quick step behind and pull the knee up.", "Fire your arms back up when you pull the right knee, being sure that your knee goes straight up and down. Avoid turning your feet as you move and continue to look forward as you move to the side."],erros:[],cuidados:[],series:"3",reps:"12-15",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Carioca_Quick_Step/0.jpg"},
{id:"db_lateral_box_jump",nome:"Lateral Box Jump",nome_en:"",grupo:"Adutores",principais:["Adutores"],secundarios:["Abdutores", "Panturrilha"],equipamento:"Outro",nivel:"Iniciante",passos:["Assume a comfortable standing position, with a short box positioned next to you. This will be your starting position.", "Quickly dip into a quarter squat to initiate the stretch reflex, and immediately reverse direction to jump up and to the side.", "Bring your knees high enough to ensure your feet have good clearance over the box."],erros:[],cuidados:[],series:"3",reps:"12-15",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lateral_Box_Jump/0.jpg"},
{id:"db_lateral_cone_hops",nome:"Lateral Cone Hops",nome_en:"",grupo:"Adutores",principais:["Adutores"],secundarios:["Abdutores", "Panturrilha"],equipamento:"Outro",nivel:"Iniciante",passos:["Position a number of cones in a row several feet apart.", "Stand next to the end of the cones, facing 90 degrees to the direction of travel. This will be your starting position.", "Begin the jump by dipping with the knees to initiate a stretch reflex, and immediately reverse direction to push off the ground, jumping up and sideways over the cone."],erros:[],cuidados:[],series:"3",reps:"12-15",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lateral_Cone_Hops/0.jpg"},
{id:"db_barbell_side_split_squat",nome:"Barbell Side Split Squat",nome_en:"",grupo:"Quadríceps",principais:["Quadríceps"],secundarios:["Panturrilha", "Isquiotibiais"],equipamento:"Barra",nivel:"Iniciante",passos:["Stand up straight while holding a barbell placed on the back of your shoulders (slightly below the neck). Your feet should be placed wide apart with the foot of the lead leg angled out to the side. This will be your starting position.", "Lower your body towards the side of your angled foot by bending the knee and hip of your lead leg and while keeping the opposite leg only slightly bent. Breathe in as you lower your body.", "Return to the starting position by extending the hip and knee of the lead leg. Breathe out as you perform this movement."],erros:[],cuidados:[],series:"3",reps:"10-15",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Side_Split_Squat/0.jpg"},
{id:"db_barbell_squat",nome:"Agachamento Livre com Barra",nome_en:"",grupo:"Quadríceps",principais:["Quadríceps"],secundarios:["Panturrilha", "Glúteos"],equipamento:"Barra",nivel:"Iniciante",passos:["This exercise is best performed inside a squat rack for safety purposes. To begin, first set the bar on a rack to just below shoulder level. Once the correct height is chosen and the bar is loaded, step under the bar and place the back of your shoulders (slightly below the neck) across it.", "Hold on to the bar using both arms at each side and lift it off the rack by first pushing with your legs and at the same time straightening your torso.", "Step away from the rack and position your legs using a shoulder width medium stance with the toes slightly pointed out. Keep your head up at all times and also maintain a straight back. This will be your starting position. (Note: For the purposes of this discussion we will use the medium stance described above which targets overall development; however you can choose any of the three stances discussed in the foot stances section)."],erros:[],cuidados:[],series:"3",reps:"10-15",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Squat/0.jpg"},
{id:"db_barbell_walking_lunge",nome:"Avanço Caminhando com Barra",nome_en:"",grupo:"Quadríceps",principais:["Quadríceps"],secundarios:["Panturrilha", "Glúteos"],equipamento:"Barra",nivel:"Iniciante",passos:["Begin standing with your feet shoulder width apart and a barbell across your upper back.", "Step forward with one leg, flexing the knees to drop your hips. Descend until your rear knee nearly touches the ground. Your posture should remain upright, and your front knee should stay above the front foot.", "Drive through the heel of your lead foot and extend both knees to raise yourself back up."],erros:[],cuidados:[],series:"3",reps:"10-15",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Walking_Lunge/0.jpg"},
{id:"db_barbell_full_squat",nome:"Agachamento Completo com Barra",nome_en:"",grupo:"Quadríceps",principais:["Quadríceps"],secundarios:["Panturrilha", "Glúteos"],equipamento:"Barra",nivel:"Intermediário",passos:["This exercise is best performed inside a squat rack for safety purposes. To begin, first set the bar on a rack just above shoulder level. Once the correct height is chosen and the bar is loaded, step under the bar and place the back of your shoulders (slightly below the neck) across it.", "Hold on to the bar using both arms at each side and lift it off the rack by first pushing with your legs and at the same time straightening your torso.", "Step away from the rack and position your legs using a shoulder-width medium stance with the toes slightly pointed out. Keep your head up at all times and maintain a straight back. This will be your starting position."],erros:[],cuidados:[],series:"3-4",reps:"10-15",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Full_Squat/0.jpg"},
{id:"db_barbell_hack_squat",nome:"Agachamento Hack com Barra",nome_en:"",grupo:"Quadríceps",principais:["Quadríceps"],secundarios:["Panturrilha", "Antebraço"],equipamento:"Barra",nivel:"Intermediário",passos:["Stand up straight while holding a barbell behind you at arms length and your feet at shoulder width. Tip: A shoulder width grip is best with the palms of your hands facing back. You can use wrist wraps for this exercise for a better grip. This will be your starting position.", "While keeping your head and eyes up and back straight, squat until your upper thighs are parallel to the floor. Breathe in as you slowly go down.", "Pressing mainly with the heel of the foot and squeezing the thighs, go back up as you breathe out."],erros:[],cuidados:[],series:"3-4",reps:"10-15",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Hack_Squat/0.jpg"},
{id:"db_barbell_lunge",nome:"Avanço com Barra",nome_en:"",grupo:"Quadríceps",principais:["Quadríceps"],secundarios:["Panturrilha", "Glúteos"],equipamento:"Barra",nivel:"Intermediário",passos:["This exercise is best performed inside a squat rack for safety purposes. To begin, first set the bar on a rack just below shoulder level. Once the correct height is chosen and the bar is loaded, step under the bar and place the back of your shoulders (slightly below the neck) across it.", "Hold on to the bar using both arms at each side and lift it off the rack by first pushing with your legs and at the same time straightening your torso.", "Step away from the rack and step forward with your right leg and squat down through your hips, while keeping the torso upright and maintaining balance. Inhale as you go down. Note: Do not allow your knee to go forward beyond your toes as you come down, as this will put undue stress on the knee joint. li>"],erros:[],cuidados:[],series:"3-4",reps:"10-15",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Lunge/0.jpg"},
{id:"db_barbell_step_ups",nome:"Step Up com Barra",nome_en:"",grupo:"Quadríceps",principais:["Quadríceps"],secundarios:["Panturrilha", "Glúteos"],equipamento:"Barra",nivel:"Intermediário",passos:["Stand up straight while holding a barbell placed on the back of your shoulders (slightly below the neck) and stand upright behind an elevated platform (such as the one used for spotting behind a flat bench). This is your starting position.", "Place the right foot on the elevated platform. Step on the platform by extending the hip and the knee of your right leg. Use the heel mainly to lift the rest of your body up and place the foot of the left leg on the platform as well. Breathe out as you execute the force required to come up.", "Step down with the left leg by flexing the hip and knee of the right leg as you inhale. Return to the original standing position by placing the right foot of to next to the left foot on the initial position."],erros:[],cuidados:[],series:"3-4",reps:"10-15",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Step_Ups/0.jpg"},
{id:"db_box_squat",nome:"Agachamento no Box",nome_en:"",grupo:"Quadríceps",principais:["Quadríceps"],secundarios:["Adutores", "Panturrilha"],equipamento:"Barra",nivel:"Intermediário",passos:["The box squat allows you to squat to desired depth and develop explosive strength in the squat movement. Begin in a power rack with a box at the appropriate height behind you. Typically, you would aim for a box height that brings you to a parallel squat, but you can train higher or lower if desired.", "Begin by stepping under the bar and placing it across the back of the shoulders. Squeeze your shoulder blades together and rotate your elbows forward, attempting to bend the bar across your shoulders. Remove the bar from the rack, creating a tight arch in your lower back, and step back into position. Place your feet wider for more emphasis on the back, glutes, adductors, and hamstrings, or closer together for more quad development. Keep your head facing forward.", "With your back, shoulders, and core tight, push your knees and butt out and you begin your descent. Sit back with your hips until you are seated on the box. Ideally, your shins should be perpendicular to the ground. Pause when you reach the box, and relax the hip flexors. Never bounce off of a box."],erros:[],cuidados:[],series:"3-4",reps:"10-15",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Box_Squat/0.jpg"},
{id:"db_clean_pull",nome:"Clean Pull",nome_en:"",grupo:"Quadríceps",principais:["Quadríceps"],secundarios:["Antebraço", "Glúteos"],equipamento:"Barra",nivel:"Intermediário",passos:["With a barbell on the floor close to the shins, take an overhand or hook grip just outside the legs. Lower your hips with the weight focused on the heels, back straight, head facing forward, chest up, with your shoulders just in front of the bar. This will be your starting position.", "Begin the first pull by driving through the heels, extending your knees. Your back angle should stay the same, and your arms should remain straight and elbows out. Move the weight with control as you continue to above the knees.", "Next comes the second pull, the main source of acceleration for the clean. As the bar approaches the mid-thigh position, begin extending through the hips. In a jumping motion, accelerate by extending the hips, knees, and ankles, using speed to move the bar upward. There should be no need to actively pull through the arms to accelerate the weight; at the end of the second pull, the body should be fully extended, leaning slightly back, with the arms still extended. Full extension should be violent and abrupt, and ensure that you do not prolong the extension for longer than necessary."],erros:[],cuidados:[],series:"3-4",reps:"10-15",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Clean_Pull/0.jpg"},
{id:"db_clean_from_blocks",nome:"Clean from Blocks",nome_en:"",grupo:"Quadríceps",principais:["Quadríceps"],secundarios:["Panturrilha", "Glúteos"],equipamento:"Barra",nivel:"Intermediário",passos:["With a barbell on boxes or stands of the desired height, take an overhand or hook grip just outside the legs. Lower your hips with the weight focused on the heels, back straight, head facing forward, chest up, with your shoulders just in front of the bar. This will be your starting position.", "Begin the first pull by driving through the heels, extending your knees. Your back angle should stay the same, and your arms should remain straight with the elbows pointed out.", "As full extension is achieved, transition into the receiving position by aggressively shrugging and flexing the arms with the elbows up and out. Aggressively pull yourself down, rotating your elbows under the bar as you do so. Receive the bar in a front squat position, the depth of which is dependent upon the height of the bar at the end of the third pull. The bar should be racked onto the protracted shoulders, lightly touching the throat with the hands relaxed. Continue to descend to the bottom squat position, which will help in the recovery."],erros:[],cuidados:[],series:"3-4",reps:"10-15",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Clean_from_Blocks/0.jpg"},
{id:"db_elevated_back_lunge",nome:"Elevated Back Lunge",nome_en:"",grupo:"Quadríceps",principais:["Quadríceps"],secundarios:["Glúteos", "Isquiotibiais"],equipamento:"Barra",nivel:"Intermediário",passos:["Position a bar onto a rack at shoulder height loaded to an appropriate weight. Place a short, raised platform behind you.", "Rack the bar onto your upper back, keeping your back arched and tight. Step onto your raised platform with both feet. This will be your starting position.", "Begin by stepping backwards with one leg. Descend by flexing your hips and knees until your knee touches the floor."],erros:[],cuidados:[],series:"3-4",reps:"10-15",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Elevated_Back_Lunge/0.jpg"},
{id:"db_frankenstein_squat",nome:"Frankenstein Squat",nome_en:"",grupo:"Quadríceps",principais:["Quadríceps"],secundarios:["Reto abdominal", "Panturrilha"],equipamento:"Barra",nivel:"Intermediário",passos:["This drill teaches you the proper positioning of both the bar and your body during the clean and front squat.", "Place the barbell on the front of the shoulders, releasing your grip and extending your arms out in front of you. The shoulders should be pushed forward to create a shelf, and the bar should be in contact with the throat. Ensure that you only move your shoulder blades forward; don't round the thoracic spine.", "Squat by flexing the knees and hips, sitting in between your legs. Keep the torso upright, the arms up, and the shoulders forward, and the bar should stay in place. Go to the bottom of the squat, until your hamstrings contact your calves."],erros:[],cuidados:[],series:"3-4",reps:"10-15",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Frankenstein_Squat/0.jpg"},
{id:"db_front_squat_clean_grip",nome:"Front Squat (Clean Grip)",nome_en:"",grupo:"Quadríceps",principais:["Quadríceps"],secundarios:["Reto abdominal", "Glúteos"],equipamento:"Barra",nivel:"Intermediário",passos:["To begin, first set the bar in a rack slightly below shoulder level. Rest the bar on top of the deltoids, pushing into the clavicles, and lightly touching the throat. Your hands should be in a clean grip, touching the bar only with your fingers to help keep it in position.", "Lift the bar off the rack by first pushing with your legs and at the same time straightening your torso. Step away from the rack and position your legs using a shoulder width medium stance with the toes slightly pointed out. Keep your head and elbows up at all times. This will be your starting position.", "Bend at the knees, sitting down between your legs. Continue down until your hamstrings are on your calves. Keep your knees aligned with your feet by consciously using your abductors to push your knees out as you squat."],erros:[],cuidados:[],series:"3-4",reps:"10-15",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Squat_Clean_Grip/0.jpg"},
{id:"db_hang_clean",nome:"Hang Clean",nome_en:"",grupo:"Quadríceps",principais:["Quadríceps"],secundarios:["Panturrilha", "Antebraço"],equipamento:"Barra",nivel:"Intermediário",passos:["Begin with a shoulder width, double overhand or hook grip, with the bar hanging at the mid thigh position. Your back should be straight and inclined slightly forward.", "Begin by aggressively extending through the hips, knees and ankles, driving the weight upward. As you do so, shrug your shoulders towards your ears.", "Immediately recover by driving through the heels, keeping the torso upright and elbows up. Continue until you have risen to a standing position."],erros:[],cuidados:[],series:"3-4",reps:"10-15",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hang_Clean/0.jpg"},
{id:"db_hang_clean___below_the_knees",nome:"Hang Clean - Below the Knees",nome_en:"",grupo:"Quadríceps",principais:["Quadríceps"],secundarios:["Panturrilha", "Antebraço"],equipamento:"Barra",nivel:"Intermediário",passos:["Begin with a shoulder width, double overhand or hook grip, with the bar hanging just below the knees. Your back should be straight and inclined slightly forward.", "Begin by aggressively extending through the hips, knees and ankles, driving the weight upward. As you do so, shrug your shoulders towards your ears. As full extension is achieved, transition into the third pull by aggressively shrugging and flexing the arms with the elbows up and out.", "At peak extension, aggressively pull yourself down, rotating your elbows under the bar as you do so. Receive the bar in a front squat position, the depth of which is dependent upon the height of the bar at the end of the third pull. The bar should be racked onto the protracted shoulders, lightly touching the throat with the hands relaxed. Continue to descend to the bottom squat position, which will help in the recovery."],erros:[],cuidados:[],series:"3-4",reps:"10-15",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hang_Clean_-_Below_the_Knees/0.jpg"},
{id:"db_heaving_snatch_balance",nome:"Heaving Snatch Balance",nome_en:"",grupo:"Quadríceps",principais:["Quadríceps"],secundarios:["Reto abdominal", "Antebraço"],equipamento:"Barra",nivel:"Intermediário",passos:["This drill helps you learn the snatch. Begin by holding a light weight across the back of the shoulders. Your feet should be slightly wider than hip width apart with the feet turned out, the same position that you would perform a squat with.", "Begin by dipping with the knees slightly, and popping back up to briefly unload the bar. Drive yourself underneath the bar, elevating it overhead as you descend into a full squat.", "Return to a standing position."],erros:[],cuidados:[],series:"3-4",reps:"10-15",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Heaving_Snatch_Balance/0.jpg"},
{id:"db_jefferson_squats",nome:"Jefferson Squats",nome_en:"",grupo:"Quadríceps",principais:["Quadríceps"],secundarios:["Panturrilha", "Glúteos"],equipamento:"Barra",nivel:"Intermediário",passos:["Place a barbell on the floor.", "Stand in the middle of the bar length wise.", "Bend down by bending at the knees and keeping your back straight and grasp the front of the bar with your right hand. Your palm should be in (neutral grip) facing the left side."],erros:[],cuidados:[],series:"3-4",reps:"10-15",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Jefferson_Squats/0.jpg"},
{id:"db_narrow_stance_squats",nome:"Narrow Stance Squats",nome_en:"",grupo:"Quadríceps",principais:["Quadríceps"],secundarios:["Panturrilha", "Glúteos"],equipamento:"Barra",nivel:"Intermediário",passos:["This exercise is best performed inside a squat rack for safety purposes. To begin, first set the bar on a rack that best matches your height. Once the correct height is chosen and the bar is loaded, step under the bar and place the back of your shoulders (slightly below the neck) across it.", "Hold on to the bar using both arms at each side and lift it off the rack by first pushing with your legs and at the same time straightening your torso.", "Step away from the rack and position your legs using a less-than-shoulder-width narrow stance with the toes slightly pointed out. Feet should be around 3-6 inches apart. Keep your head up at all times (looking down will get you off balance) and maintain a straight back. This will be your starting position. (Note: For the purposes of this discussion we will use the medium stance described above which targets overall development; however you can choose any of the three stances discussed in the foot stances section)."],erros:[],cuidados:[],series:"3-4",reps:"10-15",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Narrow_Stance_Squats/0.jpg"},
{id:"db_olympic_squat",nome:"Olympic Squat",nome_en:"",grupo:"Quadríceps",principais:["Quadríceps"],secundarios:["Panturrilha", "Glúteos"],equipamento:"Barra",nivel:"Intermediário",passos:["Begin with a barbell supported on top of the traps. The chest should be up, and the head facing forward. Adopt a hip width stance with the feet turned out as needed.", "Descend by flexing the knees, refraining from moving the hips back as much as possible. This requires that the knees travel forward; ensure that they stay aligned with the feet. The goal is to keep the torso as upright as possible. Continue all the way down, keeping the weight on the front of the heel.", "At the moment the upper legs contact the lower, reverse the motion, driving the weight upward."],erros:[],cuidados:[],series:"3-4",reps:"10-15",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Olympic_Squat/0.jpg"},
{id:"db_power_snatch_from_blocks",nome:"Power Snatch from Blocks",nome_en:"",grupo:"Quadríceps",principais:["Quadríceps"],secundarios:["Panturrilha", "Antebraço"],equipamento:"Barra",nivel:"Intermediário",passos:["Begin with a loaded barbell on boxes or stands of the desired height. A wide grip should be taken on the bar. The feet should be directly below the hips, with the feet turned out as needed. Lower the hips, with the chest up and the head looking forward. The shoulders should be just in front of the bar, with the elbows pointed out. This will be the starting position.", "Begin the first pull by driving through the front of the heels, raising the bar from the boxes.", "Transition into the second pull by extending through the hips knees and ankles, driving the bar up as quickly as possible. The bar should be close to the body. At peak extension, shrug the shoulders and allow the elbows to flex to the side."],erros:[],cuidados:[],series:"3-4",reps:"10-15",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Power_Snatch_from_Blocks/0.jpg"},
{id:"db_reverse_band_box_squat",nome:"Reverse Band Box Squat",nome_en:"",grupo:"Quadríceps",principais:["Quadríceps"],secundarios:["Abdutores", "Adutores"],equipamento:"Barra",nivel:"Intermediário",passos:["Begin in a power rack with a box at the appropriate height behind you. Set up the bands either on band pegs or attached to the top of the rack, ensuring they will be directly above the bar during the squat. Attach the other end to the bar.", "Begin by stepping under the bar and placing it across the back of the shoulders. Squeeze your shoulder blades together and rotate your elbows forward, attempting to bend the bar across your shoulders. Remove the bar from the rack, creating a tight arch in your lower back, and step back into position. Place your feet wider for more emphasis on the back, glutes, adductors, and hamstrings, or closer together for more quad development. Keep your head facing forward.", "With your back, shoulders, and core tight, push your knees and butt out and you begin your descent. Sit back with your hips until you are seated on the box. Ideally, your shins should be perpendicular to the ground. Pause when you reach the box, and relax the hip flexors. Never bounce off of a box."],erros:[],cuidados:[],series:"3-4",reps:"10-15",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Band_Box_Squat/0.jpg"},
{id:"db_snatch",nome:"Snatch",nome_en:"",grupo:"Quadríceps",principais:["Quadríceps"],secundarios:["Bíceps", "Glúteos"],equipamento:"Barra",nivel:"Intermediário",passos:["Place your feet at a shoulder width stance with the barbell resting right above the connection between the toes and the rest of the foot.", "With a palms facing down grip, bend at the knees and keeping the back flat grab the bar using a wider than shoulder width grip. Bring the hips down and make sure that your body drops as if you were going to sit on a chair. This will be your starting position.", "Start pushing the floor as if it were a moving platform with your feet and simultaneously start lifting the barbell keeping it close to your legs."],erros:[],cuidados:[],series:"3-4",reps:"10-15",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Snatch/0.jpg"},
{id:"db_snatch_balance",nome:"Snatch Balance",nome_en:"",grupo:"Quadríceps",principais:["Quadríceps"],secundarios:["Panturrilha", "Glúteos"],equipamento:"Barra",nivel:"Intermediário",passos:["Begin with the feet in the pulling position, the bar racked across the back of the shoulders, and the hands placed in a wide snatch grip.", "Pop the bar with an abrupt dip and drive of the knees, and aggressively drive under the bar, transitioning the feet into the receiving position.", "Receive the bar locked out overhead near the bottom of the squat. The torso should remain vertical, lowering the hips between the legs."],erros:[],cuidados:[],series:"3-4",reps:"10-15",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Snatch_Balance/0.jpg"},
{id:"db_speed_box_squat",nome:"Speed Box Squat",nome_en:"",grupo:"Quadríceps",principais:["Quadríceps"],secundarios:["Panturrilha", "Glúteos"],equipamento:"Barra",nivel:"Intermediário",passos:["Attach bands to the bar that are securely anchored near the ground. You may need to choke the bands to get adequate tension.", "Use a box of an appropriate height for this exercise. Load the bar to a weight that still requires effort, but isn't so heavy that speed is compromised. Typically, that will be between 50-70% of your one rep max.", "Position the bar on your upper back, shoulder blades retracted, back arched and everything tight head to toe. This will be the starting position."],erros:[],cuidados:[],series:"3-4",reps:"10-15",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Speed_Box_Squat/0.jpg"},
{id:"db_split_clean",nome:"Split Clean",nome_en:"",grupo:"Quadríceps",principais:["Quadríceps"],secundarios:["Panturrilha", "Antebraço"],equipamento:"Barra",nivel:"Intermediário",passos:["With a barbell on the floor close to the shins, take an overhand grip just outside the legs. Lower your hips with the weight focused on the heels, back straight, head facing forward, chest up, with your shoulders just in front of the bar. This will be your starting position.", "Begin the first pull by driving through the heels, extending your knees. Your back angle should stay the same, and your arms should remain straight. Move the weight with control as you continue to above the knees.", "Next comes the second pull, the main source of acceleration for the clean. As the bar approaches the mid-thigh position, begin extending through the hips. In a jumping motion, accelerate by extending the hips, knees, and ankles, using speed to move the bar upward. There should be no need to actively pull through the arms to accelerate the weight; at the end of the second pull, the body should be fully extended, leaning slightly back, with the arms still extended."],erros:[],cuidados:[],series:"3-4",reps:"10-15",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Split_Clean/0.jpg"},
{id:"db_close_grip_ez_bar_curl_with_band",nome:"Close-Grip EZ-Bar Curl with Band",nome_en:"",grupo:"Bíceps",principais:["Bíceps"],secundarios:["Antebraço"],equipamento:"Barra EZ",nivel:"Iniciante",passos:["Attach a band to each end of the bar. Take the bar, placing a foot on the middle of the band. Stand upright with a narrow, supinated grip on the EZ bar. The elbows should be close to the torso. This will be your starting position.", "While keeping the upper arms in place, flex the elbows to execute the curl. Exhale as the weight is lifted.", "Continue the movement until your biceps are fully contracted and the bar is at shoulder level. Hold the contracted position for a second and squeeze the biceps hard."],erros:[],cuidados:[],series:"3",reps:"10-12",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_EZ-Bar_Curl_with_Band/0.jpg"},
{id:"db_ez_bar_curl",nome:"Rosca Direta Barra EZ",nome_en:"",grupo:"Bíceps",principais:["Bíceps"],secundarios:[],equipamento:"Barra EZ",nivel:"Iniciante",passos:["Stand up straight while holding an EZ curl bar at the wide outer handle. The palms of your hands should be facing forward and slightly tilted inward due to the shape of the bar. Keep your elbows close to your torso. This will be your starting position.", "Now, while keeping your upper arms stationary, exhale and curl the weights forward while contracting the biceps. Focus on only moving your forearms.", "Continue to raise the weight until your biceps are fully contracted and the bar is at shoulder level. Hold the top contracted position for a moment and squeeze the biceps."],erros:[],cuidados:[],series:"3",reps:"10-12",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/EZ-Bar_Curl/0.jpg"},
{id:"db_spider_curl",nome:"Rosca Spider",nome_en:"",grupo:"Bíceps",principais:["Bíceps"],secundarios:[],equipamento:"Barra EZ",nivel:"Iniciante",passos:["Start out by setting the bar on the part of the preacher bench that you would normally sit on. Make sure to align the barbell properly so that it is balanced and will not fall off.", "Move to the front side of the preacher bench (the part where the arms usually lay) and position yourself to lay at a 45 degree slant with your torso and stomach pressed against the front side of the preacher bench.", "Make sure that your feet (especially the toes) are well positioned on the floor and place your upper arms on top of the pad located on the inside part of the preacher bench."],erros:[],cuidados:[],series:"3",reps:"10-12",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Spider_Curl/0.jpg"},
{id:"db_reverse_barbell_preacher_curls",nome:"Reverse Barbell Preacher Curls",nome_en:"",grupo:"Bíceps",principais:["Bíceps"],secundarios:["Antebraço"],equipamento:"Barra EZ",nivel:"Intermediário",passos:["Grab an EZ-bar using a shoulder width and palms down (pronated) grip.", "Now place the upper part of both arms on top of the preacher bench and have your arms extended. This will be your starting position.", "As you exhale, use the biceps to curl the weight up until your biceps are fully contracted and the barbell is at shoulder height. Squeeze the biceps hard for a second at the contracted position."],erros:[],cuidados:[],series:"3-4",reps:"10-12",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Barbell_Preacher_Curls/0.jpg"},
{id:"db_barbell_curl",nome:"Rosca Direta com Barra",nome_en:"",grupo:"Bíceps",principais:["Bíceps"],secundarios:["Antebraço"],equipamento:"Barra",nivel:"Iniciante",passos:["Stand up with your torso upright while holding a barbell at a shoulder-width grip. The palm of your hands should be facing forward and the elbows should be close to the torso. This will be your starting position.", "While holding the upper arms stationary, curl the weights forward while contracting the biceps as you breathe out. Tip: Only the forearms should move.", "Continue the movement until your biceps are fully contracted and the bar is at shoulder level. Hold the contracted position for a second and squeeze the biceps hard."],erros:[],cuidados:[],series:"3",reps:"10-12",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Curl/0.jpg"},
{id:"db_barbell_curls_lying_against_an_incline",nome:"Barbell Curls Lying Against An Incline",nome_en:"",grupo:"Bíceps",principais:["Bíceps"],secundarios:[],equipamento:"Barra",nivel:"Iniciante",passos:["Lie against an incline bench, with your arms holding a barbell and hanging down in a horizontal line. This will be your starting position.", "While keeping the upper arms stationary, curl the weight up as high as you can while squeezing the biceps. Breathe out as you perform this portion of the movement. Tip: Only the forearms should move. Do not swing the arms.", "After a second contraction, slowly go back to the starting position as you inhale. Tip: Make sure that you go all of the way down."],erros:[],cuidados:[],series:"3",reps:"10-12",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Curls_Lying_Against_An_Incline/0.jpg"},
{id:"db_close_grip_ez_bar_curl",nome:"Rosca EZ Pegada Fechada",nome_en:"",grupo:"Bíceps",principais:["Bíceps"],secundarios:["Antebraço"],equipamento:"Barra",nivel:"Iniciante",passos:["Stand up with your torso upright while holding an E-Z Curl Bar at the closer inner handle. The palm of your hands should be facing forward and they should be slightly tilted inwards due to the shape of the bar. The elbows should be close to the torso. This will be your starting position.", "While holding the upper arms stationary, curl the weights forward while contracting the biceps as you breathe out. Tip: Only the forearms should move.", "Continue the movement until your biceps are fully contracted and the bar is at shoulder level. Hold the contracted position for a second and squeeze the biceps hard."],erros:[],cuidados:[],series:"3",reps:"10-12",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_EZ_Bar_Curl/0.jpg"},
{id:"db_close_grip_standing_barbell_curl",nome:"Close-Grip Standing Barbell Curl",nome_en:"",grupo:"Bíceps",principais:["Bíceps"],secundarios:["Antebraço"],equipamento:"Barra",nivel:"Iniciante",passos:["Hold a barbell with both hands, palms up and a few inches apart.", "Stand with your torso straight and your head up. Your feet should be about shoulder width and your elbows close to your torso. This will be your starting position. Tip: You will keep your upper arms and elbows stationary throughout the movement.", "Curl the bar up in a semicircular motion until the forearms touch your biceps. Exhale as you perform this portion of the movement and contract your biceps hard for a second at the top. Tip: Avoid bending the back or using swinging motions as you lift the weight. Only the forearms should move."],erros:[],cuidados:[],series:"3",reps:"10-12",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_Standing_Barbell_Curl/0.jpg"},
{id:"db_preacher_curl",nome:"Rosca Scott",nome_en:"",grupo:"Bíceps",principais:["Bíceps"],secundarios:[],equipamento:"Barra",nivel:"Iniciante",passos:["To perform this movement you will need a preacher bench and an E-Z bar. Grab the E-Z curl bar at the close inner handle (either have someone hand you the bar which is preferable or grab the bar from the front bar rest provided by most preacher benches). The palm of your hands should be facing forward and they should be slightly tilted inwards due to the shape of the bar.", "With the upper arms positioned against the preacher bench pad and the chest against it, hold the E-Z Curl Bar at shoulder length. This will be your starting position.", "As you breathe in, slowly lower the bar until your upper arm is extended and the biceps is fully stretched."],erros:[],cuidados:[],series:"3",reps:"10-12",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Preacher_Curl/0.jpg"},
{id:"db_reverse_barbell_curl",nome:"Rosca Inversa com Barra",nome_en:"",grupo:"Bíceps",principais:["Bíceps"],secundarios:["Antebraço"],equipamento:"Barra",nivel:"Iniciante",passos:["Stand up with your torso upright while holding a barbell at shoulder width with the elbows close to the torso. The palm of your hands should be facing down (pronated grip). This will be your starting position.", "While holding the upper arms stationary, curl the weights while contracting the biceps as you breathe out. Only the forearms should move. Continue the movement until your biceps are fully contracted and the bar is at shoulder level. Hold the contracted position for a second as you squeeze the muscle.", "Slowly begin to bring the bar back to starting position as your breathe in."],erros:[],cuidados:[],series:"3",reps:"10-12",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Barbell_Curl/0.jpg"},
{id:"db_wide_grip_standing_barbell_curl",nome:"Rosca Barra Aberta em Pé",nome_en:"",grupo:"Bíceps",principais:["Bíceps"],secundarios:[],equipamento:"Barra",nivel:"Iniciante",passos:["Stand up with your torso upright while holding a barbell at the wide outer handle. The palm of your hands should be facing forward. The elbows should be close to the torso. This will be your starting position.", "While holding the upper arms stationary, curl the weights forward while contracting the biceps as you breathe out. Tip: Only the forearms should move.", "Continue the movement until your biceps are fully contracted and the bar is at shoulder level. Hold the contracted position for a second and squeeze the biceps hard."],erros:[],cuidados:[],series:"3",reps:"10-12",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Standing_Barbell_Curl/0.jpg"},
{id:"db_drag_curl",nome:"Drag Curl",nome_en:"",grupo:"Bíceps",principais:["Bíceps"],secundarios:["Antebraço"],equipamento:"Barra",nivel:"Intermediário",passos:["Grab a barbell with a supinated grip (palms facing forward) and get your elbows close to your torso and back. This will be your starting position.", "As you exhale, curl the bar up while keeping the elbows to the back as you \"Drag\" the bar up by keeping it in contact with your torso. Tip: As you can see, you will not be keeping the elbows pinned to your sides, but instead you will be bringing them back. Also, do not lift your shoulders.", "Slowly go back to the starting position as you keep the bar in contact with the torso at all times."],erros:[],cuidados:[],series:"3-4",reps:"10-12",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Drag_Curl/0.jpg"},
{id:"db_lying_high_bench_barbell_curl",nome:"Lying High Bench Barbell Curl",nome_en:"",grupo:"Bíceps",principais:["Bíceps"],secundarios:[],equipamento:"Barra",nivel:"Intermediário",passos:["Lie face forward on a tall flat bench while holding a barbell with a supinated grip (palms facing up). Tip: If you are holding a barbell grab it using a shoulder-width grip and if you are using an E-Z Bar grab it on the inner handles. Your upper body should be positioned in a way that the upper chest is over the end of the bench and the barbell is hanging in front of you with the arms extended and perpendicular to the floor. This will be your starting position.", "While keeping the elbows in and the upper arms stationary, curl the weight up in a semi-circular motion as you contract the biceps and exhale. Hold at the top of the movement for a second.", "As you inhale, slowly go back to the starting position. Tip: Maintain full control of the weight at all times and avoid any swinging. Remember, only the forearms should move throughout the movement."],erros:[],cuidados:[],series:"3-4",reps:"10-12",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_High_Bench_Barbell_Curl/0.jpg"},
{id:"db_seated_close_grip_concentration_barbell_curl",nome:"Seated Close-Grip Concentration Barbell Curl",nome_en:"",grupo:"Bíceps",principais:["Bíceps"],secundarios:[],equipamento:"Barra",nivel:"Intermediário",passos:["Sit down on a flat bench with a barbell or E-Z Bar in front of you in between your legs. Your legs should be spread with the knees bent and the feet on the floor.", "Use your arms to pick the barbell up and place the back of your upper arms on top of your inner thighs (around three and a half inches away from the front of the knee). A supinated grip closer than shoulder width is needed to perform this exercise. Tip: Your arm should be extended at arms length and the barbell should be above the floor. This will be your starting position.", "While holding the upper arms stationary, curl the weights forward while contracting the biceps as you breathe out. Only the forearms should move. Continue the movement until your biceps are fully contracted and the dumbbells are at shoulder level. Hold the contracted position for a second as you squeeze the biceps."],erros:[],cuidados:[],series:"3-4",reps:"10-12",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Close-Grip_Concentration_Barbell_Curl/0.jpg"},
{id:"db_alternate_hammer_curl",nome:"Rosca Martelo Alternada",nome_en:"",grupo:"Bíceps",principais:["Bíceps"],secundarios:["Antebraço"],equipamento:"Halter",nivel:"Iniciante",passos:["Stand up with your torso upright and a dumbbell in each hand being held at arms length. The elbows should be close to the torso.", "The palms of the hands should be facing your torso. This will be your starting position.", "While holding the upper arm stationary, curl the right weight forward while contracting the biceps as you breathe out. Continue the movement until your biceps is fully contracted and the dumbbells are at shoulder level. Hold the contracted position for a second as you squeeze the biceps. Tip: Only the forearms should move."],erros:[],cuidados:[],series:"3",reps:"10-12",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternate_Hammer_Curl/0.jpg"},
{id:"db_alternate_incline_dumbbell_curl",nome:"Alternate Incline Dumbbell Curl",nome_en:"",grupo:"Bíceps",principais:["Bíceps"],secundarios:["Antebraço"],equipamento:"Halter",nivel:"Iniciante",passos:["Sit down on an incline bench with a dumbbell in each hand being held at arms length. Tip: Keep the elbows close to the torso.This will be your starting position.", "While holding the upper arm stationary, curl the right weight forward while contracting the biceps as you breathe out. As you do so, rotate the hand so that the palm is facing up. Continue the movement until your biceps is fully contracted and the dumbbells are at shoulder level. Hold the contracted position for a second as you squeeze the biceps. Tip: Only the forearms should move.", "Slowly begin to bring the dumbbell back to starting position as your breathe in."],erros:[],cuidados:[],series:"3",reps:"10-12",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternate_Incline_Dumbbell_Curl/0.jpg"},
{id:"db_concentration_curls",nome:"Rosca Concentrada",nome_en:"",grupo:"Bíceps",principais:["Bíceps"],secundarios:["Antebraço"],equipamento:"Halter",nivel:"Iniciante",passos:["Sit down on a flat bench with one dumbbell in front of you between your legs. Your legs should be spread with your knees bent and feet on the floor.", "Use your right arm to pick the dumbbell up. Place the back of your right upper arm on the top of your inner right thigh. Rotate the palm of your hand until it is facing forward away from your thigh. Tip: Your arm should be extended and the dumbbell should be above the floor. This will be your starting position.", "While holding the upper arm stationary, curl the weights forward while contracting the biceps as you breathe out. Only the forearms should move. Continue the movement until your biceps are fully contracted and the dumbbells are at shoulder level. Tip: At the top of the movement make sure that the little finger of your arm is higher than your thumb. This guarantees a good contraction. Hold the contracted position for a second as you squeeze the biceps."],erros:[],cuidados:[],series:"3",reps:"10-12",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Concentration_Curls/0.jpg"},
{id:"db_cross_body_hammer_curl",nome:"Rosca Martelo Cruzada",nome_en:"",grupo:"Bíceps",principais:["Bíceps"],secundarios:["Antebraço"],equipamento:"Halter",nivel:"Iniciante",passos:["Stand up straight with a dumbbell in each hand. Your hands should be down at your side with your palms facing in.", "While keeping your palms facing in and without twisting your arm, curl the dumbbell of the right arm up towards your left shoulder as you exhale. Touch the top of the dumbbell to your shoulder and hold the contraction for a second.", "Slowly lower the dumbbell along the same path as you inhale and then repeat the same movement for the left arm."],erros:[],cuidados:[],series:"3",reps:"10-12",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cross_Body_Hammer_Curl/0.jpg"},
{id:"db_anti_gravity_press",nome:"Anti-Gravity Press",nome_en:"",grupo:"Ombros",principais:["Deltóide"],secundarios:["Trapézio médio", "Trapézio"],equipamento:"Barra",nivel:"Iniciante",passos:["Place a bar on the ground behind the head of an incline bench.", "Lay on the bench face down. With a pronated grip, pick the barbell up from the floor. Flex the elbows, performing a reverse curl to bring the bar near your chest. This will be your starting position.", "To begin, press the barbell out in front of your head by extending your elbows. Keep your arms parallel to the ground throughout the movement."],erros:[],cuidados:[],series:"3",reps:"10-15",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Anti-Gravity_Press/0.jpg"},
{id:"db_barbell_incline_shoulder_raise",nome:"Barbell Incline Shoulder Raise",nome_en:"",grupo:"Ombros",principais:["Deltóide"],secundarios:["Peitoral"],equipamento:"Barra",nivel:"Iniciante",passos:["Lie back on an Incline Bench. Using a medium width grip (a grip that is slightly wider than shoulder width), lift the bar from the rack and hold it straight over you with your arms straight. This will be your starting position.", "While keeping the arms straight, lift the bar by protracting your shoulder blades, raising the shoulders from the bench as you breathe out.", "Bring back the bar to the starting position as you breathe in."],erros:[],cuidados:[],series:"3",reps:"10-15",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Incline_Shoulder_Raise/0.jpg"},
{id:"db_barbell_rear_delt_row",nome:"Remada para Deltóide Posterior",nome_en:"",grupo:"Ombros",principais:["Deltóide"],secundarios:["Bíceps", "Latíssimo"],equipamento:"Barra",nivel:"Iniciante",passos:["Stand up straight while holding a barbell using a wide (higher than shoulder width) and overhand (palms facing your body) grip.", "Bend knees slightly and bend over as you keep the natural arch of your back. Let the arms hang in front of you as they hold the bar. Once your torso is parallel to the floor, flare the elbows out and away from your body. Tip: Your torso and your arms should resemble the letter \"T\". Now you are ready to begin the exercise.", "While keeping the upper arms perpendicular to the torso, pull the barbell up towards your upper chest as you squeeze the rear delts and you breathe out. Tip: When performed correctly, this exercise should resemble a bench press in reverse. Also, refrain from using your biceps to do the work. Focus on targeting the rear delts; the arms should only act as hooks."],erros:[],cuidados:[],series:"3",reps:"10-15",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Rear_Delt_Row/0.jpg"},
{id:"db_bradford_rocky_presses",nome:"Bradford/Rocky Presses",nome_en:"",grupo:"Ombros",principais:["Deltóide"],secundarios:["Tríceps"],equipamento:"Barra",nivel:"Iniciante",passos:["Sit on a Military Press Bench with a bar at shoulder level with a pronated grip (palms facing forward). Tip: Your grip should be wider than shoulder width and it should create a 90-degree angle between the forearm and the upper arm as the barbell goes down. This is your starting position.", "Once you pick up the barbell with the correct grip, lift the bar up over your head by locking your arms.", "Now lower the bar down to the back of the head slowly as you inhale."],erros:[],cuidados:[],series:"3",reps:"10-15",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bradford-Rocky_Presses/0.jpg"},
{id:"db_car_drivers",nome:"Car Drivers",nome_en:"",grupo:"Ombros",principais:["Deltóide"],secundarios:["Antebraço"],equipamento:"Barra",nivel:"Iniciante",passos:["While standing upright, hold a barbell plate in both hands at the 3 and 9 o'clock positions. Your palms should be facing each other and your arms should be extended straight out in front of you. This will be your starting position.", "Initiate the movement by rotating the plate as far to one side as possible. Use the same type of movement you would use to turn a steering wheel to one side.", "Reverse the motion, turning it all the way to the opposite side."],erros:[],cuidados:[],series:"3",reps:"10-15",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Car_Drivers/0.jpg"},
{id:"db_smith_incline_shoulder_raise",nome:"Smith Incline Shoulder Raise",nome_en:"",grupo:"Ombros",principais:["Deltóide"],secundarios:["Peitoral"],equipamento:"Barra",nivel:"Iniciante",passos:["Place an incline bench underneath the smith machine. Place the barbell at a height that you can reach when lying down and your arms are almost fully extended. Once the weight you need is selected, lie down on the incline bench and make sure your shoulders are aligned right under the barbell.", "Using a shoulder width pronated (palms forward) grip, lift the bar from the rack and hold it straight over you with a slight bend at the elbows. This will be your starting position.", "As you breathe out, lift the bar up until your arms are fully extended. Note: The contraction should be felt around the shoulders."],erros:[],cuidados:[],series:"3",reps:"10-15",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Incline_Shoulder_Raise/0.jpg"},
{id:"db_standing_bradford_press",nome:"Standing Bradford Press",nome_en:"",grupo:"Ombros",principais:["Deltóide"],secundarios:["Tríceps"],equipamento:"Barra",nivel:"Iniciante",passos:["Place a loaded bar at shoulder level in a rack. With a pronated grip at shoulder width, begin with the bar racked across the front of your shoulders. This is your starting position.", "Initiate the lift by extending the elbows to press the bar overhead. Avoid locking out the elbow as you move the weight behind your head.", "Lower the bar down to the back of the head until your elbow forms a right angle."],erros:[],cuidados:[],series:"3",reps:"10-15",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Bradford_Press/0.jpg"},
{id:"db_standing_military_press",nome:"Standing Military Press",nome_en:"",grupo:"Ombros",principais:["Deltóide"],secundarios:["Tríceps"],equipamento:"Barra",nivel:"Iniciante",passos:["Start by placing a barbell that is about chest high on a squat rack. Once you have selected the weights, grab the barbell using a pronated (palms facing forward) grip. Make sure to grip the bar wider than shoulder width apart from each other.", "Slightly bend the knees and place the barbell on your collar bone. Lift the barbell up keeping it lying on your chest. Take a step back and position your feet shoulder width apart from each other.", "Once you pick up the barbell with the correct grip length, lift the bar up over your head by locking your arms. Hold at about shoulder level and slightly in front of your head. This is your starting position."],erros:[],cuidados:[],series:"3",reps:"10-15",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Military_Press/0.jpg"},
{id:"db_straight_raises_on_incline_bench",nome:"Straight Raises on Incline Bench",nome_en:"",grupo:"Ombros",principais:["Deltóide"],secundarios:["Trapézio"],equipamento:"Barra",nivel:"Iniciante",passos:["Place a bar on the ground behind the head of an incline bench.", "Lay on the bench face down. With a pronated grip, pick the barbell up from the floor, keeping your arms straight. Allow the bar to hang straight down. This will be your starting position.", "To begin, raise the barbell out in front of your head while keeping your arms extended."],erros:[],cuidados:[],series:"3",reps:"10-15",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Straight_Raises_on_Incline_Bench/0.jpg"},
{id:"db_upright_barbell_row",nome:"Remada Alta com Barra",nome_en:"",grupo:"Ombros",principais:["Deltóide"],secundarios:["Trapézio"],equipamento:"Barra",nivel:"Iniciante",passos:["Grasp a barbell with an overhand grip that is slightly less than shoulder width. The bar should be resting on the top of your thighs with your arms extended and a slight bend in your elbows. Your back should also be straight. This will be your starting position.", "Now exhale and use the sides of your shoulders to lift the bar, raising your elbows up and to the side. Keep the bar close to your body as you raise it. Continue to lift the bar until it nearly touches your chin. Tip: Your elbows should drive the motion, and should always be higher than your forearms. Remember to keep your torso stationary and pause for a second at the top of the movement.", "Lower the bar back down slowly to the starting position. Inhale as you perform this portion of the movement."],erros:[],cuidados:[],series:"3",reps:"10-15",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Upright_Barbell_Row/0.jpg"},
{id:"db_barbell_shoulder_press",nome:"Desenvolvimento com Barra",nome_en:"",grupo:"Ombros",principais:["Deltóide"],secundarios:["Peitoral", "Tríceps"],equipamento:"Barra",nivel:"Intermediário",passos:["Sit on a bench with back support in a squat rack. Position a barbell at a height that is just above your head. Grab the barbell with a pronated grip (palms facing forward).", "Once you pick up the barbell with the correct grip width, lift the bar up over your head by locking your arms. Hold at about shoulder level and slightly in front of your head. This is your starting position.", "Lower the bar down to the shoulders slowly as you inhale."],erros:[],cuidados:[],series:"3-4",reps:"10-15",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Shoulder_Press/0.jpg"},
{id:"db_clean_and_press",nome:"Clean and Press",nome_en:"",grupo:"Ombros",principais:["Deltóide"],secundarios:["Reto abdominal", "Panturrilha"],equipamento:"Barra",nivel:"Intermediário",passos:["Assume a shoulder-width stance, with knees inside the arms. Now while keeping the back flat, bend at the knees and hips so that you can grab the bar with the arms fully extended and a pronated grip that is slightly wider than shoulder width. Point the elbows out to sides. The bar should be close to the shins. Position the shoulders over or slightly ahead of the bar. Establish a flat back posture. This will be your starting position.", "Begin to pull the bar by extending the knees. Move your hips forward and raise the shoulders at the same rate while keeping the angle of the back constant; continue to lift the bar straight up while keeping it close to your body.", "As the bar passes the knee, extend at the ankles, knees, and hips forcefully, similar to a jumping motion. As you do so, continue to guide the bar with your hands, shrugging your shoulders and using the momentum from your movement to pull the bar as high as possible. The bar should travel close to your body, and you should keep your elbows out."],erros:[],cuidados:[],series:"3-4",reps:"10-15",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Clean_and_Press/0.jpg"},
{id:"db_jerk_balance",nome:"Jerk Balance",nome_en:"",grupo:"Ombros",principais:["Deltóide"],secundarios:["Glúteos", "Isquiotibiais"],equipamento:"Barra",nivel:"Intermediário",passos:["This drill helps you learn to drive yourself low enough during the jerk and corrects those who move backward during the movement. Begin with the bar racked in the jerk position, with the shoulders forward, torso upright, and the feet split slightly apart.", "Initiate the movement as you would a normal jerk, dipping at the knees while keeping your torso vertical, and driving back up forcefully, using momentum and not your arms to elevate the weight.", "Keep the rear foot in place, using it to drive your body forward into a full split as you jerk the weight. Recover by standing up with the weight overhead."],erros:[],cuidados:[],series:"3-4",reps:"10-15",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Jerk_Balance/0.jpg"},
{id:"db_landmine_linear_jammer",nome:"Landmine Linear Jammer",nome_en:"",grupo:"Ombros",principais:["Deltóide"],secundarios:["Reto abdominal", "Panturrilha"],equipamento:"Barra",nivel:"Intermediário",passos:["Position a bar into landmine or, lacking one, securely anchor it in a corner. Load the bar to an appropriate weight and position the handle attachment on the bar.", "Raise the bar from the floor, taking the handles to your shoulders. This will be your starting position.", "In an athletic stance, squat by flexing your hips and setting your hips back, keeping your arms flexed."],erros:[],cuidados:[],series:"3-4",reps:"10-15",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Landmine_Linear_Jammer/0.jpg"},
{id:"db_push_press___behind_the_neck",nome:"Push Press - Behind the Neck",nome_en:"",grupo:"Ombros",principais:["Deltóide"],secundarios:["Panturrilha", "Quadríceps"],equipamento:"Barra",nivel:"Intermediário",passos:["Standing with the weight racked on the back of the shoulders, begin with the dip. With your feet directly under your hips, flex the knees without moving the hips backward. Go down only slightly, and reverse direction as powerfully as possible. Drive through the heels create as much speed and force as possible, moving the bar in a vertical path.", "Using the momentum generated, finish pressing the weight overhead be extending through the arms.", "Return to the starting position, using your legs to absorb the impact."],erros:[],cuidados:[],series:"3-4",reps:"10-15",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push_Press_-_Behind_the_Neck/0.jpg"},
{id:"db_rack_delivery",nome:"Rack Delivery",nome_en:"",grupo:"Ombros",principais:["Deltóide"],secundarios:["Antebraço", "Trapézio"],equipamento:"Barra",nivel:"Intermediário",passos:["This drill teaches the delivery of the barbell to the rack position on the shoulders. Begin holding a bar in the scarecrow position, with the upper arms parallel to the floor, and the forearms hanging down. Use a hook grip, with your fingers wrapped over your thumbs.", "Begin by rotating the elbows around the bar, delivering the bar to the shoulders. As your elbows come forward, relax your grip. The shoulders should be protracted, providing a shelf for the bar, which should lightly contact the throat.", "It is important that the bar stay close to the body at all times, as with a heavier load any distance will result in an unwanted collision. As the movement becomes smoother, speed and load can be increased before progressing further."],erros:[],cuidados:[],series:"3-4",reps:"10-15",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rack_Delivery/0.jpg"},
{id:"db_seated_barbell_military_press",nome:"Desenvolvimento Militar Sentado",nome_en:"",grupo:"Ombros",principais:["Deltóide"],secundarios:["Tríceps"],equipamento:"Barra",nivel:"Intermediário",passos:["Sit on a Military Press Bench with a bar behind your head and either have a spotter give you the bar (better on the rotator cuff this way) or pick it up yourself carefully with a pronated grip (palms facing forward). Tip: Your grip should be wider than shoulder width and it should create a 90-degree angle between the forearm and the upper arm as the barbell goes down.", "Once you pick up the barbell with the correct grip length, lift the bar up over your head by locking your arms. Hold at about shoulder level and slightly in front of your head. This is your starting position.", "Lower the bar down to the collarbone slowly as you inhale."],erros:[],cuidados:[],series:"3-4",reps:"10-15",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Barbell_Military_Press/0.jpg"},
{id:"db_single_arm_linear_jammer",nome:"Single-Arm Linear Jammer",nome_en:"",grupo:"Ombros",principais:["Deltóide"],secundarios:["Peitoral", "Tríceps"],equipamento:"Barra",nivel:"Intermediário",passos:["Position a bar into a landmine or securely anchor it in a corner. Load the bar to an appropriate weight.", "Raise the bar from the floor, taking it to your shoulders with one or both hands. Adopt a wide stance. This will be your starting position.", "Perform the movement by extending the elbow, pressing the weight up. Move explosively, extending the hips and knees fully to produce maximal force."],erros:[],cuidados:[],series:"3-4",reps:"10-15",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single-Arm_Linear_Jammer/0.jpg"},
{id:"db_standing_barbell_press_behind_neck",nome:"Standing Barbell Press Behind Neck",nome_en:"",grupo:"Ombros",principais:["Deltóide"],secundarios:["Tríceps"],equipamento:"Barra",nivel:"Intermediário",passos:["This exercise is best performed inside a squat rack for easier pick up of the bar. To begin, first set the bar on a rack that best matches your height. Once the correct height is chosen and the bar is loaded, step under the bar and place the back of your shoulders (slightly below the neck) across it.", "Hold on to the bar using both arms at each side and lift it off the rack by first pushing with your legs and at the same time straightening your torso.", "Step away from the rack and position your legs using a shoulder width medium stance with the toes slightly pointed out. Your back should be kept straight while performing this exercise. This will be your starting position."],erros:[],cuidados:[],series:"3-4",reps:"10-15",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Barbell_Press_Behind_Neck/0.jpg"},
{id:"db_standing_front_barbell_raise_over_head",nome:"Standing Front Barbell Raise Over Head",nome_en:"",grupo:"Ombros",principais:["Deltóide"],secundarios:[],equipamento:"Barra",nivel:"Intermediário",passos:["To begin, stand straight with a barbell in your hands. You should grip the bar with palms facing down and a closer than shoulder width grip apart from each other.", "Your feet should be shoulder width apart from each other. Your elbows should be slightly bent. This is the starting position.", "Lift the barbell up until it is directly over your head while exhaling. Make sure to keep your elbows slightly bent when performing each repetition."],erros:[],cuidados:[],series:"3-4",reps:"10-15",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Front_Barbell_Raise_Over_Head/0.jpg"},
{id:"db_clean_and_jerk",nome:"Clean and Jerk",nome_en:"",grupo:"Ombros",principais:["Deltóide"],secundarios:["Reto abdominal", "Glúteos"],equipamento:"Barra",nivel:"Avançado",passos:["With a barbell on the floor close to the shins, take an overhand or hook grip just outside the legs. Lower your hips with the weight focused on the heels, back straight, head facing forward, chest up, with your shoulders just in front of the bar. This will be your starting position.", "Begin the first pull by driving through the heels, extending your knees. Your back angle should stay the same, and your arms should remain straight. Move the weight with control as you continue to above the knees.", "Next comes the second pull, the main source of acceleration for the clean. As the bar approaches the mid-thigh position, begin extending through the hips. In a jumping motion, accelerate by extending the hips, knees, and ankles, using speed to move the bar upward. There should be no need to actively pull through the arms to accelerate the weight; at the end of the second pull, the body should be fully extended, leaning slightly back, with the arms still extended."],erros:[],cuidados:[],series:"4-5",reps:"10-15",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Clean_and_Jerk/0.jpg"},
{id:"db_alternating_deltoid_raise",nome:"Alternating Deltoid Raise",nome_en:"",grupo:"Ombros",principais:["Deltóide"],secundarios:[],equipamento:"Halter",nivel:"Iniciante",passos:["In a standing position, hold a pair of dumbbells at your side.", "Keeping your elbows slightly bent, raise the weights directly in front of you to shoulder height, avoiding any swinging or cheating.", "Return the weights to your side."],erros:[],cuidados:[],series:"3",reps:"10-15",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternating_Deltoid_Raise/0.jpg"},
{id:"db_bodyweight_flyes",nome:"Bodyweight Flyes",nome_en:"",grupo:"Peito",principais:["Peitoral"],secundarios:["Reto abdominal", "Deltóide"],equipamento:"Barra EZ",nivel:"Intermediário",passos:["Position two equally loaded EZ bars on the ground next to each other. Ensure they are able to roll.", "Assume a push-up position over the bars, supporting your weight on your toes and hands with your arms extended and body straight.", "Place your hands on the bars. This will be your starting position."],erros:[],cuidados:[],series:"3-4",reps:"8-12",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bodyweight_Flyes/0.jpg"},
{id:"db_barbell_bench_press___medium_grip",nome:"Supino Reto com Barra",nome_en:"",grupo:"Peito",principais:["Peitoral"],secundarios:["Deltóide", "Tríceps"],equipamento:"Barra",nivel:"Iniciante",passos:["Lie back on a flat bench. Using a medium width grip (a grip that creates a 90-degree angle in the middle of the movement between the forearms and the upper arms), lift the bar from the rack and hold it straight over you with your arms locked. This will be your starting position.", "From the starting position, breathe in and begin coming down slowly until the bar touches your middle chest.", "After a brief pause, push the bar back to the starting position as you breathe out. Focus on pushing the bar using your chest muscles. Lock your arms and squeeze your chest in the contracted position at the top of the motion, hold for a second and then start coming down slowly again. Tip: Ideally, lowering the weight should take about twice as long as raising it."],erros:[],cuidados:[],series:"3",reps:"8-12",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Bench_Press_-_Medium_Grip/0.jpg"},
{id:"db_barbell_incline_bench_press___medium_grip",nome:"Barbell Incline Bench Press - Medium Grip",nome_en:"",grupo:"Peito",principais:["Peitoral"],secundarios:["Deltóide", "Tríceps"],equipamento:"Barra",nivel:"Iniciante",passos:["Lie back on an incline bench. Using a medium-width grip (a grip that creates a 90-degree angle in the middle of the movement between the forearms and the upper arms), lift the bar from the rack and hold it straight over you with your arms locked. This will be your starting position.", "As you breathe in, come down slowly until you feel the bar on you upper chest.", "After a second pause, bring the bar back to the starting position as you breathe out and push the bar using your chest muscles. Lock your arms in the contracted position, squeeze your chest, hold for a second and then start coming down slowly again. Tip: it should take at least twice as long to go down than to come up."],erros:[],cuidados:[],series:"3",reps:"8-12",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Incline_Bench_Press_-_Medium_Grip/0.jpg"},
{id:"db_decline_barbell_bench_press",nome:"Decline Barbell Bench Press",nome_en:"",grupo:"Peito",principais:["Peitoral"],secundarios:["Deltóide", "Tríceps"],equipamento:"Barra",nivel:"Iniciante",passos:["Secure your legs at the end of the decline bench and slowly lay down on the bench.", "Using a medium width grip (a grip that creates a 90-degree angle in the middle of the movement between the forearms and the upper arms), lift the bar from the rack and hold it straight over you with your arms locked. The arms should be perpendicular to the floor. This will be your starting position. Tip: In order to protect your rotator cuff, it is best if you have a spotter help you lift the barbell off the rack.", "As you breathe in, come down slowly until you feel the bar on your lower chest."],erros:[],cuidados:[],series:"3",reps:"8-12",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Barbell_Bench_Press/0.jpg"},
{id:"db_front_raise_and_pullover",nome:"Front Raise And Pullover",nome_en:"",grupo:"Peito",principais:["Peitoral"],secundarios:["Latíssimo", "Deltóide"],equipamento:"Barra",nivel:"Iniciante",passos:["Lie on a flat bench while holding a barbell using a palms down grip that is about 15 inches apart.", "Place the bar on your upper thighs, extend your arms and lock them while keeping a slight bend on the elbows. This will be your starting position.", "Now raise the weight using a semicircular motion and keeping your arms straight as you inhale. Continue the same movement until the bar is on the other side above your head . (Tip: the bar will travel approximately 180-degrees). At this point your arms should be parallel to the floor with the palms of your hands facing the ceiling."],erros:[],cuidados:[],series:"3",reps:"8-12",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Raise_And_Pullover/0.jpg"},
{id:"db_barbell_guillotine_bench_press",nome:"Barbell Guillotine Bench Press",nome_en:"",grupo:"Peito",principais:["Peitoral"],secundarios:["Deltóide", "Tríceps"],equipamento:"Barra",nivel:"Intermediário",passos:["Using a medium width grip (a grip that creates a 90-degree angle in the middle of the movement between the forearms and the upper arms), lift the bar from the rack and hold it straight over your neck with your arms locked. This will be your starting position.", "As you breathe in, bring the bar down slowly until it is about 1 inch from your neck.", "After a second pause, bring the bar back to the starting position as you breathe out and push the bar using your chest muscles. Lock your arms and squeeze your chest in the contracted position, hold for a second and then start coming down slowly again. It should take at least twice as long to go down than to come up."],erros:[],cuidados:[],series:"3-4",reps:"8-12",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Guillotine_Bench_Press/0.jpg"},
{id:"db_neck_press",nome:"Neck Press",nome_en:"",grupo:"Peito",principais:["Peitoral"],secundarios:["Deltóide", "Tríceps"],equipamento:"Barra",nivel:"Intermediário",passos:["Lie back on a flat bench. Using a medium-width grip (a grip that creates a 90-degree angle in the middle of the movement between the forearms and the upper arms), lift the bar from the rack and hold it straight over your neck with your arms locked. This will be your starting position.", "As you breathe in, come down slowly until you feel the bar on your neck.", "After a second pause, bring the bar back to the starting position as you breathe out and push the bar using your chest muscles. Lock your arms and squeeze your chest in the contracted position, hold for a second and then start coming down slowly again. Tip: It should take at least twice as long to go down than to come up)."],erros:[],cuidados:[],series:"3-4",reps:"8-12",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Neck_Press/0.jpg"},
{id:"db_wide_grip_barbell_bench_press",nome:"Supino Pegada Aberta",nome_en:"",grupo:"Peito",principais:["Peitoral"],secundarios:["Deltóide", "Tríceps"],equipamento:"Barra",nivel:"Intermediário",passos:["Lie back on a flat bench with feet firm on the floor. Using a wide, pronated (palms forward) grip that is around 3 inches away from shoulder width (for each hand), lift the bar from the rack and hold it straight over you with your arms locked. The bar will be perpendicular to the torso and the floor. This will be your starting position.", "As you breathe in, come down slowly until you feel the bar on your middle chest.", "After a second pause, bring the bar back to the starting position as you breathe out and push the bar using your chest muscles. Lock your arms and squeeze your chest in the contracted position, hold for a second and then start coming down slowly again. Tip: It should take at least twice as long to go down than to come up."],erros:[],cuidados:[],series:"3-4",reps:"8-12",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Barbell_Bench_Press/0.jpg"},
{id:"db_wide_grip_decline_barbell_bench_press",nome:"Wide-Grip Decline Barbell Bench Press",nome_en:"",grupo:"Peito",principais:["Peitoral"],secundarios:["Deltóide", "Tríceps"],equipamento:"Barra",nivel:"Intermediário",passos:["Lie back on a decline bench with the feet securely locked at the front of the bench. Using a wide, pronated (palms forward) grip that is around 3 inches away from shoulder width (for each hand), lift the bar from the rack and hold it straight over you with your arms locked. The bar will be perpendicular to the torso and the floor. This will be your starting position.", "As you breathe in, come down slowly until you feel the bar on your lower chest.", "After a second pause, bring the bar back to the starting position as you breathe out and push the bar using your chest muscles. Lock your arms and squeeze your chest in the contracted position, hold for a second and then start coming down slowly again. Tip: It should take at least twice as long to go down than to come up."],erros:[],cuidados:[],series:"3-4",reps:"8-12",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Decline_Barbell_Bench_Press/0.jpg"},
{id:"db_wide_grip_decline_barbell_pullover",nome:"Wide-Grip Decline Barbell Pullover",nome_en:"",grupo:"Peito",principais:["Peitoral"],secundarios:["Deltóide", "Tríceps"],equipamento:"Barra",nivel:"Intermediário",passos:["Lie down on a decline bench with both legs securely locked in position. Reach for the barbell behind the head using a pronated grip (palms facing out). Make sure to grab the barbell wider than shoulder width apart for this exercise. Slowly lift the barbell up from the floor by using your arms.", "When positioned properly, your arms should be fully extended and perpendicular to the floor. This is the starting position.", "Begin by moving the barbell back down in a semicircular motion as if you were going to place it on the floor, but instead, stop when the arms are parallel to the floor. Tip: Keep the arms fully extended at all times. The movement should only happen at the shoulder joint. Inhale as you perform this portion of the movement."],erros:[],cuidados:[],series:"3-4",reps:"8-12",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Decline_Barbell_Pullover/0.jpg"},
{id:"db_decline_dumbbell_bench_press",nome:"Decline Dumbbell Bench Press",nome_en:"",grupo:"Peito",principais:["Peitoral"],secundarios:["Deltóide", "Tríceps"],equipamento:"Halter",nivel:"Iniciante",passos:["Secure your legs at the end of the decline bench and lie down with a dumbbell on each hand on top of your thighs. The palms of your hand will be facing each other.", "Once you are laying down, move the dumbbells in front of you at shoulder width.", "Once at shoulder width, rotate your wrists forward so that the palms of your hands are facing away from you. This will be your starting position."],erros:[],cuidados:[],series:"3",reps:"8-12",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Dumbbell_Bench_Press/0.jpg"},
{id:"db_decline_dumbbell_flyes",nome:"Crucifixo Declinado com Halteres",nome_en:"",grupo:"Peito",principais:["Peitoral"],secundarios:[],equipamento:"Halter",nivel:"Iniciante",passos:["Secure your legs at the end of the decline bench and lie down with a dumbbell on each hand on top of your thighs. The palms of your hand will be facing each other.", "Once you are laying down, move the dumbbells in front of you at shoulder width. The palms of the hands should be facing each other and the arms should be perpendicular to the floor and fully extended. This will be your starting position.", "With a slight bend on your elbows in order to prevent stress at the biceps tendon, lower your arms out at both sides in a wide arc until you feel a stretch on your chest. Breathe in as you perform this portion of the movement. Tip: Keep in mind that throughout the movement, the arms should remain stationary; the movement should only occur at the shoulder joint."],erros:[],cuidados:[],series:"3",reps:"8-12",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Dumbbell_Flyes/0.jpg"},
{id:"db_dumbbell_bench_press",nome:"Supino com Halteres",nome_en:"",grupo:"Peito",principais:["Peitoral"],secundarios:["Deltóide", "Tríceps"],equipamento:"Halter",nivel:"Iniciante",passos:["Lie down on a flat bench with a dumbbell in each hand resting on top of your thighs. The palms of your hands will be facing each other.", "Then, using your thighs to help raise the dumbbells up, lift the dumbbells one at a time so that you can hold them in front of you at shoulder width.", "Once at shoulder width, rotate your wrists forward so that the palms of your hands are facing away from you. The dumbbells should be just to the sides of your chest, with your upper arm and forearm creating a 90 degree angle. Be sure to maintain full control of the dumbbells at all times. This will be your starting position."],erros:[],cuidados:[],series:"3",reps:"8-12",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Bench_Press/0.jpg"},
{id:"db_dumbbell_bench_press_with_neutral_grip",nome:"Dumbbell Bench Press with Neutral Grip",nome_en:"",grupo:"Peito",principais:["Peitoral"],secundarios:["Deltóide", "Tríceps"],equipamento:"Halter",nivel:"Iniciante",passos:["Take a dumbbell in each hand and lay back onto a flat bench. Your feet should be flat on the floor and your shoulder blades retracted.", "Maintaining a neutral grip, palms facing each other, begin with your arms extended directly above you, perpendicular to the floor. This will be your starting position.", "Begin the movement by flexing the elbow, lowering the upper arms to the side. Descend until the dumbbells are to your torso."],erros:[],cuidados:[],series:"3",reps:"8-12",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Bench_Press_with_Neutral_Grip/0.jpg"},
{id:"db_dumbbell_flyes",nome:"Crucifixo com Halteres",nome_en:"",grupo:"Peito",principais:["Peitoral"],secundarios:[],equipamento:"Halter",nivel:"Iniciante",passos:["Lie down on a flat bench with a dumbbell on each hand resting on top of your thighs. The palms of your hand will be facing each other.", "Then using your thighs to help raise the dumbbells, lift the dumbbells one at a time so you can hold them in front of you at shoulder width with the palms of your hands facing each other. Raise the dumbbells up like you're pressing them, but stop and hold just before you lock out. This will be your starting position.", "With a slight bend on your elbows in order to prevent stress at the biceps tendon, lower your arms out at both sides in a wide arc until you feel a stretch on your chest. Breathe in as you perform this portion of the movement. Tip: Keep in mind that throughout the movement, the arms should remain stationary; the movement should only occur at the shoulder joint."],erros:[],cuidados:[],series:"3",reps:"8-12",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Flyes/0.jpg"},
{id:"db_hammer_grip_incline_db_bench_press",nome:"Hammer Grip Incline DB Bench Press",nome_en:"",grupo:"Peito",principais:["Peitoral"],secundarios:["Deltóide", "Tríceps"],equipamento:"Halter",nivel:"Iniciante",passos:["Lie back on an incline bench with a dumbbell on each hand on top of your thighs. The palms of your hand will be facing each other.", "By using your thighs to help you get the dumbbells up, clean the dumbbells one arm at a time so that you can hold them at shoulder width.", "Once at shoulder width, keep the palms of your hands with a neutral grip (palms facing each other). Keep your elbows flared out with the upper arms in line with the shoulders (perpendicular to the torso) and the elbows bent creating a 90-degree angle between the upper arm and the forearm. This will be your starting position."],erros:[],cuidados:[],series:"3",reps:"8-12",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hammer_Grip_Incline_DB_Bench_Press/0.jpg"},
{id:"db_incline_dumbbell_bench_with_palms_facing_in",nome:"Incline Dumbbell Bench With Palms Facing In",nome_en:"",grupo:"Peito",principais:["Peitoral"],secundarios:["Deltóide", "Tríceps"],equipamento:"Halter",nivel:"Iniciante",passos:["Lie back on an incline bench with a dumbbell on each hand on top of your thighs. The palms of your hand will be facing each other.", "By using your thighs to help you get the dumbbells up, clean the dumbbells one arm at a time so that you can hold them at shoulder width.", "Once at shoulder width, keep the palms of your hands with a neutral grip (palms facing each other). Keep your elbows flared out with the upper arms in line with the shoulders (perpendicular to the torso) and the elbows bent creating a 90-degree angle between the upper arm and the forearm. This will be your starting position."],erros:[],cuidados:[],series:"3",reps:"8-12",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Bench_With_Palms_Facing_In/0.jpg"},
{id:"db_incline_dumbbell_flyes",nome:"Crucifixo Inclinado com Halteres",nome_en:"",grupo:"Peito",principais:["Peitoral"],secundarios:["Deltóide"],equipamento:"Halter",nivel:"Iniciante",passos:["Hold a dumbbell on each hand and lie on an incline bench that is set to an incline angle of no more than 30 degrees.", "Extend your arms above you with a slight bend at the elbows.", "Now rotate the wrists so that the palms of your hands are facing you. Tip: The pinky fingers should be next to each other. This will be your starting position."],erros:[],cuidados:[],series:"3",reps:"8-12",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Flyes/0.jpg"},
{id:"db_incline_dumbbell_flyes___with_a_twist",nome:"Incline Dumbbell Flyes - With A Twist",nome_en:"",grupo:"Peito",principais:["Peitoral"],secundarios:["Deltóide"],equipamento:"Halter",nivel:"Iniciante",passos:["Hold a dumbbell in each hand and lie on an incline bench that is set to an incline angle of no more than 30 degrees.", "Extend your arms above you with a slight bend at the elbows.", "Now rotate the wrists so that the palms of your hands are facing you. Tip: The pinky fingers should be next to each other. This will be your starting position."],erros:[],cuidados:[],series:"3",reps:"8-12",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Flyes_-_With_A_Twist/0.jpg"},
{id:"db_incline_dumbbell_press",nome:"Supino Inclinado com Halteres",nome_en:"",grupo:"Peito",principais:["Peitoral"],secundarios:["Deltóide", "Tríceps"],equipamento:"Halter",nivel:"Iniciante",passos:["Lie back on an incline bench with a dumbbell in each hand atop your thighs. The palms of your hands will be facing each other.", "Then, using your thighs to help push the dumbbells up, lift the dumbbells one at a time so that you can hold them at shoulder width.", "Once you have the dumbbells raised to shoulder width, rotate your wrists forward so that the palms of your hands are facing away from you. This will be your starting position."],erros:[],cuidados:[],series:"3",reps:"8-12",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Press/0.jpg"},
{id:"db_one_arm_flat_bench_dumbbell_flye",nome:"One-Arm Flat Bench Dumbbell Flye",nome_en:"",grupo:"Peito",principais:["Peitoral"],secundarios:[],equipamento:"Halter",nivel:"Iniciante",passos:["Lie down on a flat bench with a dumbbell in one hand resting on top of your thigh. The palm of your hand with the dumbbell in it should be at a neutral grip.", "By using your thighs to help you get the dumbbell up, clean the dumbbell so that you can hold it in front of you with your lifting arm being fully extended. Remember to maintain a neutral grip with this exercise. Your non lifting hand should be to the side holding the flat bench for better support. This will be your starting position.", "Your arm with the weight should have a slight bend on your elbow in order to prevent stress at the biceps tendon. Begin by lowering your arm with the weight in it out in a wide arc until you feel a stretch on your chest. Breathe in as you perform this portion of the movement. Tip: Keep in mind that throughout the movement, your lifting arm should remain stationary; the movement should only occur at the shoulder joint."],erros:[],cuidados:[],series:"3",reps:"8-12",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Flat_Bench_Dumbbell_Flye/0.jpg"},
{id:"db_one_arm_dumbbell_bench_press",nome:"One Arm Dumbbell Bench Press",nome_en:"",grupo:"Peito",principais:["Peitoral"],secundarios:["Deltóide", "Tríceps"],equipamento:"Halter",nivel:"Iniciante",passos:["Lie down on a flat bench with a dumbbell in one hand on top of your thigh.", "By using your thigh to help you get the dumbbell up, clean the dumbbell up so that you can hold it in front of you at shoulder width. Use the hand you are not lifting with to help position the dumbbell over you properly.", "Once at shoulder width, rotate your wrist forward so that the palm of your hand is facing away from you. This will be your starting position."],erros:[],cuidados:[],series:"3",reps:"8-12",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Arm_Dumbbell_Bench_Press/0.jpg"},
{id:"db_around_the_worlds",nome:"Around The Worlds",nome_en:"",grupo:"Peito",principais:["Peitoral"],secundarios:["Deltóide"],equipamento:"Halter",nivel:"Intermediário",passos:["Lay down on a flat bench holding a dumbbell in each hand with the palms of the hands facing towards the ceiling. Tip: Your arms should be parallel to the floor and next to your thighs. To avoid injury, make sure that you keep your elbows slightly bent. This will be your starting position.", "Now move the dumbbells by creating a semi-circle as you displace them from the initial position to over the head. All of the movement should happen with the arms parallel to the floor at all times. Breathe in as you perform this portion of the movement.", "Reverse the movement to return the weight to the starting position as you exhale."],erros:[],cuidados:[],series:"3-4",reps:"8-12",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Around_The_Worlds/0.jpg"},
{id:"db_bent_arm_dumbbell_pullover",nome:"Bent-Arm Dumbbell Pullover",nome_en:"",grupo:"Peito",principais:["Peitoral"],secundarios:["Latíssimo", "Deltóide"],equipamento:"Halter",nivel:"Intermediário",passos:["Place a dumbbell standing up on a flat bench.", "Ensuring that the dumbbell stays securely placed at the top of the bench, lie perpendicular to the bench (torso across it as in forming a cross) with only your shoulders lying on the surface. Hips should be below the bench and legs bent with feet firmly on the floor. The head will be off the bench as well.", "Grasp the dumbbell with both hands and hold it straight over your chest with a bend in your arms. Both palms should be pressing against the underside one of the sides of the dumbbell. This will be your starting position. Caution: Always ensure that the dumbbell used for this exercise is secure. Using a dumbbell with loose plates can result in the dumbbell falling apart and falling on your face."],erros:[],cuidados:[],series:"3-4",reps:"8-12",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent-Arm_Dumbbell_Pullover/0.jpg"},
{id:"db_straight_arm_dumbbell_pullover",nome:"Straight-Arm Dumbbell Pullover",nome_en:"",grupo:"Peito",principais:["Peitoral"],secundarios:["Latíssimo", "Deltóide"],equipamento:"Halter",nivel:"Intermediário",passos:["Place a dumbbell standing up on a flat bench.", "Ensuring that the dumbbell stays securely placed at the top of the bench, lie perpendicular to the bench (torso across it as in forming a cross) with only your shoulders lying on the surface. Hips should be below the bench and legs bent with feet firmly on the floor. The head will be off the bench as well.", "Grasp the dumbbell with both hands and hold it straight over your chest at arms length. Both palms should be pressing against the underside one of the sides of the dumbbell. This will be your starting position.\nCaution: Always ensure that the dumbbell used for this exercise is secure. Using a dumbbell with loose plates can result in the dumbbell falling apart and falling on your face."],erros:[],cuidados:[],series:"3-4",reps:"8-12",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Straight-Arm_Dumbbell_Pullover/0.jpg"},
{id:"db_barbell_shrug",nome:"Encolhimento com Barra",nome_en:"",grupo:"Costas",principais:["Trapézio"],secundarios:[],equipamento:"Barra",nivel:"Iniciante",passos:["Stand up straight with your feet at shoulder width as you hold a barbell with both hands in front of you using a pronated grip (palms facing the thighs). Tip: Your hands should be a little wider than shoulder width apart. You can use wrist wraps for this exercise for a better grip. This will be your starting position.", "Raise your shoulders up as far as you can go as you breathe out and hold the contraction for a second. Tip: Refrain from trying to lift the barbell by using your biceps.", "Slowly return to the starting position as you breathe in."],erros:[],cuidados:[],series:"3",reps:"8-12",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Shrug/0.jpg"},
{id:"db_barbell_shrug_behind_the_back",nome:"Encolhimento com Barra por Trás",nome_en:"",grupo:"Costas",principais:["Trapézio"],secundarios:["Antebraço", "Trapézio médio"],equipamento:"Barra",nivel:"Iniciante",passos:["Stand up straight with your feet at shoulder width as you hold a barbell with both hands behind your back using a pronated grip (palms facing back). Tip: Your hands should be a little wider than shoulder width apart. You can use wrist wraps for this exercise for better grip. This will be your starting position.", "Raise your shoulders up as far as you can go as you breathe out and hold the contraction for a second. Tip: Refrain from trying to lift the barbell by using your biceps. The arms should remain stretched out at all times.", "Slowly return to the starting position as you breathe in."],erros:[],cuidados:[],series:"3",reps:"8-12",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Shrug_Behind_The_Back/0.jpg"},
{id:"db_bent_over_barbell_row",nome:"Remada Curvada com Barra",nome_en:"",grupo:"Costas",principais:["Trapézio médio"],secundarios:["Bíceps", "Latíssimo"],equipamento:"Barra",nivel:"Iniciante",passos:["Holding a barbell with a pronated grip (palms facing down), bend your knees slightly and bring your torso forward, by bending at the waist, while keeping the back straight until it is almost parallel to the floor. Tip: Make sure that you keep the head up. The barbell should hang directly in front of you as your arms hang perpendicular to the floor and your torso. This is your starting position.", "Now, while keeping the torso stationary, breathe out and lift the barbell to you. Keep the elbows close to the body and only use the forearms to hold the weight. At the top contracted position, squeeze the back muscles and hold for a brief pause.", "Then inhale and slowly lower the barbell back to the starting position."],erros:[],cuidados:[],series:"3",reps:"8-12",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Barbell_Row/0.jpg"},
{id:"db_bent_over_one_arm_long_bar_row",nome:"Bent Over One-Arm Long Bar Row",nome_en:"",grupo:"Costas",principais:["Trapézio médio"],secundarios:["Bíceps", "Latíssimo"],equipamento:"Barra",nivel:"Iniciante",passos:["Put weight on one of the ends of an Olympic barbell. Make sure that you either place the other end of the barbell in the corner of two walls; or put a heavy object on the ground so the barbell cannot slide backward.", "Bend forward until your torso is as close to parallel with the floor as you can and keep your knees slightly bent.", "Now grab the bar with one arm just behind the plates on the side where the weight was placed and put your other hand on your knee. This will be your starting position."],erros:[],cuidados:[],series:"3",reps:"8-12",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_One-Arm_Long_Bar_Row/0.jpg"},
{id:"db_incline_bench_pull",nome:"Incline Bench Pull",nome_en:"",grupo:"Costas",principais:["Trapézio médio"],secundarios:["Latíssimo", "Deltóide"],equipamento:"Barra",nivel:"Iniciante",passos:["Grab a dumbbell in each hand and lie face down on an incline bench that is set to an incline that is approximately 30 degrees.", "Let the arms hang to your sides fully extended as they point to the floor.", "Turn the wrists until your hands have a pronated (palms down) grip."],erros:[],cuidados:[],series:"3",reps:"8-12",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Bench_Pull/0.jpg"},
{id:"db_lying_cambered_barbell_row",nome:"Lying Cambered Barbell Row",nome_en:"",grupo:"Costas",principais:["Trapézio médio"],secundarios:["Bíceps", "Latíssimo"],equipamento:"Barra",nivel:"Iniciante",passos:["Place a cambered bar underneath an exercise bench.", "Lie face down on the exercise bench and grab the bar using a palms down (pronated grip) that is wider than shoulder width. This will be your starting position.", "As you exhale row the bar up as you keep the elbows close to your body to either your chest, in order to target the upper mid back, or to your stomach if targeting the lats is your goal."],erros:[],cuidados:[],series:"3",reps:"8-12",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Cambered_Barbell_Row/0.jpg"},
{id:"db_one_arm_long_bar_row",nome:"Remada Unilateral na Barra Longa",nome_en:"",grupo:"Costas",principais:["Trapézio médio"],secundarios:["Bíceps", "Latíssimo"],equipamento:"Barra",nivel:"Iniciante",passos:["Position a bar into a landmine or in a corner to keep it from moving. Load an appropriate weight onto your end.", "Stand next to the bar, and take a grip with one hand close to the collar. Using your hips and legs, rise to a standing position.", "Assume a bent-knee stance with your hips back and your chest up. Your arm should be extended. This will be your starting position."],erros:[],cuidados:[],series:"3",reps:"8-12",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Long_Bar_Row/0.jpg"},
{id:"db_stiff_leg_barbell_good_morning",nome:"Stiff Leg Barbell Good Morning",nome_en:"",grupo:"Costas",principais:["Eretores"],secundarios:["Glúteos", "Isquiotibiais"],equipamento:"Barra",nivel:"Iniciante",passos:["This exercise is best performed inside a squat rack for safety purposes. To begin, first set the bar on a rack that best matches your height. Once the correct height is chosen and the bar is loaded, step under the bar and place the back of your shoulders (slightly below the neck) across it.", "Hold on to the bar using both arms at each side and lift it off the rack by first pushing with your legs and at the same time straightening your torso.", "Step away from the rack and position your legs using a shoulder width medium stance. Keep your head up at all times as looking down will get you off balance and also maintain a straight back. This will be your starting position."],erros:[],cuidados:[],series:"3",reps:"8-12",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Stiff_Leg_Barbell_Good_Morning/0.jpg"},
{id:"db_straight_bar_bench_mid_rows",nome:"Straight Bar Bench Mid Rows",nome_en:"",grupo:"Costas",principais:["Trapézio médio"],secundarios:["Bíceps", "Latíssimo"],equipamento:"Barra",nivel:"Iniciante",passos:["Place a loaded barbell on the end of a bench. Standing on the bench behind the bar, take a medium, pronated grip. Stand with your hips back and chest up, maintaining a neutral spine. This will be your starting position.", "Row the bar to your torso by retracting the shoulder blades and flexing the elbows. Use a controlled movement with no jerking.", "After a brief pause, slowly return the bar to the starting position, ensuring to go all the way down."],erros:[],cuidados:[],series:"3",reps:"8-12",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Straight_Bar_Bench_Mid_Rows/0.jpg"},
{id:"db_t_bar_row_with_handle",nome:"Remada T-Bar com Pegada",nome_en:"",grupo:"Costas",principais:["Trapézio médio"],secundarios:["Bíceps", "Latíssimo"],equipamento:"Barra",nivel:"Iniciante",passos:["Position a bar into a landmine or in a corner to keep it from moving. Load an appropriate weight onto your end.", "Stand over the bar, and position a Double D row handle around the bar next to the collar. Using your hips and legs, rise to a standing position.", "Assume a wide stance with your hips back and your chest up. Your arms should be extended. This will be your starting position."],erros:[],cuidados:[],series:"3",reps:"8-12",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/T-Bar_Row_with_Handle/0.jpg"},
{id:"db_barbell_deadlift",nome:"Levantamento Terra",nome_en:"",grupo:"Costas",principais:["Eretores"],secundarios:["Panturrilha", "Antebraço"],equipamento:"Barra",nivel:"Intermediário",passos:["Stand in front of a loaded barbell.", "While keeping the back as straight as possible, bend your knees, bend forward and grasp the bar using a medium (shoulder width) overhand grip. This will be the starting position of the exercise. Tip: If it is difficult to hold on to the bar with this grip, alternate your grip or use wrist straps.", "While holding the bar, start the lift by pushing with your legs while simultaneously getting your torso to the upright position as you breathe out. In the upright position, stick your chest out and contract the back by bringing the shoulder blades back. Think of how the soldiers in the military look when they are in standing in attention."],erros:[],cuidados:[],series:"3-4",reps:"8-12",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Deadlift/0.jpg"},
{id:"db_bent_arm_barbell_pullover",nome:"Bent-Arm Barbell Pullover",nome_en:"",grupo:"Costas",principais:["Latíssimo"],secundarios:["Peitoral", "Latíssimo"],equipamento:"Barra",nivel:"Intermediário",passos:["Lie on a flat bench with a barbell using a shoulder grip width.", "Hold the bar straight over your chest with a bend in your arms. This will be your starting position.", "While keeping your arms in the bent arm position, lower the weight slowly in an arc behind your head while breathing in until you feel a stretch on the chest."],erros:[],cuidados:[],series:"3-4",reps:"8-12",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent-Arm_Barbell_Pullover/0.jpg"},
{id:"db_bent_over_two_arm_long_bar_row",nome:"Bent Over Two-Arm Long Bar Row",nome_en:"",grupo:"Costas",principais:["Trapézio médio"],secundarios:["Bíceps", "Latíssimo"],equipamento:"Barra",nivel:"Intermediário",passos:["Put weight on one of the ends of an Olympic barbell. Make sure that you either place the other end of the barbell in the corner of two walls; or put a heavy object on the ground so the barbell cannot slide backward.", "Bend forward until your torso is as close to parallel with the floor as you can and keep your knees slightly bent.", "Now grab the bar with both arms just behind the plates on the side where the weight was placed and put your other hand on your knee. This will be your starting position."],erros:[],cuidados:[],series:"3-4",reps:"8-12",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Two-Arm_Long_Bar_Row/0.jpg"},
{id:"db_deficit_deadlift",nome:"Deficit Deadlift",nome_en:"",grupo:"Costas",principais:["Eretores"],secundarios:["Antebraço", "Glúteos"],equipamento:"Barra",nivel:"Intermediário",passos:["Begin by having a platform or weight plates that you can stand on, usually 1-3 inches in height. Approach the bar so that it is centered over your feet. You feet should be about hip width apart. Bend at the hip to grip the bar at shoulder width, allowing your shoulder blades to protract. Typically, you would use an overhand grip or an over/under grip on heavier sets.", "With your feet, and your grip set, take a big breath and then lower your hips and bend the knees until your shins contact the bar. Look forward with your head, keep your chest up and your back arched, and begin driving through the heels to move the weight upward. After the bar passes the knees, aggressively pull the bar back, pulling your shoulder blades together as you drive your hips forward into the bar.", "Lower the bar by bending at the hips and guiding it to the floor."],erros:[],cuidados:[],series:"3-4",reps:"8-12",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Deficit_Deadlift/0.jpg"},
{id:"db_rack_pull_with_bands",nome:"Rack Pull with Bands",nome_en:"",grupo:"Costas",principais:["Eretores"],secundarios:["Antebraço", "Glúteos"],equipamento:"Barra",nivel:"Intermediário",passos:["Set up in a power rack with the bar on the pins. The pins should be set to the desired point; just below the knees, just above, or in the mid thigh position. Attach bands to the base of the rack, or secure them with dumbbells. Attach the other end to the bar. You may need to choke the bands to provide tension.", "Position yourself against the bar in proper deadlifting position. Your feet should be under your hips, your grip shoulder width, back arched, and hips back to engage the hamstrings. Since the weight is typically heavy, you may use a mixed grip, a hook grip, or use straps to aid in holding the weight.", "With your head looking forward, extend through the hips and knees, pulling the weight up and back until lockout. Be sure to pull your shoulders back as you complete the movement. Return the weight to the pins and repeat."],erros:[],cuidados:[],series:"3-4",reps:"8-12",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rack_Pull_with_Bands/0.jpg"},
{id:"db_rack_pulls",nome:"Rack Pulls",nome_en:"",grupo:"Costas",principais:["Eretores"],secundarios:["Antebraço", "Glúteos"],equipamento:"Barra",nivel:"Intermediário",passos:["Set up in a power rack with the bar on the pins. The pins should be set to the desired point; just below the knees, just above, or in the mid thigh position. Position yourself against the bar in proper deadlifting position. Your feet should be under your hips, your grip shoulder width, back arched, and hips back to engage the hamstrings. Since the weight is typically heavy, you may use a mixed grip, a hook grip, or use straps to aid in holding the weight.", "With your head looking forward, extend through the hips and knees, pulling the weight up and back until lockout. Be sure to pull your shoulders back as you complete the movement.", "Return the weight to the pins and repeat."],erros:[],cuidados:[],series:"3-4",reps:"8-12",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rack_Pulls/0.jpg"},
{id:"db_reverse_grip_bent_over_rows",nome:"Reverse Grip Bent-Over Rows",nome_en:"",grupo:"Costas",principais:["Trapézio médio"],secundarios:["Bíceps", "Latíssimo"],equipamento:"Barra",nivel:"Intermediário",passos:["Stand erect while holding a barbell with a supinated grip (palms facing up).", "Bend your knees slightly and bring your torso forward, by bending at the waist, while keeping the back straight until it is almost parallel to the floor. Tip: Make sure that you keep the head up. The barbell should hang directly in front of you as your arms hang perpendicular to the floor and your torso. This is your starting position.", "While keeping the torso stationary, lift the barbell as you breathe out, keeping the elbows close to the body and not doing any force with the forearm other than holding the weights. On the top contracted position, squeeze the back muscles and hold for a second."],erros:[],cuidados:[],series:"3-4",reps:"8-12",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Grip_Bent-Over_Rows/0.jpg"},
{id:"db_seated_good_mornings",nome:"Seated Good Mornings",nome_en:"",grupo:"Costas",principais:["Eretores"],secundarios:["Glúteos"],equipamento:"Barra",nivel:"Intermediário",passos:["Set up a box in a power rack. The pins should be set at an appropriate height. Begin by stepping under the bar and placing it across the back of the shoulders, not on top of your traps. Squeeze your shoulder blades together and rotate your elbows forward, attempting to bend the bar across your shoulders.", "Remove the bar from the rack, creating a tight arch in your lower back. Keep your head facing forward. With your back, shoulders, and core tight, push your knees and butt out and you begin your descent. Sit back with your hips until you are seated on the box. This will be your starting position.", "Keeping the bar tight, bend forward at the hips as much as possible. If you set the pins to what would be parallel, you not only have a safety if you fail, but know when to stop."],erros:[],cuidados:[],series:"3-4",reps:"8-12",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Good_Mornings/0.jpg"},
{id:"db_clean_shrug",nome:"Clean Shrug",nome_en:"",grupo:"Costas",principais:["Trapézio"],secundarios:["Antebraço", "Deltóide"],equipamento:"Barra",nivel:"Iniciante",passos:["Begin with a shoulder width, double overhand or hook grip, with the bar hanging at the mid thigh position. Your back should be straight and inclined slightly forward.", "Shrug your shoulders towards your ears. While this exercise can usually by loaded with heavier weight than a clean, avoid overloading to the point that the execution slows down."],erros:[],cuidados:[],series:"3",reps:"8-12",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Clean_Shrug/0.jpg"},
{id:"db_deadlift_with_bands",nome:"Levantamento Terra com Elástico",nome_en:"",grupo:"Costas",principais:["Eretores"],secundarios:["Antebraço", "Glúteos"],equipamento:"Barra",nivel:"Avançado",passos:["To deadlift with short bands, simply loop them over the bar before you start, and step into them to set up. For long bands, they will need to be anchored to a secure base, such as heavy dumbbells or a rack.", "With your feet, and your grip set, take a big breath and then lower your hips and bend the knees until your shins contact the bar. Look forward with your head, keep your chest up and your back arched, and begin driving through the heels to move the weight upward. After the bar passes the knees, aggressively pull the bar back, pulling your shoulder blades together as you drive your hips forward into the bar.", "Lower the bar by bending at the hips and guiding it to the floor."],erros:[],cuidados:[],series:"4-5",reps:"8-12",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Deadlift_with_Bands/0.jpg"},
{id:"db_deadlift_with_chains",nome:"Deadlift with Chains",nome_en:"",grupo:"Costas",principais:["Eretores"],secundarios:["Antebraço", "Glúteos"],equipamento:"Barra",nivel:"Avançado",passos:["You can attach the chains to the sleeves of the bar, or just drape the middle over the bar so there is a greater weight increase as you lift.", "Approach the bar so that it is centered over your feet. You feet should be about hip width apart. Bend at the hip to grip the bar at shoulder width, allowing your shoulder blades to protract. Typically, you would use an overhand grip or an over/under grip on heavier sets. With your feet, and your grip set, take a big breath and then lower your hips and bend the knees until your shins contact the bar.", "Look forward with your head, keep your chest up and your back arched, and begin driving through the heels to move the weight upward. After the bar passes the knees, aggressively pull the bar back, pulling your shoulder blades together as you drive your hips forward into the bar."],erros:[],cuidados:[],series:"4-5",reps:"8-12",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Deadlift_with_Chains/0.jpg"},
{id:"db_reverse_band_deadlift",nome:"Reverse Band Deadlift",nome_en:"",grupo:"Costas",principais:["Eretores"],secundarios:["Abdutores", "Adutores"],equipamento:"Barra",nivel:"Avançado",passos:["Set the bar up in a power rack. Attach bands to the top of the rack, using either bands pegs or the frame itself. Attach the other end of the bands to the bar.", "Approach the bar so that it is centered over your feet. You feet should be about hip width apart. Bend at the hip to grip the bar at shoulder width, allowing your shoulder blades to protract. Typically, you would use an overhand grip or an over/under grip on heavier sets.", "With your feet, and your grip set, take a big breath and then lower your hips and bend the knees until your shins contact the bar. Look forward with your head, keep your chest up and your back arched, and begin driving through the heels to move the weight upward."],erros:[],cuidados:[],series:"4-5",reps:"8-12",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Band_Deadlift/0.jpg"},
{id:"db_snatch_shrug",nome:"Snatch Shrug",nome_en:"",grupo:"Costas",principais:["Trapézio"],secundarios:["Antebraço", "Deltóide"],equipamento:"Barra",nivel:"Intermediário",passos:["Begin with a wide grip, with the bar hanging at the mid thigh position. You can use a hook or overhand grip. Your back should be straight and inclined slightly forward.", "Shrug your shoulders towards your ears. While this exercise can usually by loaded with heavier weight than a snatch, avoid overloading to the point that the execution slows down."],erros:[],cuidados:[],series:"3-4",reps:"8-12",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Snatch_Shrug/0.jpg"},
{id:"db_bent_over_two_dumbbell_row",nome:"Remada com Dois Halteres",nome_en:"",grupo:"Costas",principais:["Trapézio médio"],secundarios:["Bíceps", "Latíssimo"],equipamento:"Halter",nivel:"Iniciante",passos:["With a dumbbell in each hand (palms facing your torso), bend your knees slightly and bring your torso forward by bending at the waist; as you bend make sure to keep your back straight until it is almost parallel to the floor. Tip: Make sure that you keep the head up. The weights should hang directly in front of you as your arms hang perpendicular to the floor and your torso. This is your starting position.", "While keeping the torso stationary, lift the dumbbells to your side (as you breathe out), keeping the elbows close to the body (do not exert any force with the forearm other than holding the weights). On the top contracted position, squeeze the back muscles and hold for a second.", "Slowly lower the weight again to the starting position as you inhale."],erros:[],cuidados:[],series:"3",reps:"8-12",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Two-Dumbbell_Row/0.jpg"},
{id:"db_bent_over_two_dumbbell_row_with_palms_in",nome:"Bent Over Two-Dumbbell Row With Palms In",nome_en:"",grupo:"Costas",principais:["Trapézio médio"],secundarios:["Bíceps", "Latíssimo"],equipamento:"Halter",nivel:"Iniciante",passos:["With a dumbbell in each hand (palms facing each other), bend your knees slightly and bring your torso forward, by bending at the waist, while keeping the back straight until it is almost parallel to the floor. Tip: Make sure that you keep the head up. The weights should hang directly in front of you as your arms hang perpendicular to the floor and your torso. This is your starting position.", "While keeping the torso stationary, lift the dumbbells to your side as you breathe out, squeezing your shoulder blades together. On the top contracted position, squeeze the back muscles and hold for a second.", "Slowly lower the weight again to the starting position as you inhale."],erros:[],cuidados:[],series:"3",reps:"8-12",descanso:"90s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Two-Dumbbell_Row_With_Palms_In/0.jpg"},
{id:"db_barbell_seated_calf_raise",nome:"Elevação de Calcanhares Sentado com Barra",nome_en:"",grupo:"Panturrilha",principais:["Panturrilha"],secundarios:[],equipamento:"Barra",nivel:"Iniciante",passos:["Place a block about 12 inches in front of a flat bench.", "Sit on the bench and place the ball of your feet on the block.", "Have someone place a barbell over your upper thighs about 3 inches above your knees and hold it there. This will be your starting position."],erros:[],cuidados:[],series:"3",reps:"15-20",descanso:"45s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Seated_Calf_Raise/0.jpg"},
{id:"db_rocking_standing_calf_raise",nome:"Rocking Standing Calf Raise",nome_en:"",grupo:"Panturrilha",principais:["Panturrilha"],secundarios:[],equipamento:"Barra",nivel:"Iniciante",passos:["This exercise is best performed inside a squat rack for safety purposes. To begin, first set the bar on a rack that best matches your height. Once the correct height is chosen and the bar is loaded, step under the bar and place it on the back of your shoulders (slightly below the neck).", "Hold on to the bar using both arms at each side and lift it off the rack by first pushing with your legs and at the same time straightening your torso.", "Step away from the rack and position your legs using a shoulder width medium stance with the toes slightly pointed out. Keep your head up at all times as looking down will get you off balance. Also maintain a straight back and keep the knees with a slight bend; never locked. This will be your starting position."],erros:[],cuidados:[],series:"3",reps:"15-20",descanso:"45s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rocking_Standing_Calf_Raise/0.jpg"},
{id:"db_standing_barbell_calf_raise",nome:"Elevação de Calcanhares em Pé com Barra",nome_en:"",grupo:"Panturrilha",principais:["Panturrilha"],secundarios:[],equipamento:"Barra",nivel:"Iniciante",passos:["This exercise is best performed inside a squat rack for safety purposes. To begin, first set the bar on a rack that best matches your height. Once the correct height is chosen and the bar is loaded, step under the bar and place the bar on the back of your shoulders (slightly below the neck).", "Hold on to the bar using both arms at each side and lift it off the rack by first pushing with your legs and at the same time straightening your torso.", "Step away from the rack and position your legs using a shoulder width medium stance with the toes slightly pointed out. Keep your head up at all times as looking down will get you off balance and also maintain a straight back. The knees should be kept with a slight bend; never locked. This will be your starting position. Tip: For better range of motion you may also place the ball of your feet on a wooden block but be careful as this option requires more balance and a sturdy block."],erros:[],cuidados:[],series:"3",reps:"15-20",descanso:"45s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Barbell_Calf_Raise/0.jpg"},
{id:"db_dumbbell_seated_one_leg_calf_raise",nome:"Dumbbell Seated One-Leg Calf Raise",nome_en:"",grupo:"Panturrilha",principais:["Panturrilha"],secundarios:[],equipamento:"Halter",nivel:"Iniciante",passos:["Place a block on the floor about 12 inches from a flat bench.", "Sit on a flat bench and place a dumbbell on your upper left thigh about 3 inches above your knee.", "Now place the ball of your left foot on the block. This will be your starting position."],erros:[],cuidados:[],series:"3",reps:"15-20",descanso:"45s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Seated_One-Leg_Calf_Raise/0.jpg"},
{id:"db_calf_raise_on_a_dumbbell",nome:"Calf Raise On A Dumbbell",nome_en:"",grupo:"Panturrilha",principais:["Panturrilha"],secundarios:[],equipamento:"Halter",nivel:"Intermediário",passos:["Hang on to a sturdy object for balance and stand on a dumbbell handle, preferably one with round plates so that it rolls as in this manner you have to work harder to stabilize yourself; thus increasing the effectiveness of the exercise.", "Now roll your foot slightly forward so that you can get a nice stretch of the calf. This will be your starting position.", "Lift the calf as you roll your foot over the top of the handle so that you get a full extension. Exhale during the execution of this movement. Contract the calf hard at the top and hold for a second. Tip: As you come up, roll the dumbbell slightly backward."],erros:[],cuidados:[],series:"3-4",reps:"15-20",descanso:"45s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Calf_Raise_On_A_Dumbbell/0.jpg"},
{id:"db_standing_dumbbell_calf_raise",nome:"Elevação de Calcanhares com Halter",nome_en:"",grupo:"Panturrilha",principais:["Panturrilha"],secundarios:[],equipamento:"Halter",nivel:"Intermediário",passos:["Stand with your torso upright holding two dumbbells in your hands by your sides. Place the ball of the foot on a sturdy and stable wooden board (that is around 2-3 inches tall) while your heels extend off and touch the floor. This will be your starting position.", "With the toes pointing either straight (to hit all parts equally), inwards (for emphasis on the outer head) or outwards (for emphasis on the inner head), raise the heels off the floor as you exhale by contracting the calves. Hold the top contraction for a second.", "As you inhale, go back to the starting position by slowly lowering the heels."],erros:[],cuidados:[],series:"3-4",reps:"15-20",descanso:"45s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Dumbbell_Calf_Raise/0.jpg"},
{id:"db_calf_press",nome:"Elevação de Calcanhares na Prensa",nome_en:"",grupo:"Panturrilha",principais:["Panturrilha"],secundarios:[],equipamento:"Máquina",nivel:"Iniciante",passos:["Adjust the seat so that your legs are only slightly bent in the start position. The balls of your feet should be firmly on the platform.", "Select an appropriate weight, and grasp the handles. This will be your starting position.", "Straighten the legs by extending the knees, just barely lifting the weight from the stack. Your ankle should be fully flexed, toes pointing up. Execute the movement by pressing downward through the balls of your feet as far as possible."],erros:[],cuidados:[],series:"3",reps:"15-20",descanso:"45s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Calf_Press/0.jpg"},
{id:"db_calf_press_on_the_leg_press_machine",nome:"Elevação de Calcanhares no Leg Press",nome_en:"",grupo:"Panturrilha",principais:["Panturrilha"],secundarios:[],equipamento:"Máquina",nivel:"Iniciante",passos:["Using a leg press machine, sit down on the machine and place your legs on the platform directly in front of you at a medium (shoulder width) foot stance.", "Lower the safety bars holding the weighted platform in place and press the platform all the way up until your legs are fully extended in front of you without locking your knees. (Note: In some leg press units you can leave the safety bars on for increased safety. If your leg press unit allows for this, then this is the preferred method of performing the exercise.) Your torso and the legs should make perfect 90-degree angle. Now carefully place your toes and balls of your feet on the lower portion of the platform with the heels extending off. Toes should be facing forward, outwards or inwards as described at the beginning of the chapter. This will be your starting position.", "Press on the platform by raising your heels as you breathe out by extending your ankles as high as possible and flexing your calf. Ensure that the knee is kept stationary at all times. There should be no bending at any time. Hold the contracted position by a second before you start to go back down."],erros:[],cuidados:[],series:"3",reps:"15-20",descanso:"45s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Calf_Press_On_The_Leg_Press_Machine/0.jpg"},
{id:"db_seated_calf_raise",nome:"Elevação de Calcanhares Sentado",nome_en:"",grupo:"Panturrilha",principais:["Panturrilha"],secundarios:[],equipamento:"Máquina",nivel:"Iniciante",passos:["Sit on the machine and place your toes on the lower portion of the platform provided with the heels extending off. Choose the toe positioning of your choice (forward, in, or out) as per the beginning of this chapter.", "Place your lower thighs under the lever pad, which will need to be adjusted according to the height of your thighs. Now place your hands on top of the lever pad in order to prevent it from slipping forward.", "Lift the lever slightly by pushing your heels up and release the safety bar. This will be your starting position."],erros:[],cuidados:[],series:"3",reps:"15-20",descanso:"45s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Calf_Raise/0.jpg"},
{id:"db_standing_calf_raises",nome:"Elevação de Calcanhares em Pé",nome_en:"",grupo:"Panturrilha",principais:["Panturrilha"],secundarios:[],equipamento:"Máquina",nivel:"Iniciante",passos:["Adjust the padded lever of the calf raise machine to fit your height.", "Place your shoulders under the pads provided and position your toes facing forward (or using any of the two other positions described at the beginning of the chapter). The balls of your feet should be secured on top of the calf block with the heels extending off it. Push the lever up by extending your hips and knees until your torso is standing erect. The knees should be kept with a slight bend; never locked. Toes should be facing forward, outwards or inwards as described at the beginning of the chapter. This will be your starting position.", "Raise your heels as you breathe out by extending your ankles as high as possible and flexing your calf. Ensure that the knee is kept stationary at all times. There should be no bending at any time. Hold the contracted position by a second before you start to go back down."],erros:[],cuidados:[],series:"3",reps:"15-20",descanso:"45s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Calf_Raises/0.jpg"},
{id:"db_calf_raises___with_bands",nome:"Calf Raises - With Bands",nome_en:"",grupo:"Panturrilha",principais:["Panturrilha"],secundarios:[],equipamento:"Elástico",nivel:"Iniciante",passos:["Grab an exercise band and stand on it with your toes making sure that the length of the band between the foot and the arms is the same for both sides.", "While holding the handles of the band, raise the arms to the side of your head as if you were getting ready to perform a shoulder press. The palms should be facing forward with the elbows bent and to the sides. This movement will create tension on the band. This will be your starting position.", "Keeping the hands by your shoulder, stand up on your toes as you exhale and contract the calves hard at the top of the movement."],erros:[],cuidados:[],series:"3",reps:"15-20",descanso:"45s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Calf_Raises_-_With_Bands/0.jpg"},
{id:"db_knee_circles",nome:"Knee Circles",nome_en:"",grupo:"Panturrilha",principais:["Panturrilha"],secundarios:["Isquiotibiais", "Quadríceps"],equipamento:"Peso corporal",nivel:"Iniciante",passos:["Stand with your legs together and hands by your waist.", "Now move your knees in a circular motion as you breathe normally.", "Repeat for the recommended amount of repetitions."],erros:[],cuidados:[],series:"3",reps:"15-20",descanso:"45s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Knee_Circles/0.jpg"},
{id:"db_barbell_glute_bridge",nome:"Ponte de Glúteos com Barra",nome_en:"",grupo:"Glúteos",principais:["Glúteos"],secundarios:["Panturrilha", "Isquiotibiais"],equipamento:"Barra",nivel:"Intermediário",passos:["Begin seated on the ground with a loaded barbell over your legs. Using a fat bar or having a pad on the bar can greatly reduce the discomfort caused by this exercise. Roll the bar so that it is directly above your hips, and lay down flat on the floor.", "Begin the movement by driving through with your heels, extending your hips vertically through the bar. Your weight should be supported by your upper back and the heels of your feet.", "Extend as far as possible, then reverse the motion to return to the starting position."],erros:[],cuidados:[],series:"3-4",reps:"12-15",descanso:"75s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Glute_Bridge/0.jpg"},
{id:"db_barbell_hip_thrust",nome:"Hip Thrust com Barra",nome_en:"",grupo:"Glúteos",principais:["Glúteos"],secundarios:["Panturrilha", "Isquiotibiais"],equipamento:"Barra",nivel:"Intermediário",passos:["Begin seated on the ground with a bench directly behind you. Have a loaded barbell over your legs. Using a fat bar or having a pad on the bar can greatly reduce the discomfort caused by this exercise.", "Roll the bar so that it is directly above your hips, and lean back against the bench so that your shoulder blades are near the top of it.", "Begin the movement by driving through your feet, extending your hips vertically through the bar. Your weight should be supported by your shoulder blades and your feet. Extend as far as possible, then reverse the motion to return to the starting position."],erros:[],cuidados:[],series:"3-4",reps:"12-15",descanso:"75s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Hip_Thrust/0.jpg"},
{id:"db_kneeling_squat",nome:"Kneeling Squat",nome_en:"",grupo:"Glúteos",principais:["Glúteos"],secundarios:["Reto abdominal", "Isquiotibiais"],equipamento:"Barra",nivel:"Intermediário",passos:["Set the bar to the proper height in a power rack. Kneel behind the bar; it may be beneficial to put a mat down to pad your knees. Slide under the bar, racking it across the back of your shoulders. Your shoulder blades should be retracted and the bar tight across your back. Unrack the weight.", "With your head looking forward, sit back with your butt until you touch your calves.", "Reverse the motion, returning the torso to an upright position."],erros:[],cuidados:[],series:"3-4",reps:"12-15",descanso:"75s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kneeling_Squat/0.jpg"},
{id:"db_kneeling_jump_squat",nome:"Kneeling Jump Squat",nome_en:"",grupo:"Glúteos",principais:["Glúteos"],secundarios:["Panturrilha", "Isquiotibiais"],equipamento:"Barra",nivel:"Avançado",passos:["Begin kneeling on the floor with a barbell racked across the back of your shoulders, or you can use your body weight for this exercise. This can be done inside of a power rack to make unracking easier.", "Sit back with your hips until your glutes touch your feet, keeping your head and chest up.", "Explode up with your hips, generating enough power to land with your feet flat on the floor."],erros:[],cuidados:[],series:"4-5",reps:"12-15",descanso:"75s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kneeling_Jump_Squat/0.jpg"},
{id:"db_one_legged_cable_kickback",nome:"One-Legged Cable Kickback",nome_en:"",grupo:"Glúteos",principais:["Glúteos"],secundarios:["Isquiotibiais"],equipamento:"Polia",nivel:"Intermediário",passos:["Hook a leather ankle cuff to a low cable pulley and then attach the cuff to your ankle.", "Face the weight stack from a distance of about two feet, grasping the steel frame for support.", "While keeping your knees and hips bent slightly and your abs tight, contract your glutes to slowly \"kick\" the working leg back in a semicircular arc as high as it will comfortably go as you breathe out. Tip: At full extension, squeeze your glutes for a second in order to achieve a peak contraction."],erros:[],cuidados:[],series:"3-4",reps:"12-15",descanso:"75s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Legged_Cable_Kickback/0.jpg"},
{id:"db_pull_through",nome:"Pull Through",nome_en:"",grupo:"Glúteos",principais:["Glúteos"],secundarios:["Isquiotibiais", "Eretores"],equipamento:"Polia",nivel:"Iniciante",passos:["Begin standing a few feet in front of a low pulley with a rope or handle attached. Face away from the machine, straddling the cable, with your feet set wide apart.", "Begin the movement by reaching through your legs as far as possible, bending at the hips. Keep your knees slightly bent. Keeping your arms straight, extend through the hip to stand straight up. Avoid pulling upward through the shoulders; all of the motion should originate through the hips."],erros:[],cuidados:[],series:"3",reps:"12-15",descanso:"75s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pull_Through/0.jpg"},
{id:"db_hip_extension_with_bands",nome:"Hip Extension with Bands",nome_en:"",grupo:"Glúteos",principais:["Glúteos"],secundarios:["Isquiotibiais"],equipamento:"Elástico",nivel:"Iniciante",passos:["Secure one end of the band to the lower portion of a post and attach the other to one ankle.", "Facing the attachment point of the band, hold on to the column to stabilize yourself.", "Keeping your head and your chest up, move the resisted leg back as far as you can while keeping the knee straight."],erros:[],cuidados:[],series:"3",reps:"12-15",descanso:"75s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hip_Extension_with_Bands/0.jpg"},
{id:"db_hip_lift_with_band",nome:"Hip Lift with Band",nome_en:"",grupo:"Glúteos",principais:["Glúteos"],secundarios:["Panturrilha", "Isquiotibiais"],equipamento:"Elástico",nivel:"Iniciante",passos:["After choosing a suitable band, lay down in the middle of the rack, after securing the band on either side of you. If your rack doesn't have pegs, the band can be secured using heavy dumbbells or similar objects, just ensure they won't move.", "Adjust your position so that the band is directly over your hips. Bend your knees and place your feet flat on the floor. Your hands can be on the floor or holding the band in position.", "Keeping your shoulders on the ground, drive through your heels to raise your hips, pushing into the band as high as you can."],erros:[],cuidados:[],series:"3",reps:"12-15",descanso:"75s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hip_Lift_with_Band/0.jpg"},
{id:"db_butt_lift_bridge",nome:"Butt Lift (Bridge)",nome_en:"",grupo:"Glúteos",principais:["Glúteos"],secundarios:["Isquiotibiais"],equipamento:"Peso corporal",nivel:"Iniciante",passos:["Lie flat on the floor on your back with the hands by your side and your knees bent. Your feet should be placed around shoulder width. This will be your starting position.", "Pushing mainly with your heels, lift your hips off the floor while keeping your back straight. Breathe out as you perform this part of the motion and hold at the top for a second.", "Slowly go back to the starting position as you breathe in."],erros:[],cuidados:[],series:"3",reps:"12-15",descanso:"75s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Butt_Lift_Bridge/0.jpg"},
{id:"db_flutter_kicks",nome:"Chutes Alternados",nome_en:"",grupo:"Glúteos",principais:["Glúteos"],secundarios:["Isquiotibiais"],equipamento:"Peso corporal",nivel:"Iniciante",passos:["On a flat bench lie facedown with the hips on the edge of the bench, the legs straight with toes high off the floor and with the arms on top of the bench holding on to the front edge.", "Squeeze your glutes and hamstrings and straighten the legs until they are level with the hips. This will be your starting position.", "Start the movement by lifting the left leg higher than the right leg."],erros:[],cuidados:[],series:"3",reps:"12-15",descanso:"75s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Flutter_Kicks/0.jpg"},
{id:"db_glute_kickback",nome:"Glute Kickback",nome_en:"",grupo:"Glúteos",principais:["Glúteos"],secundarios:["Isquiotibiais"],equipamento:"Peso corporal",nivel:"Iniciante",passos:["Kneel on the floor or an exercise mat and bend at the waist with your arms extended in front of you (perpendicular to the torso) in order to get into a kneeling push-up position but with the arms spaced at shoulder width. Your head should be looking forward and the bend of the knees should create a 90-degree angle between the hamstrings and the calves. This will be your starting position.", "As you exhale, lift up your right leg until the hamstrings are in line with the back while maintaining the 90-degree angle bend. Contract the glutes throughout this movement and hold the contraction at the top for a second. Tip: At the end of the movement the upper leg should be parallel to the floor while the calf should be perpendicular to it.", "Go back to the initial position as you inhale and now repeat with the left leg."],erros:[],cuidados:[],series:"3",reps:"12-15",descanso:"75s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Glute_Kickback/0.jpg"},
{id:"db_leg_lift",nome:"Leg Lift",nome_en:"",grupo:"Glúteos",principais:["Glúteos"],secundarios:["Isquiotibiais"],equipamento:"Peso corporal",nivel:"Iniciante",passos:["While standing up straight with both feet next to each other at around shoulder width, grab a sturdy surface such as the sides of a squat rack or the top of a chair to brace yourself and keep balance.", "With or without an ankle weight, lift one leg behind you as if performing a leg curl but standing up while keeping the other leg straight. Breathe out as you perform this movement.", "Slowly bring the raised leg back to the floor as you breathe in."],erros:[],cuidados:[],series:"3",reps:"12-15",descanso:"75s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Lift/0.jpg"},
{id:"db_single_leg_glute_bridge",nome:"Ponte de Glúteos Unilateral",nome_en:"",grupo:"Glúteos",principais:["Glúteos"],secundarios:["Isquiotibiais"],equipamento:"Peso corporal",nivel:"Iniciante",passos:["Lay on the floor with your feet flat and knees bent.", "Raise one leg off of the ground, pulling the knee to your chest. This will be your starting position.", "Execute the movement by driving through the heel, extending your hip upward and raising your glutes off of the ground."],erros:[],cuidados:[],series:"3",reps:"12-15",descanso:"75s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single_Leg_Glute_Bridge/0.jpg"},
{id:"db_step_up_with_knee_raise",nome:"Step-up with Knee Raise",nome_en:"",grupo:"Glúteos",principais:["Glúteos"],secundarios:["Isquiotibiais", "Quadríceps"],equipamento:"Peso corporal",nivel:"Iniciante",passos:["Stand facing a box or bench of an appropriate height with your feet together. This will be your starting position.", "Begin the movement by stepping up, putting your left foot on the top of the bench. Extend through the hip and knee of your front leg to stand up on the box. As you stand on the box with your left leg, flex your right knee and hip, bringing your knee as high as you can.", "Reverse this motion to step down off the box, and then repeat the sequence on the opposite leg."],erros:[],cuidados:[],series:"3",reps:"12-15",descanso:"75s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Step-up_with_Knee_Raise/0.jpg"},
{id:"db_lying_glute",nome:"Lying Glute",nome_en:"",grupo:"Glúteos",principais:["Glúteos"],secundarios:["Abdutores"],equipamento:"Peso corporal",nivel:"Avançado",passos:["Lie on your back with your partner kneeling beside you.", "Flex the hip of one leg, raising it off of the floor. Rotate the leg so the foot is over the opposite hip, the lower leg perpendicular to your body. Your partner should hold the knee and ankle in place. This will be your starting position.", "Attempt to push your leg towards your partner, who should be preventing any actual movement of the leg."],erros:[],cuidados:[],series:"4-5",reps:"12-15",descanso:"75s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Glute/0.jpg"},
{id:"db_close_grip_ez_bar_press",nome:"Close-Grip EZ-Bar Press",nome_en:"",grupo:"Tríceps",principais:["Tríceps"],secundarios:["Peitoral", "Deltóide"],equipamento:"Barra EZ",nivel:"Iniciante",passos:["Lie on a flat bench with an EZ bar loaded to an appropriate weight.", "Using a narrow grip lift the bar and hold it straight over your torso with your elbows in. The arms should be perpendicular to the floor. This will be your starting position.", "Now lower the bar down to your lower chest as you breathe in. Keep the elbows in as you perform this movement."],erros:[],cuidados:[],series:"3",reps:"10-15",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_EZ-Bar_Press/0.jpg"},
{id:"db_ez_bar_skullcrusher",nome:"Tríceps Testa Barra EZ",nome_en:"",grupo:"Tríceps",principais:["Tríceps"],secundarios:["Antebraço"],equipamento:"Barra EZ",nivel:"Iniciante",passos:["Using a close grip, lift the EZ bar and hold it with your elbows in as you lie on the bench. Your arms should be perpendicular to the floor. This will be your starting position.", "Keeping the upper arms stationary, lower the bar by allowing the elbows to flex. Inhale as you perform this portion of the movement. Pause once the bar is directly above the forehead.", "Lift the bar back to the starting position by extending the elbow and exhaling."],erros:[],cuidados:[],series:"3",reps:"10-15",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/EZ-Bar_Skullcrusher/0.jpg"},
{id:"db_lying_close_grip_barbell_triceps_press_to_chin",nome:"Lying Close-Grip Barbell Triceps Press To Chin",nome_en:"",grupo:"Tríceps",principais:["Tríceps"],secundarios:[],equipamento:"Barra EZ",nivel:"Intermediário",passos:["While holding a barbell or EZ Curl bar with a pronated grip (palms facing forward), lie on your back on a flat bench with your head off the end of the bench. Tip: If you are holding a barbell grab it using a shoulder-width grip and if you are using an E-Z Bar grab it on the inner handles.", "Extend your arms in front of you as you hold the barbell over your chest. The arms should be perpendicular to your torso (90-degree angle). This will be your starting position.", "As you inhale, lower the bar in a semi-circular motion by bending at the elbows and while keeping the upper arm stationary and elbows in. Keep lowering the bar until it lightly touches your chin."],erros:[],cuidados:[],series:"3-4",reps:"10-15",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Close-Grip_Barbell_Triceps_Press_To_Chin/0.jpg"},
{id:"db_lying_triceps_press",nome:"Tríceps Testa Deitado",nome_en:"",grupo:"Tríceps",principais:["Tríceps"],secundarios:[],equipamento:"Barra EZ",nivel:"Intermediário",passos:["Lie on a flat bench with either an e-z bar (my preference) or a straight bar placed on the floor behind your head and your feet on the floor.", "Grab the bar behind you, using a medium overhand (pronated) grip, and raise the bar in front of you at arms length. Tip: The arms should be perpendicular to the torso and the floor. The elbows should be tucked in. This is the starting position.", "As you breathe in, slowly lower the weight until the bar lightly touches your forehead while keeping the upper arms and elbows stationary."],erros:[],cuidados:[],series:"3-4",reps:"10-15",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Triceps_Press/0.jpg"},
{id:"db_close_grip_barbell_bench_press",nome:"Supino Pegada Fechada (Tríceps)",nome_en:"",grupo:"Tríceps",principais:["Tríceps"],secundarios:["Peitoral", "Deltóide"],equipamento:"Barra",nivel:"Iniciante",passos:["Lie back on a flat bench. Using a close grip (around shoulder width), lift the bar from the rack and hold it straight over you with your arms locked. This will be your starting position.", "As you breathe in, come down slowly until you feel the bar on your middle chest. Tip: Make sure that - as opposed to a regular bench press - you keep the elbows close to the torso at all times in order to maximize triceps involvement.", "After a second pause, bring the bar back to the starting position as you breathe out and push the bar using your triceps muscles. Lock your arms in the contracted position, hold for a second and then start coming down slowly again. Tip: It should take at least twice as long to go down than to come up."],erros:[],cuidados:[],series:"3",reps:"10-15",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_Barbell_Bench_Press/0.jpg"},
{id:"db_decline_ez_bar_triceps_extension",nome:"Decline EZ Bar Triceps Extension",nome_en:"",grupo:"Tríceps",principais:["Tríceps"],secundarios:[],equipamento:"Barra",nivel:"Iniciante",passos:["Secure your legs at the end of the decline bench and slowly lay down on the bench.", "Using a close grip (a grip that is slightly less than shoulder width), lift the EZ bar from the rack and hold it straight over you with your arms locked and elbows in. The arms should be perpendicular to the floor. This will be your starting position. Tip: In order to protect your rotator cuff, it is best if you have a spotter help you lift the barbell off the rack.", "As you breathe in and you keep the upper arms stationary, bring the bar down slowly by moving your forearms in a semicircular motion towards you until you feel the bar slightly touch your forehead. Breathe in as you perform this portion of the movement."],erros:[],cuidados:[],series:"3",reps:"10-15",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_EZ_Bar_Triceps_Extension/0.jpg"},
{id:"db_jm_press",nome:"JM Press",nome_en:"",grupo:"Tríceps",principais:["Tríceps"],secundarios:["Peitoral", "Deltóide"],equipamento:"Barra",nivel:"Iniciante",passos:["Start the exercise the same way you would a close grip bench press. You will lie on a flat bench while holding a barbell at arms length (fully extended) with the elbows in. However, instead of having the arms perpendicular to the torso, make sure the bar is set in a direct line above the upper chest. This will be your starting position.", "Now beginning from a fully extended position lower the bar down as if performing a lying triceps extension. Inhale as you perform this movement. When you reach the half way point, let the bar roll back about one inch by moving the upper arms towards your legs until they are perpendicular to the torso. Tip: Keep the bend at the elbows constant as you bring the upper arms forward.", "As you exhale, press the bar back up by using the triceps to perform a close grip bench press."],erros:[],cuidados:[],series:"3",reps:"10-15",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/JM_Press/0.jpg"},
{id:"db_standing_overhead_barbell_triceps_extension",nome:"Standing Overhead Barbell Triceps Extension",nome_en:"",grupo:"Tríceps",principais:["Tríceps"],secundarios:["Deltóide"],equipamento:"Barra",nivel:"Iniciante",passos:["To begin, stand up holding a barbell or e-z bar using a pronated grip (palms facing forward) with your hands closer than shoulder width apart from each other. Your feet should be about shoulder width apart.", "Now elevate the barbell above your head until your arms are fully extended. Keep your elbows in. This will be your starting position.", "Keeping your upper arms close to your head and elbows in, perpendicular to the floor, lower the resistance in a semicircular motion behind your head until your forearms touch your biceps. Tip: The upper arms should remain stationary and only the forearms should move. Breathe in as you perform this step."],erros:[],cuidados:[],series:"3",reps:"10-15",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Overhead_Barbell_Triceps_Extension/0.jpg"},
{id:"db_bench_press___powerlifting",nome:"Bench Press - Powerlifting",nome_en:"",grupo:"Tríceps",principais:["Tríceps"],secundarios:["Peitoral", "Antebraço"],equipamento:"Barra",nivel:"Intermediário",passos:["Begin by lying on the bench, getting your head beyond the bar if possible. Tuck your feet underneath you and arch your back. Using the bar to help support your weight, lift your shoulder off the bench and retract them, squeezing the shoulder blades together. Use your feet to drive your traps into the bench. Maintain this tight body position throughout the movement.", "However wide your grip, it should cover the ring on the bar. Pull the bar out of the rack without protracting your shoulders. Focus on squeezing the bar and trying to pull it apart.", "Lower the bar to your lower chest or upper stomach. The bar, wrist, and elbow should stay in line at all times."],erros:[],cuidados:[],series:"3-4",reps:"10-15",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bench_Press_-_Powerlifting/0.jpg"},
{id:"db_board_press",nome:"Board Press",nome_en:"",grupo:"Tríceps",principais:["Tríceps"],secundarios:["Peitoral", "Antebraço"],equipamento:"Barra",nivel:"Intermediário",passos:["Begin by lying on the bench, getting your head beyond the bar if possible. One to five boards, made out of 2x6's, can be screwed together and held in place by a training partner, bands, or just tucked under your shirt.", "Tuck your feet underneath you and arch your back. Using the bar to help support your weight, lift your shoulder off the bench and retract them, squeezing the shoulder blades together. Use your feet to drive your traps into the bench. Maintain this tight body position throughout the movement.", "You can take a standard bench grip, or shoulder width to focus on the triceps. Pull the bar out of the rack without protracting your shoulders. The bar, wrist, and elbow should stay in line at all times. Focus on squeezing the bar and trying to pull it apart."],erros:[],cuidados:[],series:"3-4",reps:"10-15",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Board_Press/0.jpg"},
{id:"db_decline_close_grip_bench_to_skull_crusher",nome:"Supino Declinado Fechado",nome_en:"",grupo:"Tríceps",principais:["Tríceps"],secundarios:["Peitoral", "Deltóide"],equipamento:"Barra",nivel:"Intermediário",passos:["Secure your legs at the end of the decline bench and slowly lay down on the bench.", "Using a close grip (a grip that is slightly less than shoulder width), lift the bar from the rack and hold it straight over you with your arms locked and elbows in. The arms should be perpendicular to the floor. This will be your starting position. Tip: In order to protect your rotator cuff, it is best if you have a spotter help you lift the barbell off the rack.", "Now lower the bar down to your lower chest as you breathe in. Keep the elbows in as you perform this movement."],erros:[],cuidados:[],series:"3-4",reps:"10-15",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Close-Grip_Bench_To_Skull_Crusher/0.jpg"},
{id:"db_floor_press",nome:"Floor Press",nome_en:"",grupo:"Tríceps",principais:["Tríceps"],secundarios:["Peitoral", "Deltóide"],equipamento:"Barra",nivel:"Intermediário",passos:["Adjust the j-hooks so they are at the appropriate height to rack the bar. Begin lying on the floor with your head near the end of a power rack. Keeping your shoulder blades pulled together; pull the bar off of the hooks.", "Lower the bar towards the bottom of your chest or upper stomach, squeezing the bar and attempting to pull it apart as you do so. Ensure that you tuck your elbows throughout the movement. Lower the bar until your upper arm contacts the ground and pause, preventing any slamming or bouncing of the weight.", "Press the bar back up as fast as you can, keeping the bar, your wrists, and elbows in line as you do so."],erros:[],cuidados:[],series:"3-4",reps:"10-15",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Floor_Press/0.jpg"},
{id:"db_floor_press_with_chains",nome:"Floor Press with Chains",nome_en:"",grupo:"Tríceps",principais:["Tríceps"],secundarios:["Peitoral", "Deltóide"],equipamento:"Barra",nivel:"Intermediário",passos:["Adjust the j-hooks so they are at the appropriate height to rack the bar. For this exercise, drape the chains directly over the end of the bar, trying to keep the ends away from the plates.", "Begin lying on the floor with your head near the end of a power rack. Keeping your shoulder blades pulled together, pull the bar off of the hooks.", "Lower the bar towards the bottom of your chest or upper stomach, squeezing the bar and attempting to pull it apart as you do so. Ensure that you tuck your elbows throughout the movement. Lower the bar until your upper arm contacts the ground and pause, preventing any slamming or bouncing of the weight."],erros:[],cuidados:[],series:"3-4",reps:"10-15",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Floor_Press_with_Chains/0.jpg"},
{id:"db_incline_barbell_triceps_extension",nome:"Incline Barbell Triceps Extension",nome_en:"",grupo:"Tríceps",principais:["Tríceps"],secundarios:["Antebraço"],equipamento:"Barra",nivel:"Intermediário",passos:["Hold a barbell with an overhand grip (palms down) that is a little closer together than shoulder width.", "Lie back on an incline bench set at any angle between 45-75-degrees.", "Bring the bar overhead with your arms extended and elbows in. The arms should be in line with the torso above the head. This will be your starting position."],erros:[],cuidados:[],series:"3-4",reps:"10-15",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Barbell_Triceps_Extension/0.jpg"},
{id:"db_lying_close_grip_barbell_triceps_extension_behind_",nome:"Lying Close-Grip Barbell Triceps Extension Behind The Head",nome_en:"",grupo:"Tríceps",principais:["Tríceps"],secundarios:[],equipamento:"Barra",nivel:"Intermediário",passos:["While holding a barbell or EZ Curl bar with a pronated grip (palms facing forward), lie on your back on a flat bench with your head close to the end of the bench. Tip: If you are holding a barbell grab it using a shoulder-width grip and if you are using an E-Z Bar grab it on the inner handles.", "Extend your arms in front of you and slowly bring the bar back in a semi circular motion (while keeping the arms extended) to a position over your head. At the end of this step your arms should be overhead and parallel to the floor. This will be your starting position. Tip: Keep your elbows in at all times.", "As you inhale, lower the bar by bending at the elbows and while keeping the upper arm stationary. Keep lowering the bar until your forearms are perpendicular to the floor."],erros:[],cuidados:[],series:"3-4",reps:"10-15",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Close-Grip_Barbell_Triceps_Extension_Behind_The_Head/0.jpg"},
{id:"db_one_arm_floor_press",nome:"One Arm Floor Press",nome_en:"",grupo:"Tríceps",principais:["Tríceps"],secundarios:["Peitoral", "Deltóide"],equipamento:"Barra",nivel:"Intermediário",passos:["Lie down on a flat surface with your back pressing against the floor or an exercise mat. Make sure your knees are bent.", "Have a partner hand you the bar on one hand. When starting, your arm should be just about fully extended, similar to the starting position of a barbell bench press. However, this time your grip will be neutral (palms facing your torso).", "Make sure the hand you are not using to lift the weight is placed by your side."],erros:[],cuidados:[],series:"3-4",reps:"10-15",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Arm_Floor_Press/0.jpg"},
{id:"db_pin_presses",nome:"Pin Presses",nome_en:"",grupo:"Tríceps",principais:["Tríceps"],secundarios:["Peitoral", "Antebraço"],equipamento:"Barra",nivel:"Intermediário",passos:["Pin presses remove the eccentric phase of the bench press, developing starting strength. They also allow you to train a desired range of motion.", "The bench should be set up in a power rack. Set the pins to the desired point in your range of motion, whether it just be lockout or an inch off of your chest. The bar should be moved to the pins and prepared for lifting.", "Begin by lying on the bench, with the bar directly above the contact point during your regular bench. Tuck your feet underneath you and arch your back. Using the bar to help support your weight, lift your shoulder off the bench and retract them, squeezing the shoulder blades together. Use your feet to drive your traps into the bench. Maintain this tight body position throughout the movement."],erros:[],cuidados:[],series:"3-4",reps:"10-15",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pin_Presses/0.jpg"},
{id:"db_reverse_band_bench_press",nome:"Reverse Band Bench Press",nome_en:"",grupo:"Tríceps",principais:["Tríceps"],secundarios:["Peitoral", "Antebraço"],equipamento:"Barra",nivel:"Intermediário",passos:["Position a bench inside a power rack, with the bar set to the correct height. Begin by anchoring bands either to band pegs or to the top of the rack. Ensure that you will be position properly under the bands. Attach the other end to the barbell.", "Lie on the bench, tuck your feet underneath you and arch your back. Using the bar to help support your weight, lift your shoulder off the bench and retract them, squeezing the shoulder blades together. Use your feet to drive your traps into the bench. Maintain this tight body position throughout the movement. However wide your grip, it should cover the ring on the bar.", "Pull the bar out of the rack without protracting your shoulders. Focus on squeezing the bar and trying to pull it apart. Lower the bar to your lower chest or upper stomach. The bar, wrist, and elbow should stay in line at all times."],erros:[],cuidados:[],series:"3-4",reps:"10-15",descanso:"60s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Band_Bench_Press/0.jpg"},
{id:"db_finger_curls",nome:"Flexão de Dedos",nome_en:"",grupo:"Antebraço",principais:["Antebraço"],secundarios:[],equipamento:"Barra",nivel:"Iniciante",passos:["Hold a barbell with both hands and your palms facing up; hands spaced about shoulder width.", "Place your feet flat on the floor, at a distance that is slightly wider than shoulder width apart. This will be your starting position.", "Lower the bar as far as possible by extending the fingers. Allowing the bar to roll down the hands, catch the bar with the final joint in the fingers."],erros:[],cuidados:[],series:"3",reps:"12-15",descanso:"45s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Finger_Curls/0.jpg"},
{id:"db_palms_down_wrist_curl_over_a_bench",nome:"Palms-Down Wrist Curl Over A Bench",nome_en:"",grupo:"Antebraço",principais:["Antebraço"],secundarios:[],equipamento:"Barra",nivel:"Iniciante",passos:["Start out by placing a barbell on one side of a flat bench.", "Kneel down on both of your knees so that your body is facing the flat bench.", "Use your arms to grab the barbell with a pronated grip (palms down) and bring them up so that your forearms are resting against the flat bench. Your wrists should be hanging over the edge."],erros:[],cuidados:[],series:"3",reps:"12-15",descanso:"45s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Palms-Down_Wrist_Curl_Over_A_Bench/0.jpg"},
{id:"db_palms_up_barbell_wrist_curl_over_a_bench",nome:"Palms-Up Barbell Wrist Curl Over A Bench",nome_en:"",grupo:"Antebraço",principais:["Antebraço"],secundarios:[],equipamento:"Barra",nivel:"Iniciante",passos:["Start out by placing a barbell on one side of a flat bench.", "Kneel down on both of your knees so that your body is facing the flat bench.", "Use your arms to grab the barbell with a supinated grip (palms up) and bring them up so that your forearms are resting against the flat bench. Your wrists should be hanging over the edge."],erros:[],cuidados:[],series:"3",reps:"12-15",descanso:"45s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Palms-Up_Barbell_Wrist_Curl_Over_A_Bench/0.jpg"},
{id:"db_seated_palm_up_barbell_wrist_curl",nome:"Seated Palm-Up Barbell Wrist Curl",nome_en:"",grupo:"Antebraço",principais:["Antebraço"],secundarios:[],equipamento:"Barra",nivel:"Iniciante",passos:["Hold a barbell with both hands and your palms facing up; hands spaced about shoulder width.", "Place your feet flat on the floor, at a distance that is slightly wider than shoulder width apart.", "Lean forward and place your forearms on top of your upper thighs with your palms up. Tip: Make sure that the front of the wrists lay on top of your knees. This will be your starting position."],erros:[],cuidados:[],series:"3",reps:"12-15",descanso:"45s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Palm-Up_Barbell_Wrist_Curl/0.jpg"},
{id:"db_seated_palms_down_barbell_wrist_curl",nome:"Flexão de Pulso Pronada Sentado",nome_en:"",grupo:"Antebraço",principais:["Antebraço"],secundarios:[],equipamento:"Barra",nivel:"Iniciante",passos:["Hold a barbell with both hands and your palms facing down; hands spaced about shoulder width.", "Place your feet flat on the floor, at a distance that is slightly wider than shoulder width apart.", "Lean forward and place your forearms on top of your upper thighs with your palms down. Tip: Make sure that the back of the wrists lay on top of your knees. This will be your starting position."],erros:[],cuidados:[],series:"3",reps:"12-15",descanso:"45s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Palms-Down_Barbell_Wrist_Curl/0.jpg"},
{id:"db_standing_palms_up_barbell_behind_the_back_wrist_cu",nome:"Standing Palms-Up Barbell Behind The Back Wrist Curl",nome_en:"",grupo:"Antebraço",principais:["Antebraço"],secundarios:[],equipamento:"Barra",nivel:"Iniciante",passos:["Start by standing straight and holding a barbell behind your glutes at arm's length while using a pronated grip (palms will be facing back away from the glutes) and having your hands shoulder width apart from each other.", "You should be looking straight forward while your feet are shoulder width apart from each other. This is the starting position.", "While exhaling, slowly elevate the barbell up by curling your wrist in a semi-circular motion towards the ceiling. Note: Your wrist should be the only body part moving for this exercise."],erros:[],cuidados:[],series:"3",reps:"12-15",descanso:"45s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Palms-Up_Barbell_Behind_The_Back_Wrist_Curl/0.jpg"},
{id:"db_wrist_rotations_with_straight_bar",nome:"Wrist Rotations with Straight Bar",nome_en:"",grupo:"Antebraço",principais:["Antebraço"],secundarios:[],equipamento:"Barra",nivel:"Iniciante",passos:["Hold a barbell with both hands and your palms facing down; hands spaced about shoulder width. This will be your starting position.", "Alternating between each of your hands, perform the movement by extending the wrist as though you were rolling up a newspaper. Continue alternating back and forth until failure.", "Reverse the motion by flexing the wrist, rolling the opposite direction. Continue the alternating motion until failure."],erros:[],cuidados:[],series:"3",reps:"12-15",descanso:"45s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wrist_Rotations_with_Straight_Bar/0.jpg"},
{id:"db_palms_down_dumbbell_wrist_curl_over_a_bench",nome:"Palms-Down Dumbbell Wrist Curl Over A Bench",nome_en:"",grupo:"Antebraço",principais:["Antebraço"],secundarios:[],equipamento:"Halter",nivel:"Iniciante",passos:["Start out by placing two dumbbells on one side of a flat bench.", "Kneel down on both of your knees so that your body is facing the flat bench.", "Use your arms to grab both of the dumbbells with a pronated grip (palms facing down) and bring them up so that your forearms are resting against the flat bench. Your wrists should be hanging over the edge."],erros:[],cuidados:[],series:"3",reps:"12-15",descanso:"45s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Palms-Down_Dumbbell_Wrist_Curl_Over_A_Bench/0.jpg"},
{id:"db_palms_up_dumbbell_wrist_curl_over_a_bench",nome:"Palms-Up Dumbbell Wrist Curl Over A Bench",nome_en:"",grupo:"Antebraço",principais:["Antebraço"],secundarios:[],equipamento:"Halter",nivel:"Iniciante",passos:["Start out by placing two dumbbells on one side of a flat bench.", "Kneel down on both of your knees so that your body is facing the flat bench.", "Use your arms to grab both of the dumbbells with a supinated grip (palms up) and bring them up so that your forearms are resting against the flat bench. Your wrists should be hanging over the edge."],erros:[],cuidados:[],series:"3",reps:"12-15",descanso:"45s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Palms-Up_Dumbbell_Wrist_Curl_Over_A_Bench/0.jpg"},
{id:"db_seated_dumbbell_palms_down_wrist_curl",nome:"Seated Dumbbell Palms-Down Wrist Curl",nome_en:"",grupo:"Antebraço",principais:["Antebraço"],secundarios:[],equipamento:"Halter",nivel:"Iniciante",passos:["Start out by placing two dumbbells on the floor in front of a flat bench.", "Sit down on the edge of the flat bench with your legs at about shoulder width apart. Make sure to keep your feet on the floor.", "Use your arms to grab both of the dumbbells and bring them up so that your forearms are resting against your thighs with the palms of the hands facing down. Your wrists should be hanging over the edge of your thighs."],erros:[],cuidados:[],series:"3",reps:"12-15",descanso:"45s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Dumbbell_Palms-Down_Wrist_Curl/0.jpg"},
{id:"db_isometric_neck_exercise___front_and_back",nome:"Isometric Neck Exercise - Front And Back",nome_en:"",grupo:"Pescoço",principais:["Pescoço"],secundarios:[],equipamento:"Peso corporal",nivel:"Iniciante",passos:["With your head and neck in a neutral position (normal position with head erect facing forward), place both of your hands on the front side of your head.", "Now gently push forward as you contract the neck muscles but resisting any movement of your head. Start with slow tension and increase slowly. Keep breathing normally as you execute this contraction.", "Hold for the recommended number of seconds."],erros:[],cuidados:[],series:"3",reps:"12-15",descanso:"45s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Isometric_Neck_Exercise_-_Front_And_Back/0.jpg"},
{id:"db_isometric_neck_exercise___sides",nome:"Isometric Neck Exercise - Sides",nome_en:"",grupo:"Pescoço",principais:["Pescoço"],secundarios:[],equipamento:"Peso corporal",nivel:"Iniciante",passos:["With your head and neck in a neutral position (normal position with head erect facing forward), place your left hand on the left side of your head.", "Now gently push towards the left as you contract the left neck muscles but resisting any movement of your head. Start with slow tension and increase slowly. Keep breathing normally as you execute this contraction.", "Hold for the recommended number of seconds."],erros:[],cuidados:[],series:"3",reps:"12-15",descanso:"45s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Isometric_Neck_Exercise_-_Sides/0.jpg"},
{id:"db_lying_face_down_plate_neck_resistance",nome:"Extensão de Pescoço com Anilha",nome_en:"",grupo:"Pescoço",principais:["Pescoço"],secundarios:[],equipamento:"Outro",nivel:"Intermediário",passos:["Lie face down with your whole body straight on a flat bench while holding a weight plate behind your head. Tip: You will need to position yourself so that your shoulders are slightly above the end of a flat bench in order for the upper chest, neck and face to be off the bench. This will be your starting position.", "While keeping the plate secure on the back of your head slowly lower your head (as in saying \"yes\") as you breathe in.", "Raise your head back up to the starting position in a semi-circular motion as you breathe out. Hold the contraction for a second."],erros:[],cuidados:[],series:"3-4",reps:"12-15",descanso:"45s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Face_Down_Plate_Neck_Resistance/0.jpg"},
{id:"db_lying_face_up_plate_neck_resistance",nome:"Flexão de Pescoço com Anilha",nome_en:"",grupo:"Pescoço",principais:["Pescoço"],secundarios:[],equipamento:"Outro",nivel:"Intermediário",passos:["Lie face up with your whole body straight on a flat bench while holding a weight plate on top of your forehead. Tip: You will need to position yourself so that your shoulders are slightly above the end of a flat bench in order for the traps, neck and head to be off the bench. This will be your starting position.", "While keeping the plate secure on your forehead slowly lower your head back in a semi-circular motion as you breathe in.", "Raise your head back up to the starting position in a semi-circular motion as you breathe out. Hold the contraction for a second."],erros:[],cuidados:[],series:"3-4",reps:"12-15",descanso:"45s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Face_Up_Plate_Neck_Resistance/0.jpg"},
{id:"db_seated_head_harness_neck_resistance",nome:"Seated Head Harness Neck Resistance",nome_en:"",grupo:"Pescoço",principais:["Pescoço"],secundarios:[],equipamento:"Outro",nivel:"Intermediário",passos:["Place a neck strap on the floor at the end of a flat bench. Once you have selected the weights, sit at the end of the flat bench with your feet wider than shoulder width apart from each other. Your toes should be pointed out.", "Slowly move your torso forward until it is almost parallel with the floor. Using both hands, securely position the neck strap around your head. Tip: Make sure the weights are still lying on the floor to prevent any strain on the neck. Now grab the weight with both hands while elevating your torso back until it is almost perpendicular to the floor. Note: Your head and torso needs to be slightly tilted forward to perform this exercise.", "Now place both hands on top of your knees. This is the starting position."],erros:[],cuidados:[],series:"3-4",reps:"12-15",descanso:"45s",video:"",img_url:"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Head_Harness_Neck_Resistance/0.jpg"}
];
const BIBLIOTECA = BIBLIOTECA_FULL;



// ─── BIBLIOTECA MODAL (para admin montar treino) ───────────────────────────────
const BibliotecaModal = ({ onAdd, onClose }) => {
  const [grupoFiltro, setGrupoFiltro] = useState("Todos");
  const [busca, setBusca] = useState("");
  const [exSel, setExSel] = useState(null);
  const [editando, setEditando] = useState(null); // { series, reps, descanso, obs }

  const grupos = ["Todos", ...Object.keys(GRUPOS_CORES)];
  const filtrados = BIBLIOTECA.filter(ex => {
    const matchGrupo = grupoFiltro === "Todos" || ex.grupo === grupoFiltro;
    const matchBusca = !busca || ex.nome.toLowerCase().includes(busca.toLowerCase()) || ex.grupo.toLowerCase().includes(busca.toLowerCase()) || ex.principais.some(p => p.toLowerCase().includes(busca.toLowerCase()));
    return matchGrupo && matchBusca;
  });

  if (editando && exSel) {
    return (
      <div style={{ position:"fixed", inset:0, background:"#000D", zIndex:250, display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
        <div style={{ background:T.card, borderRadius:"20px 20px 0 0", width:"100%", maxWidth:430, maxHeight:"92vh", overflowY:"auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"18px 20px 14px", borderBottom:`1px solid ${T.border}`, position:"sticky", top:0, background:T.card, zIndex:2 }}>
            <span style={{ fontSize:15, fontWeight:800, color:T.text }}>Configurar exercício</span>
            <button onClick={()=>setEditando(null)} style={{ background:T.card2, border:"none", borderRadius:50, width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}><Ic n="x" size={16} color={T.text3}/></button>
          </div>
          <div style={{ padding:"16px 20px 40px" }}>
            <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:16, padding:12, background:T.bg2, borderRadius:12 }}>
              <div style={{width:60,height:60,borderRadius:8,overflow:"hidden",flexShrink:0}}><ExImg nome={exSel.nome} musculo={exSel.grupo} style={{width:60,height:60}}/></div>
              <div>
                <p style={{ margin:0, fontSize:15, fontWeight:800, color:T.text }}>{exSel.nome}</p>
                <YBadge text={exSel.grupo} color={GRUPOS_CORES[exSel.grupo]||T.yellow}/>
                <p style={{ margin:"4px 0 0", color:T.text3, fontSize:12 }}>{exSel.principais.join(", ")}</p>
              </div>
            </div>
            <Inp label="SÉRIES" value={editando.series} onChange={v=>setEditando(p=>({...p,series:v}))}/>
            <Inp label="REPETIÇÕES" value={editando.reps} onChange={v=>setEditando(p=>({...p,reps:v}))}/>
            <Inp label="DESCANSO" value={editando.descanso} onChange={v=>setEditando(p=>({...p,descanso:v}))} placeholder="Ex: 60s, 90s"/>
            <Textarea label="OBSERVAÇÕES (carga, foco, adaptações)" value={editando.obs} onChange={v=>setEditando(p=>({...p,obs:v}))} placeholder="Ex: carga 20kg, foco na excêntrica..." rows={2}/>
            <Inp label="LINK DO VÍDEO (opcional)" value={editando.video||""} onChange={v=>setEditando(p=>({...p,video:v}))} placeholder="https://youtube.com/..."/>
            <div style={{ display:"flex", gap:10, marginTop:16 }}>
              <Btn onClick={()=>setEditando(null)} outline style={{ flex:1 }}>Voltar</Btn>
              <Btn onClick={()=>{ onAdd({ id:Date.now(), nome:exSel.nome, musculo:exSel.grupo, principais:exSel.principais, img:"", ...editando }); onClose(); }} style={{ flex:2, color:T.bg }}>
                <Ic n="plus" size={14} color={T.bg}/>Adicionar ao treino
              </Btn>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (exSel) {
    const cor = GRUPOS_CORES[exSel.grupo] || T.yellow;
    return (
      <div style={{ position:"fixed", inset:0, background:"#000D", zIndex:250, display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
        <div style={{ background:T.card, borderRadius:"20px 20px 0 0", width:"100%", maxWidth:430, maxHeight:"92vh", overflowY:"auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"18px 20px 14px", borderBottom:`1px solid ${T.border}`, position:"sticky", top:0, background:T.card, zIndex:2 }}>
            <button onClick={()=>setExSel(null)} style={{ background:"none", border:"none", cursor:"pointer", color:T.text3, display:"flex", alignItems:"center", gap:6, fontSize:14 }}><Ic n="back" size={16} color={T.text3}/>Biblioteca</button>
            <button onClick={onClose} style={{ background:T.card2, border:"none", borderRadius:50, width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}><Ic n="x" size={16} color={T.text3}/></button>
          </div>
          <div style={{ padding:"16px 20px 40px" }}>
            {/* Anatomy illustration */}
            <div style={{ display:"flex", gap:14, marginBottom:16 }}>
              <div style={{width:80,height:80,borderRadius:8,overflow:"hidden",flexShrink:0}}><ExImg nome={exSel.nome} musculo={exSel.grupo} style={{width:80,height:80}}/></div>
              <div style={{ flex:1 }}>
                <YBadge text={exSel.grupo} color={cor}/>
                <h3 style={{ margin:"6px 0 4px", fontSize:18, fontWeight:900, color:T.text }}>{exSel.nome}</h3>
                <p style={{ margin:0, color:T.text3, fontSize:12 }}>🎯 {exSel.principais.join(" · ")}</p>
                {exSel.secundarios?.length > 0 && <p style={{ margin:"2px 0 0", color:T.text3, fontSize:11 }}>+ {exSel.secundarios.join(", ")}</p>}
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:16 }}>
              {[{v:exSel.series,l:"Séries"},{v:exSel.reps,l:"Reps"},{v:exSel.descanso,l:"Descanso"}].map(i=>(
                <div key={i.l} style={{ background:T.card2, borderRadius:10, padding:"10px 8px", textAlign:"center", border:`1px solid ${cor}33` }}>
                  <p style={{ margin:0, fontSize:15, fontWeight:900, color:cor }}>{i.v}</p>
                  <p style={{ margin:"3px 0 0", fontSize:10, color:T.text3 }}>{i.l}</p>
                </div>
              ))}
            </div>
            <p style={{ margin:"0 0 10px", color:T.text2, fontSize:13, lineHeight:1.6 }}>{exSel.desc}</p>
            <div style={{ background:T.bg2, borderRadius:12, padding:12, marginBottom:12 }}>
              <p style={{ margin:"0 0 8px", fontSize:13, fontWeight:700, color:T.text }}>📋 Execução</p>
              {exSel.passos.map((p,i)=>(
                <div key={i} style={{ display:"flex", gap:8, marginBottom:6 }}>
                  <span style={{ width:20, height:20, borderRadius:50, background:cor+"22", color:cor, fontSize:10, fontWeight:900, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{i+1}</span>
                  <p style={{ margin:0, color:T.text2, fontSize:12, lineHeight:1.5 }}>{p}</p>
                </div>
              ))}
            </div>
            {exSel.erros?.length > 0 && (
              <div style={{ background:"#E31B1B11", borderRadius:10, padding:10, marginBottom:10, border:`1px solid ${T.red}22` }}>
                <p style={{ margin:"0 0 6px", fontSize:12, fontWeight:700, color:T.red }}>❌ Erros comuns</p>
                {exSel.erros.map((e,i)=><p key={i} style={{ margin:"0 0 3px", color:T.text3, fontSize:12 }}>• {e}</p>)}
              </div>
            )}
            {exSel.cuidados?.length > 0 && (
              <div style={{ background:T.yellowDim, borderRadius:10, padding:10, marginBottom:14, border:`1px solid ${T.yellow}22` }}>
                <p style={{ margin:"0 0 6px", fontSize:12, fontWeight:700, color:T.yellow }}>⚠️ Cuidados de postura</p>
                {exSel.cuidados.map((c,i)=><p key={i} style={{ margin:"0 0 3px", color:T.text2, fontSize:12 }}>• {c}</p>)}
              </div>
            )}
            <Btn onClick={()=>setEditando({ series:exSel.series, reps:exSel.reps, descanso:exSel.descanso, obs:"", video:"" })} style={{ width:"100%", color:T.bg }}>
              <Ic n="plus" size={16} color={T.bg}/>Adicionar ao treino do aluno
            </Btn>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position:"fixed", inset:0, background:"#000D", zIndex:250, display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
      <div style={{ background:T.card, borderRadius:"20px 20px 0 0", width:"100%", maxWidth:430, maxHeight:"94vh", overflowY:"auto" }}>
        <div style={{ padding:"18px 20px 12px", borderBottom:`1px solid ${T.border}`, position:"sticky", top:0, background:T.card, zIndex:2 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <span style={{ fontSize:16, fontWeight:800, color:T.text }}>📚 Biblioteca de Exercícios</span>
            <button onClick={onClose} style={{ background:T.card2, border:"none", borderRadius:50, width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}><Ic n="x" size={16} color={T.text3}/></button>
          </div>
          {/* Search */}
          <div style={{ position:"relative", marginBottom:10 }}>
            <div style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)" }}><Ic n="search" size={15} color={T.text3}/></div>
            <input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Buscar exercício ou músculo..." style={{ width:"100%", background:T.bg2, border:`1px solid ${busca?T.yellow:T.border}`, borderRadius:10, padding:"10px 12px 10px 38px", color:T.text, fontSize:13, outline:"none", boxSizing:"border-box" }}/>
          </div>
          {/* Group filter */}
          <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:4 }}>
            {grupos.map(g=>(
              <button key={g} onClick={()=>setGrupoFiltro(g)} style={{ flexShrink:0, background:grupoFiltro===g?(GRUPOS_CORES[g]||T.yellow)+"22":"transparent", border:`1px solid ${grupoFiltro===g?(GRUPOS_CORES[g]||T.yellow):T.border}`, borderRadius:20, padding:"5px 12px", color:grupoFiltro===g?(GRUPOS_CORES[g]||T.yellow):T.text3, fontSize:11, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>
                {g==="Todos"?"Todos":GRUPOS_EMOJI[g]+" "+g}
              </button>
            ))}
          </div>
        </div>
        <div style={{ padding:"12px 16px 40px" }}>
          <p style={{ color:T.text3, fontSize:12, marginBottom:12 }}>{filtrados.length} exercícios encontrados</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {filtrados.map(ex=>{
              const cor = GRUPOS_CORES[ex.grupo] || T.yellow;
              return (
                <div key={ex.id} onClick={()=>setExSel(ex)} style={{ background:T.card2, borderRadius:14, overflow:"hidden", border:`1px solid ${T.border}`, cursor:"pointer" }}>
                  <div style={{ position:"relative" }}>
                    <div style={{height:110,overflow:"hidden",background:T.bg2}}><ExImg nome={ex.nome} musculo={ex.grupo} style={{width:"100%",height:110,objectFit:"cover"}}/></div>
                    <div style={{ position:"absolute", top:6, left:6 }}><YBadge text={ex.grupo} color={cor}/></div>
                  </div>
                  <div style={{ padding:"10px 10px 12px" }}>
                    <p style={{ margin:"0 0 3px", fontSize:13, fontWeight:800, color:T.text, lineHeight:1.3 }}>{ex.nome}</p>
                    <p style={{ margin:"0 0 8px", color:T.text3, fontSize:11 }}>{ex.principais[0]}</p>
                    <div style={{ display:"flex", gap:6 }}>
                      <span style={{ background:cor+"22", color:cor, borderRadius:6, padding:"3px 7px", fontSize:10, fontWeight:700 }}>{ex.series}s</span>
                      <span style={{ background:T.bg, color:T.text3, borderRadius:6, padding:"3px 7px", fontSize:10 }}>{ex.reps}r</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── INITIAL DATA ─────────────────────────────────────────────────────────────
const REFEICOES_DEFAULT = ["Café da manhã","Lanche da manhã","Almoço","Lanche da tarde","Jantar","Ceia"];
const initAlunos = [
  {
    id:"43657979808",
    nome:"Evelyn",
    cpf:"43657979808",
    senha:"43657979808",
    telefone:"",
    email:"",
    nascimento:"",
    objetivo:"Definição",
    obs:"",
    status:"Ativo",
    plano:"Premium",
    since:"Jun 2026",
    treinos: {
      "Treino A": [
        { id:1, nome:"Agachamento Livre", series:"4", reps:"12", descanso:"60s", obs:"Core ativado", img:"", video:"", musculo:"Pernas" },
        { id:2, nome:"Leg Press", series:"4", reps:"15", descanso:"60s", obs:"Não trave o joelho", img:"", video:"", musculo:"Pernas" },
        { id:3, nome:"Supino Reto", series:"4", reps:"10", descanso:"90s", obs:"Costas no banco", img:"", video:"", musculo:"Peito" },
      ],
      "Treino B": [
        { id:4, nome:"Puxada Frente", series:"3", reps:"12", descanso:"60s", obs:"Puxe até o queixo", img:"", video:"", musculo:"Costas" },
        { id:5, nome:"Rosca Direta", series:"3", reps:"15", descanso:"45s", obs:"Cotovelhos fixos", img:"", video:"", musculo:"Bíceps" },
        { id:6, nome:"Prancha", series:"3", reps:"45s", descanso:"30s", obs:"Corpo reto", img:"", video:"", musculo:"Abdômen" },
      ]
    },
    cardapio: {
      "Café da manhã": { horario:"07:00", alimentos:[ { id:1, nome:"Ovos mexidos", qtd:"3 unidades", kcal:"210", obs:"" }, { id:2, nome:"Pão integral", qtd:"2 fatias", kcal:"140", obs:"" } ], obs:"", img:"", video:"" },
      "Almoço": { horario:"12:00", alimentos:[ { id:3, nome:"Frango grelhado", qtd:"200g", kcal:"330", obs:"Sem sal extra" }, { id:4, nome:"Arroz integral", qtd:"4 colheres", kcal:"240", obs:"" }, { id:5, nome:"Salada verde", qtd:"À vontade", kcal:"30", obs:"" } ], obs:"Refeição principal", img:"", video:"" },
      "Jantar": { horario:"20:00", alimentos:[ { id:6, nome:"Omelete", qtd:"3 ovos", kcal:"280", obs:"" } ], obs:"", img:"", video:"" },
    }
  }
];

// ─── LOGIN ────────────────────────────────────────────────────────────────────
const LoginScreen = ({ onLogin, setAuthAdmin }) => {
  const [login,setLogin]=useState("");
  const [senha,setSenha]=useState("");
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);

  const ADMIN_SENHA = "admin@123"; // senha local do admin

  const handle = async () => {
    if(!login.trim()||!senha.trim()){setErr("Preencha login e senha.");return;}
    setLoading(true); setErr("");

    // ── Login admin local (sem Firebase Auth) ──────────────────────────────
    if(login.trim()==="admin"){
      if(senha === ADMIN_SENHA){
        // Seta auth direto no estado — bypassa Firebase Auth
        setAuthAdmin();
      } else {
        setErr("Senha do admin incorreta.");
      }
      setLoading(false);
      return;
    }

    // ── Login aluno via Firebase Auth ──────────────────────────────────────
    try {
      const cpf = login.replace(/\D/g,"");
      await signInWithEmailAndPassword(fbAuth,`${cpf}@imperio.app`,senha);
      // onAuthStateChanged cuida do resto
    } catch(e) {
      const msgs = {
        "auth/invalid-credential":"CPF ou senha incorretos.",
        "auth/user-not-found":"Aluno não cadastrado.",
        "auth/wrong-password":"Senha incorreta.",
        "auth/too-many-requests":"Muitas tentativas. Aguarde alguns minutos.",
      };
      setErr(msgs[e.code]||"Erro ao entrar. Verifique os dados.");
    }
    setLoading(false);
  };

  return (
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,#0A0A0A,#1A1500)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{width:"100%",maxWidth:380}}>
        <div style={{textAlign:"center",marginBottom:40}}>
          <div style={{width:80,height:80,borderRadius:24,background:T.gold,margin:"0 auto 16px",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 8px 40px ${T.yellow}55`,fontSize:36}}>💪</div>
          <h1 style={{fontSize:32,fontWeight:900,color:T.text,margin:0,letterSpacing:-1}}>IM<span style={{color:T.yellow}}>PÉRIO</span></h1>
          <p style={{color:T.text3,fontSize:13,margin:"6px 0 0"}}>Academia — Plataforma Oficial</p>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Inp label="CPF / LOGIN ADMIN" value={login} onChange={v=>{setLogin(v);setErr("");}} placeholder="Digite seu CPF ou 'admin'"/>
          <Inp label="SENHA" type="password" value={senha} onChange={v=>{setSenha(v);setErr("");}} placeholder="••••••••"/>
          {err&&<div style={{background:T.redDim,border:`1px solid ${T.red}44`,borderRadius:10,padding:"10px 14px",color:"#FF6666",fontSize:13,display:"flex",gap:8,alignItems:"center"}}><Ic n="info" size={16} color={T.red}/>{err}</div>}
          <button onClick={handle} disabled={loading} style={{background:loading?"#333":T.gold,color:T.bg,border:"none",borderRadius:12,padding:16,fontSize:15,fontWeight:900,cursor:loading?"not-allowed":"pointer",boxShadow:`0 4px 24px ${T.yellow}44`,marginTop:4,opacity:loading?0.7:1}}>
            {loading?"Entrando...":"ENTRAR"}
          </button>
        </div>
        <p style={{textAlign:"center",color:T.text3,fontSize:12,marginTop:20}}>Admin: admin + sua senha · Aluno: CPF + senha CPF</p>
      </div>
    </div>
  );
};

// ─── ADMIN: ALUNO DETALHE ─────────────────────────────────────────────────────
const AlunoDetalhe = ({ aluno, onBack, onSave, onDelete }) => {
  const [tab,setTab]=useState("info");
  const [dados,setDados]=useState({...aluno});
  const [treinos,setTreinos]=useState(aluno.treinos||{});
  const [cardapio,setCardapio]=useState(aluno.cardapio||{});
  const [treinoAtivo,setTreinoAtivo]=useState(Object.keys(aluno.treinos||{})[0]||"Treino A");
  const [showConfirm,setShowConfirm]=useState(false);
  const [saved,setSaved]=useState(false);
  // Treino state
  const [editEx,setEditEx]=useState(null);
  const [showBiblioteca,setShowBiblioteca]=useState(false);
  const [newFicha,setNewFicha]=useState("");
  const [showAddFicha,setShowAddFicha]=useState(false);
  // Cardapio state
  const [refSel,setRefSel]=useState(null);
  const [editAlim,setEditAlim]=useState(null);

  const salvarTudo = () => {
    onSave({ ...dados, treinos, cardapio });
    setSaved(true); setTimeout(()=>setSaved(false),2000);
  };

  // ── helpers treino
  const exList = treinos[treinoAtivo]||[];
  const addFicha = () => {
    if(!newFicha.trim()) return;
    setTreinos(p=>({...p,[newFicha]:[]}));
    setTreinoAtivo(newFicha); setNewFicha(""); setShowAddFicha(false);
  };
  const deleteFicha = (f) => {
    const t={...treinos}; delete t[f];
    setTreinos(t); setTreinoAtivo(Object.keys(t)[0]||"");
  };
  const saveEx = (ex) => {
    setTreinos(p=>{
      const list=[...(p[treinoAtivo]||[])];
      const idx=list.findIndex(e=>e.id===ex.id);
      if(idx>=0) list[idx]=ex; else list.push({...ex,id:Date.now()});
      return {...p,[treinoAtivo]:list};
    });
    setEditEx(null);
  };
  const deleteEx = (id) => setTreinos(p=>({...p,[treinoAtivo]:(p[treinoAtivo]||[]).filter(e=>e.id!==id)}));

  // ── helpers cardapio
  const refeicoes = REFEICOES_DEFAULT;
  const getRef = (r) => cardapio[r]||{horario:"",alimentos:[],obs:"",img:"",video:""};
  const saveRef = (r,data) => setCardapio(p=>({...p,[r]:data}));
  const addAlim = (ref,alim) => {
    const r=getRef(ref);
    saveRef(ref,{...r,alimentos:[...(r.alimentos||[]),{...alim,id:Date.now()}]});
    setEditAlim(null);
  };
  const removeAlim = (ref,id) => {
    const r=getRef(ref);
    saveRef(ref,{...r,alimentos:(r.alimentos||[]).filter(a=>a.id!==id)});
  };

  const TABS=[
    {id:"info",l:"📋 Dados"},
    {id:"treinos",l:"🏋️ Treinos"},
    {id:"cardapio",l:"🥗 Cardápio"},
    {id:"evolucao",l:"📈 Evolução"},
  ];

  return (
    <div style={{ minHeight:"100vh", background:T.bg, fontFamily:"system-ui,sans-serif" }}>
      {showConfirm && <Confirm msg={`Excluir aluno ${aluno.nome}?`} onYes={()=>{ onDelete(aluno.id); }} onNo={()=>setShowConfirm(false)}/>}
      {editEx && (
        <Modal title={editEx.id?"Editar exercício":"Novo exercício"} onClose={()=>setEditEx(null)}>
          <ExForm ex={editEx} onSave={saveEx} onCancel={()=>setEditEx(null)}/>
        </Modal>
      )}
      {refSel && (
        <Modal title={refSel} onClose={()=>setRefSel(null)}>
          <RefForm ref_name={refSel} data={getRef(refSel)} onSave={(d)=>{ saveRef(refSel,d); setRefSel(null); }} onAddAlim={(a)=>addAlim(refSel,a)} onRemoveAlim={(id)=>removeAlim(refSel,id)}/>
        </Modal>
      )}

      {/* Header */}
      <div style={{ background:`linear-gradient(135deg,#1A1500,#0D0D00)`, padding:"16px 16px 0", borderBottom:`1px solid ${T.yellow}33`, position:"sticky", top:0, zIndex:50 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:6, color:T.text3, fontSize:14 }}><Ic n="back" size={18} color={T.text3}/> Alunos</button>
          <div style={{ display:"flex", gap:8 }}>
            <Btn small onClick={()=>setShowConfirm(true)} danger><Ic n="trash" size={13} color={T.text}/>Excluir</Btn>
            <Btn small onClick={salvarTudo} color={T.green} style={{ color:T.text }}>{saved?"✓ Salvo!":"💾 Salvar"}</Btn>
          </div>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:12 }}>
          <div style={{ width:44, height:44, borderRadius:50, background:T.gold, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>👤</div>
          <div><p style={{ margin:0, fontSize:17, fontWeight:900, color:T.text }}>{dados.nome}</p><p style={{ margin:0, fontSize:12, color:T.text3 }}>CPF: {dados.cpf}</p></div>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{ flex:1, background:tab===t.id?T.gold:"transparent", border:`1px solid ${tab===t.id?T.yellow:T.border}`, borderRadius:"10px 10px 0 0", padding:"8px 4px", color:tab===t.id?T.bg:T.text3, fontSize:12, fontWeight:700, cursor:"pointer" }}>{t.l}</button>
          ))}
        </div>
      </div>

      <div style={{ padding:"16px 16px 100px" }}>
        {/* ── ABA DADOS ── */}
        {tab==="info" && (
          <div>
            <Sec title="Dados pessoais">
              <Inp label="NOME COMPLETO" value={dados.nome} onChange={v=>setDados(p=>({...p,nome:v}))}/>
              <Inp label="CPF" value={dados.cpf} onChange={v=>setDados(p=>({...p,cpf:v}))}/>
              <Inp label="SENHA DE ACESSO" value={dados.senha} onChange={v=>setDados(p=>({...p,senha:v}))}/>
              <Inp label="TELEFONE" value={dados.telefone||""} onChange={v=>setDados(p=>({...p,telefone:v}))} placeholder="(11) 9 0000-0000"/>
              <Inp label="E-MAIL" value={dados.email||""} onChange={v=>setDados(p=>({...p,email:v}))} placeholder="email@exemplo.com"/>
              <Inp label="DATA DE NASCIMENTO" type="date" value={dados.nascimento||""} onChange={v=>setDados(p=>({...p,nascimento:v}))}/>
            </Sec>
            <Sec title="Academia">
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
                {[{l:"Plano",k:"plano",opts:["Basic","Premium"]},{l:"Status",k:"status",opts:["Ativo","Pendente","Bloqueado"]}].map(f=>(
                  <div key={f.k}>
                    <label style={{ fontSize:11, color:T.text3, fontWeight:700, letterSpacing:0.8, display:"block", marginBottom:5 }}>{f.l.toUpperCase()}</label>
                    <select value={dados[f.k]||""} onChange={e=>setDados(p=>({...p,[f.k]:e.target.value}))} style={{ width:"100%", background:T.card2, border:`1px solid ${T.border}`, borderRadius:10, padding:"12px 10px", color:T.text, fontSize:14, outline:"none" }}>
                      {f.opts.map(o=><option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <Inp label="OBJETIVO" value={dados.objetivo||""} onChange={v=>setDados(p=>({...p,objetivo:v}))} placeholder="Ex: Emagrecimento, Hipertrofia..."/>
            </Sec>
            <Sec title="Histórico / Observações">
              <Textarea value={dados.obs||""} onChange={v=>setDados(p=>({...p,obs:v}))} placeholder="Lesões, histórico médico, observações..." rows={4}/>
            </Sec>
          </div>
        )}

        {/* ── ABA TREINOS ── */}
        {tab==="treinos" && (
          <div>
            {showBiblioteca && <BibliotecaModal onAdd={(ex)=>{ saveEx(ex); setShowBiblioteca(false); }} onClose={()=>setShowBiblioteca(false)}/>}
            {/* Fichas */}
            <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:8, marginBottom:16 }}>
              {Object.keys(treinos).map(f=>(
                <div key={f} style={{ display:"flex", flexShrink:0 }}>
                  <button onClick={()=>setTreinoAtivo(f)} style={{ background:treinoAtivo===f?T.gold:"transparent", border:`1px solid ${treinoAtivo===f?T.yellow:T.border}`, borderRadius:10, padding:"8px 14px", color:treinoAtivo===f?T.bg:T.text3, fontSize:13, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>{f}</button>
                  {Object.keys(treinos).length>1 && <button onClick={()=>deleteFicha(f)} style={{ background:"transparent", border:"none", color:T.text3, cursor:"pointer", padding:"0 4px", fontSize:16 }}>×</button>}
                </div>
              ))}
              {showAddFicha ? (
                <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                  <input value={newFicha} onChange={e=>setNewFicha(e.target.value)} placeholder="Ex: Treino C" style={{ background:T.card2, border:`1px solid ${T.yellow}`, borderRadius:10, padding:"8px 12px", color:T.text, fontSize:13, outline:"none", width:120 }}/>
                  <button onClick={addFicha} style={{ background:T.gold, border:"none", borderRadius:10, padding:"8px 12px", color:T.bg, fontWeight:700, cursor:"pointer", fontSize:13 }}>+</button>
                  <button onClick={()=>setShowAddFicha(false)} style={{ background:"transparent", border:"none", color:T.text3, cursor:"pointer" }}>×</button>
                </div>
              ) : (
                <button onClick={()=>setShowAddFicha(true)} style={{ background:"transparent", border:`1px dashed ${T.border}`, borderRadius:10, padding:"8px 14px", color:T.text3, fontSize:13, cursor:"pointer", whiteSpace:"nowrap", flexShrink:0 }}>+ Nova ficha</button>
              )}
            </div>

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <span style={{ fontSize:15, fontWeight:800, color:T.text }}>{treinoAtivo} <span style={{ color:T.text3, fontWeight:400, fontSize:13 }}>({exList.length} exercícios)</span></span>
              <div style={{ display:"flex", gap:8 }}>
                <Btn small onClick={()=>setShowBiblioteca(true)} style={{ color:T.bg }}><Ic n="search" size={13} color={T.bg}/>Biblioteca</Btn>
                <Btn small onClick={()=>setEditEx({id:0,nome:"",series:"3",reps:"12",descanso:"60s",obs:"",img:"",video:"",musculo:""})} outline><Ic n="plus" size={13} color={T.yellow}/>Manual</Btn>
              </div>
            </div>

            {exList.length===0 ? (
              <div style={{ textAlign:"center", padding:"40px 0", color:T.text3 }}>
                <p style={{ fontSize:32, marginBottom:12 }}>🏋️</p>
                <p>Nenhum exercício nesta ficha. Clique em Adicionar.</p>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {exList.map(ex=>(
                  <div key={ex.id} style={{ background:T.card, borderRadius:14, border:`1px solid ${T.border}`, overflow:"hidden", display:"flex" }}>
                    <div style={{ width:72, flexShrink:0 }}><ExImg nome={ex.nome} musculo={ex.musculo} imgUrl={ex.img_url} style={{width:72,height:72}}/></div>
                    <div style={{ flex:1, padding:"10px 12px" }}>
                      <p style={{ margin:"0 0 3px", fontSize:14, fontWeight:700, color:T.text }}>{ex.nome}</p>
                      <p style={{ margin:0, color:T.text3, fontSize:12 }}>{ex.series}x{ex.reps} · Descanso {ex.descanso}</p>
                      {ex.obs && <p style={{ margin:"3px 0 0", color:T.text3, fontSize:11, fontStyle:"italic" }}>{ex.obs}</p>}
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", justifyContent:"center", gap:6, padding:"8px 10px", flexShrink:0 }}>
                      <button onClick={()=>setEditEx({...ex})} style={{ background:T.yellowDim, border:"none", borderRadius:8, width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}><Ic n="edit" size={13} color={T.yellow}/></button>
                      <button onClick={()=>deleteEx(ex.id)} style={{ background:T.redDim, border:"none", borderRadius:8, width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}><Ic n="trash" size={13} color={T.red}/></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ABA CARDÁPIO ── */}
        {tab==="cardapio" && (
          <div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {refeicoes.map((ref,i)=>{
                const r=getRef(ref);
                const kcal=(r.alimentos||[]).reduce((a,it)=>a+(parseFloat(it.kcal)||0),0);
                return (
                  <div key={ref} onClick={()=>setRefSel(ref)} style={{ background:T.card, borderRadius:14, border:`1px solid ${(r.alimentos||[]).length>0?T.green+"44":T.border}`, padding:"13px 16px", cursor:"pointer", display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width:38, height:38, borderRadius:10, background:(r.alimentos||[]).length>0?T.greenDim:T.yellowDim, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>
                      {["☀️","🍎","🍽️","🥝","🌙","⭐"][i]}
                    </div>
                    <div style={{ flex:1 }}>
                      <p style={{ margin:0, fontSize:14, fontWeight:700, color:T.text }}>{ref}</p>
                      <p style={{ margin:"3px 0 0", color:T.text3, fontSize:12 }}>
                        {r.horario && <span>{r.horario} · </span>}
                        {(r.alimentos||[]).length>0 ? `${(r.alimentos||[]).length} alimentos · ${kcal>0?kcal+" kcal":""}` : "Sem alimentos"}
                      </p>
                    </div>
                    <Ic n="edit" size={16} color={T.text3}/>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ABA EVOLUÇÃO (somente admin) ── */}
        {tab==="evolucao" && (
          <EvolucaoAdmin alunoId={aluno.id} alunoNome={aluno.nome}/>
        )}
      </div>
    </div>
  );
};

// ─── EXERCISE FORM ────────────────────────────────────────────────────────────
const ExForm = ({ ex, onSave, onCancel }) => {
  const [f,setF]=useState({...ex});
  const imgRef=useRef();
  const handleImg=(e)=>{
    const file=e.target.files[0]; if(!file) return;
    const reader=new FileReader();
    reader.onload=(ev)=>setF(p=>({...p,img:ev.target.result}));
    reader.readAsDataURL(file);
  };
  return (
    <div>
      <Inp label="NOME DO EXERCÍCIO" value={f.nome} onChange={v=>setF(p=>({...p,nome:v}))} placeholder="Ex: Agachamento Livre"/>
      <Inp label="MÚSCULO" value={f.musculo||""} onChange={v=>setF(p=>({...p,musculo:v}))} placeholder="Ex: Pernas, Peito..."/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:12 }}>
        <Inp label="SÉRIES" value={f.series} onChange={v=>setF(p=>({...p,series:v}))} placeholder="4"/>
        <Inp label="REPS" value={f.reps} onChange={v=>setF(p=>({...p,reps:v}))} placeholder="12"/>
        <Inp label="DESCANSO" value={f.descanso} onChange={v=>setF(p=>({...p,descanso:v}))} placeholder="60s"/>
      </div>
      <Textarea label="OBSERVAÇÕES" value={f.obs||""} onChange={v=>setF(p=>({...p,obs:v}))} placeholder="Cuidados, forma de execução..." rows={2}/>
      <Inp label="LINK DO VÍDEO (YouTube/Vimeo)" value={f.video||""} onChange={v=>setF(p=>({...p,video:v}))} placeholder="https://youtube.com/..."/>
      <div style={{ marginBottom:12 }}>
        <label style={{ fontSize:11, color:T.text3, fontWeight:700, letterSpacing:0.8, display:"block", marginBottom:5 }}>IMAGEM ILUSTRATIVA</label>
        {f.img && <img src={f.img} alt="" style={{ width:"100%", borderRadius:10, marginBottom:8, maxHeight:120, objectFit:"cover" }}/>}
        <input type="file" accept="image/*" ref={imgRef} style={{ display:"none" }} onChange={handleImg}/>
        <button onClick={()=>imgRef.current.click()} style={{ background:T.card2, border:`1px dashed ${T.border}`, borderRadius:10, padding:"10px 16px", color:T.text3, fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", gap:8, width:"100%" }}>
          <Ic n="upload" size={16} color={T.text3}/>{f.img?"Trocar imagem":"Upload de imagem"}
        </button>
      </div>
      <div style={{ display:"flex", gap:10, marginTop:16 }}>
        <Btn onClick={onCancel} outline style={{ flex:1 }}>Cancelar</Btn>
        <Btn onClick={()=>onSave(f)} style={{ flex:2, color:T.bg }}>💾 Salvar exercício</Btn>
      </div>
    </div>
  );
};

// ─── REFEICAO FORM ────────────────────────────────────────────────────────────
const RefForm = ({ ref_name, data, onSave, onAddAlim, onRemoveAlim }) => {
  const [local,setLocal]=useState({...data,alimentos:[...(data.alimentos||[])]});
  const [newAlim,setNewAlim]=useState({nome:"",qtd:"",kcal:"",obs:""});
  const imgRef=useRef();
  const handleImg=(e)=>{
    const file=e.target.files[0]; if(!file) return;
    const reader=new FileReader();
    reader.onload=(ev)=>setLocal(p=>({...p,img:ev.target.result}));
    reader.readAsDataURL(file);
  };
  const addAlim=()=>{
    if(!newAlim.nome.trim()) return;
    const item={...newAlim,id:Date.now()};
    setLocal(p=>({...p,alimentos:[...p.alimentos,item]}));
    setNewAlim({nome:"",qtd:"",kcal:"",obs:""});
  };
  const removeAlimLocal=(id)=>setLocal(p=>({...p,alimentos:p.alimentos.filter(a=>a.id!==id)}));
  return (
    <div>
      <Inp label="HORÁRIO" value={local.horario||""} onChange={v=>setLocal(p=>({...p,horario:v}))} placeholder="Ex: 07:30" type="time"/>
      <Textarea label="OBSERVAÇÕES DA REFEIÇÃO" value={local.obs||""} onChange={v=>setLocal(p=>({...p,obs:v}))} placeholder="Ex: Refeição pré-treino..." rows={2}/>

      {/* Alimentos */}
      <Sec title={`Alimentos (${local.alimentos.length})`} style={{ marginTop:8 }}>
        {local.alimentos.map(a=>(
          <div key={a.id} style={{ background:T.card2, borderRadius:10, padding:"10px 12px", marginBottom:8, display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ flex:1 }}>
              <p style={{ margin:0, fontSize:14, fontWeight:700, color:T.text }}>{a.nome}</p>
              <div style={{ display:"flex", gap:10 }}>
                {a.qtd && <span style={{ color:T.text3, fontSize:12 }}>📏 {a.qtd}</span>}
                {a.kcal && <span style={{ color:T.yellow, fontSize:12, fontWeight:700 }}>🔥 {a.kcal} kcal</span>}
              </div>
              {a.obs && <p style={{ margin:"3px 0 0", color:T.text3, fontSize:11 }}>{a.obs}</p>}
            </div>
            <button onClick={()=>removeAlimLocal(a.id)} style={{ background:T.redDim, border:"none", borderRadius:8, width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
              <Ic n="trash" size={12} color={T.red}/>
            </button>
          </div>
        ))}
        {/* Add alimento */}
        <Card style={{ padding:12, border:`1px dashed ${T.border}` }}>
          <Inp label="ALIMENTO" value={newAlim.nome} onChange={v=>setNewAlim(p=>({...p,nome:v}))} placeholder="Ex: Frango grelhado"/>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <Inp label="QUANTIDADE" value={newAlim.qtd} onChange={v=>setNewAlim(p=>({...p,qtd:v}))} placeholder="Ex: 200g"/>
            <Inp label="CALORIAS (kcal)" value={newAlim.kcal} onChange={v=>setNewAlim(p=>({...p,kcal:v}))} placeholder="Ex: 300"/>
          </div>
          <Inp label="OBSERVAÇÃO" value={newAlim.obs} onChange={v=>setNewAlim(p=>({...p,obs:v}))} placeholder="Ex: sem sal"/>
          <Btn onClick={addAlim} style={{ width:"100%", color:T.bg, marginTop:4 }}><Ic n="plus" size={14} color={T.bg}/>Adicionar alimento</Btn>
        </Card>
      </Sec>

      {/* Imagem opcional */}
      <div style={{ marginBottom:12 }}>
        <label style={{ fontSize:11, color:T.text3, fontWeight:700, letterSpacing:0.8, display:"block", marginBottom:5 }}>IMAGEM OPCIONAL</label>
        {local.img && <img src={local.img} alt="" style={{ width:"100%", borderRadius:10, marginBottom:8, maxHeight:120, objectFit:"cover" }}/>}
        <input type="file" accept="image/*" ref={imgRef} style={{ display:"none" }} onChange={handleImg}/>
        <button onClick={()=>imgRef.current.click()} style={{ background:T.card2, border:`1px dashed ${T.border}`, borderRadius:10, padding:"10px 16px", color:T.text3, fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", gap:8, width:"100%" }}>
          <Ic n="image" size={16} color={T.text3}/>{local.img?"Trocar imagem":"Upload de imagem"}
        </button>
      </div>
      <Inp label="VÍDEO EXPLICATIVO (link)" value={local.video||""} onChange={v=>setLocal(p=>({...p,video:v}))} placeholder="https://youtube.com/..."/>

      <Btn onClick={()=>onSave(local)} style={{ width:"100%", color:T.bg, marginTop:8 }}>💾 Salvar refeição</Btn>
    </div>
  );
};

// ─── EVOLUÇÃO ADMIN (Firebase Storage) ────────────────────────────────────────
const EvolucaoAdmin = ({ alunoId, alunoNome }) => {
  const [fotos, setFotos] = useState([]);          // [{url, path, data, obs}]
  const [avaliacoes, setAvaliacoes] = useState([]); // [{data, peso, bf, obs}]
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showAvForm, setShowAvForm] = useState(false);
  const [newAv, setNewAv] = useState({ data: new Date().toISOString().split("T")[0], peso:"", bf:"", cintura:"", quadril:"", braco:"", obs:"" });
  const [msg, setMsg] = useState("");
  const [delConfirm, setDelConfirm] = useState(null);
  const fotoInputRef = useRef();

  // Carrega dados do Firestore
  const carregarDados = async () => {
    setLoading(true);
    try {
      const snap = await getDoc(doc(db, "alunos", alunoId));
      if (snap.exists()) {
        const d = snap.data();
        setFotos(d.fotos_evolucao || []);
        setAvaliacoes(d.avaliacoes || []);
      }
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { carregarDados(); }, [alunoId]);

  // Upload de foto para Firebase Storage
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true); setMsg("");
    try {
      const timestamp = Date.now();
      const path = `evolucao/${alunoId}/${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g,"_")}`;
      const ref = storageRef(storage, path);
      await uploadBytes(ref, file);
      const url = await getDownloadURL(ref);
      const novaFoto = {
        url, path,
        data: new Date().toLocaleDateString("pt-BR"),
        obs: "",
        timestamp,
      };
      const novaLista = [...fotos, novaFoto];
      await updateDoc(doc(db, "alunos", alunoId), { fotos_evolucao: novaLista });
      setFotos(novaLista);
      setMsg("✅ Foto adicionada!");
      setTimeout(() => setMsg(""), 2500);
    } catch(e) {
      setMsg("❌ Erro ao enviar: " + e.message);
    }
    setUploading(false);
    e.target.value = "";
  };

  // Deletar foto do Storage + Firestore
  const deletarFoto = async (foto) => {
    try {
      await deleteObject(storageRef(storage, foto.path));
    } catch(e) { /* já deletado */ }
    const novaLista = fotos.filter(f => f.path !== foto.path);
    await updateDoc(doc(db, "alunos", alunoId), { fotos_evolucao: novaLista });
    setFotos(novaLista);
    setDelConfirm(null);
  };

  // Salvar avaliação no Firestore
  const salvarAvaliacao = async () => {
    if (!newAv.data) return;
    const av = { ...newAv, realizadoPor: "Admin", id: Date.now() };
    const novaLista = [...avaliacoes, av].sort((a,b) => a.data > b.data ? 1 : -1);
    await updateDoc(doc(db, "alunos", alunoId), { avaliacoes: novaLista });
    setAvaliacoes(novaLista);
    setNewAv({ data: new Date().toISOString().split("T")[0], peso:"", bf:"", cintura:"", quadril:"", braco:"", obs:"" });
    setShowAvForm(false);
    setMsg("✅ Avaliação salva!");
    setTimeout(() => setMsg(""), 2500);
  };

  const deletarAvaliacao = async (id) => {
    const novaLista = avaliacoes.filter(a => a.id !== id);
    await updateDoc(doc(db, "alunos", alunoId), { avaliacoes: novaLista });
    setAvaliacoes(novaLista);
  };

  if (loading) return <div style={{ textAlign:"center", padding:40, color:T.text3 }}>Carregando...</div>;

  return (
    <div>
      {delConfirm && <Confirm msg="Excluir esta foto?" onYes={() => deletarFoto(delConfirm)} onNo={() => setDelConfirm(null)}/>}
      {msg && <div style={{ background: msg.startsWith("✅") ? T.greenDim : T.redDim, border:`1px solid ${msg.startsWith("✅")?T.green:T.red}44`, borderRadius:10, padding:"10px 14px", marginBottom:14, color: msg.startsWith("✅") ? T.green : T.red, fontSize:13, fontWeight:700 }}>{msg}</div>}

      {/* ── FOTOS DE EVOLUÇÃO ── */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <div>
          <p style={{ margin:0, fontSize:15, fontWeight:800, color:T.text }}>📸 Fotos de evolução</p>
          <p style={{ margin:"2px 0 0", color:T.text3, fontSize:12 }}>{fotos.length} foto{fotos.length!==1?"s":""} · Adicionadas pelo professor</p>
        </div>
        <div>
          <input type="file" accept="image/*" ref={fotoInputRef} style={{ display:"none" }} onChange={handleUpload}/>
          <button onClick={() => fotoInputRef.current.click()} disabled={uploading}
            style={{ background: uploading ? "#333" : T.gold, border:"none", borderRadius:10, padding:"9px 14px", color:T.bg, fontSize:13, fontWeight:900, cursor: uploading?"not-allowed":"pointer", display:"flex", alignItems:"center", gap:6, opacity: uploading?0.7:1 }}>
            <Ic n="camera" size={15} color={T.bg}/> {uploading ? "Enviando..." : "Adicionar foto"}
          </button>
        </div>
      </div>

      {fotos.length === 0
        ? <div style={{ background:T.card2, borderRadius:16, padding:32, textAlign:"center", marginBottom:20, border:`2px dashed ${T.border}` }}>
            <p style={{ fontSize:36, margin:"0 0 8px" }}>📸</p>
            <p style={{ color:T.text3, fontSize:14, margin:0 }}>Nenhuma foto ainda</p>
            <p style={{ color:T.text3, fontSize:12, margin:"4px 0 0" }}>Adicione a primeira foto de evolução do aluno</p>
          </div>
        : <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
            {fotos.slice().reverse().map((f,i) => (
              <div key={f.path||i} style={{ background:T.card2, borderRadius:12, overflow:"hidden", border:`1px solid ${T.border}` }}>
                <div style={{ position:"relative", height:160 }}>
                  <img src={f.url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                  <button onClick={() => setDelConfirm(f)}
                    style={{ position:"absolute", top:6, right:6, background:"#000A", border:"none", borderRadius:8, width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                    <Ic n="trash" size={13} color={T.red}/>
                  </button>
                </div>
                <div style={{ padding:"8px 10px" }}>
                  <p style={{ margin:0, color:T.text3, fontSize:12, fontWeight:700 }}>{f.data}</p>
                  {f.obs && <p style={{ margin:"2px 0 0", color:T.text3, fontSize:11 }}>{f.obs}</p>}
                </div>
              </div>
            ))}
          </div>
      }

      {/* ── AVALIAÇÕES FÍSICAS ── */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <p style={{ margin:0, fontSize:15, fontWeight:800, color:T.text }}>📏 Avaliações físicas</p>
        <button onClick={() => setShowAvForm(!showAvForm)}
          style={{ background: showAvForm?"transparent":T.gold, border:`1px solid ${showAvForm?T.border:T.yellow}`, borderRadius:10, padding:"8px 14px", color: showAvForm?T.text3:T.bg, fontSize:13, fontWeight:700, cursor:"pointer" }}>
          {showAvForm ? "Cancelar" : "+ Nova avaliação"}
        </button>
      </div>

      {showAvForm && (
        <Card style={{ padding:16, marginBottom:16, border:`1px solid ${T.yellow}33` }}>
          <p style={{ margin:"0 0 12px", fontSize:14, fontWeight:700, color:T.yellow }}>Nova avaliação — {alunoNome}</p>
          <Inp label="DATA" type="date" value={newAv.data} onChange={v=>setNewAv(p=>({...p,data:v}))}/>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
            <Inp label="PESO (kg)" value={newAv.peso} onChange={v=>setNewAv(p=>({...p,peso:v}))} placeholder="Ex: 72.5"/>
            <Inp label="% GORDURA" value={newAv.bf} onChange={v=>setNewAv(p=>({...p,bf:v}))} placeholder="Ex: 18"/>
            <Inp label="CINTURA (cm)" value={newAv.cintura} onChange={v=>setNewAv(p=>({...p,cintura:v}))} placeholder="Ex: 80"/>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <Inp label="QUADRIL (cm)" value={newAv.quadril} onChange={v=>setNewAv(p=>({...p,quadril:v}))} placeholder="Ex: 96"/>
            <Inp label="BRAÇO (cm)" value={newAv.braco} onChange={v=>setNewAv(p=>({...p,braco:v}))} placeholder="Ex: 34"/>
          </div>
          <Textarea label="OBSERVAÇÕES" value={newAv.obs} onChange={v=>setNewAv(p=>({...p,obs:v}))} placeholder="Notas sobre a avaliação..." rows={2}/>
          <button onClick={salvarAvaliacao}
            style={{ width:"100%", background:T.gold, border:"none", borderRadius:12, padding:14, color:T.bg, fontSize:14, fontWeight:900, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, boxSizing:"border-box" }}>
            <Ic n="save" size={16} color={T.bg}/> Salvar avaliação
          </button>
        </Card>
      )}

      {/* Gráfico de peso */}
      {avaliacoes.filter(a=>a.peso).length > 1 && (
        <Card style={{ padding:16, marginBottom:16 }}>
          <p style={{ margin:"0 0 12px", fontSize:13, fontWeight:700, color:T.text }}>📈 Evolução do peso</p>
          <div style={{ display:"flex", alignItems:"flex-end", gap:8, height:80 }}>
            {avaliacoes.filter(a=>a.peso).slice(-8).map((av,i,arr)=>{
              const vals = arr.map(a=>parseFloat(a.peso)||0);
              const min = Math.min(...vals); const max = Math.max(...vals);
              const h = max===min ? 50 : ((parseFloat(av.peso)||0)-min)/(max-min)*60+20;
              const isLast = i===arr.length-1;
              return (
                <div key={av.id||i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                  <span style={{ fontSize:9, color:isLast?T.yellow:T.text3, fontWeight:700 }}>{av.peso}kg</span>
                  <div style={{ width:"100%", height:h, background:isLast?T.gold:`${T.yellow}44`, borderRadius:"4px 4px 0 0", transition:"height 0.4s" }}/>
                  <span style={{ fontSize:9, color:T.text3 }}>{av.data?.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Lista de avaliações */}
      {avaliacoes.length === 0
        ? <div style={{ textAlign:"center", padding:"24px 0", color:T.text3 }}>
            <p style={{ fontSize:30, margin:"0 0 6px" }}>📋</p>
            <p style={{ fontSize:13 }}>Nenhuma avaliação registrada ainda</p>
          </div>
        : avaliacoes.slice().reverse().map(av => (
            <Card key={av.id||av.data} style={{ padding:"14px 16px", marginBottom:10, borderLeft:`3px solid ${T.blue}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                <p style={{ margin:0, fontSize:14, fontWeight:700, color:T.text }}>{av.data}</p>
                <button onClick={() => deletarAvaliacao(av.id)}
                  style={{ background:T.redDim, border:"none", borderRadius:6, width:26, height:26, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                  <Ic n="trash" size={12} color={T.red}/>
                </button>
              </div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {av.peso && <span style={{ background:T.blue+"22", color:T.blue, borderRadius:20, padding:"2px 10px", fontSize:12, fontWeight:700 }}>⚖️ {av.peso}kg</span>}
                {av.bf && <span style={{ background:T.purple+"22", color:T.purple, borderRadius:20, padding:"2px 10px", fontSize:12, fontWeight:700 }}>🔥 {av.bf}% gordura</span>}
                {av.cintura && <span style={{ background:T.yellowDim, color:T.yellow, borderRadius:20, padding:"2px 10px", fontSize:12, fontWeight:700 }}>📏 C:{av.cintura}cm</span>}
                {av.quadril && <span style={{ background:T.yellowDim, color:T.yellow, borderRadius:20, padding:"2px 10px", fontSize:12, fontWeight:700 }}>Q:{av.quadril}cm</span>}
                {av.braco && <span style={{ background:T.greenDim, color:T.green, borderRadius:20, padding:"2px 10px", fontSize:12, fontWeight:700 }}>B:{av.braco}cm</span>}
              </div>
              {av.obs && <p style={{ margin:"8px 0 0", color:T.text2, fontSize:12, fontStyle:"italic" }}>{av.obs}</p>}
            </Card>
          ))
      }
    </div>
  );
};

// ─── BIBLIOTECA ADMIN ─────────────────────────────────────────────────────────
const BibliotecaAdmin = () => {
  // customExs: exercícios adicionados/editados pelo admin (salvos no Firestore)
  const [customExs, setCustomExs] = useState([]);
  const [fotoCustom, setFotoCustom] = useState({}); // { [exId]: base64 } fotos sobrescritas
  const [grupoFiltro, setGrupoFiltro] = useState("Todos");
  const [busca, setBusca] = useState("");
  const [exSel, setExSel] = useState(null);  // exercício em detalhe/edição
  const [modo, setModo] = useState(null);     // "ver" | "editar" | "novo"
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // Carrega customizações do Firestore ao montar
  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, "biblioteca_custom"));
        const exs = snap.docs.map(d => d.data());
        const fotos = {};
        exs.forEach(e => { if(e._fotoBase64) fotos[e.id] = e._fotoBase64; });
        setCustomExs(exs.filter(e => !e._deleted));
        setFotoCustom(fotos);
      } catch(e) { /* offline ou sem permissão */ }
    })();
  }, []);

  // Salva exercício no Firestore
  const salvarExercicio = async (ex) => {
    setLoading(true); setMsg("");
    try {
      const id = ex.id || "custom_" + Date.now();
      const data = { ...ex, id };
      await setDoc(doc(db, "biblioteca_custom", id), data);
      if(customExs.find(e => e.id === id)) {
        setCustomExs(p => p.map(e => e.id === id ? data : e));
      } else {
        setCustomExs(p => [...p, data]);
      }
      if(data._fotoBase64) setFotoCustom(p => ({ ...p, [id]: data._fotoBase64 }));
      setMsg("✅ Salvo com sucesso!");
      setTimeout(() => { setMsg(""); setModo(null); setExSel(null); }, 1200);
    } catch(e) {
      setMsg("❌ Erro ao salvar: " + e.message);
    }
    setLoading(false);
  };

  // Deleta exercício custom
  const deletarEx = async (id) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, "biblioteca_custom", id));
      setCustomExs(p => p.filter(e => e.id !== id));
      setFotoCustom(p => { const n={...p}; delete n[id]; return n; });
      setExSel(null); setModo(null);
    } catch(e) { setMsg("❌ Erro: " + e.message); }
    setLoading(false);
  };

  const todos = [...BIBLIOTECA, ...customExs.filter(c => !BIBLIOTECA.find(b => b.id === c.id))];
  const grupos = ["Todos", ...Object.keys(GRUPOS_CORES)];
  const filtrados = todos.filter(ex => {
    const matchG = grupoFiltro === "Todos" || ex.grupo === grupoFiltro;
    const matchB = !busca || ex.nome.toLowerCase().includes(busca.toLowerCase()) ||
      ex.grupo.toLowerCase().includes(busca.toLowerCase()) ||
      (ex.principais||[]).some(p => p.toLowerCase().includes(busca.toLowerCase()));
    return matchG && matchB;
  });

  // Modo EDITAR ou NOVO
  if (modo === "editar" || modo === "novo") {
    const base = modo === "novo"
      ? { nome:"", grupo:"Peito", principais:[], secundarios:[], desc:"", passos:[""],
          erros:[""], cuidados:[""], series:"3", reps:"12", descanso:"60s", video:"", _fotoBase64:"" }
      : { ...exSel, _fotoBase64: fotoCustom[exSel?.id] || "" };
    return (
      <ExercicioEditor
        ex={base}
        isCustom={!!customExs.find(e => e.id === exSel?.id) || modo === "novo"}
        loading={loading}
        onSave={salvarExercicio}
        onBack={() => { setModo(exSel ? "ver" : null); }}
        onDelete={customExs.find(e => e.id === exSel?.id) ? () => deletarEx(exSel.id) : null}
        msg={msg}
      />
    );
  }

  // Modo VER detalhe
  if (modo === "ver" && exSel) {
    const cor = GRUPOS_CORES[exSel.grupo] || T.yellow;
    const isCustom = !!customExs.find(e => e.id === exSel.id);
    const fotoReal = fotoCustom[exSel.id] || exSel.img_url || getExImg(exSel.nome);
    return (
      <div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <button onClick={() => { setModo(null); setExSel(null); }} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:6, color:T.text3, fontSize:14 }}>
            <Ic n="back" size={18} color={T.text3}/> Biblioteca
          </button>
          <Btn small onClick={() => setModo("editar")} style={{ color:T.bg }}>
            <Ic n="edit" size={13} color={T.bg}/> {isCustom ? "Editar" : "Personalizar"}
          </Btn>
        </div>

        {/* Foto grande */}
        <div style={{ borderRadius:18, overflow:"hidden", marginBottom:16, height:220, position:"relative", background:T.bg2 }}>
          {fotoReal
            ? <img src={fotoReal} alt={exSel.nome} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
            : <AnatomiaExercicio nome={exSel.nome} cor={cor}/>
          }
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,#0A0A0A 0%,transparent 55%)" }}/>
          <div style={{ position:"absolute", bottom:14, left:16, right:16 }}>
            <div style={{ display:"inline-block", background:cor+"22", border:`1px solid ${cor}55`, borderRadius:20, padding:"2px 12px", marginBottom:6 }}>
              <span style={{ color:cor, fontSize:11, fontWeight:700 }}>{isCustom ? "⭐ CUSTOM — " : ""}{exSel.grupo}</span>
            </div>
            <h2 style={{ margin:0, fontSize:20, fontWeight:900, color:T.text }}>{exSel.nome}</h2>
            <p style={{ margin:"4px 0 0", color:"#CCC", fontSize:12 }}>{(exSel.principais||[]).join(" · ")}</p>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:14 }}>
          {[{v:exSel.series,l:"Séries"},{v:exSel.reps,l:"Reps"},{v:exSel.descanso,l:"Descanso"}].map(i => (
            <div key={i.l} style={{ background:T.card2, borderRadius:12, padding:"12px 8px", textAlign:"center", border:`1px solid ${cor}33` }}>
              <p style={{ margin:0, fontSize:16, fontWeight:900, color:cor }}>{i.v}</p>
              <p style={{ margin:"3px 0 0", fontSize:10, color:T.text3 }}>{i.l}</p>
            </div>
          ))}
        </div>

        {exSel.desc && <Card style={{ padding:14, marginBottom:10 }}>
          <p style={{ margin:"0 0 6px", fontSize:12, fontWeight:700, color:T.text3, letterSpacing:.8 }}>DESCRIÇÃO</p>
          <p style={{ margin:0, color:T.text2, fontSize:13, lineHeight:1.6 }}>{exSel.desc}</p>
        </Card>}

        {exSel.passos?.filter(Boolean).length > 0 && <Card style={{ padding:14, marginBottom:10 }}>
          <p style={{ margin:"0 0 10px", fontSize:12, fontWeight:700, color:T.text3, letterSpacing:.8 }}>📋 EXECUÇÃO</p>
          {exSel.passos.filter(Boolean).map((p,i) => (
            <div key={i} style={{ display:"flex", gap:10, marginBottom:8 }}>
              <span style={{ width:22, height:22, borderRadius:50, background:cor+"22", color:cor, fontSize:10, fontWeight:900, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{i+1}</span>
              <p style={{ margin:0, color:T.text2, fontSize:13, lineHeight:1.5 }}>{p}</p>
            </div>
          ))}
        </Card>}

        {exSel.erros?.filter(Boolean).length > 0 && <Card style={{ padding:14, marginBottom:10, borderLeft:`3px solid ${T.red}` }}>
          <p style={{ margin:"0 0 8px", fontSize:12, fontWeight:700, color:T.red }}>❌ ERROS COMUNS</p>
          {exSel.erros.filter(Boolean).map((e,i) => <p key={i} style={{ margin:"0 0 4px", color:T.text2, fontSize:13 }}>• {e}</p>)}
        </Card>}

        {exSel.cuidados?.filter(Boolean).length > 0 && <Card style={{ padding:14, marginBottom:10, borderLeft:`3px solid ${T.yellow}` }}>
          <p style={{ margin:"0 0 8px", fontSize:12, fontWeight:700, color:T.yellow }}>⚠️ CUIDADOS</p>
          {exSel.cuidados.filter(Boolean).map((c,i) => <p key={i} style={{ margin:"0 0 4px", color:T.text2, fontSize:13 }}>• {c}</p>)}
        </Card>}

        {exSel.video && <a href={exSel.video} target="_blank" rel="noopener noreferrer"
          style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, width:"100%", background:T.redDim, border:`1px solid ${T.red}44`, borderRadius:12, padding:13, fontSize:14, fontWeight:700, color:T.red, textDecoration:"none", marginBottom:10, boxSizing:"border-box" }}>
          <Ic n="play" size={18} color={T.red}/> Assistir vídeo demonstrativo
        </a>}

        <Btn full onClick={() => setModo("editar")} style={{ color:T.bg, marginTop:4 }}>
          <Ic n="edit" size={16} color={T.bg}/> {isCustom ? "Editar este exercício" : "Personalizar — trocar foto / editar dados"}
        </Btn>
      </div>
    );
  }

  // GRADE principal
  return (
    <div>
      {msg && <div style={{ background:msg.startsWith("✅")?T.greenDim:T.redDim, borderRadius:10, padding:"10px 14px", marginBottom:12, color:msg.startsWith("✅")?T.green:T.red, fontSize:13, fontWeight:700 }}>{msg}</div>}

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <div>
          <p style={{ margin:0, fontSize:16, fontWeight:900, color:T.text }}>📚 Biblioteca</p>
          <p style={{ margin:"2px 0 0", color:T.text3, fontSize:12 }}>{todos.length} exercícios · {customExs.length} customizados</p>
        </div>
        <Btn small onClick={() => { setExSel(null); setModo("novo"); }} style={{ color:T.bg }}>
          <Ic n="plus" size={13} color={T.bg}/> Novo exercício
        </Btn>
      </div>

      {/* Busca */}
      <div style={{ position:"relative", marginBottom:10 }}>
        <div style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)" }}><Ic n="search" size={15} color={T.text3}/></div>
        <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por nome ou músculo..." style={{ width:"100%", background:T.card2, border:`1px solid ${busca?T.yellow:T.border}`, borderRadius:10, padding:"10px 12px 10px 38px", color:T.text, fontSize:13, outline:"none", boxSizing:"border-box" }}/>
      </div>

      {/* Filtros de grupo */}
      <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:8, marginBottom:14 }}>
        {grupos.map(g => (
          <button key={g} onClick={() => setGrupoFiltro(g)} style={{ flexShrink:0, background:grupoFiltro===g?(GRUPOS_CORES[g]||T.yellow)+"22":"transparent", border:`1px solid ${grupoFiltro===g?(GRUPOS_CORES[g]||T.yellow):T.border}`, borderRadius:20, padding:"5px 12px", color:grupoFiltro===g?(GRUPOS_CORES[g]||T.yellow):T.text3, fontSize:11, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>
            {g==="Todos" ? "Todos" : GRUPOS_EMOJI[g]+" "+g}
          </button>
        ))}
      </div>

      <p style={{ color:T.text3, fontSize:12, marginBottom:10 }}>{filtrados.length} resultados — toque para ver ou editar</p>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {filtrados.map(ex => {
          const cor = GRUPOS_CORES[ex.grupo] || T.yellow;
          const isCustom = !!customExs.find(e => e.id === ex.id);
          const fotoCustomizada = fotoCustom[ex.id];
          return (
            <div key={ex.id} onClick={() => { setExSel(ex); setModo("ver"); }}
              style={{ background:T.card2, borderRadius:14, overflow:"hidden", border:`1px solid ${isCustom?T.yellow:T.border}`, cursor:"pointer", position:"relative" }}>
              {/* Imagem */}
              <div style={{ height:110, overflow:"hidden", background:T.bg2, position:"relative" }}>
                {fotoCustomizada
                  ? <img src={fotoCustomizada} alt={ex.nome} style={{ width:"100%", height:110, objectFit:"cover" }}/>
                  : <ExImg nome={ex.nome} musculo={ex.grupo} imgUrl={fotoCustomizada||ex.img_url} style={{ width:"100%", height:110, objectFit:"cover" }}/>
                }
                {/* Badge grupo */}
                <div style={{ position:"absolute", top:6, left:6 }}>
                  <span style={{ background:cor+"DD", color:"#fff", borderRadius:20, padding:"2px 8px", fontSize:10, fontWeight:700 }}>{ex.grupo}</span>
                </div>
                {/* Badge custom */}
                {isCustom && <div style={{ position:"absolute", top:6, right:6 }}>
                  <span style={{ background:T.yellow, color:T.bg, borderRadius:20, padding:"2px 8px", fontSize:9, fontWeight:900 }}>⭐ CUSTOM</span>
                </div>}
                {/* Ícone de edição no hover simulado */}
                <div style={{ position:"absolute", bottom:6, right:6, background:"#000A", borderRadius:8, padding:"4px 8px", display:"flex", alignItems:"center", gap:4 }}>
                  <Ic n="edit" size={11} color="#FFF"/>
                  <span style={{ color:"#FFF", fontSize:10, fontWeight:700 }}>Editar</span>
                </div>
              </div>
              {/* Info */}
              <div style={{ padding:"10px 10px 12px" }}>
                <p style={{ margin:"0 0 3px", fontSize:12, fontWeight:800, color:T.text, lineHeight:1.3 }}>{ex.nome}</p>
                <p style={{ margin:"0 0 6px", color:T.text3, fontSize:11 }}>{ex.principais?.[0]}</p>
                <div style={{ display:"flex", gap:4 }}>
                  <span style={{ background:cor+"22", color:cor, borderRadius:5, padding:"2px 6px", fontSize:10, fontWeight:700 }}>{ex.series}s</span>
                  <span style={{ background:T.bg, color:T.text3, borderRadius:5, padding:"2px 6px", fontSize:10 }}>{ex.reps}r</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── EDITOR DE EXERCÍCIO (novo ou editar) ────────────────────────────────────
const ExercicioEditor = ({ ex, isCustom, loading, onSave, onBack, onDelete, msg }) => {
  const [f, setF] = useState({
    ...ex,
    passos: ex.passos?.length ? ex.passos : [""],
    erros:  ex.erros?.length  ? ex.erros  : [""],
    cuidados: ex.cuidados?.length ? ex.cuidados : [""],
    principais: Array.isArray(ex.principais) ? ex.principais.join(", ") : (ex.principais||""),
    secundarios: Array.isArray(ex.secundarios) ? ex.secundarios.join(", ") : (ex.secundarios||""),
    _fotoBase64: ex._fotoBase64 || "",
  });
  const [showDelConfirm, setShowDelConfirm] = useState(false);
  const imgRef = useRef();

  const handleImg = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setF(p => ({ ...p, _fotoBase64: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const listEdit   = (field,i,v) => setF(p=>({...p,[field]:p[field].map((x,j)=>j===i?v:x)}));
  const listAdd    = (field)     => setF(p=>({...p,[field]:[...p[field],""]}));
  const listRemove = (field,i)   => setF(p=>({...p,[field]:p[field].filter((_,j)=>j!==i)}));

  const handleSave = () => {
    if (!f.nome.trim()) return;
    onSave({
      ...f,
      principais: f.principais.split(",").map(s=>s.trim()).filter(Boolean),
      secundarios: f.secundarios.split(",").map(s=>s.trim()).filter(Boolean),
    });
  };

  return (
    <div>
      {showDelConfirm && <Confirm msg={`Excluir "${f.nome}"?`} onYes={()=>{onDelete();setShowDelConfirm(false);}} onNo={()=>setShowDelConfirm(false)}/>}

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:6, color:T.text3, fontSize:14 }}>
          <Ic n="back" size={18} color={T.text3}/> Voltar
        </button>
        {isCustom && onDelete && (
          <button onClick={() => setShowDelConfirm(true)} style={{ background:T.redDim, border:`1px solid ${T.red}44`, borderRadius:8, padding:"6px 12px", color:T.red, fontSize:12, fontWeight:700, cursor:"pointer" }}>
            🗑 Excluir
          </button>
        )}
      </div>

      <p style={{ margin:"0 0 20px", fontSize:16, fontWeight:900, color:T.text }}>
        {ex.id ? "✏️ Editar exercício" : "➕ Novo exercício"}
      </p>

      {/* ── FOTO ── */}
      <div style={{ marginBottom:20 }}>
        <label style={{ fontSize:11, color:T.text3, fontWeight:700, letterSpacing:.8, display:"block", marginBottom:8 }}>📸 FOTO DO EXERCÍCIO</label>
        {/* Preview da foto atual */}
        <div style={{ borderRadius:16, overflow:"hidden", height:200, background:T.bg2, marginBottom:10, position:"relative" }}>
          {f._fotoBase64
            ? <img src={f._fotoBase64} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
            : <ExImg nome={f.nome} musculo={f.grupo} imgUrl={f.img_url} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
          }
          {f._fotoBase64 && (
            <button onClick={() => setF(p=>({...p,_fotoBase64:""}))}
              style={{ position:"absolute", top:10, right:10, background:T.redDim, border:`1px solid ${T.red}55`, borderRadius:8, padding:"4px 10px", color:T.red, fontSize:12, fontWeight:700, cursor:"pointer" }}>
              ✕ Remover
            </button>
          )}
        </div>
        <input type="file" accept="image/*" ref={imgRef} style={{ display:"none" }} onChange={handleImg}/>
        <button onClick={() => imgRef.current.click()} style={{ width:"100%", background:T.card2, border:`2px dashed ${T.yellow}88`, borderRadius:14, padding:"14px 0", color:T.yellow, fontSize:14, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
          <Ic n="upload" size={18} color={T.yellow}/> {f._fotoBase64 ? "Trocar foto" : "Fazer upload da foto"}
        </button>
        <p style={{ margin:"6px 0 0", color:T.text3, fontSize:11, textAlign:"center" }}>
          {f._fotoBase64 ? "📸 Foto personalizada carregada" : "Sem foto → usa imagem padrão do banco de dados"}
        </p>
      </div>

      {/* ── DADOS BÁSICOS ── */}
      <Inp label="NOME DO EXERCÍCIO *" value={f.nome} onChange={v=>setF(p=>({...p,nome:v}))} placeholder="Ex: Supino Reto com Barra"/>

      <div style={{ marginBottom:12 }}>
        <label style={{ fontSize:11, color:T.text3, fontWeight:700, letterSpacing:.8, display:"block", marginBottom:5 }}>GRUPO MUSCULAR</label>
        <select value={f.grupo} onChange={e=>setF(p=>({...p,grupo:e.target.value}))} style={{ width:"100%", background:T.card2, border:`1px solid ${T.border}`, borderRadius:10, padding:"12px 10px", color:T.text, fontSize:14, outline:"none" }}>
          {Object.keys(GRUPOS_CORES).map(g=><option key={g} value={g}>{GRUPOS_EMOJI[g]} {g}</option>)}
        </select>
      </div>

      <Inp label="MÚSCULOS PRINCIPAIS (separados por vírgula)" value={f.principais} onChange={v=>setF(p=>({...p,principais:v}))} placeholder="Ex: Peitoral maior, Deltóide anterior"/>
      <Inp label="MÚSCULOS SECUNDÁRIOS" value={f.secundarios} onChange={v=>setF(p=>({...p,secundarios:v}))} placeholder="Ex: Tríceps, Bíceps"/>
      <Textarea label="DESCRIÇÃO DO EXERCÍCIO" value={f.desc||""} onChange={v=>setF(p=>({...p,desc:v}))} rows={2} placeholder="Descrição breve do exercício e seus benefícios"/>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:12 }}>
        <Inp label="SÉRIES" value={f.series} onChange={v=>setF(p=>({...p,series:v}))} placeholder="Ex: 4"/>
        <Inp label="REPS" value={f.reps} onChange={v=>setF(p=>({...p,reps:v}))} placeholder="Ex: 12"/>
        <Inp label="DESCANSO" value={f.descanso} onChange={v=>setF(p=>({...p,descanso:v}))} placeholder="Ex: 60s"/>
      </div>

      <Inp label="🎬 VÍDEO DEMONSTRATIVO (link YouTube/Vimeo)" value={f.video||""} onChange={v=>setF(p=>({...p,video:v}))} placeholder="https://youtube.com/..."/>

      {/* ── PASSO A PASSO ── */}
      <div style={{ marginBottom:14 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
          <label style={{ fontSize:11, color:T.text3, fontWeight:700, letterSpacing:.8 }}>📋 PASSO A PASSO</label>
          <button onClick={()=>listAdd("passos")} style={{ background:T.yellowDim, border:"none", borderRadius:6, padding:"4px 12px", color:T.yellow, fontSize:11, fontWeight:700, cursor:"pointer" }}>+ Adicionar passo</button>
        </div>
        {f.passos.map((p,i)=>(
          <div key={i} style={{ display:"flex", gap:8, marginBottom:8, alignItems:"flex-start" }}>
            <span style={{ width:24, height:24, background:T.yellowDim, borderRadius:50, color:T.yellow, fontSize:11, fontWeight:900, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:10 }}>{i+1}</span>
            <input value={p} onChange={e=>listEdit("passos",i,e.target.value)} placeholder={`Passo ${i+1}...`} style={{ flex:1, background:T.card2, border:`1px solid ${T.border}`, borderRadius:10, padding:"10px 12px", color:T.text, fontSize:13, outline:"none" }}/>
            {f.passos.length > 1 && <button onClick={()=>listRemove("passos",i)} style={{ background:T.redDim, border:"none", borderRadius:8, width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", marginTop:6, flexShrink:0 }}><Ic n="x" size={13} color={T.red}/></button>}
          </div>
        ))}
      </div>

      {/* ── ERROS COMUNS ── */}
      <div style={{ marginBottom:14 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
          <label style={{ fontSize:11, color:T.text3, fontWeight:700, letterSpacing:.8 }}>❌ ERROS COMUNS</label>
          <button onClick={()=>listAdd("erros")} style={{ background:T.redDim, border:"none", borderRadius:6, padding:"4px 12px", color:T.red, fontSize:11, fontWeight:700, cursor:"pointer" }}>+ Adicionar</button>
        </div>
        {f.erros.map((e,i)=>(
          <div key={i} style={{ display:"flex", gap:8, marginBottom:8 }}>
            <input value={e} onChange={ev=>listEdit("erros",i,ev.target.value)} placeholder="Ex: Arredondar a lombar" style={{ flex:1, background:T.card2, border:`1px solid ${T.border}`, borderRadius:10, padding:"10px 12px", color:T.text, fontSize:13, outline:"none" }}/>
            {f.erros.length > 1 && <button onClick={()=>listRemove("erros",i)} style={{ background:T.redDim, border:"none", borderRadius:8, width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}><Ic n="x" size={13} color={T.red}/></button>}
          </div>
        ))}
      </div>

      {/* ── CUIDADOS ── */}
      <div style={{ marginBottom:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
          <label style={{ fontSize:11, color:T.text3, fontWeight:700, letterSpacing:.8 }}>⚠️ CUIDADOS DE POSTURA</label>
          <button onClick={()=>listAdd("cuidados")} style={{ background:T.yellowDim, border:"none", borderRadius:6, padding:"4px 12px", color:T.yellow, fontSize:11, fontWeight:700, cursor:"pointer" }}>+ Adicionar</button>
        </div>
        {f.cuidados.map((c,i)=>(
          <div key={i} style={{ display:"flex", gap:8, marginBottom:8 }}>
            <input value={c} onChange={ev=>listEdit("cuidados",i,ev.target.value)} placeholder="Ex: Mantenha a coluna neutra" style={{ flex:1, background:T.card2, border:`1px solid ${T.border}`, borderRadius:10, padding:"10px 12px", color:T.text, fontSize:13, outline:"none" }}/>
            {f.cuidados.length > 1 && <button onClick={()=>listRemove("cuidados",i)} style={{ background:T.redDim, border:"none", borderRadius:8, width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}><Ic n="x" size={13} color={T.red}/></button>}
          </div>
        ))}
      </div>

      {msg && <div style={{ background:msg.startsWith("✅")?T.greenDim:T.redDim, borderRadius:10, padding:"10px 14px", marginBottom:12, color:msg.startsWith("✅")?T.green:T.red, fontSize:13, fontWeight:700 }}>{msg}</div>}

      <button onClick={handleSave} disabled={loading || !f.nome.trim()} style={{ width:"100%", background:loading?"#333":T.gold, color:T.bg, border:"none", borderRadius:14, padding:16, fontSize:15, fontWeight:900, cursor:loading?"not-allowed":"pointer", opacity:loading||!f.nome.trim()?0.6:1, display:"flex", alignItems:"center", justifyContent:"center", gap:10, boxSizing:"border-box" }}>
        {loading ? "Salvando..." : <><Ic n="save" size={18} color={T.bg}/> Salvar exercício</>}
      </button>
    </div>
  );
};

// ─── ADMIN PANEL ──────────────────────────────────────────────────────────────
const AdminPanel = ({ alunos, setAlunos, onAddAluno, onUpdateAluno, onDeleteAluno, onLogout }) => {
  const [subTab,setSubTab]=useState("alunos");
  const [busca,setBusca]=useState("");
  const [alunoSel,setAlunoSel]=useState(null);
  const [showAdd,setShowAdd]=useState(false);
  const [newAluno,setNewAluno]=useState({nome:"",cpf:"",senha:"",telefone:"",email:"",nascimento:"",objetivo:"",obs:"",status:"Ativo",plano:"Basic",since:new Date().toLocaleDateString("pt-BR",{month:"short",year:"numeric"}),treinos:{"Treino A":[]},cardapio:{}});

  if(alunoSel) return (
    <AlunoDetalhe
      aluno={alunoSel}
      onBack={()=>setAlunoSel(null)}
      onSave={async(updated)=>{ await onUpdateAluno({...updated,id:alunoSel.id}); setAlunoSel({...updated,id:alunoSel.id}); }}
      onDelete={async(id)=>{ await onDeleteAluno(id); setAlunoSel(null); }}
    />
  );

  const filtrados=alunos.filter(a=>
    a.nome.toLowerCase().includes(busca.toLowerCase()) ||
    a.cpf.includes(busca) ||
    (a.objetivo||"").toLowerCase().includes(busca.toLowerCase())
  );

  const [addLoading,setAddLoading]=useState(false);
  const [addErr,setAddErr]=useState("");

  const addAluno= async ()=>{
    if(!newAluno.nome.trim()||!newAluno.cpf.trim()){setAddErr("Nome e CPF são obrigatórios.");return;}
    setAddLoading(true); setAddErr("");
    try {
      const alunoCompleto={...newAluno, id:newAluno.cpf, senha:newAluno.senha||newAluno.cpf,
        treinos:{"Treino A":[]}, cardapio:{}, fotos:[], avaliacoes:[], chat:[], notificacoes:[], agenda:[],
        since:new Date().toLocaleDateString("pt-BR",{month:"short",year:"numeric"})
      };
      await onAddAluno(alunoCompleto);
      setNewAluno({nome:"",cpf:"",senha:"",telefone:"",email:"",nascimento:"",objetivo:"",obs:"",status:"Ativo",plano:"Basic"});
      setShowAdd(false);
    } catch(e) {
      setAddErr("Erro ao cadastrar: "+e.message);
    }
    setAddLoading(false);
  };

  const ADMIN_TABS=[{id:"alunos",l:"👥 Alunos"},{id:"biblioteca",l:"📚 Biblioteca"},{id:"dashboard",l:"📊 Dashboard"},{id:"config",l:"⚙️ Config"}];

  return (
    <div style={{ minHeight:"100vh", background:T.bg, fontFamily:"system-ui,sans-serif" }}>
      {showAdd && (
        <Modal title="Cadastrar novo aluno" onClose={()=>setShowAdd(false)}>
          <Inp label="NOME COMPLETO *" value={newAluno.nome} onChange={v=>setNewAluno(p=>({...p,nome:v}))}/>
          <Inp label="CPF (será o login e senha padrão) *" value={newAluno.cpf} onChange={v=>setNewAluno(p=>({...p,cpf:v}))} placeholder="Apenas números"/>
          <Inp label="SENHA (opcional — padrão = CPF)" value={newAluno.senha} onChange={v=>setNewAluno(p=>({...p,senha:v}))} placeholder="Deixe vazio para usar o CPF"/>
          <Inp label="TELEFONE" value={newAluno.telefone} onChange={v=>setNewAluno(p=>({...p,telefone:v}))} placeholder="(11) 9 0000-0000"/>
          <Inp label="E-MAIL" value={newAluno.email} onChange={v=>setNewAluno(p=>({...p,email:v}))}/>
          <Inp label="OBJETIVO" value={newAluno.objetivo} onChange={v=>setNewAluno(p=>({...p,objetivo:v}))} placeholder="Emagrecimento, Hipertrofia..."/>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
            {[{l:"Plano",k:"plano",opts:["Basic","Premium"]},{l:"Status",k:"status",opts:["Ativo","Pendente","Bloqueado"]}].map(f=>(
              <div key={f.k}>
                <label style={{ fontSize:11, color:T.text3, fontWeight:700, letterSpacing:0.8, display:"block", marginBottom:5 }}>{f.l.toUpperCase()}</label>
                <select value={newAluno[f.k]} onChange={e=>setNewAluno(p=>({...p,[f.k]:e.target.value}))} style={{ width:"100%", background:T.card2, border:`1px solid ${T.border}`, borderRadius:10, padding:"12px 10px", color:T.text, fontSize:14, outline:"none" }}>
                  {f.opts.map(o=><option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
          {addErr&&<p style={{color:T.red,fontSize:13,margin:"4px 0"}}>{addErr}</p>}
          <div style={{ display:"flex", gap:10, marginTop:8 }}>
            <Btn onClick={()=>setShowAdd(false)} outline style={{ flex:1 }}>Cancelar</Btn>
            <Btn onClick={addAluno} style={{ flex:2, color:T.bg, opacity:addLoading?0.7:1 }}>{addLoading?"Cadastrando...":"✓ Cadastrar aluno"}</Btn>
          </div>
        </Modal>
      )}

      {/* Header */}
      <div style={{ background:`linear-gradient(135deg,#1A1500,#0D0D00)`, padding:"20px 16px 0", borderBottom:`1px solid ${T.yellow}33`, position:"sticky", top:0, zIndex:40 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <div><p style={{ margin:0, color:T.yellow, fontSize:11, fontWeight:700, letterSpacing:1 }}>PAINEL ADMIN</p><h1 style={{ margin:"2px 0 0", fontSize:20, fontWeight:900, color:T.text }}>IMPÉRIO</h1></div>
          <button onClick={onLogout} style={{ background:"transparent", border:`1px solid ${T.border}`, borderRadius:8, padding:"8px 12px", color:T.text3, fontSize:12, cursor:"pointer" }}>Sair</button>
        </div>
        <div style={{ display:"flex", gap:6, paddingBottom:1 }}>
          {ADMIN_TABS.map(t=>(
            <button key={t.id} onClick={()=>setSubTab(t.id)} style={{ flex:1, background:subTab===t.id?T.gold:"transparent", border:`1px solid ${subTab===t.id?T.yellow:T.border}`, borderRadius:"10px 10px 0 0", padding:"8px 4px", color:subTab===t.id?T.bg:T.text3, fontSize:12, fontWeight:700, cursor:"pointer" }}>{t.l}</button>
          ))}
        </div>
      </div>

      <div style={{ padding:"16px 16px 80px" }}>
        {/* ── ALUNOS ── */}
        {subTab==="alunos" && (
          <div>
            <div style={{ display:"flex", gap:10, marginBottom:14 }}>
              <div style={{ position:"relative", flex:1 }}>
                <div style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)" }}><Ic n="search" size={16} color={T.text3}/></div>
                <input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Buscar por nome, CPF ou objetivo..." style={{ width:"100%", background:T.card2, border:`1px solid ${busca?T.yellow:T.border}`, borderRadius:12, padding:"12px 12px 12px 40px", color:T.text, fontSize:14, outline:"none", boxSizing:"border-box" }}/>
              </div>
              <Btn onClick={()=>setShowAdd(true)} style={{ flexShrink:0, color:T.bg }}><Ic n="plus" size={16} color={T.bg}/>Novo</Btn>
            </div>

            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
              <span style={{ color:T.text3, fontSize:13 }}>{filtrados.length} aluno{filtrados.length!==1?"s":""}</span>
              <div style={{ display:"flex", gap:8 }}>
                <YBadge text={`${alunos.filter(a=>a.status==="Ativo").length} ativos`} color={T.green}/>
                <YBadge text={`${alunos.filter(a=>a.status==="Pendente").length} pendentes`} color={T.yellow}/>
              </div>
            </div>

            {filtrados.length===0 ? (
              <div style={{ textAlign:"center", paddingTop:40, color:T.text3 }}>
                <p style={{ fontSize:40, marginBottom:12 }}>🔍</p>
                <p>Nenhum aluno encontrado</p>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {filtrados.map(a=>(
                  <div key={a.id} onClick={()=>setAlunoSel(a)} style={{ background:T.card, borderRadius:16, border:`1px solid ${T.border}`, padding:"14px 16px", cursor:"pointer", display:"flex", alignItems:"center", gap:14 }}>
                    <div style={{ width:46, height:46, borderRadius:50, background:`linear-gradient(135deg,${T.yellow}44,${T.yellow}22)`, border:`2px solid ${T.yellow}55`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>👤</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ margin:0, fontSize:15, fontWeight:800, color:T.text }}>{a.nome}</p>
                      <p style={{ margin:"2px 0 0", color:T.text3, fontSize:12 }}>CPF: {a.cpf}</p>
                      <p style={{ margin:"2px 0 0", color:T.text3, fontSize:12 }}>{a.objetivo||"Sem objetivo definido"} · {a.plano}</p>
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6, flexShrink:0 }}>
                      <YBadge text={a.status} color={a.status==="Ativo"?T.green:a.status==="Pendente"?T.yellow:T.red}/>
                      <Ic n="chevR" size={16} color={T.text3}/>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── BIBLIOTECA ── */}
        {subTab==="biblioteca" && (
          <BibliotecaAdmin/>
        )}

        {/* ── DASHBOARD ── */}
        {subTab==="dashboard" && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
              {[
                {v:alunos.length,l:"Total de alunos",icon:"user",color:T.yellow},
                {v:alunos.filter(a=>a.status==="Ativo").length,l:"Alunos ativos",icon:"check",color:T.green},
                {v:alunos.filter(a=>a.status==="Pendente").length,l:"Pendências",icon:"bell",color:T.red},
                {v:alunos.filter(a=>a.plano==="Premium").length,l:"Premium",icon:"star",color:"#9B59B6"},
              ].map(s=>(
                <Card key={s.l} style={{ padding:"16px", display:"flex", gap:12, alignItems:"center" }}>
                  <div style={{ width:40, height:40, background:s.color+"22", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center" }}><Ic n={s.icon} size={20} color={s.color}/></div>
                  <div><p style={{ margin:0, fontSize:24, fontWeight:900, color:T.text }}>{s.v}</p><p style={{ margin:0, fontSize:11, color:T.text3 }}>{s.l}</p></div>
                </Card>
              ))}
            </div>
            <Sec title="Últimos cadastros">
              {alunos.slice(-4).reverse().map(a=>(
                <Card key={a.id} style={{ padding:"12px 14px", marginBottom:8, display:"flex", gap:12, alignItems:"center" }}>
                  <div style={{ width:36, height:36, borderRadius:50, background:T.yellowDim, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>👤</div>
                  <div style={{ flex:1 }}><p style={{ margin:0, fontSize:14, fontWeight:700, color:T.text }}>{a.nome}</p><p style={{ margin:0, fontSize:12, color:T.text3 }}>Desde {a.since}</p></div>
                  <YBadge text={a.status} color={a.status==="Ativo"?T.green:T.yellow}/>
                </Card>
              ))}
            </Sec>
          </div>
        )}

        {/* ── CONFIG ── */}
        {subTab==="config" && (
          <Sec title="Configurações">
            {[{l:"Nome da academia",v:"IMPÉRIO"},{l:"WhatsApp",v:"(11) 9 8765-4321"},{l:"Plano Basic",v:"R$ 79,90/mês"},{l:"Plano Premium",v:"R$ 99,90/mês"},{l:"Versão",v:"3.0.0"}].map(c=>(
              <Card key={c.l} style={{ padding:"13px 16px", display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <span style={{ color:T.text2, fontSize:14 }}>{c.l}</span>
                <span style={{ color:T.yellow, fontWeight:700, fontSize:14 }}>{c.v}</span>
              </Card>
            ))}
          </Sec>
        )}
      </div>
    </div>
  );
};

// ─── ALUNO APP ────────────────────────────────────────────────────────────────
const NUTRI_VIDEOS=[
  {title:"5 erros que sabotam seu cutting",duration:"6:42",tag:"Emagrecimento",views:"2.3k"},
  {title:"Café da manhã fitness em 10 min",duration:"8:15",tag:"Receitas",views:"4.1k"},
  {title:"Proteínas: quanto você realmente precisa?",duration:"11:30",tag:"Nutrição",views:"3.7k"},
];

const AlunoApp = ({ aluno, onUpdateAluno, onLogout }) => {
  const [tab,setTab]=useState("inicio");
  const [menuOpen,setMenuOpen]=useState(false);
  const [exSel,setExSel]=useState(null);
  const [done,setDone]=useState([]);
  const [seriesDone,setSeriesDone]=useState({}); // { [exId]: nº séries feitas }
  const [timerSeg,setTimerSeg]=useState(null);
  const [treinoAtivo,setTreinoAtivo]=useState(Object.keys(aluno.treinos||{})[0]||"");
  const fichas=Object.keys(aluno.treinos||{});
  const exList=aluno.treinos?.[treinoAtivo]||[];

  const BOT_NAV=[
    {id:"inicio",icon:"home",label:"Início"},
    {id:"treinos",icon:"dumbbell",label:"Treinos"},
    {id:"nutricao",icon:"leaf",label:"Nutrição"},
    {id:"cardapio",icon:"heart",label:"Cardápio"},
    {id:"perfil",icon:"user",label:"Perfil"},
  ];
  const SIDE_MENU=[
    {icon:"home",label:"Início",tab:"inicio"},
    {icon:"dumbbell",label:"Treinos",tab:"treinos"},
    {icon:"leaf",label:"Nutrição",tab:"nutricao"},
    {icon:"heart",label:"Meu Cardápio",tab:"cardapio"},
    {icon:"credit",label:"Pagamentos",tab:"pagamentos"},
    {icon:"user",label:"Perfil",tab:"perfil"},
  ];
  const TAB_TITLES={inicio:`Olá, ${aluno.nome.split(" ")[0]}! 👋`,treinos:"Meus Treinos",nutricao:"Nutrição",cardapio:"Meu Cardápio",perfil:"Meu Perfil",pagamentos:"Pagamentos"};

  const renderTab = () => {
    // ── INICIO
    if(tab==="inicio") return (
      <div>
        <div style={{ background:`linear-gradient(135deg,#0D0D00,#161600)`, borderRadius:20, padding:20, border:`1px solid ${T.yellow}33`, marginBottom:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <p style={{ margin:"0 0 4px", color:T.yellow, fontSize:12, fontWeight:700, letterSpacing:1 }}>BOM DIA 🌤️</p>
              <h2 style={{ margin:"0 0 4px", fontSize:22, fontWeight:900, color:T.text }}>{aluno.nome}</h2>
              <p style={{ margin:0, color:T.text3, fontSize:13 }}>Objetivo: {aluno.objetivo||"Não definido"}</p>
            </div>
            <div style={{ width:56, height:56, borderRadius:50, background:T.gold, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, boxShadow:`0 4px 20px ${T.yellow}55` }}>💪</div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginTop:16 }}>
            {[{v:fichas.length,l:"fichas"},{v:exList.length,l:"exercícios"},{v:done.length,l:"concluídos"}].map(s=>(
              <div key={s.l} style={{ background:"#050500", borderRadius:10, padding:"10px 6px", textAlign:"center", border:`1px solid ${T.yellow}22` }}>
                <p style={{ margin:0, fontSize:18, fontWeight:900, color:T.yellow }}>{s.v}</p>
                <p style={{ margin:0, fontSize:10, color:T.text3 }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
          {[
            {icon:"dumbbell",label:"Ver Treino",tab:"treinos",color:T.yellow},
            {icon:"heart",label:"Meu Cardápio",tab:"cardapio",color:T.green},
            {icon:"leaf",label:"Nutrição",tab:"nutricao",color:T.green},
            {icon:"credit",label:"Pagamentos",tab:"pagamentos",color:"#3498DB"},
          ].map(it=>(
            <div key={it.label} onClick={()=>setTab(it.tab)} style={{ background:T.card, borderRadius:16, border:`1px solid ${T.border}`, padding:14, display:"flex", alignItems:"center", gap:12, cursor:"pointer", borderLeft:`3px solid ${it.color}` }}>
              <div style={{ width:38, height:38, background:it.color+"22", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" }}><Ic n={it.icon} size={18} color={it.color}/></div>
              <span style={{ color:T.text, fontSize:13, fontWeight:700 }}>{it.label}</span>
            </div>
          ))}
        </div>
        {treinoAtivo && (
          <div>
            <p style={{ color:T.text, fontSize:15, fontWeight:800, marginBottom:12 }}>Treino de hoje</p>
            <div style={{ background:`linear-gradient(135deg,#0D0D00,#161616)`, borderRadius:16, overflow:"hidden", border:`1px solid ${T.yellow}33` }}>
              <div style={{ padding:"14px 16px" }}>
                <p style={{ margin:"0 0 4px", fontSize:17, fontWeight:900, color:T.text }}>{treinoAtivo}</p>
                <p style={{ margin:0, color:T.text3, fontSize:13 }}>{exList.length} exercícios</p>
              </div>
              <button onClick={()=>setTab("treinos")} style={{ display:"block", width:"100%", background:T.gold, color:T.bg, border:"none", padding:13, fontSize:14, fontWeight:900, cursor:"pointer" }}>⚡ INICIAR TREINO</button>
            </div>
          </div>
        )}
      </div>
    );

    // ── TREINOS
    if(tab==="treinos") {
      if(exSel) {
        // Parse número de séries do exercício
        const totalSeries = parseInt(String(exSel.series).split("-")[0]) || 3;
        const seriesFeitas = seriesDone[exSel.id] || 0;
        const tudoConcluido = seriesFeitas >= totalSeries;

        // Ao completar todas as séries → marca como concluído automaticamente
        const marcarSerie = () => {
          const novas = (seriesDone[exSel.id] || 0) + 1;
          setSeriesDone(p => ({ ...p, [exSel.id]: novas }));
          if (novas >= totalSeries) {
            setDone(p => p.includes(exSel.id) ? p : [...p, exSel.id]);
            setTimerSeg(null);
            setTimeout(() => setExSel(null), 900); // volta após animação
          } else {
            setTimerSeg(parseDescanso(exSel.descanso)); // abre timer automático
          }
        };

        const resetSeries = () => {
          setSeriesDone(p => ({ ...p, [exSel.id]: 0 }));
          setDone(p => p.filter(x => x !== exSel.id));
          setTimerSeg(null);
        };

        return (
          <div>
            <button onClick={()=>setExSel(null)} style={{ background:"none", border:"none", color:T.text3, cursor:"pointer", display:"flex", alignItems:"center", gap:6, marginBottom:16, padding:0, fontSize:14 }}>
              <Ic n="back" size={18} color={T.text3}/> Voltar
            </button>
            {timerSeg!==null && <TimerDescanso segundos={timerSeg} onClose={()=>setTimerSeg(null)}/>}

            {/* Foto real do exercício */}
            <div style={{ borderRadius:20, overflow:"hidden", marginBottom:16, position:"relative", height:200 }}>
              {exSel.img
                ? <img src={exSel.img} alt={exSel.nome} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                : <ExImg nome={exSel.nome} musculo={exSel.musculo} imgUrl={exSel.img_url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              }
              <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,#0A0A0A 0%,transparent 50%)" }}/>
              <div style={{ position:"absolute", bottom:14, left:16, right:16, display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
                <div>
                  <h2 style={{ margin:"0 0 4px", fontSize:20, fontWeight:900, color:T.text }}>{exSel.nome}</h2>
                  <p style={{ margin:0, color:"#CCC", fontSize:13 }}>{exSel.musculo}</p>
                </div>
                <YBadge text={treinoAtivo}/>
              </div>
            </div>

            {/* Info reps/descanso */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:16 }}>
              {[{v:exSel.reps,l:"Repetições"},{v:exSel.descanso,l:"Descanso"}].map(i=>(
                <div key={i.l} style={{ background:T.card2, borderRadius:12, padding:12, textAlign:"center", border:`1px solid ${T.yellow}33` }}>
                  <p style={{ margin:0, fontSize:20, fontWeight:900, color:T.yellow }}>{i.v}</p>
                  <p style={{ margin:"4px 0 0", fontSize:11, color:T.text3 }}>{i.l}</p>
                </div>
              ))}
            </div>

            {/* ── CONTADOR DE SÉRIES ── */}
            <div style={{ background:`linear-gradient(135deg,#0D0D00,#161616)`, borderRadius:20, padding:20, marginBottom:14, border:`1px solid ${tudoConcluido ? T.green+"55" : T.yellow+"33"}` }}>
              {/* Header */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                <div>
                  <p style={{ margin:0, fontSize:12, color:T.text3, fontWeight:700, letterSpacing:1 }}>SÉRIES</p>
                  <p style={{ margin:"2px 0 0", fontSize:22, fontWeight:900, color: tudoConcluido ? T.green : T.yellow }}>
                    {seriesFeitas} / {totalSeries}
                  </p>
                </div>
                {seriesFeitas > 0 && (
                  <button onClick={resetSeries} style={{ background:"transparent", border:`1px solid ${T.border}`, borderRadius:8, padding:"6px 12px", color:T.text3, fontSize:12, cursor:"pointer" }}>
                    ↺ Resetar
                  </button>
                )}
              </div>

              {/* Bolinhas das séries */}
              <div style={{ display:"flex", gap:10, justifyContent:"center", marginBottom:20 }}>
                {Array.from({ length: totalSeries }).map((_, i) => {
                  const feita = i < seriesFeitas;
                  const atual = i === seriesFeitas;
                  return (
                    <div key={i} style={{
                      display:"flex", flexDirection:"column", alignItems:"center", gap:6
                    }}>
                      <div style={{
                        width: atual ? 52 : 44,
                        height: atual ? 52 : 44,
                        borderRadius:"50%",
                        background: feita
                          ? `linear-gradient(135deg,${T.green},#16A34A)`
                          : atual
                            ? T.gold
                            : T.card2,
                        border: `2px solid ${feita ? T.green : atual ? T.yellow : T.border}`,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize: feita ? 18 : 14,
                        fontWeight:900,
                        color: feita || atual ? T.bg : T.text3,
                        transition:"all 0.3s",
                        boxShadow: atual ? `0 0 18px ${T.yellow}55` : feita ? `0 0 12px ${T.green}44` : "none",
                      }}>
                        {feita ? "✓" : i + 1}
                      </div>
                      <span style={{ fontSize:10, color: feita ? T.green : atual ? T.yellow : T.text3, fontWeight:700 }}>
                        {feita ? "Feita" : atual ? "Atual" : `${i+1}ª`}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Botão principal */}
              {tudoConcluido ? (
                <div style={{ textAlign:"center", padding:"8px 0" }}>
                  <p style={{ margin:"0 0 8px", fontSize:28 }}>🎉</p>
                  <p style={{ margin:0, color:T.green, fontSize:16, fontWeight:900 }}>Exercício concluído!</p>
                  <p style={{ margin:"4px 0 0", color:T.text3, fontSize:13 }}>Voltando para a lista...</p>
                </div>
              ) : (
                <button
                  onClick={marcarSerie}
                  style={{
                    width:"100%",
                    background: `linear-gradient(135deg,${T.yellow},#FFD700)`,
                    border:"none", borderRadius:14, padding:16,
                    color:T.bg, fontSize:15, fontWeight:900, cursor:"pointer",
                    display:"flex", alignItems:"center", justifyContent:"center", gap:10,
                    boxShadow:`0 4px 20px ${T.yellow}44`,
                  }}
                >
                  <span style={{ fontSize:20 }}>💪</span>
                  {seriesFeitas === 0
                    ? `Iniciar — 1ª série (${exSel.reps} reps)`
                    : seriesFeitas === totalSeries - 1
                      ? `Concluir — ${totalSeries}ª série (${exSel.reps} reps)`
                      : `Série feita! → ${seriesFeitas + 1}ª de ${totalSeries}`
                  }
                </button>
              )}
            </div>

            {/* Timer de descanso manual */}
            {!tudoConcluido && (
              <div style={{ background:T.card, borderRadius:16, padding:14, marginBottom:12, border:`1px solid ${T.border}` }}>
                <p style={{ margin:"0 0 10px", fontSize:12, fontWeight:700, color:T.text3, letterSpacing:1 }}>⏱ TIMER MANUAL</p>
                <div style={{ display:"flex", gap:8 }}>
                  {["30s","45s","60s","90s","2min"].map(t=>(
                    <button key={t} onClick={()=>setTimerSeg(parseDescanso(t))} style={{ flex:1, background:T.card2, border:`1px solid ${T.border}`, borderRadius:8, padding:"8px 0", color:T.text3, fontSize:12, fontWeight:700, cursor:"pointer" }}>{t}</button>
                  ))}
                </div>
              </div>
            )}

            {exSel.obs && (
              <Card style={{ padding:14, marginBottom:12, borderLeft:`3px solid ${T.yellow}` }}>
                <p style={{ margin:"0 0 4px", fontSize:12, fontWeight:700, color:T.yellow }}>📋 OBSERVAÇÕES DO PROFESSOR</p>
                <p style={{ margin:0, color:T.text2, fontSize:13 }}>{exSel.obs}</p>
              </Card>
            )}
            {exSel.video && (
              <a href={exSel.video} target="_blank" rel="noopener noreferrer" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, width:"100%", background:T.redDim, border:`1px solid ${T.red}44`, borderRadius:12, padding:13, fontSize:14, fontWeight:700, color:T.red, textDecoration:"none", marginBottom:10, boxSizing:"border-box" }}>
                <Ic n="play" size={18} color={T.red}/> Assistir vídeo tutorial
              </a>
            )}
          </div>
        );
      }
      return (
        <div>
          {fichas.length>1 && (
            <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:8, marginBottom:16 }}>
              {fichas.map(f=>(
                <button key={f} onClick={()=>setTreinoAtivo(f)} style={{ flexShrink:0, background:treinoAtivo===f?T.gold:"transparent", border:`1px solid ${treinoAtivo===f?T.yellow:T.border}`, borderRadius:10, padding:"8px 16px", color:treinoAtivo===f?T.bg:T.text3, fontSize:13, fontWeight:700, cursor:"pointer" }}>{f}</button>
              ))}
            </div>
          )}
          <Card style={{ marginBottom:16, background:`linear-gradient(135deg,#0D0D00,#161616)`, border:`1px solid ${T.yellow}33` }}>
            <div style={{ padding:"14px 16px 0" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                <div><p style={{ margin:0, fontSize:17, fontWeight:900, color:T.text }}>{treinoAtivo}</p><p style={{ margin:"4px 0 0", color:T.text3, fontSize:12 }}>{exList.length} exercícios</p></div>
                <span style={{ fontSize:28 }}>⚡</span>
              </div>
              <div style={{ background:"#050500", borderRadius:50, height:6, marginBottom:8 }}>
                <div style={{ width:`${exList.length>0?(done.filter(id=>exList.find(e=>e.id===id)).length/exList.length)*100:0}%`, height:"100%", background:T.gold, borderRadius:50, transition:"width 0.4s" }}/>
              </div>
              <p style={{ margin:0, color:T.text3, fontSize:12 }}>{done.filter(id=>exList.find(e=>e.id===id)).length}/{exList.length} concluídos</p>
            </div>
            <div style={{ height:12 }}/>
          </Card>
          {exList.length===0 ? (
            <div style={{ textAlign:"center", paddingTop:40, color:T.text3 }}><p style={{ fontSize:40, marginBottom:12 }}>🏋️</p><p>Nenhum exercício nesta ficha ainda.</p></div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {exList.map(ex=>{
                const d=done.includes(ex.id);
                const sf=seriesDone[ex.id]||0;
                const ts=parseInt(String(ex.series).split("-")[0])||3;
                const pct=sf/ts;
                return (
                  <div key={ex.id} onClick={()=>setExSel(ex)} style={{ background:d?"#0A1000":T.card, borderRadius:16, border:`1px solid ${d?T.green+"44":sf>0?T.yellow+"44":T.border}`, overflow:"hidden", display:"flex", alignItems:"stretch", cursor:"pointer" }}>
                    <div style={{ width:80, height:80, flexShrink:0, opacity:d?0.4:1 }}>
                      {ex.img ? <img src={ex.img} alt={ex.nome} style={{ width:80, height:80, objectFit:"cover", display:"block" }}/> : <ExImg nome={ex.nome} musculo={ex.musculo} imgUrl={ex.img_url} style={{width:80,height:80}}/>}
                    </div>
                    <div style={{ flex:1, padding:"10px 12px", display:"flex", flexDirection:"column", justifyContent:"center", gap:3 }}>
                      <p style={{ margin:0, fontSize:14, fontWeight:700, color:d?T.text3:T.text, textDecoration:d?"line-through":"none" }}>{ex.nome}</p>
                      {ex.musculo && <p style={{ margin:0, color:T.text3, fontSize:11 }}>{ex.musculo}</p>}
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <p style={{ margin:0, color:T.text3, fontSize:12 }}>{ex.series}×{ex.reps}</p>
                        {sf>0 && !d && (
                          <span style={{ fontSize:11, color:T.yellow, fontWeight:700 }}>{sf}/{ts} séries</span>
                        )}
                      </div>
                      {/* Barra de progresso de séries */}
                      {sf>0 && (
                        <div style={{ height:3, background:T.border, borderRadius:50, marginTop:3 }}>
                          <div style={{ height:"100%", width:`${pct*100}%`, background:d?T.green:T.gold, borderRadius:50, transition:"width 0.4s" }}/>
                        </div>
                      )}
                    </div>
                    <div style={{ display:"flex", alignItems:"center", paddingRight:12 }}>
                      {d ? <Ic n="check" size={20} color={T.green}/> : sf>0 ? <span style={{ fontSize:16 }}>🔥</span> : <Ic n="chevR" size={16} color={T.text3}/>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    // ── CARDÁPIO
    if(tab==="cardapio") return (
      <div>
        <div style={{ background:`linear-gradient(135deg,#001A08,#0A0A0A)`, borderRadius:16, padding:16, border:`1px solid ${T.green}33`, marginBottom:16 }}>
          <p style={{ margin:"0 0 4px", color:T.green, fontSize:11, fontWeight:700, letterSpacing:1 }}>SEU PLANO ALIMENTAR</p>
          <h3 style={{ margin:"0 0 4px", fontSize:17, fontWeight:900, color:T.text }}>Cardápio personalizado</h3>
          <p style={{ margin:0, color:T.text3, fontSize:13 }}>Montado pela Dra. Ana Paula</p>
        </div>
        {REFEICOES_DEFAULT.map((ref,i)=>{
          const r=aluno.cardapio?.[ref]; const alims=r?.alimentos||[];
          const kcal=alims.reduce((a,it)=>a+(parseFloat(it.kcal)||0),0);
          if(!r && alims.length===0) return (
            <div key={ref} style={{ background:T.card, borderRadius:14, border:`1px solid ${T.border}`, padding:"13px 16px", marginBottom:8, display:"flex", alignItems:"center", gap:12, opacity:0.5 }}>
              <span style={{ fontSize:22 }}>{["☀️","🍎","🍽️","🥝","🌙","⭐"][i]}</span>
              <div><p style={{ margin:0, fontSize:14, fontWeight:700, color:T.text3 }}>{ref}</p><p style={{ margin:0, color:T.text3, fontSize:12 }}>Não cadastrado</p></div>
            </div>
          );
          return (
            <div key={ref} style={{ background:T.card, borderRadius:14, border:`1px solid ${T.green}44`, marginBottom:10, overflow:"hidden" }}>
              <div style={{ padding:"13px 16px", display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ fontSize:22 }}>{["☀️","🍎","🍽️","🥝","🌙","⭐"][i]}</span>
                <div style={{ flex:1 }}>
                  <p style={{ margin:0, fontSize:14, fontWeight:700, color:T.text }}>{ref}</p>
                  <p style={{ margin:"2px 0 0", color:T.text3, fontSize:12 }}>{r?.horario && `${r.horario} · `}{alims.length} alimentos{kcal>0?` · ${kcal} kcal`:""}</p>
                </div>
              </div>
              {r?.img && <img src={r.img} alt={ref} style={{ width:"100%", maxHeight:120, objectFit:"cover" }}/>}
              <div style={{ padding:"0 16px 14px" }}>
                {alims.map(a=>(
                  <div key={a.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 0", borderBottom:`1px solid ${T.border}` }}>
                    <span style={{ color:T.text2, fontSize:13 }}>{a.nome}</span>
                    <div style={{ display:"flex", gap:10 }}>
                      {a.qtd && <span style={{ color:T.text3, fontSize:12 }}>{a.qtd}</span>}
                      {a.kcal && <span style={{ color:T.yellow, fontSize:12, fontWeight:700 }}>{a.kcal}kcal</span>}
                    </div>
                  </div>
                ))}
                {r?.obs && <p style={{ margin:"8px 0 0", color:T.text3, fontSize:12, fontStyle:"italic" }}>{r.obs}</p>}
                {r?.video && <a href={r.video} target="_blank" rel="noopener noreferrer" style={{ display:"inline-flex", alignItems:"center", gap:6, marginTop:8, color:T.green, fontSize:12, fontWeight:700, textDecoration:"none" }}><Ic n="play" size={14} color={T.green}/>Ver vídeo</a>}
              </div>
            </div>
          );
        })}
      </div>
    );

    // ── NUTRIÇÃO
    if(tab==="nutricao") return (
      <div>
        <div style={{ background:`linear-gradient(135deg,#001A08,#0A0A0A)`, borderRadius:20, padding:18, border:`1px solid ${T.green}33`, marginBottom:18 }}>
          <div style={{ display:"flex", gap:14, alignItems:"center", marginBottom:12 }}>
            <div style={{ width:56, height:56, borderRadius:50, background:`linear-gradient(135deg,${T.green},#16A34A)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0, boxShadow:`0 4px 18px ${T.green}44` }}>👩‍⚕️</div>
            <div>
              <p style={{ margin:"0 0 2px", fontSize:10, color:T.green, fontWeight:700, letterSpacing:1 }}>NUTRICIONISTA OFICIAL</p>
              <h3 style={{ margin:"0 0 2px", fontSize:16, fontWeight:900, color:T.text }}>Dra. Ana Paula</h3>
              <p style={{ margin:0, color:T.text3, fontSize:12 }}>CRN 1234 · Nutrição Esportiva</p>
            </div>
          </div>
          <button style={{ width:"100%", background:`linear-gradient(135deg,${T.green},#16A34A)`, color:T.text, border:"none", borderRadius:12, padding:13, fontSize:14, fontWeight:800, cursor:"pointer" }}>📅 Agendar consulta</button>
        </div>
        <p style={{ color:T.text, fontSize:15, fontWeight:800, marginBottom:12 }}>Vídeos</p>
        {NUTRI_VIDEOS.map(v=>(
          <Card key={v.title} style={{ overflow:"hidden", marginBottom:10 }}>
            <div style={{ height:90, background:`linear-gradient(135deg,#001A08,#0A1505)`, display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
              <div style={{ width:40, height:40, background:`${T.green}22`, borderRadius:50, border:`2px solid ${T.green}55`, display:"flex", alignItems:"center", justifyContent:"center" }}><Ic n="play" size={18} color={T.green}/></div>
              <div style={{ position:"absolute", bottom:8, right:8, background:"#000A", borderRadius:5, padding:"2px 7px" }}><span style={{ color:T.text, fontSize:11, fontWeight:700 }}>{v.duration}</span></div>
            </div>
            <div style={{ padding:"11px 13px" }}><p style={{ margin:0, fontSize:14, fontWeight:700, color:T.text }}>{v.title}</p><p style={{ margin:"3px 0 0", color:T.text3, fontSize:12 }}>{v.views} visualizações</p></div>
          </Card>
        ))}
      </div>
    );

    // ── PERFIL
    if(tab==="perfil") return (
      <div>
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ width:80, height:80, borderRadius:50, background:T.gold, margin:"0 auto 12px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, boxShadow:`0 4px 24px ${T.yellow}44` }}>💪</div>
          <h2 style={{ margin:"0 0 4px", fontSize:20, fontWeight:900, color:T.text }}>{aluno.nome}</h2>
          <p style={{ margin:"0 0 8px", color:T.text3, fontSize:13 }}>CPF: {aluno.cpf}</p>
          <YBadge text={`✦ ${aluno.plano}`} color={T.yellow}/>
        </div>
        {[["Plano",aluno.plano],["Status",aluno.status],["Objetivo",aluno.objetivo||"—"],["Membro desde",aluno.since],["Telefone",aluno.telefone||"—"],["E-mail",aluno.email||"—"]].map(([l,v])=>(
          <Card key={l} style={{ display:"flex", justifyContent:"space-between", marginBottom:8, padding:"13px 16px" }}>
            <span style={{ color:T.text3, fontSize:14 }}>{l}</span>
            <span style={{ color:T.text, fontSize:14, fontWeight:600 }}>{v}</span>
          </Card>
        ))}

        {/* Fotos de evolução — somente leitura, adicionadas pelo professor */}
        {(aluno.fotos_evolucao||[]).length > 0 && (
          <div style={{ marginTop:20 }}>
            <p style={{ margin:"0 0 12px", fontSize:15, fontWeight:800, color:T.text }}>📸 Minha evolução</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {(aluno.fotos_evolucao||[]).slice().reverse().map((f,i)=>(
                <div key={f.path||i} style={{ background:T.card2, borderRadius:12, overflow:"hidden", border:`1px solid ${T.border}` }}>
                  <img src={f.url} alt="" style={{ width:"100%", height:150, objectFit:"cover", display:"block" }}/>
                  <div style={{ padding:"8px 10px" }}>
                    <p style={{ margin:0, color:T.text3, fontSize:12, fontWeight:700 }}>{f.data}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Avaliações físicas — somente leitura */}
        {(aluno.avaliacoes||[]).length > 0 && (
          <div style={{ marginTop:20 }}>
            <p style={{ margin:"0 0 12px", fontSize:15, fontWeight:800, color:T.text }}>📏 Minhas avaliações</p>
            {(aluno.avaliacoes||[]).slice().reverse().slice(0,3).map((av,i)=>(
              <Card key={av.id||i} style={{ padding:"13px 16px", marginBottom:10, borderLeft:`3px solid ${T.blue}` }}>
                <p style={{ margin:"0 0 8px", fontSize:13, fontWeight:700, color:T.text }}>{av.data}</p>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {av.peso && <span style={{ background:T.blue+"22", color:T.blue, borderRadius:20, padding:"2px 10px", fontSize:12, fontWeight:700 }}>⚖️ {av.peso}kg</span>}
                  {av.bf && <span style={{ background:T.purple+"22", color:T.purple, borderRadius:20, padding:"2px 10px", fontSize:12, fontWeight:700 }}>🔥 {av.bf}% gordura</span>}
                  {av.cintura && <span style={{ background:T.yellowDim, color:T.yellow, borderRadius:20, padding:"2px 10px", fontSize:12, fontWeight:700 }}>C:{av.cintura}cm</span>}
                </div>
                {av.obs && <p style={{ margin:"6px 0 0", color:T.text2, fontSize:12, fontStyle:"italic" }}>{av.obs}</p>}
              </Card>
            ))}
          </div>
        )}
      </div>
    );

    // ── PAGAMENTOS
    return (
      <div style={{ textAlign:"center", paddingTop:40 }}>
        <p style={{ fontSize:40, marginBottom:12 }}>💳</p>
        <p style={{ color:T.text, fontSize:16, fontWeight:700 }}>Pagamentos</p>
        <p style={{ color:T.text3, fontSize:14, marginTop:8 }}>Entre em contato com a academia pelo WhatsApp.</p>
        <a href="https://wa.me/5511999999999?text=Olá, preciso de ajuda com meu pagamento." target="_blank" rel="noopener noreferrer" style={{ display:"inline-flex", alignItems:"center", gap:8, marginTop:20, background:"#25D36622", border:"1px solid #25D36644", borderRadius:12, padding:"12px 20px", color:"#25D366", textDecoration:"none", fontWeight:700, fontSize:14 }}>
          <Ic n="whatsapp" size={18} color="#25D366"/> Falar no WhatsApp
        </a>
      </div>
    );
  };

  return (
    <div style={{ maxWidth:430, margin:"0 auto", background:T.bg, minHeight:"100vh", fontFamily:"system-ui,-apple-system,sans-serif", position:"relative" }}>
      {menuOpen && <div onClick={()=>setMenuOpen(false)} style={{ position:"fixed", inset:0, background:"#000C", zIndex:40, maxWidth:430, margin:"0 auto" }}/>}
      {/* Sidebar */}
      <div style={{ position:"fixed", top:0, left:menuOpen?"max(0px,calc(50vw - 215px))":"max(-290px,calc(50vw - 505px))", width:260, height:"100%", background:"#0D0D00", borderRight:`1px solid ${T.yellow}22`, zIndex:50, transition:"left 0.3s cubic-bezier(.4,0,.2,1)", overflowY:"auto" }}>
        <div style={{ background:`linear-gradient(135deg,#1A1500,#0D0D00)`, padding:"32px 20px 20px", borderBottom:`1px solid ${T.yellow}22` }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:48, height:48, borderRadius:50, background:T.gold, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>💪</div>
            <div><p style={{ margin:0, fontSize:15, fontWeight:900, color:T.text }}>{aluno.nome}</p><YBadge text={`✦ ${aluno.plano}`} color={T.yellow}/></div>
          </div>
        </div>
        <div style={{ padding:"10px 0" }}>
          {SIDE_MENU.map(it=>(
            <div key={it.label} onClick={()=>{setTab(it.tab);setMenuOpen(false);}} style={{ display:"flex", alignItems:"center", gap:14, padding:"13px 20px", cursor:"pointer", borderLeft:tab===it.tab?`3px solid ${T.yellow}`:"3px solid transparent", background:tab===it.tab?`${T.yellow}08`:"transparent" }}>
              <Ic n={it.icon} size={18} color={tab===it.tab?T.yellow:T.text3}/>
              <span style={{ fontSize:14, color:tab===it.tab?T.text:T.text2, fontWeight:tab===it.tab?700:400 }}>{it.label}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Header */}
      <div style={{ position:"sticky", top:0, zIndex:30, background:"#0A0A0AEE", backdropFilter:"blur(14px)", borderBottom:`1px solid ${T.border}`, padding:"14px 20px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <button onClick={()=>setMenuOpen(!menuOpen)} style={{ background:"none", border:"none", cursor:"pointer", padding:0 }}><Ic n={menuOpen?"x":"menu"} size={22} color={T.text}/></button>
        <span style={{ fontSize:15, fontWeight:800, color:T.text }}>{TAB_TITLES[tab]||"IMPÉRIO"}</span>
        <button style={{ background:"none", border:"none", cursor:"pointer", padding:0, position:"relative" }}><Ic n="bell" size={22} color={T.text}/><span style={{ position:"absolute", top:-2, right:-2, width:8, height:8, background:T.red, borderRadius:50, border:`2px solid ${T.bg}` }}/></button>
      </div>
      {/* Content */}
      <div style={{ padding:"20px 16px 100px" }}>{renderTab()}</div>
      {/* Bottom Nav */}
      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, background:"#0D0D00EE", borderTop:`1px solid ${T.yellow}22`, display:"flex", padding:"8px 0 16px", zIndex:30, backdropFilter:"blur(14px)" }}>
        {BOT_NAV.map(it=>{
          const active=tab===it.id;
          return (
            <button key={it.id} onClick={()=>setTab(it.id)} style={{ flex:1, background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:4, padding:"4px 0" }}>
              <div style={{ width:active?34:26, height:active?34:26, borderRadius:active?10:50, background:active?T.gold:"transparent", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s", boxShadow:active?`0 4px 14px ${T.yellow}55`:"none" }}>
                <Ic n={it.icon} size={16} color={active?T.bg:T.text3}/>
              </div>
              <span style={{ fontSize:10, color:active?T.yellow:T.text3, fontWeight:active?800:400 }}>{it.label}</span>
            </button>
          );
        })}
      </div>
      {/* WhatsApp FAB */}
      <a href="https://wa.me/5511999999999?text=Olá, preciso de ajuda pelo app da academia." target="_blank" rel="noopener noreferrer" style={{ position:"fixed", bottom:90, right:"max(20px,calc(50vw - 195px))", width:52, height:52, borderRadius:50, background:"linear-gradient(135deg,#25D366,#128C7E)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 20px #25D36688", zIndex:35, textDecoration:"none" }}>
        <Ic n="whatsapp" size={26} color={T.text}/>
      </a>
    </div>
  );
};

// ─── ROOT ─────────────────────────────────────────────────────────────────────

// ─── ALUNO APP FIREBASE WRAPPER ───────────────────────────────────────────────
// Carrega dados do aluno em tempo real do Firestore
const AlunoAppFirebase = ({ alunoId, onLogout }) => {
  const [aluno, setAluno] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!alunoId) return;
    const unsub = onSnapshot(doc(db, "alunos", alunoId), snap => {
      if (snap.exists()) setAluno(snap.data());
      setCarregando(false);
    });
    return () => unsub();
  }, [alunoId]);

  const onUpdateAluno = async (updated) => {
    await salvarAluno(updated);
    setAluno(updated);
  };

  if (carregando) return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <p style={{color:T.text3,fontSize:14}}>Carregando seu perfil...</p>
    </div>
  );

  if (!aluno) return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <p style={{color:T.red,fontSize:14}}>Perfil não encontrado.</p>
    </div>
  );

  return <AlunoApp aluno={aluno} onUpdateAluno={onUpdateAluno} onLogout={onLogout}/>;
};

export default function App() {
  const [auth,setAuth]   = useState(null);   // null | {role,id,uid}
  const [alunos,setAlunos] = useState([]);
  const [carregando,setCarregando] = useState(true);

  // ── Auth state listener ──────────────────────────────────────────────────
  useEffect(() => {
    // Check if admin is already logged in locally
    const localAdmin = sessionStorage.getItem("imperio_admin");
    if (localAdmin === "true") {
      setAuth({ role:"admin" });
      setCarregando(false);
    }

    const unsub = onAuthStateChanged(fbAuth, async (user) => {
      // Se admin local já está setado, ignora Firebase
      if (sessionStorage.getItem("imperio_admin") === "true") {
        setCarregando(false);
        return;
      }

      if (!user) { setAuth(null); setCarregando(false); return; }

      // Admin via Firebase Auth (legado)
      if (user.email === "admin@imperio.app") {
        setAuth({ role:"admin", uid:user.uid });
        setCarregando(false);
        return;
      }

      // Aluno: busca dados no Firestore
      const cpf = user.email.replace("@imperio.app","");
      const snap = await getDoc(doc(db,"alunos",cpf));
      if (snap.exists()) {
        setAuth({ role:"aluno", id:cpf, uid:user.uid });
      } else {
        await signOut(fbAuth);
        setAuth(null);
      }
      setCarregando(false);
    });
    return () => unsub();
  }, []);

  // ── Carrega alunos em tempo real quando admin logado ─────────────────────
  useEffect(() => {
    if (!auth || auth.role !== "admin") return;
    const unsub = onSnapshot(collection(db,"alunos"), snap => {
      setAlunos(snap.docs.map(d => d.data()));
    });
    return () => unsub();
  }, [auth]);

  // ── Atualiza aluno no Firestore e no state local ─────────────────────────
  const updateAluno = useCallback(async (aluno) => {
    await salvarAluno(aluno);
    setAlunos(p => p.map(a => a.id === aluno.id ? aluno : a));
  }, []);

  // ── Adiciona aluno (cria auth + salva no Firestore) ──────────────────────
  const addAluno = useCallback(async (novoAluno) => {
    await criarContaAluno(novoAluno.cpf, novoAluno.senha || novoAluno.cpf);
    await salvarAluno({ ...novoAluno, id: novoAluno.cpf });
  }, []);

  // ── Deleta aluno ──────────────────────────────────────────────────────────
  const removerAluno = useCallback(async (id) => {
    await deletarAluno(id);
    setAlunos(p => p.filter(a => a.id !== id));
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const handleLogin = async (role, id) => {
    // Login já gerenciado pelo onAuthStateChanged
    // Esta função é chamada pela LoginScreen após signIn bem-sucedido
  };

  const handleLogout = async () => {
    sessionStorage.removeItem("imperio_admin");
    await signOut(fbAuth);
    setAuth(null);
  };

  // Seta admin local sem Firebase Auth
  const setAuthAdmin = () => {
    sessionStorage.setItem("imperio_admin","true");
    setAuth({ role:"admin" });
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (carregando) return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
      <div style={{width:60,height:60,borderRadius:20,background:T.gold,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,boxShadow:`0 8px 32px ${T.yellow}44`}}>💪</div>
      <p style={{color:T.text3,fontSize:14}}>Carregando IMPÉRIO...</p>
      <div style={{width:40,height:3,background:T.card2,borderRadius:50,overflow:"hidden"}}>
        <div style={{width:"60%",height:"100%",background:T.gold,borderRadius:50,animation:"slide 1s ease-in-out infinite"}}/>
      </div>
    </div>
  );

  if (!auth) return <LoginScreen onLogin={handleLogin} setAuthAdmin={setAuthAdmin} />;

  if (auth.role === "admin") return (
    <AdminPanel
      alunos={alunos}
      setAlunos={setAlunos}
      onAddAluno={addAluno}
      onUpdateAluno={updateAluno}
      onDeleteAluno={removerAluno}
      onLogout={handleLogout}
    />
  );

  // Aluno: busca dados em tempo real do Firestore
  return (
    <AlunoAppFirebase
      alunoId={auth.id}
      onLogout={handleLogout}
    />
  );
}