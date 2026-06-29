import { useState, useRef } from "react";

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
const LoginScreen = ({ onLogin, alunos }) => {
  const [login,setLogin]=useState(""); const [senha,setSenha]=useState(""); const [err,setErr]=useState("");
  const handle = () => {
    if(login==="admin" && senha==="admin@123"){ setErr(""); onLogin("admin",null); return; }
    const aluno = alunos.find(a => a.cpf===login && a.senha===senha);
    if(aluno){ setErr(""); onLogin("aluno",aluno.id); return; }
    setErr("Login ou senha incorretos.");
  };
  return (
    <div style={{ minHeight:"100vh", background:`linear-gradient(160deg,#0A0A0A 0%,#1A1500 100%)`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ width:"100%", maxWidth:380 }}>
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <div style={{ width:80, height:80, borderRadius:24, background:T.gold, margin:"0 auto 16px", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 8px 40px ${T.yellow}55`, fontSize:36 }}>💪</div>
          <h1 style={{ fontSize:32, fontWeight:900, color:T.text, margin:0, letterSpacing:-1 }}>IM<span style={{ color:T.yellow }}>PÉRIO</span></h1>
          <p style={{ color:T.text3, fontSize:13, margin:"6px 0 0" }}>Academia — Plataforma Oficial</p>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <Inp label="CPF / LOGIN" value={login} onChange={v=>{setLogin(v);setErr("");}} placeholder="Digite seu CPF ou login"/>
          <Inp label="SENHA" type="password" value={senha} onChange={v=>{setSenha(v);setErr("");}} placeholder="••••••••"/>
          {err && <div style={{ background:T.redDim, border:`1px solid ${T.red}44`, borderRadius:10, padding:"10px 14px", color:"#FF6666", fontSize:13, display:"flex", gap:8, alignItems:"center" }}><Ic n="info" size={16} color={T.red}/>{err}</div>}
          <button onClick={handle} style={{ background:T.gold, color:T.bg, border:"none", borderRadius:12, padding:16, fontSize:15, fontWeight:900, cursor:"pointer", letterSpacing:1, boxShadow:`0 4px 24px ${T.yellow}44`, marginTop:4 }}>ENTRAR</button>
        </div>
        <p style={{ textAlign:"center", color:T.text3, fontSize:12, marginTop:20 }}>Admin: admin / admin@123 · Aluno: CPF / CPF</p>
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
              <Btn small onClick={()=>setEditEx({id:0,nome:"",series:"3",reps:"12",descanso:"60s",obs:"",img:"",video:"",musculo:""})}><Ic n="plus" size={13} color={T.bg}/>Adicionar</Btn>
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
                    <div style={{ width:72, flexShrink:0 }}><ExIllust name={ex.nome} color={T.yellow} size="thumb"/></div>
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

// ─── ADMIN PANEL ──────────────────────────────────────────────────────────────
const AdminPanel = ({ alunos, setAlunos, onLogout }) => {
  const [subTab,setSubTab]=useState("alunos");
  const [busca,setBusca]=useState("");
  const [alunoSel,setAlunoSel]=useState(null);
  const [showAdd,setShowAdd]=useState(false);
  const [newAluno,setNewAluno]=useState({nome:"",cpf:"",senha:"",telefone:"",email:"",nascimento:"",objetivo:"",obs:"",status:"Ativo",plano:"Basic",since:new Date().toLocaleDateString("pt-BR",{month:"short",year:"numeric"}),treinos:{"Treino A":[]},cardapio:{}});

  if(alunoSel) return (
    <AlunoDetalhe
      aluno={alunoSel}
      onBack={()=>setAlunoSel(null)}
      onSave={(updated)=>{ setAlunos(p=>p.map(a=>a.id===alunoSel.id?{...updated,id:alunoSel.id}:a)); setAlunoSel({...updated,id:alunoSel.id}); }}
      onDelete={(id)=>{ setAlunos(p=>p.filter(a=>a.id!==id)); setAlunoSel(null); }}
    />
  );

  const filtrados=alunos.filter(a=>
    a.nome.toLowerCase().includes(busca.toLowerCase()) ||
    a.cpf.includes(busca) ||
    (a.objetivo||"").toLowerCase().includes(busca.toLowerCase())
  );

  const addAluno=()=>{
    if(!newAluno.nome.trim()||!newAluno.cpf.trim()) return;
    const id=newAluno.cpf;
    setAlunos(p=>[...p,{...newAluno,id,senha:newAluno.senha||newAluno.cpf}]);
    setNewAluno({nome:"",cpf:"",senha:"",telefone:"",email:"",nascimento:"",objetivo:"",obs:"",status:"Ativo",plano:"Basic",since:new Date().toLocaleDateString("pt-BR",{month:"short",year:"numeric"}),treinos:{"Treino A":[]},cardapio:{}});
    setShowAdd(false);
  };

  const ADMIN_TABS=[{id:"alunos",l:"👥 Alunos"},{id:"dashboard",l:"📊 Dashboard"},{id:"config",l:"⚙️ Config"}];

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
          <div style={{ display:"flex", gap:10, marginTop:8 }}>
            <Btn onClick={()=>setShowAdd(false)} outline style={{ flex:1 }}>Cancelar</Btn>
            <Btn onClick={addAluno} style={{ flex:2, color:T.bg }}>✓ Cadastrar aluno</Btn>
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

const AlunoApp = ({ aluno }) => {
  const [tab,setTab]=useState("inicio");
  const [menuOpen,setMenuOpen]=useState(false);
  const [exSel,setExSel]=useState(null);
  const [done,setDone]=useState([]);
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
      if(exSel) return (
        <div>
          <button onClick={()=>setExSel(null)} style={{ background:"none", border:"none", color:T.text3, cursor:"pointer", display:"flex", alignItems:"center", gap:6, marginBottom:20, padding:0, fontSize:14 }}><Ic n="back" size={18} color={T.text3}/> Voltar</button>
          <div style={{ borderRadius:20, overflow:"hidden", marginBottom:20, position:"relative", height:180 }}>
            {exSel.img ? <img src={exSel.img} alt={exSel.nome} style={{ width:"100%", height:"100%", objectFit:"cover" }}/> : <ExIllust name={exSel.nome} color={T.yellow} size="hero"/>}
            <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,#0A0A0A 0%,transparent 50%)" }}/>
            <div style={{ position:"absolute", bottom:14, left:16, right:16, display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
              <div><h2 style={{ margin:"0 0 4px", fontSize:20, fontWeight:900, color:T.text }}>{exSel.nome}</h2><p style={{ margin:0, color:"#CCC", fontSize:13 }}>{exSel.musculo}</p></div>
              <YBadge text={treinoAtivo}/>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:16 }}>
            {[{v:exSel.series,l:"Séries"},{v:exSel.reps,l:"Reps"},{v:exSel.descanso,l:"Descanso"}].map(i=>(
              <div key={i.l} style={{ background:T.card2, borderRadius:12, padding:12, textAlign:"center", border:`1px solid ${T.yellow}33` }}>
                <p style={{ margin:0, fontSize:20, fontWeight:900, color:T.yellow }}>{i.v}</p>
                <p style={{ margin:"4px 0 0", fontSize:11, color:T.text3 }}>{i.l}</p>
              </div>
            ))}
          </div>
          {exSel.obs && <Card style={{ padding:14, marginBottom:12, borderLeft:`3px solid ${T.yellow}` }}><p style={{ margin:"0 0 6px", fontSize:13, fontWeight:700, color:T.text }}>📋 Observações</p><p style={{ margin:0, color:T.text2, fontSize:13 }}>{exSel.obs}</p></Card>}
          {exSel.video && <a href={exSel.video} target="_blank" rel="noopener noreferrer" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, width:"100%", background:T.redDim, border:`1px solid ${T.red}44`, borderRadius:12, padding:13, fontSize:14, fontWeight:700, color:T.red, textDecoration:"none", marginBottom:10, boxSizing:"border-box" }}><Ic n="play" size={18} color={T.red}/> Assistir vídeo tutorial</a>}
          <button onClick={()=>{setDone(p=>p.includes(exSel.id)?p.filter(x=>x!==exSel.id):[...p,exSel.id]);setExSel(null);}} style={{ width:"100%", background:done.includes(exSel.id)?T.greenDim:T.gold, color:done.includes(exSel.id)?T.green:T.bg, border:done.includes(exSel.id)?`1px solid ${T.green}`:"none", borderRadius:12, padding:14, fontSize:14, fontWeight:900, cursor:"pointer" }}>
            {done.includes(exSel.id)?"✓ Concluído!":"✓ Marcar como concluído"}
          </button>
        </div>
      );
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
                return (
                  <div key={ex.id} onClick={()=>setExSel(ex)} style={{ background:d?"#0A1000":T.card, borderRadius:16, border:`1px solid ${d?T.green+"33":T.border}`, overflow:"hidden", display:"flex", alignItems:"stretch", cursor:"pointer" }}>
                    <div style={{ width:80, flexShrink:0, opacity:d?0.4:1 }}>
                      {ex.img ? <img src={ex.img} alt={ex.nome} style={{ width:80, height:80, objectFit:"cover", display:"block" }}/> : <ExIllust name={ex.nome} color={T.yellow} size="thumb"/>}
                    </div>
                    <div style={{ flex:1, padding:"10px 12px", display:"flex", flexDirection:"column", justifyContent:"center", gap:3 }}>
                      <p style={{ margin:0, fontSize:14, fontWeight:700, color:d?T.text3:T.text, textDecoration:d?"line-through":"none" }}>{ex.nome}</p>
                      {ex.musculo && <p style={{ margin:0, color:T.text3, fontSize:12 }}>{ex.musculo}</p>}
                      <p style={{ margin:0, color:T.text3, fontSize:12 }}>{ex.series}x{ex.reps} · {ex.descanso}</p>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", paddingRight:12 }}>{d?<Ic n="check" size={18} color={T.green}/>:<Ic n="chevR" size={16} color={T.text3}/>}</div>
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
export default function App() {
  const [alunos,setAlunos]=useState(initAlunos);
  const [auth,setAuth]=useState(null);

  if(!auth) return <LoginScreen onLogin={(role,id)=>setAuth({role,id})} alunos={alunos}/>;

  if(auth.role==="admin") return (
    <AdminPanel
      alunos={alunos}
      setAlunos={setAlunos}
      onLogout={()=>setAuth(null)}
    />
  );

  const aluno=alunos.find(a=>a.id===auth.id);
  if(!aluno) return <LoginScreen onLogin={(role,id)=>setAuth({role,id})} alunos={alunos}/>;
  return <AlunoApp aluno={aluno}/>;
}