import { useState, useRef, useEffect, useCallback } from "react";

// ─── FIREBASE CONFIG ──────────────────────────────────────────────────────────
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, getDocs, onSnapshot, serverTimestamp, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAaNDr6O36T_VCCk1p4iK29npFA2o92JwM",
  authDomain: "imperio-academia.firebaseapp.com",
  projectId: "imperio-academia",
  storageBucket: "imperio-academia.firebasestorage.app",
  messagingSenderId: "583980259345",
  appId: "1:583980259345:web:9425a8afb1325a66b779b0"
};

const fbApp  = initializeApp(firebaseConfig);
const fbAuth = getAuth(fbApp);
const db     = getFirestore(fbApp);

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
const ExImg = ({ nome, musculo, cor, style={} }) => {
  const [imgOk, setImgOk] = useState(true);
  const src = getExImg(nome);
  if (src && imgOk) {
    return (
      <img src={src} alt={nome} onError={()=>setImgOk(false)}
        style={{ width:"100%", height:"100%", objectFit:"cover", display:"block", ...style }}/>
    );
  }
  return <AnatomiaExercicio nome={nome} cor={cor||(GRUPOS_CORES[musculo]||T.yellow)}/>;
};

// ─── BIBLIOTECA DE EXERCÍCIOS ─────────────────────────────────────────────────
const GRUPOS_CORES = {
  "Peito":"#E31B1B","Costas":"#9B59B6","Ombros":"#3498DB","Bíceps":"#27AE60",
  "Tríceps":"#E91E63","Abdômen":"#F39C12","Quadríceps":"#F5C518","Posterior de Coxa":"#FF6B35",
  "Glúteos":"#FF6B35","Panturrilha":"#1ABC9C","Cardio":"#E74C3C","Alongamentos":"#2ECC71",
};
const GRUPOS_EMOJI = {
  "Peito":"💪","Costas":"🔙","Ombros":"🏋️","Bíceps":"💪","Tríceps":"🤜",
  "Abdômen":"🎯","Quadríceps":"🦵","Posterior de Coxa":"🦵","Glúteos":"🍑",
  "Panturrilha":"🦶","Cardio":"🏃","Alongamentos":"🧘",
};

// Anatomical SVG illustrations - body silhouette with highlighted muscles
const AnatomySVG = ({ grupo, color="#F5C518", size=88 }) => {
  const h = size === "card" ? 120 : size;
  const w = size === "card" ? 88 : size;
  // Body silhouette parts
  const body = (
    <>
      {/* Head */}
      <ellipse cx="50" cy="16" rx="10" ry="12" fill="#2a2a2a" stroke="#333" strokeWidth="0.5"/>
      {/* Neck */}
      <rect x="45" y="27" width="10" height="8" rx="2" fill="#2a2a2a"/>
      {/* Torso */}
      <path d="M30 35 L20 95 L35 95 L38 75 L50 78 L62 75 L65 95 L80 95 L70 35 Z" fill="#222" stroke="#333" strokeWidth="0.5"/>
      {/* Arms */}
      <path d="M30 38 L15 70 L20 72 L32 48 Z" fill="#2a2a2a"/>
      <path d="M70 38 L85 70 L80 72 L68 48 Z" fill="#2a2a2a"/>
      {/* Forearms */}
      <path d="M15 70 L10 95 L18 95 L20 72 Z" fill="#2a2a2a"/>
      <path d="M85 70 L90 95 L82 95 L80 72 Z" fill="#2a2a2a"/>
      {/* Legs */}
      <path d="M35 95 L30 145 L44 145 L50 115 L56 145 L70 145 L65 95 Z" fill="#2a2a2a"/>
      {/* Lower legs */}
      <path d="M30 145 L28 175 L38 175 L44 145 Z" fill="#2a2a2a"/>
      <path d="M56 145 L62 175 L72 175 L70 145 Z" fill="#2a2a2a"/>
    </>
  );

  const highlights = {
    "Peito": <path d="M32 38 L68 38 L70 60 L65 65 L50 68 L35 65 L30 60 Z" fill={color} opacity="0.85"/>,
    "Costas": <path d="M31 38 L69 38 L67 68 L62 72 L50 74 L38 72 L33 68 Z" fill={color} opacity="0.8"/>,
    "Ombros": <><ellipse cx="27" cy="42" rx="10" ry="8" fill={color} opacity="0.85"/><ellipse cx="73" cy="42" rx="10" ry="8" fill={color} opacity="0.85"/></>,
    "Bíceps": <><path d="M18 48 L30 46 L32 62 L18 64 Z" fill={color} opacity="0.85"/><path d="M70 46 L82 48 L82 64 L68 62 Z" fill={color} opacity="0.85"/></>,
    "Tríceps": <><path d="M14 50 L20 48 L18 70 L12 68 Z" fill={color} opacity="0.85"/><path d="M80 48 L86 50 L88 68 L82 70 Z" fill={color} opacity="0.85"/></>,
    "Abdômen": <><rect x="38" y="60" width="24" height="8" rx="3" fill={color} opacity="0.85"/><rect x="38" y="71" width="24" height="8" rx="3" fill={color} opacity="0.85"/><rect x="38" y="82" width="24" height="8" rx="3" fill={color} opacity="0.85"/></>,
    "Quadríceps": <><path d="M35 95 L44 95 L46 138 L31 138 Z" fill={color} opacity="0.85"/><path d="M56 95 L65 95 L69 138 L54 138 Z" fill={color} opacity="0.85"/></>,
    "Posterior de Coxa": <><path d="M36 95 L44 95 L43 135 L33 135 Z" fill={color} opacity="0.8"/><path d="M56 95 L64 95 L67 135 L57 135 Z" fill={color} opacity="0.8"/></>,
    "Glúteos": <path d="M33 88 L67 88 L68 100 L62 105 L50 107 L38 105 L32 100 Z" fill={color} opacity="0.85"/>,
    "Panturrilha": <><path d="M29 145 L38 145 L36 172 L27 172 Z" fill={color} opacity="0.85"/><path d="M62 145 L71 145 L73 172 L62 172 Z" fill={color} opacity="0.85"/></>,
    "Cardio": <><ellipse cx="44" cy="56" rx="10" ry="13" fill={color} opacity="0.7"/><ellipse cx="56" cy="56" rx="10" ry="13" fill={color} opacity="0.7"/><path d="M34 56 Q50 76 66 56" fill={color} opacity="0.6"/></>,
    "Alongamentos": <><path d="M32 38 L68 38 L70 95 L30 95 Z" fill={color} opacity="0.3"/><path d="M33 95 L35 138 L65 138 L67 95 Z" fill={color} opacity="0.3"/></>,
  };

  return (
    <svg width={w} height={h} viewBox="0 0 100 185" style={{ display:"block", background:T.bg2, borderRadius:8 }}>
      <rect width="100" height="185" fill={T.bg2}/>
      {/* Subtle grid */}
      <line x1="50" y1="0" x2="50" y2="185" stroke="#1a1a1a" strokeWidth="0.5"/>
      <line x1="0" y1="92" x2="100" y2="92" stroke="#1a1a1a" strokeWidth="0.5"/>
      {body}
      {highlights[grupo] || <ellipse cx="50" cy="92" rx="30" ry="30" fill={color} opacity="0.3"/>}
      {/* Label */}
      <text x="50" y="182" textAnchor="middle" fill={color} fontSize="5" fontWeight="bold">{grupo?.toUpperCase()}</text>
    </svg>
  );
};

const BIBLIOTECA = [
  { id:"p1",grupo:"Peito",nome:"Supino Reto com Barra",principais:["Peitoral maior"],secundarios:["Tríceps","Deltóide anterior"],
    desc:"Exercício fundamental para desenvolvimento do peitoral com sobrecarga elevada.",
    passos:["Deite no banco com os pés apoiados no chão","Segure a barra com pegada maior que a largura dos ombros","Desça a barra controladamente até tocar o peito","Empurre a barra para cima expirando o ar","Mantenha os cotovelos a 45° do corpo"],
    erros:["Quicar a barra no peito","Tirar os pés do chão","Arquear excessivamente a lombar"],
    cuidados:["Use trava de segurança","Tenha um parceiro de treino","Mantenha as escápulas retraídas"],
    series:"4",reps:"10-12",descanso:"90s",video:"" },
  { id:"p2",grupo:"Peito",nome:"Supino Inclinado com Halteres",principais:["Peitoral superior"],secundarios:["Tríceps","Deltóide anterior"],
    desc:"Foca na porção superior do peitoral, dando volume na parte de cima do peito.",
    passos:["Ajuste o banco a 30-45°","Segure os halteres ao lado do peito","Empurre para cima e levemente para dentro","Desça controladamente","Mantenha a curvatura natural da coluna"],
    erros:["Banco muito inclinado (>45°)","Descida rápida sem controle"],
    cuidados:["Peça ajuda para posicionar os halteres","Escápulas sempre retraídas"],
    series:"3-4",reps:"10-12",descanso:"75s",video:"" },
  { id:"p3",grupo:"Peito",nome:"Crucifixo com Halteres",principais:["Peitoral maior"],secundarios:["Deltóide anterior"],
    desc:"Isolamento do peitoral com grande amplitude, ótimo para definição.",
    passos:["Deite no banco com halteres acima do peito","Abra os braços em arco controlado","Desça até sentir o alongamento","Feche como se abraçasse uma árvore","Mantenha leve flexão nos cotovelos"],
    erros:["Braços completamente estendidos","Descer demais","Carga muito pesada"],
    cuidados:["Mantenha cotovelos levemente flexionados","Movimento de arco, não de press"],
    series:"3",reps:"12-15",descanso:"60s",video:"" },
  { id:"p4",grupo:"Peito",nome:"Crossover no Cabo",principais:["Peitoral maior"],secundarios:["Deltóide anterior"],
    desc:"Cabo mantém tensão constante no peitoral durante todo o movimento.",
    passos:["Polias na altura dos ombros","Segure as alças e dê um passo à frente","Traga as mãos para o centro cruzando levemente","Controle o retorno","Tronco levemente inclinado"],
    erros:["Usar o impulso do corpo","Não cruzar as mãos no final"],
    cuidados:["Core ativado","Não trancar os cotovelos"],
    series:"3",reps:"12-15",descanso:"60s",video:"" },
  { id:"p5",grupo:"Peito",nome:"Mergulho no Paralelo (Fundos)",principais:["Peitoral inferior","Tríceps"],secundarios:["Deltóide anterior"],
    desc:"Composto de peso corporal para peitoral inferior e tríceps com grande amplitude.",
    passos:["Apoie nas barras paralelas","Incline o tronco para frente","Desça até os cotovelos chegarem a 90°","Suba estendendo completamente","Para mais peitoral, incline mais o tronco"],
    erros:["Não inclinar o tronco","Descer demais lesionando o ombro"],
    cuidados:["Iniciantes usem banco de apoio","Não desça além de 90° nos cotovelos"],
    series:"3-4",reps:"8-12",descanso:"90s",video:"" },
  // COSTAS
  { id:"c1",grupo:"Costas",nome:"Puxada Frontal na Polia",principais:["Latíssimo do dorso"],secundarios:["Bíceps","Rombóides"],
    desc:"Principal exercício para largura das costas, criando o formato em V.",
    passos:["Prenda os joelhos sob o suporte","Pegada larga pronada","Puxe até a altura do queixo","Controle o retorno","Peito alto durante o movimento"],
    erros:["Puxar atrás da nuca","Usar demais o bíceps","Curvar a coluna"],
    cuidados:["Inicie o movimento com a escápula","Cotovelhos apontados para baixo"],
    series:"4",reps:"10-12",descanso:"75s",video:"" },
  { id:"c2",grupo:"Costas",nome:"Remada Curvada com Barra",principais:["Latíssimo","Rombóides","Trapézio"],secundarios:["Bíceps"],
    desc:"Composto de alta intensidade para espessura e densidade das costas.",
    passos:["Incline o tronco a 45° com costas retas","Pegada pronada","Puxe em direção ao umbigo","Contraia as escápulas ao final","Desça controladamente"],
    erros:["Curvar a lombar","Usar impulso do tronco","Puxar muito alto"],
    cuidados:["Coluna neutra","Core sempre contraído","Use cinto para cargas pesadas"],
    series:"4",reps:"8-12",descanso:"90s",video:"" },
  { id:"c3",grupo:"Costas",nome:"Remada Unilateral com Halter",principais:["Latíssimo","Rombóides"],secundarios:["Bíceps"],
    desc:"Unilateral que permite maior amplitude e correção de desequilíbrios.",
    passos:["Apoie joelho e mão no banco","Segure o halter com braço estendido","Puxe em direção ao quadril","Gire levemente o tronco no final","Controle a descida"],
    erros:["Rotar demais o tronco","Puxar com bíceps","Não completar a amplitude"],
    cuidados:["Coluna paralela ao chão","Foco no cotovelo","Retraia a escápula no topo"],
    series:"3-4",reps:"10-12 cada",descanso:"60s",video:"" },
  { id:"c4",grupo:"Costas",nome:"Levantamento Terra",principais:["Eretores","Glúteos","Isquiotibiais"],secundarios:["Trapézio","Quadríceps"],
    desc:"Exercício mais completo da musculação, trabalhando a cadeia posterior inteira.",
    passos:["Barra sobre o meio do pé","Segure com pegada mista ou dupla pronada","Coluna neutra, peito alto","Empurre o chão subindo quadril e tronco juntos","Estenda completamente ao final"],
    erros:["Arredondar a lombar (altamente lesivo)","Barra afastada do corpo","Quadril subindo antes do tronco"],
    cuidados:["Nunca arredonde a lombar","Use cinto para cargas pesadas","Domine a técnica antes de aumentar carga"],
    series:"4",reps:"5-8",descanso:"120s",video:"" },
  { id:"c5",grupo:"Costas",nome:"Pulldown com Triângulo",principais:["Latíssimo do dorso"],secundarios:["Bíceps","Peitoral menor"],
    desc:"Variação da puxada com pegada neutra, maior conforto nos ombros.",
    passos:["Polia alta com triângulo","Puxe até o peito","Cotovelhos apontam para baixo","Controle o retorno","Peito alto e escápulas retraídas"],
    erros:["Inclinar demais para trás","Soltar a carga no retorno"],
    cuidados:["Pegada neutra é mais segura para os ombros","Foco no latíssimo"],
    series:"3",reps:"12-15",descanso:"60s",video:"" },
  // OMBROS
  { id:"o1",grupo:"Ombros",nome:"Desenvolvimento com Halteres",principais:["Deltóide medial","Deltóide anterior"],secundarios:["Trapézio","Tríceps"],
    desc:"Principal exercício para desenvolvimento da massa e largura dos ombros.",
    passos:["Sentado ou em pé com costas apoiadas","Halteres na altura dos ombros","Empurre para cima","Desça controladamente","Core ativado durante todo o movimento"],
    erros:["Arquear a lombar","Subir os ombros","Usar impulso do tronco"],
    cuidados:["Não hiper-estenda a lombar","Escápulas estabilizadas"],
    series:"4",reps:"10-12",descanso:"75s",video:"" },
  { id:"o2",grupo:"Ombros",nome:"Elevação Lateral com Halteres",principais:["Deltóide medial"],secundarios:["Trapézio superior"],
    desc:"Isolamento para deltóide médio, essencial para amplitude de ombros.",
    passos:["Em pé com halteres ao lado","Eleve os braços lateralmente até a altura dos ombros","Polegar levemente mais baixo que o mindinho","Controle a descida por 2-3 segundos","Leve flexão nos cotovelos"],
    erros:["Usar o trapézio (encolher o ombro)","Levantar acima dos ombros","Impulso das pernas"],
    cuidados:["Carga leve a moderada","Foco na queima do deltóide médio"],
    series:"3-4",reps:"12-15",descanso:"60s",video:"" },
  { id:"o3",grupo:"Ombros",nome:"Desenvolvimento Arnold",principais:["Deltóide (todas as cabeças)"],secundarios:["Trapézio","Tríceps"],
    desc:"Ativa as três cabeças do deltóide em um único movimento.",
    passos:["Halteres na frente do rosto, palmas para você","Gire os halteres para fora enquanto sobe","No topo, palmas para frente","Inverta na descida","Movimento fluido e controlado"],
    erros:["Fazer muito rápido","Carga excessiva","Arquear a lombar"],
    cuidados:["Use carga menor que o desenvolvimento tradicional","Excelente variação"],
    series:"3-4",reps:"10-12",descanso:"75s",video:"" },
  { id:"o4",grupo:"Ombros",nome:"Elevação Frontal",principais:["Deltóide anterior"],secundarios:["Peitoral superior"],
    desc:"Isola a porção anterior do deltóide.",
    passos:["Em pé com halteres na frente das coxas","Eleve até a altura dos ombros","Palma da mão voltada para baixo","Controle a descida","Cotovelos levemente flexionados"],
    erros:["Levantar acima dos ombros","Usar o impulso do tronco"],
    cuidados:["O ombro anterior já recebe estímulo no supino","Use carga moderada"],
    series:"3",reps:"12-15",descanso:"60s",video:"" },
  { id:"o5",grupo:"Ombros",nome:"Encolhimento (Shrug)",principais:["Trapézio superior"],secundarios:["Levantador da escápula"],
    desc:"Exercício específico para o trapézio superior.",
    passos:["Em pé com halteres ou barra","Eleve os ombros em direção às orelhas","Segure 1-2 segundos no topo","Desça controladamente","Não role os ombros"],
    erros:["Rolar os ombros","Usar impulso","Não completar a amplitude"],
    cuidados:["Movimento vertical, não circular","Cuidado com histórico de pescoço"],
    series:"3-4",reps:"12-15",descanso:"60s",video:"" },
  // BÍCEPS
  { id:"b1",grupo:"Bíceps",nome:"Rosca Direta com Barra",principais:["Bíceps braquial"],secundarios:["Braquial","Braquiorradial"],
    desc:"Exercício clássico e mais eficiente para o bíceps.",
    passos:["Em pé com barra em pegada supinada","Cotovelhos fixos ao tronco","Flexione trazendo a barra até os ombros","Contraia no topo por 1 segundo","Desça até a extensão quase completa"],
    erros:["Mover os cotovelos para frente","Usar impulso das costas","Não completar a descida"],
    cuidados:["Cotovelhos fixos são essenciais","Só os antebraços se movem"],
    series:"3-4",reps:"10-12",descanso:"60s",video:"" },
  { id:"b2",grupo:"Bíceps",nome:"Rosca Alternada com Halteres",principais:["Bíceps braquial"],secundarios:["Braquial"],
    desc:"Permite supinação completa para máxima contração do bíceps.",
    passos:["Em pé ou sentado com halteres ao lado","Inicie com palma voltada para o corpo","Flexione o cotovelo girando o antebraço","Palma sobe no topo (supinação)","Alterne os braços"],
    erros:["Não supinar o antebraço","Mover o cotovelo para frente","Balançar o tronco"],
    cuidados:["A supinação diferencia de uma simples flexão","Não perca a tensão na descida"],
    series:"3",reps:"10-12 cada",descanso:"60s",video:"" },
  { id:"b3",grupo:"Bíceps",nome:"Rosca Martelo",principais:["Braquiorradial","Braquial"],secundarios:["Bíceps braquial"],
    desc:"Foca no braquial e braquiorradial, criando espessura no braço.",
    passos:["Pegada neutra (como martelo)","Cotovelhos fixos ao tronco","Flexione sem girar os pulsos","Suba até próximo ao ombro","Desça controladamente"],
    erros:["Girar o pulso no movimento","Usar o impulso"],
    cuidados:["Pegada neutra durante todo o movimento","Trabalha o antebraço também"],
    series:"3",reps:"12-15",descanso:"60s",video:"" },
  { id:"b4",grupo:"Bíceps",nome:"Rosca Concentrada",principais:["Bíceps (pico)"],secundarios:["Braquial"],
    desc:"Máximo isolamento para o pico do bíceps.",
    passos:["Sente com pés afastados","Cotovelo interno na coxa interna","Flexione trazendo o peso ao ombro","Gire o pulso para fora no topo","Descida controlada"],
    erros:["Mover o cotovelo do apoio","Carga muito pesada"],
    cuidados:["O cotovelo não deve sair do apoio","Excelente para pico do bíceps"],
    series:"3",reps:"12-15",descanso:"45s",video:"" },
  // TRÍCEPS
  { id:"t1",grupo:"Tríceps",nome:"Tríceps Pulley (Corda)",principais:["Tríceps (cabeça lateral)"],secundarios:["Tríceps (cabeça longa e medial)"],
    desc:"Exercício mais popular para tríceps com tensão constante.",
    passos:["Polia alta com corda","Cotovelhos fixos ao tronco","Empurre para baixo estendendo os cotovelos","Abra a corda ao final","Controle o retorno até 90°"],
    erros:["Mover os cotovelos","Inclinar demais o tronco","Não abrir a corda"],
    cuidados:["Cotovelhos grudados ao corpo","Foco na extensão completa"],
    series:"3-4",reps:"12-15",descanso:"60s",video:"" },
  { id:"t2",grupo:"Tríceps",nome:"Tríceps Testa com Barra EZ",principais:["Tríceps (cabeça longa)"],secundarios:["Tríceps (cabeças medial e lateral)"],
    desc:"Foca na cabeça longa do tríceps, responsável pelo volume.",
    passos:["Deite no banco com a barra EZ acima do peito","Cotovelhos apontados para o teto","Dobre os cotovelos trazendo a barra à testa","Estenda completamente","Cotovelhos na mesma posição"],
    erros:["Mover os cotovelos para o lado","Descer abaixo da testa","Carga excessiva"],
    cuidados:["Barra EZ é mais segura para os pulsos","Tenha um spotter"],
    series:"3",reps:"10-12",descanso:"60s",video:"" },
  { id:"t3",grupo:"Tríceps",nome:"Extensão Overhead com Halter",principais:["Tríceps (cabeça longa)"],secundarios:["Tríceps (lateral e medial)"],
    desc:"Alonga e trabalha a cabeça longa na amplitude máxima.",
    passos:["Em pé ou sentado com um halter","Eleve acima da cabeça","Dobre os cotovelos abaixando atrás da cabeça","Estenda completamente para cima","Cotovelhos paralelos à cabeça"],
    erros:["Abrir os cotovelos","Carga muito pesada","Não completar a extensão"],
    cuidados:["Cotovelhos sempre paralelos","Ótimo para cabeça longa"],
    series:"3",reps:"12-15",descanso:"60s",video:"" },
  { id:"t4",grupo:"Tríceps",nome:"Mergulho no Banco",principais:["Tríceps braquial"],secundarios:["Deltóide anterior","Peitoral"],
    desc:"Peso corporal eficiente para tríceps.",
    passos:["Mãos no banco atrás do corpo","Pernas estendidas ou dobradas","Desça até ~90° nos cotovelos","Empurre para cima estendendo os braços","Cotovelos apontando para trás"],
    erros:["Cotovelos abertos para os lados","Descer muito baixo","Não completar a extensão"],
    cuidados:["Para mais dificuldade, coloque peso nas coxas","Ombros longe das orelhas"],
    series:"3-4",reps:"12-15",descanso:"60s",video:"" },
  // ABDÔMEN
  { id:"ab1",grupo:"Abdômen",nome:"Prancha Abdominal",principais:["Reto abdominal","Transverso"],secundarios:["Oblíquos","Glúteos"],
    desc:"Isométrico fundamental para estabilidade do core.",
    passos:["Apoie nos antebraços e pontas dos pés","Corpo em linha reta","Contraia abdômen e glúteos","Olhar para o chão","Respire de forma controlada"],
    erros:["Quadril muito alto ou baixo","Prender a respiração","Pescoço em tensão"],
    cuidados:["Comece com 20-30 segundos","Progrida até 60s+","Corpo como uma tábua"],
    series:"3-4",reps:"30-60s",descanso:"30s",video:"" },
  { id:"ab2",grupo:"Abdômen",nome:"Crunch Abdominal",principais:["Reto abdominal superior"],secundarios:["Oblíquos"],
    desc:"Clássico para a porção superior do abdômen.",
    passos:["Deitado com joelhos dobrados","Mãos atrás da cabeça sem puxar","Eleve os ombros contraindo o abdômen","Segure 1-2 segundos no topo","Desça sem largar a tensão"],
    erros:["Puxar o pescoço","Subir o tronco inteiro","Não contrair o abdômen"],
    cuidados:["Movimento pequeno, foco na contração","Pressione a lombar no chão"],
    series:"3-4",reps:"15-20",descanso:"45s",video:"" },
  { id:"ab3",grupo:"Abdômen",nome:"Russian Twist",principais:["Oblíquos"],secundarios:["Reto abdominal"],
    desc:"Rotacional que trabalha oblíquos intensamente.",
    passos:["Tronco inclinado 45°, joelhos dobrados","Segure peso ou mãos juntas","Gire o tronco de lado a lado","Toque próximo ao quadril em cada lado","Abdômen contraído"],
    erros:["Rotar apenas com os braços","Não inclinar o tronco","Fazer muito rápido"],
    cuidados:["Para avançado, erga os pés","Movimento parte do tronco"],
    series:"3",reps:"20 (10 cada)",descanso:"45s",video:"" },
  { id:"ab4",grupo:"Abdômen",nome:"Elevação de Pernas",principais:["Reto inferior","Flexores do quadril"],secundarios:["Oblíquos"],
    desc:"Trabalha a porção inferior do abdômen.",
    passos:["Deitado com mãos sob o cóccix","Eleve as pernas estendidas até 90°","Desça lentamente sem encostar no chão","Lombar pressionada no chão","Avançado: banco declinado"],
    erros:["Lombar arquear","Usar o impulso","Dobrar demais os joelhos"],
    cuidados:["Lombar sempre no chão","Comece com joelhos dobrados"],
    series:"3",reps:"12-15",descanso:"45s",video:"" },
  { id:"ab5",grupo:"Abdômen",nome:"Abdominal Bicicleta",principais:["Oblíquos","Reto abdominal"],secundarios:["Flexores do quadril"],
    desc:"Dinâmico que combina rotação e flexão.",
    passos:["Deitado, mãos atrás da cabeça","Joelhos dobrados a 90°","Cotovelo direito ao joelho esquerdo e vice-versa","Movimento de pedalada","Lombar pressionada no chão"],
    erros:["Puxar o pescoço","Fazer muito rápido","Não rotar o tronco"],
    cuidados:["Movimento lento e controlado","Foco na rotação"],
    series:"3",reps:"20 (10 cada)",descanso:"45s",video:"" },
  // QUADRÍCEPS
  { id:"q1",grupo:"Quadríceps",nome:"Agachamento Livre com Barra",principais:["Quadríceps","Glúteos"],secundarios:["Isquiotibiais","Core"],
    desc:"Rainha dos exercícios para o trem inferior.",
    passos:["Barra no trapézio, pés na largura dos ombros","Pontas dos pés levemente abertas","Desça com tronco ereto e joelhos alinhados","Até a dobra do quadril ficar abaixo dos joelhos","Suba empurrando com os calcanhares"],
    erros:["Joelhos colapsando","Calcanhar saindo do chão","Lombar arredondada"],
    cuidados:["Domine sem carga primeiro","Use cinto para cargas pesadas","Mobilidade é fundamental"],
    series:"4-5",reps:"8-12",descanso:"120s",video:"" },
  { id:"q2",grupo:"Quadríceps",nome:"Leg Press 45°",principais:["Quadríceps","Glúteos"],secundarios:["Isquiotibiais"],
    desc:"Grande carga para o trem inferior em posição segura.",
    passos:["Pés na plataforma, afastamento médio","Solte as travas e dobre os joelhos até 90°","Empurre até quase estender","Não trave os joelhos completamente","Lombar sempre apoiada"],
    erros:["Descer demais curvando o cóccix","Joelhos colapsando","Travar os joelhos"],
    cuidados:["Não trave os joelhos","Pés na largura do quadril para foco em quádriceps"],
    series:"4",reps:"10-15",descanso:"90s",video:"" },
  { id:"q3",grupo:"Quadríceps",nome:"Cadeira Extensora",principais:["Quadríceps (isolamento)"],secundarios:["Reto femoral"],
    desc:"Único isolamento verdadeiro para quadríceps.",
    passos:["Ajuste encosto e rolo na parte inferior da perna","Estenda os joelhos até quase 180°","Contraia no topo","Desça lentamente por 3-4 segundos","Não deixe o peso cair"],
    erros:["Usar impulso para subir","Descer muito rápido"],
    cuidados:["Joelhos com problemas: cuidado","Excêntrica lenta para mais ganho"],
    series:"3-4",reps:"12-15",descanso:"60s",video:"" },
  { id:"q4",grupo:"Quadríceps",nome:"Avanço (Lunge) com Halteres",principais:["Quadríceps","Glúteos"],secundarios:["Isquiotibiais","Core"],
    desc:"Funcional unilateral para força e equilíbrio.",
    passos:["Em pé com halteres","Dê um passo largo para frente","Desça até o joelho traseiro quase tocar o chão","Joelho da frente não ultrapassa os dedos","Suba e alterne"],
    erros:["Joelho da frente ultrapassando os pés","Tronco muito inclinado","Joelhos colapsando"],
    cuidados:["Tronco ereto","Olhar à frente","Ótimo para desequilíbrios"],
    series:"3-4",reps:"10-12 cada",descanso:"60s",video:"" },
  // POSTERIOR DE COXA
  { id:"pc1",grupo:"Posterior de Coxa",nome:"Mesa Flexora",principais:["Isquiotibiais"],secundarios:["Gastrocnêmio"],
    desc:"Principal isolamento para isquiotibiais.",
    passos:["Deite de bruços com rolo acima dos calcanhares","Dobre os joelhos trazendo os pés ao glúteo","Contraia no topo","Desça lentamente excêntrico","Não levante o quadril"],
    erros:["Levantar o quadril","Usar impulso","Descer rápido"],
    cuidados:["Excêntrica lenta é fundamental","Rolo no tendão calcâneo"],
    series:"3-4",reps:"12-15",descanso:"60s",video:"" },
  { id:"pc2",grupo:"Posterior de Coxa",nome:"Stiff com Halteres",principais:["Isquiotibiais","Glúteo maior"],secundarios:["Eretores"],
    desc:"Alonga e fortalece isquiotibiais em grande amplitude.",
    passos:["Em pé com halteres na frente","Incline o tronco empurrando o quadril para trás","Pernas semi-estendidas","Desça sentindo o alongamento","Suba estendendo o quadril"],
    erros:["Arredondar a lombar","Dobrar demais os joelhos","Não empurrar o quadril para trás"],
    cuidados:["Coluna neutra obrigatória","Sinta o alongamento nos isquiotibiais"],
    series:"3-4",reps:"10-12",descanso:"75s",video:"" },
  { id:"pc3",grupo:"Posterior de Coxa",nome:"Cadeira Flexora",principais:["Isquiotibiais"],secundarios:["Gastrocnêmio"],
    desc:"Versão sentada para isquiotibiais.",
    passos:["Rolo na parte de trás do tornozelo","Dobre os joelhos trazendo os pés para baixo","Contraia no topo","Desça controladamente","Costas no encosto"],
    erros:["Levantar o quadril","Fazer muito rápido"],
    cuidados:["Complementar à mesa flexora","Ótima para pós-reabilitação"],
    series:"3",reps:"12-15",descanso:"60s",video:"" },
  { id:"pc4",grupo:"Posterior de Coxa",nome:"RDL (Romanian Deadlift)",principais:["Isquiotibiais","Glúteos"],secundarios:["Eretores","Adutores"],
    desc:"Variação do terra com ênfase nos isquiotibiais e glúteos.",
    passos:["Em pé com barra ou halteres","Joelhos ligeiramente flexionados","Incline o tronco com coluna neutra","Desça até a altura das canelas","Suba contraindo os isquiotibiais"],
    erros:["Arredondar a lombar","Dobrar demais os joelhos","Não manter coluna neutra"],
    cuidados:["Diferença do stiff: mais flexão de joelho","Amplitude controlada"],
    series:"3-4",reps:"10-12",descanso:"75s",video:"" },
  // GLÚTEOS
  { id:"g1",grupo:"Glúteos",nome:"Hip Thrust com Barra",principais:["Glúteo maior"],secundarios:["Isquiotibiais","Core"],
    desc:"Exercício mais eficiente para o glúteo máximo.",
    passos:["Escápulas apoiadas em banco resistente","Barra sobre os quadris com proteção","Pés afastados, dobrados a 90°","Eleve o quadril com os calcanhares","Contraia fortemente no topo por 2 segundos"],
    erros:["Quadril não chega ao paralelo","Não contrair no topo","Hiperextender a lombar"],
    cuidados:["Banco deve ser estável","Use proteção para a barra","Foco na contração glútea"],
    series:"4",reps:"10-15",descanso:"75s",video:"" },
  { id:"g2",grupo:"Glúteos",nome:"Agachamento Sumô",principais:["Glúteos","Adutores","Quadríceps"],secundarios:["Isquiotibiais"],
    desc:"Base larga aumenta recrutamento de glúteos e adutores.",
    passos:["Pés bem afastados, pontas abertas 45-60°","Desça com tronco ereto","Joelhos acompanham as pontas dos pés","Suba empurrando joelhos para fora","Contraia os glúteos ao subir"],
    erros:["Joelhos colapsando","Tronco muito inclinado"],
    cuidados:["Aquecimento de quadril importante","Ótimo para foco em glúteos"],
    series:"3-4",reps:"12-15",descanso:"75s",video:"" },
  { id:"g3",grupo:"Glúteos",nome:"Elevação Pélvica",principais:["Glúteo maior","Isquiotibiais"],secundarios:["Core"],
    desc:"Versão de peso corporal do Hip Thrust.",
    passos:["Deitado com joelhos dobrados e pés apoiados","Braços ao lado","Eleve o quadril contraindo os glúteos","Segure 2 segundos no topo","Desça lentamente"],
    erros:["Não contrair os glúteos","Hiperextender a lombar"],
    cuidados:["Progressão para Hip Thrust","Pode ser feito em casa"],
    series:"3-4",reps:"15-20",descanso:"45s",video:"" },
  { id:"g4",grupo:"Glúteos",nome:"Abdução de Quadril na Máquina",principais:["Glúteo médio e mínimo"],secundarios:["TFL","Piriforme"],
    desc:"Para o glúteo médio e mínimo, responsáveis pela firmeza lateral.",
    passos:["Sente-se com joelhos nas almofadas","Abra os joelhos contra a resistência","Contraia o glúteo médio no topo","Retorne controlando","Não use impulso"],
    erros:["Impulso do tronco","Não completar a amplitude"],
    cuidados:["Ótimo para finalização","Pode ser feito com elástico"],
    series:"3-4",reps:"15-20",descanso:"45s",video:"" },
  // PANTURRILHA
  { id:"pan1",grupo:"Panturrilha",nome:"Elevação de Calcanhares em Pé",principais:["Gastrocnêmio"],secundarios:["Sóleo"],
    desc:"Principal exercício para a cabeça maior da panturrilha.",
    passos:["Pontas dos pés em um degrau","Desça os calcanhares abaixo do nível","Eleve na ponta dos pés o máximo","Segure 1-2 segundos no topo","Desça lentamente completando o alongamento"],
    erros:["Não completar o alongamento na descida","Fazer muito rápido"],
    cuidados:["Panturrilha precisa de amplitude e volume","Excêntrica lenta é fundamental"],
    series:"4",reps:"15-20",descanso:"45s",video:"" },
  { id:"pan2",grupo:"Panturrilha",nome:"Elevação de Calcanhares Sentado",principais:["Sóleo"],secundarios:["Gastrocnêmio"],
    desc:"Isola o sóleo com o joelho dobrado.",
    passos:["Sentado com resistência sobre os joelhos","Pontas dos pés apoiadas","Desça os calcanhares completamente","Eleve ao máximo","Segure 1-2 segundos"],
    erros:["Não completar o alongamento","Carga excessiva sem amplitude"],
    cuidados:["Sóleo diferente do gastrocnêmio","Ambos os exercícios são complementares"],
    series:"3-4",reps:"15-20",descanso:"45s",video:"" },
  // CARDIO
  { id:"car1",grupo:"Cardio",nome:"HIIT na Esteira",principais:["Sistema cardiovascular","MMII"],secundarios:["Core"],
    desc:"Intervalado de alta intensidade para máxima queima de gordura.",
    passos:["Aquecimento: 5 min moderado","Sprint: 30-40s na velocidade máxima sustentável","Recuperação: 90s em caminhada","Repita 8-12 ciclos","Desaquecimento: 5 min de caminhada"],
    erros:["Pular o aquecimento","Velocidade muito alta","Não se hidratar"],
    cuidados:["Máximo 3x por semana","Não no mesmo dia de pernas pesadas"],
    series:"8-12 ciclos",reps:"30s sprint + 90s recuperação",descanso:"Ver descrição",video:"" },
  { id:"car2",grupo:"Cardio",nome:"Corrida Leve (Steady State)",principais:["Sistema cardiovascular"],secundarios:["MMII"],
    desc:"Cardio estável para oxidação de gordura e saúde cardiovascular.",
    passos:["FC alvo: 60-70% da FC máxima","Ritmo de conversa","Duração: 30-50 minutos","Postura ereta, passada natural","Respiração rítmica"],
    erros:["Intensidade muito baixa","Intensidade muito alta","Postura curvada"],
    cuidados:["Calçado adequado","Hidratação constante"],
    series:"1",reps:"30-50 minutos",descanso:"N/A",video:"" },
  { id:"car3",grupo:"Cardio",nome:"Pular Corda",principais:["Sistema cardiovascular","Coordenação"],secundarios:["Panturrilha","Ombros"],
    desc:"Alta eficiência cardiovascular com melhora de coordenação.",
    passos:["Segure as alças na altura do quadril","Salte levemente com as duas pernas","Pulso faz o movimento circular","Pouso na ponta dos pés","Comece com 30s e aumente"],
    erros:["Usar os braços demais","Saltar muito alto"],
    cuidados:["Superfície amortecida","Ótimo para aquecimento"],
    series:"4-6",reps:"30-60s",descanso:"30s",video:"" },
  // ALONGAMENTOS
  { id:"al1",grupo:"Alongamentos",nome:"Alongamento de Isquiotibiais",principais:["Isquiotibiais"],secundarios:["Lombar","Panturrilha"],
    desc:"Fundamental para flexibilidade da cadeia posterior.",
    passos:["Sente com pernas estendidas","Incline o tronco para frente com coluna reta","Segure os pés ou canelas","Mantenha 20-30 segundos","Aprofunde a cada expiração"],
    erros:["Curvar a lombar","Puxar com força","Prender a respiração"],
    cuidados:["Nunca force além do limite","Ideal após o treino"],
    series:"2-3",reps:"20-30s cada",descanso:"N/A",video:"" },
  { id:"al2",grupo:"Alongamentos",nome:"Alongamento de Quadríceps",principais:["Quadríceps"],secundarios:["Flexores do quadril"],
    desc:"Essencial para saúde dos joelhos e flexibilidade anterior.",
    passos:["Em pé, dobre um joelho trazendo o pé ao glúteo","Segure o tornozelo","Joelhos alinhados","Empurre levemente o quadril para frente","20-30 segundos cada lado"],
    erros:["Separar os joelhos","Inclinar o tronco para frente"],
    cuidados:["Apoio em parede se necessário","Realize após treino de pernas"],
    series:"2-3",reps:"20-30s cada",descanso:"N/A",video:"" },
  { id:"al3",grupo:"Alongamentos",nome:"Alongamento de Peitoral",principais:["Peitoral maior"],secundarios:["Deltóide anterior"],
    desc:"Importante após treino de peito, melhora a postura.",
    passos:["Entrelace as mãos atrás das costas","Eleve levemente os braços","Abra o peito e empurre ombros para trás","Cabeça neutra","20-30 segundos"],
    erros:["Inclinar demais para frente","Tensão no pescoço"],
    cuidados:["Também em uma porta","Realize diariamente para postura"],
    series:"2-3",reps:"20-30s",descanso:"N/A",video:"" },
  { id:"al4",grupo:"Alongamentos",nome:"Gato-Vaca (Coluna)",principais:["Eretores","Latíssimo"],secundarios:["Trapézio","Rombóides"],
    desc:"Dinâmico para toda a coluna, alivia tensão.",
    passos:["Em quatro apoios","Gato: arqueie as costas para cima, queixo no peito","Vaca: abaixe as costas, eleve a cabeça","Alterne lenta e ritmicamente","8-10 repetições"],
    erros:["Fazer muito rápido","Não completar o arco"],
    cuidados:["Ideal para aquecimento e finalização","Excelente para lombar"],
    series:"2-3",reps:"10 ciclos",descanso:"N/A",video:"" },
];

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
const LoginScreen = ({ onLogin }) => {
  const [login,setLogin]=useState("");
  const [senha,setSenha]=useState("");
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);

  const handle = async () => {
    if(!login.trim()||!senha.trim()){setErr("Preencha login e senha.");return;}
    setLoading(true); setErr("");
    try {
      if(login.trim()==="admin"){
        await signInWithEmailAndPassword(fbAuth,"admin@imperio.app",senha);
      } else {
        const cpf = login.replace(/\D/g,"");
        await signInWithEmailAndPassword(fbAuth,`${cpf}@imperio.app`,senha);
      }
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

  const TABS=[{id:"info",l:"📋 Dados"},{id:"treinos",l:"🏋️ Treinos"},{id:"cardapio",l:"🥗 Cardápio"}];

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
                    <div style={{ width:72, flexShrink:0 }}><ExImg nome={ex.nome} musculo={ex.musculo} style={{width:72,height:72}}/></div>
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

// ─── BIBLIOTECA ADMIN (browse + edit exercises) ───────────────────────────────
const BibliotecaAdmin = () => {
  const [customExs, setCustomExs] = useState([]);
  const [grupoFiltro, setGrupoFiltro] = useState("Todos");
  const [busca, setBusca] = useState("");
  const [exSel, setExSel] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const todos = [...BIBLIOTECA, ...customExs];
  const grupos = ["Todos", ...Object.keys(GRUPOS_CORES)];
  const filtrados = todos.filter(ex => {
    const matchG = grupoFiltro==="Todos" || ex.grupo===grupoFiltro;
    const matchB = !busca || ex.nome.toLowerCase().includes(busca.toLowerCase()) || ex.grupo.toLowerCase().includes(busca.toLowerCase());
    return matchG && matchB;
  });

  const saveCustom = (ex) => {
    if(ex.id && customExs.find(e=>e.id===ex.id)) setCustomExs(p=>p.map(e=>e.id===ex.id?ex:e));
    else setCustomExs(p=>[...p,{...ex,id:"custom_"+Date.now()}]);
    setShowAdd(false); setExSel(null);
  };

  if(showAdd || (exSel && customExs.find(e=>e.id===exSel?.id))) {
    const base = showAdd ? {nome:"",grupo:"Peito",principais:[],secundarios:[],desc:"",passos:[""],erros:[""],cuidados:[""],series:"3",reps:"12",descanso:"60s",video:""} : exSel;
    return <ExercicioEditor ex={base} onSave={saveCustom} onBack={()=>{setShowAdd(false);setExSel(null);}}/>;
  }

  if(exSel) {
    const cor = GRUPOS_CORES[exSel.grupo]||T.yellow;
    return (
      <div>
        <button onClick={()=>setExSel(null)} style={{ background:"none", border:"none", color:T.text3, cursor:"pointer", display:"flex", alignItems:"center", gap:6, marginBottom:16, padding:0, fontSize:14 }}><Ic n="back" size={18} color={T.text3}/>Biblioteca</button>
        <div style={{ display:"flex", gap:14, alignItems:"center", marginBottom:20, padding:14, background:T.bg2, borderRadius:14 }}>
          <div style={{width:80,height:80,borderRadius:8,overflow:"hidden",flexShrink:0}}><ExImg nome={exSel.nome} musculo={exSel.grupo} style={{width:80,height:80}}/></div>
          <div style={{ flex:1 }}>
            <YBadge text={exSel.grupo} color={cor}/>
            <h3 style={{ margin:"6px 0 4px", fontSize:18, fontWeight:900, color:T.text }}>{exSel.nome}</h3>
            <p style={{ margin:0, color:T.text3, fontSize:12 }}>{exSel.principais?.join(" · ")}</p>
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
        <Card style={{ padding:14, marginBottom:12 }}>
          <p style={{ margin:"0 0 6px", fontSize:13, fontWeight:700, color:T.text }}>Descrição</p>
          <p style={{ margin:0, color:T.text2, fontSize:13, lineHeight:1.6 }}>{exSel.desc}</p>
        </Card>
        <Card style={{ padding:14, marginBottom:12 }}>
          <p style={{ margin:"0 0 10px", fontSize:13, fontWeight:700, color:T.text }}>📋 Execução passo a passo</p>
          {exSel.passos?.map((p,i)=>(
            <div key={i} style={{ display:"flex", gap:8, marginBottom:6 }}>
              <span style={{ width:20, height:20, borderRadius:50, background:cor+"22", color:cor, fontSize:10, fontWeight:900, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{i+1}</span>
              <p style={{ margin:0, color:T.text2, fontSize:13 }}>{p}</p>
            </div>
          ))}
        </Card>
        {exSel.erros?.length>0 && <Card style={{ padding:14, marginBottom:12, borderLeft:`3px solid ${T.red}` }}>
          <p style={{ margin:"0 0 8px", fontSize:13, fontWeight:700, color:T.red }}>❌ Erros comuns</p>
          {exSel.erros.map((e,i)=><p key={i} style={{ margin:"0 0 4px", color:T.text2, fontSize:13 }}>• {e}</p>)}
        </Card>}
        {exSel.cuidados?.length>0 && <Card style={{ padding:14, marginBottom:16, borderLeft:`3px solid ${T.yellow}` }}>
          <p style={{ margin:"0 0 8px", fontSize:13, fontWeight:700, color:T.yellow }}>⚠️ Cuidados de postura</p>
          {exSel.cuidados.map((c,i)=><p key={i} style={{ margin:"0 0 4px", color:T.text2, fontSize:13 }}>• {c}</p>)}
        </Card>}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <div>
          <p style={{ margin:0, fontSize:16, fontWeight:900, color:T.text }}>📚 Biblioteca de Exercícios</p>
          <p style={{ margin:"2px 0 0", color:T.text3, fontSize:12 }}>{todos.length} exercícios pré-cadastrados</p>
        </div>
        <Btn small onClick={()=>setShowAdd(true)} style={{ color:T.bg }}><Ic n="plus" size={13} color={T.bg}/>Novo</Btn>
      </div>
      <div style={{ position:"relative", marginBottom:10 }}>
        <div style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)" }}><Ic n="search" size={15} color={T.text3}/></div>
        <input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Buscar exercício ou músculo..." style={{ width:"100%", background:T.card2, border:`1px solid ${busca?T.yellow:T.border}`, borderRadius:10, padding:"10px 12px 10px 38px", color:T.text, fontSize:13, outline:"none", boxSizing:"border-box" }}/>
      </div>
      <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:8, marginBottom:14 }}>
        {grupos.map(g=>(
          <button key={g} onClick={()=>setGrupoFiltro(g)} style={{ flexShrink:0, background:grupoFiltro===g?(GRUPOS_CORES[g]||T.yellow)+"22":"transparent", border:`1px solid ${grupoFiltro===g?(GRUPOS_CORES[g]||T.yellow):T.border}`, borderRadius:20, padding:"5px 12px", color:grupoFiltro===g?(GRUPOS_CORES[g]||T.yellow):T.text3, fontSize:11, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>
            {g==="Todos"?"Todos":GRUPOS_EMOJI[g]+" "+g}
          </button>
        ))}
      </div>
      <p style={{ color:T.text3, fontSize:12, marginBottom:10 }}>{filtrados.length} resultados</p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {filtrados.map(ex=>{
          const cor = GRUPOS_CORES[ex.grupo]||T.yellow;
          const isCustom = customExs.find(e=>e.id===ex.id);
          return (
            <div key={ex.id} onClick={()=>setExSel(ex)} style={{ background:T.card2, borderRadius:14, overflow:"hidden", border:`1px solid ${isCustom?T.yellow:T.border}`, cursor:"pointer" }}>
              <div style={{ position:"relative" }}>
                <div style={{height:110,overflow:"hidden",background:T.bg2}}><ExImg nome={ex.nome} musculo={ex.grupo} style={{width:"100%",height:110,objectFit:"cover"}}/></div>
                <div style={{ position:"absolute", top:6, left:6 }}><YBadge text={isCustom?"CUSTOM":ex.grupo} color={isCustom?T.yellow:cor}/></div>
              </div>
              <div style={{ padding:"10px 10px 12px" }}>
                <p style={{ margin:"0 0 3px", fontSize:12, fontWeight:800, color:T.text, lineHeight:1.3 }}>{ex.nome}</p>
                <p style={{ margin:"0 0 6px", color:T.text3, fontSize:11 }}>{ex.principais?.[0]}</p>
                <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
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

const ExercicioEditor = ({ ex, onSave, onBack }) => {
  const [f,setF]=useState({...ex, passos:ex.passos||[""], erros:ex.erros||[""], cuidados:ex.cuidados||[""], principais:(ex.principais||[]).join(", "), secundarios:(ex.secundarios||[]).join(", ")});
  const imgRef=useRef();
  const handleImg=(e)=>{ const file=e.target.files[0]; if(!file) return; const r=new FileReader(); r.onload=ev=>setF(p=>({...p,img:ev.target.result})); r.readAsDataURL(file); };
  const listEdit=(field,idx,val)=>setF(p=>({...p,[field]:p[field].map((x,i)=>i===idx?val:x)}));
  const listAdd=(field)=>setF(p=>({...p,[field]:[...p[field],""]}));
  const listRemove=(field,idx)=>setF(p=>({...p,[field]:p[field].filter((_,i)=>i!==idx)}));
  return (
    <div>
      <button onClick={onBack} style={{ background:"none", border:"none", color:T.text3, cursor:"pointer", display:"flex", alignItems:"center", gap:6, marginBottom:16, padding:0, fontSize:14 }}><Ic n="back" size={18} color={T.text3}/>Voltar</button>
      <p style={{ margin:"0 0 16px", fontSize:16, fontWeight:900, color:T.text }}>{ex.id?"Editar exercício":"Novo exercício"}</p>
      <Inp label="NOME DO EXERCÍCIO *" value={f.nome} onChange={v=>setF(p=>({...p,nome:v}))}/>
      <div style={{ marginBottom:12 }}>
        <label style={{ fontSize:11, color:T.text3, fontWeight:700, letterSpacing:0.8, display:"block", marginBottom:5 }}>GRUPO MUSCULAR</label>
        <select value={f.grupo} onChange={e=>setF(p=>({...p,grupo:e.target.value}))} style={{ width:"100%", background:T.card2, border:`1px solid ${T.border}`, borderRadius:10, padding:"12px 10px", color:T.text, fontSize:14, outline:"none" }}>
          {Object.keys(GRUPOS_CORES).map(g=><option key={g} value={g}>{g}</option>)}
        </select>
      </div>
      <Inp label="MÚSCULOS PRINCIPAIS (separados por vírgula)" value={f.principais} onChange={v=>setF(p=>({...p,principais:v}))} placeholder="Ex: Peitoral maior, Deltóide"/>
      <Inp label="MÚSCULOS SECUNDÁRIOS" value={f.secundarios} onChange={v=>setF(p=>({...p,secundarios:v}))} placeholder="Ex: Tríceps, Bíceps"/>
      <Textarea label="DESCRIÇÃO" value={f.desc||""} onChange={v=>setF(p=>({...p,desc:v}))} rows={2}/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:12 }}>
        <Inp label="SÉRIES" value={f.series} onChange={v=>setF(p=>({...p,series:v}))}/>
        <Inp label="REPS" value={f.reps} onChange={v=>setF(p=>({...p,reps:v}))}/>
        <Inp label="DESCANSO" value={f.descanso} onChange={v=>setF(p=>({...p,descanso:v}))}/>
      </div>
      {/* Passos */}
      <div style={{ marginBottom:12 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
          <label style={{ fontSize:11, color:T.text3, fontWeight:700, letterSpacing:0.8 }}>PASSO A PASSO</label>
          <button onClick={()=>listAdd("passos")} style={{ background:T.yellowDim, border:"none", borderRadius:6, padding:"3px 10px", color:T.yellow, fontSize:11, fontWeight:700, cursor:"pointer" }}>+ Adicionar</button>
        </div>
        {f.passos.map((p,i)=>(
          <div key={i} style={{ display:"flex", gap:6, marginBottom:6 }}>
            <span style={{ width:20, height:20, background:T.yellowDim, borderRadius:50, color:T.yellow, fontSize:10, fontWeight:900, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:12 }}>{i+1}</span>
            <input value={p} onChange={e=>listEdit("passos",i,e.target.value)} style={{ flex:1, background:T.card2, border:`1px solid ${T.border}`, borderRadius:8, padding:"10px 10px", color:T.text, fontSize:13, outline:"none" }}/>
            {f.passos.length>1 && <button onClick={()=>listRemove("passos",i)} style={{ background:T.redDim, border:"none", borderRadius:8, width:30, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}><Ic n="x" size={12} color={T.red}/></button>}
          </div>
        ))}
      </div>
      {/* Erros */}
      <div style={{ marginBottom:12 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
          <label style={{ fontSize:11, color:T.text3, fontWeight:700, letterSpacing:0.8 }}>ERROS COMUNS</label>
          <button onClick={()=>listAdd("erros")} style={{ background:T.redDim, border:"none", borderRadius:6, padding:"3px 10px", color:T.red, fontSize:11, fontWeight:700, cursor:"pointer" }}>+ Adicionar</button>
        </div>
        {f.erros.map((e,i)=>(
          <div key={i} style={{ display:"flex", gap:6, marginBottom:6 }}>
            <input value={e} onChange={ev=>listEdit("erros",i,ev.target.value)} placeholder="Ex: Arredondar a lombar" style={{ flex:1, background:T.card2, border:`1px solid ${T.border}`, borderRadius:8, padding:"10px", color:T.text, fontSize:13, outline:"none" }}/>
            {f.erros.length>1 && <button onClick={()=>listRemove("erros",i)} style={{ background:T.redDim, border:"none", borderRadius:8, width:30, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}><Ic n="x" size={12} color={T.red}/></button>}
          </div>
        ))}
      </div>
      {/* Imagem */}
      <div style={{ marginBottom:12 }}>
        <label style={{ fontSize:11, color:T.text3, fontWeight:700, letterSpacing:0.8, display:"block", marginBottom:5 }}>IMAGEM (opcional)</label>
        {f.img && <img src={f.img} alt="" style={{ width:"100%", borderRadius:10, marginBottom:8, maxHeight:120, objectFit:"cover" }}/>}
        <input type="file" accept="image/*" ref={imgRef} style={{ display:"none" }} onChange={handleImg}/>
        <button onClick={()=>imgRef.current.click()} style={{ background:T.card2, border:`1px dashed ${T.border}`, borderRadius:10, padding:"10px 16px", color:T.text3, fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", gap:8, width:"100%" }}>
          <Ic n="upload" size={16} color={T.text3}/>{f.img?"Trocar imagem":"Upload de imagem"}
        </button>
      </div>
      <Inp label="VÍDEO DEMONSTRATIVO (link)" value={f.video||""} onChange={v=>setF(p=>({...p,video:v}))} placeholder="https://youtube.com/..."/>
      <Btn onClick={()=>onSave({...f, principais:f.principais.split(",").map(s=>s.trim()).filter(Boolean), secundarios:f.secundarios.split(",").map(s=>s.trim()).filter(Boolean)})} style={{ width:"100%", color:T.bg, marginTop:8 }}>
        💾 Salvar exercício
      </Btn>
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
                : <ExImg nome={exSel.nome} musculo={exSel.musculo} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
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
                      {ex.img ? <img src={ex.img} alt={ex.nome} style={{ width:80, height:80, objectFit:"cover", display:"block" }}/> : <ExImg nome={ex.nome} musculo={ex.musculo} style={{width:80,height:80}}/>}
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
    const unsub = onAuthStateChanged(fbAuth, async (user) => {
      if (!user) { setAuth(null); setCarregando(false); return; }

      // Admin fixo por email
      if (user.email === "admin@imperio.app") {
        setAuth({ role:"admin", uid:user.uid });
        setCarregando(false);
        return;
      }

      // Aluno: busca dados no Firestore pelo UID ou CPF
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
    await signOut(fbAuth);
    setAuth(null);
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

  if (!auth) return <LoginScreen onLogin={handleLogin} />;

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