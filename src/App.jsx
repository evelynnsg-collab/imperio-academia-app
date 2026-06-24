import { useState } from "react";

// ─── THEME ────────────────────────────────────────────────────────────────────
const T = {
  bg: "#0A0A0A", bg2: "#111111", card: "#161616", card2: "#1C1C1C",
  border: "#252525", border2: "#2E2E2E",
  yellow: "#F5C518", yellowDim: "#F5C51833", yellowHover: "#FFD700",
  red: "#E31B1B", redDim: "#E31B1B22",
  green: "#22C55E", greenDim: "#22C55E22",
  text: "#FFFFFF", text2: "#BBBBBB", text3: "#777777",
  gold: "linear-gradient(135deg, #F5C518, #FFD700)",
  goldDark: "linear-gradient(135deg, #B8960A, #D4AF00)",
};

// ─── SVG ICONS ────────────────────────────────────────────────────────────────
const Ic = ({ n, size = 20, color = "currentColor", style = {} }) => {
  const p = {
    home: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
    dumbbell: <><line x1="6.5" y1="6.5" x2="17.5" y2="17.5"/><path d="M8 6l-4 4 8.5 8.5 4-4"/><path d="M16 8l4 4-8.5 8.5-4-4"/></>,
    leaf: <><path d="M17 8C8 10 5.9 16.17 3.82 22"/><path d="M3.82 22c0-7 8-15 13.46-15 0 2-2 5.5-7 7"/></>,
    user2: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    credit: <><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></>,
    menu: <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>,
    x: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    bell: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
    check: <polyline points="20 6 9 17 4 12"/>,
    play: <><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></>,
    star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
    clock: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    trophy: <><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></>,
    chart: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
    dollar: <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
    lock: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
    back: <><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>,
    chevR: <polyline points="9 18 15 12 9 6"/>,
    info: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
    user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    heart: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>,
    film: <><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="17" y1="7" x2="22" y2="7"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="2" y1="17" x2="7" y2="17"/></>,
    apple: <><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 13.9 5 22 8 22c1.25 0 2.5-1.06 4-1.06z"/><path d="M10 2c1 .5 2 2 2 5"/></>,
    bolt: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>,
    shop: <><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></>,
    award: <><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></>,
    layers: <><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></>,
    target: <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    camera: <><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></>,
    whatsapp: null,
  };
  if (n === "whatsapp") return (
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
const ExIllust = ({ name, color = T.yellow, size = "thumb" }) => {
  const w = size === "hero" ? 400 : 88;
  const h = size === "hero" ? 200 : 88;
  const s = size === "hero" ? 1.55 : 0.34;
  const ills = {
    "Leg Press": <g><rect x="20" y="120" width="220" height="12" rx="4" fill="#444"/><rect x="20" y="80" width="12" height="60" rx="4" fill="#555"/><rect x="228" y="40" width="12" height="100" rx="4" fill="#555"/><rect x="20" y="30" width="12" height="80" rx="4" fill="#666"/><rect x="20" y="30" width="60" height="12" rx="4" fill="#666"/><rect x="50" y="90" width="70" height="14" rx="6" fill="#777"/><rect x="165" y="50" width="65" height="50" rx="6" fill="#666"/><line x1="32" y1="50" x2="180" y2="50" stroke="#555" strokeWidth="6"/><line x1="32" y1="110" x2="180" y2="110" stroke="#555" strokeWidth="6"/><rect x="230" y="40" width="20" height="8" rx="2" fill={color} opacity="0.9"/><rect x="230" y="52" width="20" height="8" rx="2" fill={color} opacity="0.7"/><rect x="230" y="64" width="20" height="8" rx="2" fill={color} opacity="0.5"/><circle cx="75" cy="68" r="12" fill="#DDD"/><line x1="75" y1="80" x2="75" y2="102" stroke="#DDD" strokeWidth="7" strokeLinecap="round"/><line x1="75" y1="102" x2="165" y2="65" stroke="#DDD" strokeWidth="6" strokeLinecap="round"/><line x1="75" y1="102" x2="165" y2="82" stroke="#DDD" strokeWidth="6" strokeLinecap="round"/></g>,
    "Agachamento Livre": <g><rect x="30" y="20" width="10" height="150" rx="4" fill="#555"/><rect x="215" y="20" width="10" height="150" rx="4" fill="#555"/><rect x="30" y="50" width="30" height="8" rx="3" fill="#666"/><rect x="195" y="50" width="30" height="8" rx="3" fill="#666"/><rect x="50" y="82" width="155" height="9" rx="4" fill="#888"/><rect x="44" y="75" width="18" height="22" rx="4" fill={color} opacity="0.9"/><rect x="193" y="75" width="18" height="22" rx="4" fill={color} opacity="0.9"/><circle cx="127" cy="52" r="13" fill="#DDD"/><line x1="127" y1="65" x2="127" y2="88" stroke="#DDD" strokeWidth="8" strokeLinecap="round"/><line x1="100" y1="86" x2="80" y2="86" stroke="#DDD" strokeWidth="6" strokeLinecap="round"/><line x1="154" y1="86" x2="174" y2="86" stroke="#DDD" strokeWidth="6" strokeLinecap="round"/><line x1="127" y1="88" x2="100" y2="118" stroke="#DDD" strokeWidth="7" strokeLinecap="round"/><line x1="127" y1="88" x2="154" y2="118" stroke="#DDD" strokeWidth="7" strokeLinecap="round"/><line x1="100" y1="118" x2="88" y2="148" stroke="#DDD" strokeWidth="7" strokeLinecap="round"/><line x1="154" y1="118" x2="166" y2="148" stroke="#DDD" strokeWidth="7" strokeLinecap="round"/></g>,
    "Supino Reto": <g><rect x="55" y="105" width="150" height="16" rx="7" fill="#777"/><rect x="80" y="121" width="12" height="35" rx="4" fill="#555"/><rect x="168" y="121" width="12" height="35" rx="4" fill="#555"/><rect x="100" y="50" width="10" height="70" rx="4" fill="#555"/><rect x="150" y="50" width="10" height="70" rx="4" fill="#555"/><rect x="40" y="74" width="180" height="9" rx="4" fill="#888"/><rect x="36" y="68" width="20" height="20" rx="4" fill={color} opacity="0.9"/><rect x="204" y="68" width="20" height="20" rx="4" fill={color} opacity="0.9"/><circle cx="128" cy="88" r="12" fill="#DDD"/><line x1="128" y1="100" x2="128" y2="112" stroke="#DDD" strokeWidth="9" strokeLinecap="round"/><line x1="95" y1="78" x2="128" y2="78" stroke="#DDD" strokeWidth="6" strokeLinecap="round"/><line x1="128" y1="78" x2="162" y2="78" stroke="#DDD" strokeWidth="6" strokeLinecap="round"/><line x1="128" y1="108" x2="108" y2="130" stroke="#DDD" strokeWidth="7" strokeLinecap="round"/><line x1="128" y1="108" x2="148" y2="130" stroke="#DDD" strokeWidth="7" strokeLinecap="round"/></g>,
    "Puxada Frente": <g><rect x="20" y="15" width="215" height="12" rx="5" fill="#555"/><rect x="20" y="15" width="12" height="160" rx="4" fill="#444"/><rect x="223" y="15" width="12" height="80" rx="4" fill="#444"/><rect x="90" y="118" width="75" height="14" rx="6" fill="#777"/><rect x="210" y="40" width="22" height="8" rx="2" fill={color} opacity="0.9"/><rect x="210" y="52" width="22" height="8" rx="2" fill={color} opacity="0.7"/><rect x="210" y="64" width="22" height="8" rx="2" fill={color} opacity="0.5"/><circle cx="130" cy="22" r="8" fill="#777"/><line x1="130" y1="30" x2="130" y2="72" stroke="#888" strokeWidth="3"/><line x1="80" y1="70" x2="180" y2="70" stroke="#888" strokeWidth="8" strokeLinecap="round"/><line x1="80" y1="70" x2="70" y2="82" stroke="#888" strokeWidth="7" strokeLinecap="round"/><line x1="180" y1="70" x2="190" y2="82" stroke="#888" strokeWidth="7" strokeLinecap="round"/><circle cx="128" cy="88" r="12" fill="#DDD"/><line x1="128" y1="100" x2="128" y2="122" stroke="#DDD" strokeWidth="8" strokeLinecap="round"/><line x1="78" y1="80" x2="128" y2="96" stroke="#DDD" strokeWidth="6" strokeLinecap="round"/><line x1="128" y1="96" x2="182" y2="80" stroke="#DDD" strokeWidth="6" strokeLinecap="round"/><line x1="128" y1="118" x2="110" y2="142" stroke="#DDD" strokeWidth="7" strokeLinecap="round"/><line x1="128" y1="118" x2="146" y2="142" stroke="#DDD" strokeWidth="7" strokeLinecap="round"/></g>,
    "Rosca Direta": <g><rect x="60" y="108" width="140" height="8" rx="4" fill="#888"/><rect x="52" y="100" width="20" height="24" rx="4" fill={color} opacity="0.9"/><rect x="188" y="100" width="20" height="24" rx="4" fill={color} opacity="0.9"/><circle cx="128" cy="38" r="14" fill="#DDD"/><line x1="128" y1="52" x2="128" y2="95" stroke="#DDD" strokeWidth="10" strokeLinecap="round"/><line x1="128" y1="68" x2="90" y2="80" stroke="#DDD" strokeWidth="7" strokeLinecap="round"/><line x1="90" y1="80" x2="72" y2="112" stroke="#DDD" strokeWidth="7" strokeLinecap="round"/><line x1="128" y1="68" x2="166" y2="80" stroke="#DDD" strokeWidth="7" strokeLinecap="round"/><line x1="166" y1="80" x2="188" y2="112" stroke="#DDD" strokeWidth="7" strokeLinecap="round"/><line x1="128" y1="95" x2="112" y2="140" stroke="#DDD" strokeWidth="8" strokeLinecap="round"/><line x1="128" y1="95" x2="144" y2="140" stroke="#DDD" strokeWidth="8" strokeLinecap="round"/></g>,
    "Prancha": <g><rect x="20" y="158" width="220" height="8" rx="3" fill="#333"/><rect x="30" y="152" width="200" height="8" rx="3" fill="#1a3a2a"/><line x1="60" y1="120" x2="200" y2="120" stroke="#DDD" strokeWidth="12" strokeLinecap="round"/><circle cx="55" cy="112" r="13" fill="#DDD"/><line x1="80" y1="120" x2="72" y2="152" stroke="#DDD" strokeWidth="8" strokeLinecap="round"/><line x1="72" y1="152" x2="100" y2="152" stroke="#DDD" strokeWidth="8" strokeLinecap="round"/><line x1="130" y1="120" x2="122" y2="152" stroke="#DDD" strokeWidth="8" strokeLinecap="round"/><line x1="122" y1="152" x2="150" y2="152" stroke="#DDD" strokeWidth="8" strokeLinecap="round"/><line x1="200" y1="120" x2="200" y2="152" stroke="#DDD" strokeWidth="8" strokeLinecap="round"/><line x1="45" y1="108" x2="210" y2="108" stroke={color} strokeWidth="2" strokeDasharray="6,4" opacity="0.7"/></g>,
    "Esteira": <g><rect x="30" y="140" width="200" height="18" rx="6" fill="#444"/><rect x="25" y="148" width="14" height="20" rx="4" fill="#333"/><rect x="221" y="148" width="14" height="20" rx="4" fill="#333"/><rect x="38" y="126" width="184" height="16" rx="4" fill="#666"/><line x1="38" y1="134" x2="222" y2="134" stroke="#555" strokeWidth="2" strokeDasharray="10,8"/><rect x="80" y="50" width="10" height="90" rx="4" fill="#555"/><rect x="170" y="50" width="10" height="90" rx="4" fill="#555"/><rect x="75" y="48" width="110" height="10" rx="4" fill="#666"/><rect x="100" y="30" width="60" height="32" rx="6" fill="#222"/><rect x="106" y="36" width="48" height="20" rx="4" fill="#0a1f14"/><circle cx="128" cy="70" r="13" fill="#DDD"/><line x1="128" y1="83" x2="128" y2="112" stroke="#DDD" strokeWidth="9" strokeLinecap="round"/><line x1="128" y1="112" x2="145" y2="128" stroke="#DDD" strokeWidth="7" strokeLinecap="round"/><line x1="128" y1="112" x2="108" y2="128" stroke="#DDD" strokeWidth="7" strokeLinecap="round"/><line x1="128" y1="92" x2="145" y2="105" stroke="#DDD" strokeWidth="6" strokeLinecap="round"/><line x1="128" y1="92" x2="110" y2="104" stroke="#DDD" strokeWidth="6" strokeLinecap="round"/></g>,
  };
  const fb = <g><circle cx="128" cy="90" r="50" fill="none" stroke={color} strokeWidth="5" opacity="0.4"/><text x="128" y="82" textAnchor="middle" fill={color} fontSize="24">🏋️</text><text x="128" y="110" textAnchor="middle" fill="#666" fontSize="11">{name?.slice(0,16)}</text></g>;
  return (
    <svg width={w} height={h} viewBox="0 0 256 180" style={{ display:"block", background: T.bg2, borderRadius: size==="thumb"?8:0 }}>
      <rect width="256" height="180" fill={T.bg2}/>
      <g transform={`scale(${s}) translate(${size==="hero"?"-75":"-8"}, ${size==="hero"?"-36":"0"})`}>
        {ills[name] || fb}
      </g>
    </svg>
  );
};

// ─── SHARED UI ────────────────────────────────────────────────────────────────
const Card = ({ children, ch, style={}, onClick }) => (
  <div onClick={onClick} style={{ background:T.card, borderRadius:16, border:`1px solid ${T.border}`, ...style, cursor:onClick?"pointer":"default" }}>{children||ch}</div>
);
const YBadge = ({ text, color=T.yellow }) => (
  <span style={{ background:color+"22", color, border:`1px solid ${color}44`, borderRadius:20, padding:"2px 10px", fontSize:11, fontWeight:700, letterSpacing:0.4 }}>{text}</span>
);
const Sec = ({ title, action, onAction, children, style={} }) => (
  <div style={{ marginBottom:20, ...style }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
      <span style={{ fontSize:16, fontWeight:800, color:T.text, letterSpacing:-0.3 }}>{title}</span>
      {action && <span onClick={onAction} style={{ fontSize:12, color:T.yellow, cursor:"pointer", fontWeight:700 }}>{action}</span>}
    </div>
    {children}
  </div>
);
const StatCard = ({ v, l, icon, color=T.yellow }) => (
  <Card style={{ padding:"14px 10px", textAlign:"center" }} ch={<>
    <Ic n={icon} size={20} color={color}/>
    <p style={{ margin:"8px 0 2px", fontSize:22, fontWeight:900, color:T.text, letterSpacing:-1 }}>{v}</p>
    <p style={{ margin:0, fontSize:10, color:T.text3, letterSpacing:0.3 }}>{l}</p>
  </>}/>
);

// ─── DATA ─────────────────────────────────────────────────────────────────────
const WORKOUTS = [
  { id:1, name:"Agachamento Livre", muscle:"Pernas", sets:4, reps:12, rest:"60s", level:"Intermediário",
    tips:["Core ativado","Joelhos alinhados","Desça até 90°"],
    steps:["Posicione a barra nos ombros","Pés na largura dos ombros","Desça controlando","Suba expirando"]},
  { id:2, name:"Supino Reto", muscle:"Peito", sets:4, reps:10, rest:"90s", level:"Intermediário",
    tips:["Costas no banco","Pegada larga","Movimento controlado"],
    steps:["Deite no banco","Pegue a barra","Desça até o peito","Empurre para cima"]},
  { id:3, name:"Puxada Frente", muscle:"Costas", sets:3, reps:12, rest:"60s", level:"Iniciante",
    tips:["Puxe até o queixo","Ative o latíssimo","Não balance"],
    steps:["Sente-se na máquina","Segure a barra","Puxe até o queixo","Retorne controlado"]},
  { id:4, name:"Rosca Direta", muscle:"Bíceps", sets:3, reps:15, rest:"45s", level:"Iniciante",
    tips:["Cotovelhos fixos","Não use o corpo","Contração no topo"],
    steps:["Fique em pé","Cotovelos junto ao corpo","Suba até o ombro","Desça controlado"]},
  { id:5, name:"Leg Press", muscle:"Pernas", sets:4, reps:15, rest:"60s", level:"Iniciante",
    tips:["Não trave o joelho","Costas na máquina","Amplitude total"],
    steps:["Sente-se e apoie os pés","Solte o suporte","Desça até 90°","Empurre a plataforma"]},
  { id:6, name:"Prancha", muscle:"Abdômen", sets:3, reps:"45s", rest:"30s", level:"Iniciante",
    tips:["Corpo em linha reta","Core contraído","Respire normalmente"],
    steps:["Deite de bruços","Apoie nos antebraços","Eleve o corpo","Mantenha a posição"]},
];
const LIBRARY = [
  { cat:"Pernas", emoji:"🦵", color:T.yellow, exs:["Agachamento Livre","Leg Press","Cadeira Extensora","Mesa Flexora","Stiff","Avanço"] },
  { cat:"Glúteos", emoji:"🍑", color:"#FF6B35", exs:["Hip Thrust","Elevação Pélvica","Glúteo Coice","Agachamento Sumo"] },
  { cat:"Costas", emoji:"💪", color:"#9B59B6", exs:["Puxada Frente","Remada Baixa","Remada Curvada","Levantamento Terra"] },
  { cat:"Peito", emoji:"🏋️", color:"#3498DB", exs:["Supino Reto","Supino Inclinado","Crucifixo","Cross Over"] },
  { cat:"Bíceps", emoji:"💪", color:T.green, exs:["Rosca Direta","Rosca Alternada","Rosca Martelo","Rosca Concentrada"] },
  { cat:"Tríceps", emoji:"🤜", color:"#E91E63", exs:["Tríceps Corda","Tríceps Testa","Extensão Overhead"] },
  { cat:"Abdômen", emoji:"🎯", color:"#F39C12", exs:["Prancha","Crunch","Oblíquo","Russian Twist"] },
  { cat:"Cardio", emoji:"🏃", color:"#00BCD4", exs:["Esteira","Bicicleta","Elíptico","HIIT","Pular Corda"] },
];
const PERSONALS = [
  { id:1, name:"Coach Bruno", spec:"Hipertrofia & Força", exp:"8 anos", rate:100, avail:["SEG","QUA","SEX"], rating:4.9, sessions:142 },
  { id:2, name:"Coach Carla", spec:"Emagrecimento & Funcional", exp:"5 anos", rate:90, avail:["TER","QUI","SAB"], rating:4.8, sessions:98 },
  { id:3, name:"Coach João", spec:"Crossfit & Condicionamento", exp:"6 anos", rate:110, avail:["SEG","TER","QUI","SAB"], rating:5.0, sessions:211 },
];
const NUTRI_VIDEOS = [
  { title:"5 erros que sabotam seu cutting", duration:"6:42", tag:"Emagrecimento", views:"2.3k" },
  { title:"Café da manhã fitness em 10 min", duration:"8:15", tag:"Receitas", views:"4.1k" },
  { title:"Proteínas: quanto você realmente precisa?", duration:"11:30", tag:"Nutrição", views:"3.7k" },
  { title:"Pré-treino natural — o que comer", duration:"5:58", tag:"Performance", views:"1.9k" },
  { title:"Ganho de massa sem gordura", duration:"14:20", tag:"Bulking", views:"5.2k" },
];
const NUTRI_PLANS = [
  { name:"Consulta Avulsa", price:149, desc:"Avaliação completa + plano alimentar para 30 dias", icon:"star" },
  { name:"Acompanhamento Mensal", price:89, desc:"Check-in semanal + ajuste de plano + suporte via chat", icon:"heart" },
  { name:"Pacote Trimestral", price:69, desc:"3 meses de acompanhamento com desconto progressivo", icon:"trophy", badge:"MAIS VENDIDO" },
];
const PAYMENTS = [
  { month:"Jun 2026", val:"R$ 99,90", status:"Pendente", due:"30/06" },
  { month:"Mai 2026", val:"R$ 99,90", status:"Pago", paid:"05/05" },
  { month:"Abr 2026", val:"R$ 99,90", status:"Pago", paid:"03/04" },
  { month:"Mar 2026", val:"R$ 99,90", status:"Pago", paid:"07/03" },
];
const ADMIN_STATS = {
  totalAlunos:487, ativos:431, pendencias:34, receitaMes:"R$ 48.340", receitaApp:"R$ 12.780",
  personalContr:23, nutriContr:41, aulasAgendadas:67,
};

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────
const LoginScreen = ({ onLogin }) => {
  const [email,setEmail]=useState(""); const [pass,setPass]=useState("");
  const [role,setRole]=useState("aluno"); const [err,setErr]=useState("");
  const creds = { aluno:{e:"admin",p:"teste123"}, admin:{e:"admin",p:"admin123"}, instrutor:{e:"instrutor",p:"fit123"} };
  const handle = () => {
    const c = creds[role];
    if(email===c.e && pass===c.p){ setErr(""); onLogin(role); }
    else setErr("E-mail ou senha incorretos.");
  };
  return (
    <div style={{ minHeight:"100vh", background:`linear-gradient(160deg, #0A0A0A 0%, #1A1500 100%)`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ width:"100%", maxWidth:380 }}>
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <div style={{ width:80, height:80, borderRadius:24, background:T.gold, margin:"0 auto 16px", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 8px 40px ${T.yellow}55`, fontSize:36 }}>💪</div>
          <h1 style={{ fontSize:32, fontWeight:900, color:T.text, margin:0, letterSpacing:-1 }}>IM<span style={{ color:T.yellow }}>PÉRIO</span></h1>
          <p style={{ color:T.text3, fontSize:13, margin:"6px 0 0" }}>Academia — Plataforma Oficial</p>
        </div>
        <div style={{ display:"flex", gap:6, marginBottom:20, background:T.card, borderRadius:12, padding:4, border:`1px solid ${T.border}` }}>
          {["aluno","instrutor","admin"].map(r=>(
            <button key={r} onClick={()=>setRole(r)} style={{ flex:1, background:role===r?T.gold:"transparent", color:role===r?T.bg:T.text3, border:"none", borderRadius:9, padding:"8px 4px", fontSize:12, fontWeight:700, cursor:"pointer", textTransform:"capitalize" }}>{r}</button>
          ))}
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div>
            <label style={{ fontSize:11, color:T.text3, fontWeight:700, letterSpacing:1, display:"block", marginBottom:6 }}>E-MAIL / USUÁRIO</label>
            <input type="text" value={email} onChange={e=>{setEmail(e.target.value);setErr("");}} placeholder="usuario" style={{ width:"100%", background:T.card2, border:`1px solid ${err?T.red:T.border}`, borderRadius:12, padding:"14px 16px", color:T.text, fontSize:15, outline:"none", boxSizing:"border-box" }}/>
          </div>
          <div>
            <label style={{ fontSize:11, color:T.text3, fontWeight:700, letterSpacing:1, display:"block", marginBottom:6 }}>SENHA</label>
            <input type="password" value={pass} onChange={e=>{setPass(e.target.value);setErr("");}} onKeyDown={e=>e.key==="Enter"&&handle()} placeholder="••••••••" style={{ width:"100%", background:T.card2, border:`1px solid ${err?T.red:T.border}`, borderRadius:12, padding:"14px 16px", color:T.text, fontSize:15, outline:"none", boxSizing:"border-box" }}/>
          </div>
          {err&&<div style={{ background:T.redDim, border:`1px solid ${T.red}44`, borderRadius:10, padding:"10px 14px", color:"#FF6666", fontSize:13, display:"flex", gap:8, alignItems:"center" }}><Ic n="info" size={16} color={T.red}/>{err}</div>}
          <button onClick={handle} style={{ background:T.gold, color:T.bg, border:"none", borderRadius:12, padding:16, fontSize:15, fontWeight:900, cursor:"pointer", letterSpacing:1, boxShadow:`0 4px 24px ${T.yellow}44`, marginTop:4 }}>ENTRAR</button>
        </div>
        <p style={{ textAlign:"center", color:T.text3, fontSize:12, marginTop:20 }}>
          Credenciais demo — Aluno: admin/teste123 · Admin: admin/admin123
        </p>
      </div>
    </div>
  );
};

// ─── HOME SCREEN ──────────────────────────────────────────────────────────────
const HomeScreen = ({ setTab, setScreen }) => (
  <div style={{ paddingBottom:8 }}>
    {/* Pendência banner */}
    <div style={{ background:`linear-gradient(135deg, ${T.red}18, transparent)`, border:`1px solid ${T.red}44`, borderRadius:14, padding:"12px 16px", marginBottom:20, display:"flex", alignItems:"center", gap:12 }}>
      <div style={{ width:36, height:36, background:T.redDim, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><Ic n="bell" size={18} color={T.red}/></div>
      <div style={{ flex:1 }}><p style={{ margin:0, color:"#FF6666", fontWeight:700, fontSize:13 }}>⚠️ Mensalidade em aberto</p><p style={{ margin:"2px 0 0", color:T.text3, fontSize:12 }}>Vencimento: 30/06/2026 · R$ 99,90</p></div>
      <span onClick={()=>setTab("pagamentos")} style={{ color:T.red, fontSize:12, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>Pagar →</span>
    </div>

    {/* Welcome hero */}
    <div style={{ background:`linear-gradient(135deg, #1A1500, #0D0D00)`, borderRadius:20, padding:20, border:`1px solid ${T.yellow}33`, marginBottom:20 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <p style={{ margin:"0 0 4px", color:T.yellow, fontSize:12, fontWeight:700, letterSpacing:1 }}>BOM DIA 🌤️</p>
          <h2 style={{ margin:"0 0 4px", fontSize:22, fontWeight:900, color:T.text }}>João Silva</h2>
          <p style={{ margin:0, color:T.text3, fontSize:13 }}>Semana 3 do seu programa</p>
        </div>
        <div style={{ textAlign:"center" }}>
          <div style={{ width:56, height:56, borderRadius:50, background:T.gold, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, boxShadow:`0 4px 20px ${T.yellow}55` }}>💪</div>
          <p style={{ margin:"6px 0 0", color:T.yellow, fontSize:10, fontWeight:700 }}>PREMIUM</p>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginTop:16 }}>
        {[{v:"4",l:"treinos/sem"},{v:"87kg",l:"peso atual"},{v:"12%",l:"gordura"}].map(s=>(
          <div key={s.l} style={{ background:"#0A0A00", borderRadius:10, padding:"10px 6px", textAlign:"center", border:`1px solid ${T.yellow}22` }}>
            <p style={{ margin:0, fontSize:18, fontWeight:900, color:T.yellow }}>{s.v}</p>
            <p style={{ margin:0, fontSize:10, color:T.text3 }}>{s.l}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Quick access */}
    <Sec title="Acesso rápido">
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {[
          { icon:"dumbbell", label:"Meu Treino", tab:"treinos", color:T.yellow },
          { icon:"leaf", label:"Nutrição", tab:"nutricao", color:T.green },
          { icon:"user2", label:"Personal", tab:"personal", color:"#9B59B6" },
          { icon:"credit", label:"Pagamentos", tab:"pagamentos", color:"#3498DB" },
        ].map(it=>(
          <Card key={it.label} onClick={()=>setTab(it.tab)} style={{ padding:14, display:"flex", alignItems:"center", gap:12, borderLeft:`3px solid ${it.color}` }} ch={<>
            <div style={{ width:38, height:38, background:it.color+"22", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" }}><Ic n={it.icon} size={18} color={it.color}/></div>
            <span style={{ color:T.text, fontSize:13, fontWeight:700 }}>{it.label}</span>
          </>}/>
        ))}
      </div>
    </Sec>

    {/* Treino do dia */}
    <Sec title="Treino de hoje" action="Ver tudo" onAction={()=>setTab("treinos")}>
      <Card style={{ background:"linear-gradient(135deg, #0D0D00, #161600)", border:`1px solid ${T.yellow}33` }} ch={<>
        <div style={{ padding:"16px 16px 0" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
            <div>
              <p style={{ margin:0, fontSize:18, fontWeight:900, color:T.text }}>Treino A</p>
              <p style={{ margin:"4px 0 0", color:T.text3, fontSize:13 }}>Peito + Tríceps · 6 exercícios</p>
            </div>
            <YBadge text="INTERMEDIÁRIO"/>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
            {[{v:"45",l:"min"},{v:"6",l:"exercícios"},{v:"18",l:"séries"}].map(i=>(
              <div key={i.l} style={{ background:"#050500", borderRadius:10, padding:10, textAlign:"center", border:`1px solid ${T.yellow}22` }}>
                <p style={{ margin:0, fontSize:20, fontWeight:900, color:T.yellow }}>{i.v}</p>
                <p style={{ margin:0, fontSize:10, color:T.text3 }}>{i.l}</p>
              </div>
            ))}
          </div>
        </div>
        <button onClick={()=>setTab("treinos")} style={{ display:"block", width:"100%", background:T.gold, color:T.bg, border:"none", borderRadius:"0 0 16px 16px", padding:"14px", fontSize:14, fontWeight:900, cursor:"pointer", letterSpacing:0.5, marginTop:16 }}>⚡ INICIAR TREINO</button>
      </>}/>
    </Sec>

    {/* Promos */}
    <Sec title="Serviços premium">
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        <Card onClick={()=>setTab("personal")} style={{ background:"linear-gradient(135deg, #150A1A, #111)", border:"1px solid #9B59B633", padding:"14px 16px", display:"flex", alignItems:"center", gap:14 }} ch={<>
          <div style={{ width:44, height:44, background:"#9B59B622", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center" }}><Ic n="user2" size={22} color="#9B59B6"/></div>
          <div style={{ flex:1 }}><p style={{ margin:0, fontSize:15, fontWeight:700, color:T.text }}>Personal Trainer</p><p style={{ margin:"2px 0 0", color:T.text3, fontSize:12 }}>Treine com um especialista · a partir de R$90</p></div>
          <Ic n="chevR" size={16} color={T.text3}/>
        </>}/>
        <Card onClick={()=>setTab("nutricao")} style={{ background:"linear-gradient(135deg, #001A08, #111)", border:"1px solid #22C55E33", padding:"14px 16px", display:"flex", alignItems:"center", gap:14 }} ch={<>
          <div style={{ width:44, height:44, background:T.greenDim, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center" }}><Ic n="leaf" size={22} color={T.green}/></div>
          <div style={{ flex:1 }}><p style={{ margin:0, fontSize:15, fontWeight:700, color:T.text }}>Acompanhamento Nutricional</p><p style={{ margin:"2px 0 0", color:T.text3, fontSize:12 }}>Dra. Ana Paula · a partir de R$69/mês</p></div>
          <Ic n="chevR" size={16} color={T.text3}/>
        </>}/>
      </div>
    </Sec>
  </div>
);

// ─── WORKOUTS SCREEN ──────────────────────────────────────────────────────────
const WorkoutsScreen = () => {
  const [sel,setSel]=useState(null);
  const [done,setDone]=useState([]);
  if(sel){
    const w=sel; const isDone=done.includes(w.id);
    return (
      <div>
        <button onClick={()=>setSel(null)} style={{ background:"none", border:"none", color:T.text3, cursor:"pointer", display:"flex", alignItems:"center", gap:6, marginBottom:20, padding:0, fontSize:14 }}><Ic n="back" size={18} color={T.text3}/> Voltar</button>
        <div style={{ borderRadius:20, overflow:"hidden", marginBottom:20, position:"relative", height:200 }}>
          <ExIllust name={w.name} color={T.yellow} size="hero"/>
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, #0A0A0A 0%, transparent 50%)" }}/>
          <div style={{ position:"absolute", bottom:14, left:16, right:16, display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
            <div><h2 style={{ margin:"0 0 4px", fontSize:22, fontWeight:900, color:T.text }}>{w.name}</h2><p style={{ margin:0, color:T.text2, fontSize:13 }}>{w.muscle}</p></div>
            <YBadge text={w.level}/>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:20 }}>
          {[{v:w.sets,l:"Séries"},{v:w.reps,l:"Reps"},{v:w.rest,l:"Descanso"}].map(i=>(
            <div key={i.l} style={{ background:T.card2, borderRadius:14, padding:14, textAlign:"center", border:`1px solid ${T.yellow}33` }}>
              <p style={{ margin:0, fontSize:22, fontWeight:900, color:T.yellow }}>{i.v}</p>
              <p style={{ margin:"4px 0 0", fontSize:11, color:T.text3 }}>{i.l}</p>
            </div>
          ))}
        </div>
        <Card style={{ padding:16, marginBottom:14 }} ch={<>
          <p style={{ margin:"0 0 12px", fontSize:14, fontWeight:700, color:T.text }}>📋 Como executar</p>
          {w.steps.map((s,i)=>(
            <div key={i} style={{ display:"flex", gap:12, marginBottom:10, alignItems:"flex-start" }}>
              <div style={{ width:24, height:24, background:T.yellowDim, borderRadius:50, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><span style={{ color:T.yellow, fontSize:11, fontWeight:900 }}>{i+1}</span></div>
              <p style={{ margin:0, color:T.text2, fontSize:13, lineHeight:1.5 }}>{s}</p>
            </div>
          ))}
        </>}/>
        <Card style={{ padding:16, borderLeft:`3px solid #F39C12`, marginBottom:14 }} ch={<>
          <p style={{ margin:"0 0 10px", fontSize:14, fontWeight:700, color:T.text }}>⚠️ Cuidados</p>
          {w.tips.map((t,i)=><p key={i} style={{ margin:"0 0 6px", color:T.text2, fontSize:13 }}>• {t}</p>)}
        </>}/>
        <button style={{ width:"100%", background:T.card, color:T.yellow, border:`1px solid ${T.yellow}44`, borderRadius:12, padding:14, fontSize:14, fontWeight:700, cursor:"pointer", marginBottom:10, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
          <Ic n="play" size={18} color={T.yellow}/> Assistir vídeo tutorial
        </button>
        <button onClick={()=>{setDone(p=>isDone?p.filter(x=>x!==w.id):[...p,w.id]);setSel(null);}} style={{ width:"100%", background:isDone?"#0A1A0A":T.gold, color:isDone?T.green:T.bg, border:isDone?`1px solid ${T.green}`:"none", borderRadius:12, padding:14, fontSize:14, fontWeight:900, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
          <Ic n="check" size={18} color={isDone?T.green:T.bg}/>{isDone?"✓ Concluído!":"Concluir exercício"}
        </button>
      </div>
    );
  }
  const prog = done.length/WORKOUTS.length;
  return (
    <div>
      <Card style={{ marginBottom:20, background:"linear-gradient(135deg, #0D0D00, #161600)", border:`1px solid ${T.yellow}33` }} ch={<>
        <div style={{ padding:"16px 16px 0", display:"flex", justifyContent:"space-between" }}>
          <div><p style={{ margin:0, fontSize:18, fontWeight:900, color:T.text }}>Treino A</p><p style={{ margin:"4px 0 0", color:T.text3, fontSize:12 }}>Peito + Tríceps + Ombro</p></div>
          <span style={{ fontSize:30 }}>⚡</span>
        </div>
        <div style={{ padding:"12px 16px 16px" }}>
          <div style={{ background:"#050500", borderRadius:50, height:6, marginBottom:6 }}>
            <div style={{ width:`${prog*100}%`, height:"100%", background:T.gold, borderRadius:50, transition:"width 0.4s" }}/>
          </div>
          <p style={{ margin:0, color:T.text3, fontSize:12 }}>{done.length}/{WORKOUTS.length} exercícios concluídos</p>
        </div>
      </>}/>
      <Sec title="Exercícios">
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {WORKOUTS.map(w=>{
            const d=done.includes(w.id);
            return (
              <div key={w.id} onClick={()=>setSel(w)} style={{ background:d?"#0A1000":T.card, borderRadius:16, border:`1px solid ${d?T.green+"33":T.border}`, overflow:"hidden", display:"flex", alignItems:"stretch", cursor:"pointer" }}>
                <div style={{ width:88, flexShrink:0, opacity:d?0.4:1 }}><ExIllust name={w.name} color={T.yellow} size="thumb"/></div>
                <div style={{ flex:1, padding:"12px 14px", display:"flex", flexDirection:"column", justifyContent:"center", gap:4 }}>
                  <p style={{ margin:0, fontSize:15, fontWeight:700, color:d?T.text3:T.text, textDecoration:d?"line-through":"none" }}>{w.name}</p>
                  <p style={{ margin:0, color:T.text3, fontSize:12 }}>{w.muscle}</p>
                  <p style={{ margin:"2px 0 4px", color:T.text3, fontSize:12 }}>{w.sets}x{w.reps} · Descanso {w.rest}</p>
                  <YBadge text={w.level}/>
                </div>
                <div style={{ display:"flex", alignItems:"center", paddingRight:12 }}>{d?<Ic n="check" size={18} color={T.green}/>:<Ic n="chevR" size={16} color={T.text3}/>}</div>
              </div>
            );
          })}
        </div>
      </Sec>
    </div>
  );
};

// ─── LIBRARY SCREEN ───────────────────────────────────────────────────────────
const LibraryScreen = () => {
  const [cat,setCat]=useState(null);
  if(cat){
    const c=LIBRARY.find(x=>x.cat===cat);
    return (
      <div>
        <button onClick={()=>setCat(null)} style={{ background:"none", border:"none", color:T.text3, cursor:"pointer", display:"flex", alignItems:"center", gap:6, marginBottom:20, padding:0, fontSize:14 }}><Ic n="back" size={18} color={T.text3}/> Categorias</button>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <span style={{ fontSize:32 }}>{c.emoji}</span>
          <h2 style={{ margin:0, color:T.text, fontSize:22, fontWeight:900 }}>{c.cat}</h2>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {c.exs.map(ex=>(
            <div key={ex} style={{ background:T.card, borderRadius:16, border:`1px solid ${T.border}`, overflow:"hidden", display:"flex", alignItems:"stretch" }}>
              <div style={{ width:88, flexShrink:0 }}><ExIllust name={ex} color={c.color} size="thumb"/></div>
              <div style={{ flex:1, padding:"12px 14px", display:"flex", flexDirection:"column", justifyContent:"center", gap:6 }}>
                <p style={{ margin:0, fontSize:15, fontWeight:700, color:T.text }}>{ex}</p>
                <p style={{ margin:0, color:T.text3, fontSize:12 }}>Ver instruções e vídeo</p>
                <button style={{ alignSelf:"flex-start", background:c.color+"22", border:`1px solid ${c.color}44`, borderRadius:8, padding:"5px 12px", color:c.color, fontSize:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
                  <Ic n="play" size={12} color={c.color}/> Vídeo
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div>
      <Card style={{ marginBottom:20, background:"linear-gradient(135deg, #0D0D00,#161616)", border:`1px solid ${T.yellow}22`, padding:20 }} ch={<>
        <p style={{ margin:"0 0 4px", fontSize:18, fontWeight:900, color:T.text }}>📚 Biblioteca de Exercícios</p>
        <p style={{ margin:0, color:T.text3, fontSize:13 }}>{LIBRARY.reduce((a,c)=>a+c.exs.length,0)} exercícios com vídeo tutorial</p>
      </>}/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        {LIBRARY.map(c=>(
          <Card key={c.cat} onClick={()=>setCat(c.cat)} style={{ textAlign:"center", padding:"20px 12px", borderTop:`3px solid ${c.color}` }} ch={<>
            <div style={{ fontSize:30, marginBottom:8 }}>{c.emoji}</div>
            <p style={{ margin:"0 0 4px", fontSize:15, fontWeight:700, color:T.text }}>{c.cat}</p>
            <p style={{ margin:0, fontSize:12, color:T.text3 }}>{c.exs.length} exercícios</p>
          </>}/>
        ))}
      </div>
    </div>
  );
};

// ─── NUTRITION SCREEN ─────────────────────────────────────────────────────────
const NUTRI_ALUNOS = [
  { id:1, name:"João Silva",     obj:"Emagrecimento",   status:"Ativo",    updated:"hoje" },
  { id:2, name:"Maria Santos",   obj:"Ganho de massa",  status:"Ativo",    updated:"ontem" },
  { id:3, name:"Pedro Lima",     obj:"Reeducação",      status:"Pendente", updated:"3 dias" },
  { id:4, name:"Ana Costa",      obj:"Definição",       status:"Ativo",    updated:"hoje" },
  { id:5, name:"Carlos Dias",    obj:"Emagrecimento",   status:"Ativo",    updated:"1 sem" },
  { id:6, name:"Lucia Ferreira", obj:"Ganho de massa",  status:"Ativo",    updated:"2 dias" },
  { id:7, name:"Rafael Souza",   obj:"Performance",     status:"Pendente", updated:"5 dias" },
  { id:8, name:"Fernanda Lima",  obj:"Reeducação",      status:"Ativo",    updated:"ontem" },
];
const REFEICOES = ["Café da manhã","Lanche da manhã","Almoço","Lanche da tarde","Jantar","Ceia"];

const NutritionScreen = () => {
  const [subTab, setSubTab] = useState("alunos");
  const [busca, setBusca] = useState("");
  const [alunoSel, setAlunoSel] = useState(null);
  const [editRefeicao, setEditRefeicao] = useState(null);
  const [cardapios, setCardapios] = useState({});
  const [novaRefeicao, setNovaRefeicao] = useState({ alimento:"", qtd:"", kcal:"", obs:"" });
  const [saved, setSaved] = useState(false);

  const tabs = [{id:"alunos",l:"🥗 Cardápios"},{id:"dicas",l:"💡 Dicas"},{id:"videos",l:"▶️ Vídeos"}];

  const alunosFiltrados = NUTRI_ALUNOS.filter(a =>
    a.name.toLowerCase().includes(busca.toLowerCase()) ||
    a.obj.toLowerCase().includes(busca.toLowerCase())
  );

  const getCardapio = (id) => cardapios[id] || {};
  const getRefeicao = (alunoId, ref) => getCardapio(alunoId)[ref] || [];

  const addItem = (alunoId, ref) => {
    if(!novaRefeicao.alimento.trim()) return;
    setCardapios(prev => {
      const c = { ...prev };
      if(!c[alunoId]) c[alunoId] = {};
      if(!c[alunoId][ref]) c[alunoId][ref] = [];
      c[alunoId][ref] = [...c[alunoId][ref], { ...novaRefeicao, id: Date.now() }];
      return c;
    });
    setNovaRefeicao({ alimento:"", qtd:"", kcal:"", obs:"" });
  };

  const removeItem = (alunoId, ref, itemId) => {
    setCardapios(prev => {
      const c = { ...prev };
      c[alunoId][ref] = c[alunoId][ref].filter(i => i.id !== itemId);
      return c;
    });
  };

  const salvar = () => { setSaved(true); setTimeout(()=>setSaved(false), 2200); };

  // ── Tela de edição de refeição específica ──
  if (alunoSel && editRefeicao) {
    const itens = getRefeicao(alunoSel.id, editRefeicao);
    return (
      <div>
        <button onClick={()=>setEditRefeicao(null)} style={{ background:"none", border:"none", color:T.text3, cursor:"pointer", display:"flex", alignItems:"center", gap:6, marginBottom:16, padding:0, fontSize:14 }}>
          <Ic n="back" size={18} color={T.text3}/> Voltar ao cardápio
        </button>
        <div style={{ background:`linear-gradient(135deg, #001A08, #0D0D00)`, borderRadius:16, padding:16, border:`1px solid ${T.green}33`, marginBottom:20 }}>
          <p style={{ margin:"0 0 2px", color:T.green, fontSize:11, fontWeight:700, letterSpacing:1 }}>EDITANDO REFEIÇÃO</p>
          <h3 style={{ margin:"0 0 2px", fontSize:18, fontWeight:900, color:T.text }}>{editRefeicao}</h3>
          <p style={{ margin:0, color:T.text3, fontSize:12 }}>{alunoSel.name}</p>
        </div>

        {/* Itens cadastrados */}
        {itens.length > 0 ? (
          <Sec title={`Alimentos (${itens.length})`}>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {itens.map(item => (
                <div key={item.id} style={{ background:T.card2, borderRadius:12, padding:"12px 14px", border:`1px solid ${T.border}`, display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ flex:1 }}>
                    <p style={{ margin:"0 0 2px", fontSize:14, fontWeight:700, color:T.text }}>{item.alimento}</p>
                    <div style={{ display:"flex", gap:10 }}>
                      {item.qtd && <span style={{ color:T.text3, fontSize:12 }}>📏 {item.qtd}</span>}
                      {item.kcal && <span style={{ color:T.yellow, fontSize:12, fontWeight:700 }}>🔥 {item.kcal} kcal</span>}
                    </div>
                    {item.obs && <p style={{ margin:"4px 0 0", color:T.text3, fontSize:11, fontStyle:"italic" }}>{item.obs}</p>}
                  </div>
                  <button onClick={()=>removeItem(alunoSel.id, editRefeicao, item.id)} style={{ background:T.redDim, border:`1px solid ${T.red}33`, borderRadius:8, width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}>
                    <Ic n="x" size={14} color={T.red}/>
                  </button>
                </div>
              ))}
            </div>
          </Sec>
        ) : (
          <div style={{ textAlign:"center", padding:"24px 0", color:T.text3, fontSize:13, marginBottom:16 }}>
            Nenhum alimento cadastrado nesta refeição ainda.
          </div>
        )}

        {/* Formulário de adição */}
        <Card style={{ padding:16, border:`1px solid ${T.green}33` }} ch={<>
          <p style={{ margin:"0 0 14px", fontSize:14, fontWeight:800, color:T.text }}>➕ Adicionar alimento</p>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <div>
              <label style={{ fontSize:11, color:T.text3, fontWeight:700, letterSpacing:0.8, display:"block", marginBottom:5 }}>ALIMENTO *</label>
              <input value={novaRefeicao.alimento} onChange={e=>setNovaRefeicao(p=>({...p,alimento:e.target.value}))} placeholder="Ex: Frango grelhado" style={{ width:"100%", background:T.bg2, border:`1px solid ${T.border}`, borderRadius:10, padding:"11px 13px", color:T.text, fontSize:14, outline:"none", boxSizing:"border-box" }}/>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <div>
                <label style={{ fontSize:11, color:T.text3, fontWeight:700, letterSpacing:0.8, display:"block", marginBottom:5 }}>QUANTIDADE</label>
                <input value={novaRefeicao.qtd} onChange={e=>setNovaRefeicao(p=>({...p,qtd:e.target.value}))} placeholder="Ex: 150g" style={{ width:"100%", background:T.bg2, border:`1px solid ${T.border}`, borderRadius:10, padding:"11px 13px", color:T.text, fontSize:14, outline:"none", boxSizing:"border-box" }}/>
              </div>
              <div>
                <label style={{ fontSize:11, color:T.text3, fontWeight:700, letterSpacing:0.8, display:"block", marginBottom:5 }}>CALORIAS</label>
                <input value={novaRefeicao.kcal} onChange={e=>setNovaRefeicao(p=>({...p,kcal:e.target.value}))} placeholder="Ex: 180" style={{ width:"100%", background:T.bg2, border:`1px solid ${T.border}`, borderRadius:10, padding:"11px 13px", color:T.text, fontSize:14, outline:"none", boxSizing:"border-box" }}/>
              </div>
            </div>
            <div>
              <label style={{ fontSize:11, color:T.text3, fontWeight:700, letterSpacing:0.8, display:"block", marginBottom:5 }}>OBSERVAÇÃO</label>
              <input value={novaRefeicao.obs} onChange={e=>setNovaRefeicao(p=>({...p,obs:e.target.value}))} placeholder="Ex: sem sal, cozido no vapor..." style={{ width:"100%", background:T.bg2, border:`1px solid ${T.border}`, borderRadius:10, padding:"11px 13px", color:T.text, fontSize:14, outline:"none", boxSizing:"border-box" }}/>
            </div>
            <button onClick={()=>addItem(alunoSel.id, editRefeicao)} style={{ background:`linear-gradient(135deg, ${T.green}, #16A34A)`, color:T.text, border:"none", borderRadius:10, padding:13, fontSize:14, fontWeight:800, cursor:"pointer" }}>
              + Adicionar à refeição
            </button>
          </div>
        </>}/>
      </div>
    );
  }

  // ── Tela do cardápio do aluno (lista de refeições) ──
  if (alunoSel) {
    const totalItens = REFEICOES.reduce((acc, r) => acc + getRefeicao(alunoSel.id, r).length, 0);
    return (
      <div>
        <button onClick={()=>setAlunoSel(null)} style={{ background:"none", border:"none", color:T.text3, cursor:"pointer", display:"flex", alignItems:"center", gap:6, marginBottom:16, padding:0, fontSize:14 }}>
          <Ic n="back" size={18} color={T.text3}/> Lista de alunos
        </button>

        {/* Header do aluno */}
        <div style={{ background:"linear-gradient(135deg, #001A08, #0A0A0A)", borderRadius:20, padding:18, border:`1px solid ${T.green}44`, marginBottom:20 }}>
          <div style={{ display:"flex", gap:14, alignItems:"center" }}>
            <div style={{ width:54, height:54, borderRadius:50, background:`linear-gradient(135deg, ${T.green}, #16A34A)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>👤</div>
            <div style={{ flex:1 }}>
              <h3 style={{ margin:0, fontSize:18, fontWeight:900, color:T.text }}>{alunoSel.name}</h3>
              <p style={{ margin:"3px 0 0", color:T.green, fontSize:12, fontWeight:700 }}>Objetivo: {alunoSel.obj}</p>
            </div>
            <div style={{ textAlign:"right" }}>
              <p style={{ margin:0, fontSize:20, fontWeight:900, color:T.yellow }}>{totalItens}</p>
              <p style={{ margin:0, fontSize:10, color:T.text3 }}>alimentos</p>
            </div>
          </div>
        </div>

        {/* Refeições */}
        <Sec title="Cardápio do dia">
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {REFEICOES.map((ref, i) => {
              const itens = getRefeicao(alunoSel.id, ref);
              const kcalTotal = itens.reduce((a, it) => a + (parseFloat(it.kcal) || 0), 0);
              return (
                <div key={ref} onClick={()=>setEditRefeicao(ref)} style={{ background:T.card, borderRadius:14, border:`1px solid ${itens.length>0?T.green+"44":T.border}`, padding:"14px 16px", cursor:"pointer", display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:40, height:40, borderRadius:12, background:itens.length>0?T.greenDim:T.yellowDim, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>
                    {["☀️","🍎","🍽️","🥝","🌙","⭐"][i]}
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ margin:0, fontSize:14, fontWeight:700, color:T.text }}>{ref}</p>
                    <p style={{ margin:"3px 0 0", color:T.text3, fontSize:12 }}>
                      {itens.length > 0 ? `${itens.length} alimento${itens.length>1?"s":""} · ${kcalTotal > 0 ? kcalTotal+" kcal" : "kcal não informado"}` : "Sem alimentos cadastrados"}
                    </p>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
                    {itens.length > 0 && <YBadge text={`${itens.length} itens`} color={T.green}/>}
                    <Ic n="chevR" size={16} color={T.text3}/>
                  </div>
                </div>
              );
            })}
          </div>
        </Sec>

        <button onClick={salvar} style={{ width:"100%", background:saved?T.greenDim:T.gold, color:saved?T.green:T.bg, border:saved?`1px solid ${T.green}`:"none", borderRadius:12, padding:14, fontSize:15, fontWeight:900, cursor:"pointer", transition:"all 0.3s" }}>
          {saved ? "✓ Cardápio salvo!" : "💾 Salvar cardápio"}
        </button>
      </div>
    );
  }

  // ── Tela principal: busca + lista de alunos ──
  return (
    <div>
      {/* Nutricionista hero */}
      <div style={{ background:"linear-gradient(135deg, #001A08, #0A0A0A)", borderRadius:20, padding:18, border:`1px solid ${T.green}33`, marginBottom:18 }}>
        <div style={{ display:"flex", gap:14, alignItems:"center" }}>
          <div style={{ width:58, height:58, borderRadius:50, background:`linear-gradient(135deg, ${T.green}, #16A34A)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0, boxShadow:`0 4px 18px ${T.green}44` }}>👩‍⚕️</div>
          <div>
            <p style={{ margin:"0 0 2px", fontSize:10, color:T.green, fontWeight:700, letterSpacing:1 }}>NUTRICIONISTA OFICIAL</p>
            <h3 style={{ margin:"0 0 3px", fontSize:17, fontWeight:900, color:T.text }}>Dra. Ana Paula</h3>
            <p style={{ margin:0, color:T.text3, fontSize:12 }}>CRN 1234 · Nutrição Esportiva & Funcional</p>
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setSubTab(t.id)} style={{ flex:1, background:subTab===t.id?T.greenDim:"transparent", border:`1px solid ${subTab===t.id?T.green:T.border}`, borderRadius:20, padding:"8px 6px", color:subTab===t.id?T.green:T.text3, fontSize:12, fontWeight:700, cursor:"pointer" }}>{t.l}</button>
        ))}
      </div>

      {subTab==="alunos" && (
        <div>
          {/* Campo de busca */}
          <div style={{ position:"relative", marginBottom:16 }}>
            <div style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)" }}>
              <Ic n="user" size={16} color={T.text3}/>
            </div>
            <input
              value={busca}
              onChange={e=>setBusca(e.target.value)}
              placeholder="Buscar aluno por nome ou objetivo..."
              style={{ width:"100%", background:T.card2, border:`1px solid ${busca?T.green:T.border}`, borderRadius:14, padding:"13px 14px 13px 42px", color:T.text, fontSize:14, outline:"none", boxSizing:"border-box", transition:"border 0.2s" }}
            />
            {busca && (
              <button onClick={()=>setBusca("")} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:T.text3 }}>
                <Ic n="x" size={16} color={T.text3}/>
              </button>
            )}
          </div>

          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <span style={{ fontSize:13, color:T.text3 }}>{alunosFiltrados.length} aluno{alunosFiltrados.length!==1?"s":""} encontrado{alunosFiltrados.length!==1?"s":""}</span>
            <YBadge text={`${NUTRI_ALUNOS.filter(a=>a.status==="Ativo").length} ativos`} color={T.green}/>
          </div>

          {/* Lista de alunos */}
          {alunosFiltrados.length === 0 ? (
            <div style={{ textAlign:"center", paddingTop:40, color:T.text3 }}>
              <p style={{ fontSize:32, margin:"0 0 12px" }}>🔍</p>
              <p style={{ fontSize:14 }}>Nenhum aluno encontrado para "{busca}"</p>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {alunosFiltrados.map(a => {
                const totalRef = REFEICOES.reduce((acc, r) => acc + getRefeicao(a.id, r).length, 0);
                return (
                  <div key={a.id} onClick={()=>setAlunoSel(a)} style={{ background:T.card, borderRadius:16, border:`1px solid ${T.border}`, padding:"14px 16px", cursor:"pointer", display:"flex", alignItems:"center", gap:14 }}>
                    <div style={{ width:46, height:46, borderRadius:50, background:`linear-gradient(135deg, ${T.green}44, ${T.green}22)`, border:`2px solid ${T.green}55`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>👤</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ margin:0, fontSize:15, fontWeight:800, color:T.text }}>{a.name}</p>
                      <p style={{ margin:"3px 0 0", color:T.text3, fontSize:12 }}>🎯 {a.obj}</p>
                      <p style={{ margin:"3px 0 0", color:T.text3, fontSize:11 }}>
                        Atualizado: {a.updated} · {totalRef > 0 ? `${totalRef} alimentos no cardápio` : "Cardápio vazio"}
                      </p>
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6, flexShrink:0 }}>
                      <YBadge text={a.status} color={a.status==="Ativo"?T.green:T.yellow}/>
                      {totalRef > 0 && <YBadge text="Com cardápio" color={T.green}/>}
                      <Ic n="chevR" size={16} color={T.text3}/>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {subTab==="dicas" && (
        <Sec title="Dicas nutricionais">
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {[
              {emoji:"💧",title:"Hidratação",desc:"Beba 35ml de água por kg de peso corporal por dia."},
              {emoji:"🥩",title:"Proteínas no pós-treino",desc:"Consuma 20-40g de proteína em até 30 min após o treino."},
              {emoji:"🌾",title:"Carboidratos no pré-treino",desc:"Carboidratos complexos 2h antes garantem energia sustentada."},
              {emoji:"🥑",title:"Gorduras boas",desc:"Abacate, azeite e castanhas ajudam no balanço hormonal."},
              {emoji:"🌙",title:"Jantar leve",desc:"Prefira proteínas magras e vegetais no jantar para melhor recuperação."},
            ].map(d=>(
              <Card key={d.title} style={{ padding:"13px 14px", display:"flex", gap:12, alignItems:"flex-start" }} ch={<>
                <span style={{ fontSize:22, flexShrink:0 }}>{d.emoji}</span>
                <div><p style={{ margin:"0 0 4px", fontSize:14, fontWeight:700, color:T.text }}>{d.title}</p><p style={{ margin:0, color:T.text3, fontSize:13, lineHeight:1.5 }}>{d.desc}</p></div>
              </>}/>
            ))}
          </div>
        </Sec>
      )}

      {subTab==="videos" && (
        <Sec title="Vídeos da Dra. Ana Paula">
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {NUTRI_VIDEOS.map(v=>(
              <Card key={v.title} style={{ overflow:"hidden" }} ch={<>
                <div style={{ height:100, background:"linear-gradient(135deg, #001A08, #0A1505)", display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
                  <div style={{ width:44, height:44, background:`${T.green}22`, borderRadius:50, border:`2px solid ${T.green}55`, display:"flex", alignItems:"center", justifyContent:"center" }}><Ic n="play" size={20} color={T.green}/></div>
                  <div style={{ position:"absolute", top:8, right:8 }}><YBadge text={v.tag} color={T.green}/></div>
                  <div style={{ position:"absolute", bottom:8, right:8, background:"#000A", borderRadius:5, padding:"2px 7px" }}><span style={{ color:T.text, fontSize:11, fontWeight:700 }}>{v.duration}</span></div>
                </div>
                <div style={{ padding:"11px 13px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ flex:1, marginRight:8 }}><p style={{ margin:0, fontSize:14, fontWeight:700, color:T.text }}>{v.title}</p><p style={{ margin:"3px 0 0", color:T.text3, fontSize:12 }}>{v.views} visualizações</p></div>
                  <Ic n="play" size={16} color={T.green}/>
                </div>
              </>}/>
            ))}
          </div>
        </Sec>
      )}
    </div>
  );
};

// ─── PERSONAL SCREEN ──────────────────────────────────────────────────────────
const PersonalScreen = () => {
  const [sel,setSel]=useState(null);
  const [day,setDay]=useState(null);
  const [time,setTime]=useState(null);
  const [booked,setBooked]=useState(false);
  const DAYS = ["SEG","TER","QUA","QUI","SEX","SAB"];
  const TIMES = ["06:00","07:00","08:00","09:00","17:00","18:00","19:00","20:00"];
  if(booked&&sel&&day&&time) return (
    <div style={{ textAlign:"center", paddingTop:40 }}>
      <div style={{ width:80, height:80, borderRadius:50, background:T.greenDim, border:`2px solid ${T.green}`, margin:"0 auto 20px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:36 }}>✅</div>
      <h2 style={{ color:T.text, fontSize:22, fontWeight:900 }}>Agendado!</h2>
      <p style={{ color:T.text2, fontSize:15 }}>{sel.name}</p>
      <p style={{ color:T.yellow, fontSize:16, fontWeight:700 }}>{day} às {time}</p>
      <Card style={{ margin:"20px 0", padding:16, borderLeft:`3px solid ${T.green}` }} ch={<>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}><span style={{ color:T.text3 }}>Valor da aula</span><span style={{ color:T.text, fontWeight:700 }}>R$ {sel.rate},00</span></div>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}><span style={{ color:T.text3 }}>Academia (70%)</span><span style={{ color:T.yellow, fontWeight:700 }}>R$ {(sel.rate*0.7).toFixed(0)},00</span></div>
        <div style={{ display:"flex", justifyContent:"space-between" }}><span style={{ color:T.text3 }}>Instrutor (30%)</span><span style={{ color:T.green, fontWeight:700 }}>R$ {(sel.rate*0.3).toFixed(0)},00</span></div>
      </>}/>
      <button onClick={()=>{setSel(null);setDay(null);setTime(null);setBooked(false);}} style={{ background:T.gold, color:T.bg, border:"none", borderRadius:12, padding:"14px 32px", fontSize:14, fontWeight:900, cursor:"pointer" }}>Voltar</button>
    </div>
  );
  if(sel) return (
    <div>
      <button onClick={()=>setSel(null)} style={{ background:"none", border:"none", color:T.text3, cursor:"pointer", display:"flex", alignItems:"center", gap:6, marginBottom:20, padding:0, fontSize:14 }}><Ic n="back" size={18} color={T.text3}/> Instrutores</button>
      <Card style={{ padding:20, background:"linear-gradient(135deg, #0D0A1A, #111)", border:"1px solid #9B59B644", marginBottom:20 }} ch={<>
        <div style={{ display:"flex", gap:14, alignItems:"center", marginBottom:14 }}>
          <div style={{ width:60, height:60, borderRadius:50, background:"linear-gradient(135deg, #9B59B6, #7D3C98)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>👤</div>
          <div>
            <h3 style={{ margin:0, fontSize:18, fontWeight:900, color:T.text }}>{sel.name}</h3>
            <p style={{ margin:"4px 0", color:T.text3, fontSize:13 }}>{sel.spec}</p>
            <div style={{ display:"flex", gap:8 }}><YBadge text={`⭐ ${sel.rating}`} color={T.yellow}/><YBadge text={`${sel.sessions} aulas`} color="#9B59B6"/></div>
          </div>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", padding:"12px 0", borderTop:`1px solid ${T.border}` }}><span style={{ color:T.text3 }}>Experiência</span><span style={{ color:T.text, fontWeight:700 }}>{sel.exp}</span></div>
        <div style={{ display:"flex", justifyContent:"space-between", padding:"12px 0", borderTop:`1px solid ${T.border}` }}><span style={{ color:T.text3 }}>Valor por aula</span><span style={{ color:T.yellow, fontWeight:900, fontSize:18 }}>R$ {sel.rate},00</span></div>
      </>}/>
      <Sec title="Escolha o dia">
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {DAYS.map(d=>{
            const avail=sel.avail.includes(d);
            return <button key={d} onClick={()=>avail&&setDay(d)} style={{ padding:"10px 14px", borderRadius:12, background:day===d?T.gold:avail?T.card:T.bg, border:`1px solid ${day===d?T.yellow:avail?T.border:T.border2}`, color:day===d?T.bg:avail?T.text:T.text3, fontWeight:700, fontSize:13, cursor:avail?"pointer":"default", opacity:avail?1:0.3 }}>{d}</button>;
          })}
        </div>
      </Sec>
      {day&&<Sec title="Escolha o horário">
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {TIMES.map(t=>(
            <button key={t} onClick={()=>setTime(t)} style={{ padding:"10px 16px", borderRadius:12, background:time===t?T.gold:T.card, border:`1px solid ${time===t?T.yellow:T.border}`, color:time===t?T.bg:T.text, fontWeight:700, fontSize:13, cursor:"pointer" }}>{t}</button>
          ))}
        </div>
      </Sec>}
      {day&&time&&<>
        <Card style={{ padding:16, marginBottom:14, background:"linear-gradient(135deg, #0D0D00,#111)", border:`1px solid ${T.yellow}33` }} ch={<>
          <p style={{ margin:"0 0 12px", fontSize:14, fontWeight:700, color:T.text }}>Resumo do agendamento</p>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}><span style={{ color:T.text3 }}>Instrutor</span><span style={{ color:T.text, fontWeight:700 }}>{sel.name}</span></div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}><span style={{ color:T.text3 }}>Dia</span><span style={{ color:T.text, fontWeight:700 }}>{day}</span></div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}><span style={{ color:T.text3 }}>Horário</span><span style={{ color:T.text, fontWeight:700 }}>{time}</span></div>
          <div style={{ display:"flex", justifyContent:"space-between" }}><span style={{ color:T.text3 }}>Valor</span><span style={{ color:T.yellow, fontWeight:900, fontSize:16 }}>R$ {sel.rate},00</span></div>
        </>}/>
        <button onClick={()=>setBooked(true)} style={{ width:"100%", background:T.gold, color:T.bg, border:"none", borderRadius:12, padding:16, fontSize:15, fontWeight:900, cursor:"pointer", marginBottom:10 }}>⚡ CONFIRMAR AGENDAMENTO</button>
        <a href={`https://wa.me/5511999999999?text=Olá, quero agendar uma aula com ${sel.name} na ${day} às ${time}`} target="_blank" rel="noopener noreferrer" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, width:"100%", background:"#25D36622", border:"1px solid #25D36644", borderRadius:12, padding:14, fontSize:14, fontWeight:700, cursor:"pointer", color:"#25D366", textDecoration:"none", boxSizing:"border-box" }}>
          <Ic n="whatsapp" size={18} color="#25D366"/> Solicitar via WhatsApp
        </a>
      </>}
    </div>
  );
  return (
    <div>
      <div style={{ background:"linear-gradient(135deg, #0D0A1A, #0A0A0A)", borderRadius:20, padding:20, border:"1px solid #9B59B644", marginBottom:20 }}>
        <p style={{ margin:"0 0 6px", color:"#9B59B6", fontSize:12, fontWeight:700, letterSpacing:1 }}>PERSONAL TRAINER</p>
        <h2 style={{ margin:"0 0 8px", fontSize:20, fontWeight:900, color:T.text }}>Treine com um especialista</h2>
        <p style={{ margin:0, color:T.text3, fontSize:13, lineHeight:1.6 }}>Aulas personalizadas com instrutores certificados. Escolha o profissional, o dia e o horário que funcionam para você.</p>
      </div>
      <Sec title="Instrutores disponíveis">
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {PERSONALS.map(p=>(
            <Card key={p.id} onClick={()=>setSel(p)} style={{ padding:"16px", border:"1px solid #9B59B633" }} ch={<>
              <div style={{ display:"flex", gap:14, alignItems:"center", marginBottom:12 }}>
                <div style={{ width:52, height:52, borderRadius:50, background:"linear-gradient(135deg, #9B59B6, #7D3C98)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>👤</div>
                <div style={{ flex:1 }}>
                  <p style={{ margin:0, fontSize:16, fontWeight:800, color:T.text }}>{p.name}</p>
                  <p style={{ margin:"3px 0 0", color:T.text3, fontSize:12 }}>{p.spec}</p>
                </div>
                <div style={{ textAlign:"right" }}>
                  <p style={{ margin:0, fontSize:10, color:T.text3 }}>por aula</p>
                  <p style={{ margin:"2px 0 0", fontSize:20, fontWeight:900, color:T.yellow }}>R${p.rate}</p>
                </div>
              </div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:10 }}>
                <YBadge text={`⭐ ${p.rating}`} color={T.yellow}/>
                <YBadge text={`${p.exp} exp`} color="#9B59B6"/>
                {p.avail.map(d=><YBadge key={d} text={d} color={T.text3}/>)}
              </div>
              <button style={{ width:"100%", background:"linear-gradient(135deg, #9B59B6, #7D3C98)", color:T.text, border:"none", borderRadius:10, padding:11, fontSize:13, fontWeight:800, cursor:"pointer" }}>Agendar aula →</button>
            </>}/>
          ))}
        </div>
      </Sec>
    </div>
  );
};

// ─── PAYMENTS SCREEN ──────────────────────────────────────────────────────────
const PaymentsScreen = () => (
  <div>
    <Card style={{ padding:20, background:"linear-gradient(135deg, #001A08, #0A0A0A)", border:`1px solid ${T.green}33`, marginBottom:20 }} ch={<>
      <p style={{ margin:"0 0 4px", color:T.text3, fontSize:13 }}>Saldo na carteira</p>
      <p style={{ margin:"0 0 4px", fontSize:32, fontWeight:900, color:T.green }}>R$ 245,00</p>
      <p style={{ margin:0, color:T.text3, fontSize:12 }}>Disponível para pagamentos</p>
      <button style={{ marginTop:14, background:`linear-gradient(135deg, ${T.green}, #16A34A)`, color:T.text, border:"none", borderRadius:10, padding:"11px 20px", fontSize:13, fontWeight:800, cursor:"pointer" }}>+ Adicionar saldo</button>
    </>}/>
    <Sec title="Mensalidade">
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {PAYMENTS.map(p=>(
          <Card key={p.month} style={{ padding:"14px 16px", display:"flex", alignItems:"center", gap:14 }} ch={<>
            <div style={{ width:40, height:40, background:p.status==="Pago"?T.greenDim:T.redDim, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Ic n={p.status==="Pago"?"check":"bell"} size={18} color={p.status==="Pago"?T.green:T.red}/>
            </div>
            <div style={{ flex:1 }}>
              <p style={{ margin:0, fontSize:15, fontWeight:700, color:T.text }}>Mensalidade {p.month}</p>
              <p style={{ margin:"2px 0 0", color:T.text3, fontSize:12 }}>{p.val} · {p.status==="Pago"?`Pago em ${p.paid}`:`Vence ${p.due}`}</p>
            </div>
            {p.status==="Pendente"
              ? <button style={{ background:T.gold, color:T.bg, border:"none", borderRadius:8, padding:"8px 14px", fontSize:12, fontWeight:800, cursor:"pointer" }}>Pagar</button>
              : <YBadge text="PAGO" color={T.green}/>}
          </>}/>
        ))}
      </div>
    </Sec>
    <Sec title="Serviços contratados">
      {[
        { name:"Acompanhamento Nutricional", val:"R$ 89,00", next:"15/07", color:T.green },
        { name:"Personal Coach Bruno (2x/sem)", val:"R$ 200,00", next:"01/07", color:"#9B59B6" },
      ].map(s=>(
        <Card key={s.name} style={{ padding:"14px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10, borderLeft:`3px solid ${s.color}` }} ch={<>
          <div><p style={{ margin:0, fontSize:14, fontWeight:700, color:T.text }}>{s.name}</p><p style={{ margin:"2px 0 0", color:T.text3, fontSize:12 }}>Próxima cobrança: {s.next}</p></div>
          <p style={{ margin:0, fontSize:16, fontWeight:900, color:s.color }}>{s.val}</p>
        </>}/>
      ))}
    </Sec>
  </div>
);

// ─── PROFILE SCREEN ───────────────────────────────────────────────────────────
const ProfileScreen = ({ onLogout }) => (
  <div>
    <div style={{ textAlign:"center", marginBottom:24 }}>
      <div style={{ width:80, height:80, borderRadius:50, background:T.gold, margin:"0 auto 12px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, boxShadow:`0 4px 24px ${T.yellow}44` }}>💪</div>
      <h2 style={{ margin:"0 0 4px", fontSize:20, fontWeight:900, color:T.text }}>João Silva</h2>
      <p style={{ margin:"0 0 8px", color:T.text3, fontSize:13 }}>joao.silva@email.com</p>
      <YBadge text="✦ PREMIUM" color={T.yellow}/>
    </div>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:20 }}>
      {[{v:"87",l:"kg"},{v:"1,78",l:"m"},{v:"21.8",l:"IMC"}].map(s=>(
        <Card key={s.l} style={{ textAlign:"center", padding:"14px 8px" }} ch={<><p style={{ margin:0, fontSize:22, fontWeight:900, color:T.yellow }}>{s.v}</p><p style={{ margin:"4px 0 0", fontSize:11, color:T.text3 }}>{s.l}</p></>}/>
      ))}
    </div>
    <Sec title="Informações">
      {[["CPF","•••.•••.•••-12"],["Telefone","(11) 9 9999-9999"],["Nascimento","15/03/1993"],["Plano","Premium · Mensal"],["Vencimento","30/06/2026"]].map(([l,v])=>(
        <Card key={l} style={{ display:"flex", justifyContent:"space-between", marginBottom:8, padding:"13px 16px" }} ch={<><span style={{ color:T.text3, fontSize:14 }}>{l}</span><span style={{ color:T.text, fontSize:14, fontWeight:600 }}>{v}</span></>}/>
      ))}
    </Sec>
    <button onClick={onLogout} style={{ width:"100%", background:"transparent", border:`1px solid ${T.red}44`, borderRadius:12, padding:14, fontSize:14, fontWeight:700, color:T.red, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
      <Ic n="logout" size={16} color={T.red}/> Sair da conta
    </button>
  </div>
);

// ─── ADMIN PANEL ──────────────────────────────────────────────────────────────
const AdminPanel = ({ onLogout }) => {
  const [subTab,setSubTab]=useState("dashboard");
  const [split,setSplit]=useState({acad:70,inst:30});
  const tabs=[{id:"dashboard",l:"Dashboard"},{id:"alunos",l:"Alunos"},{id:"nutri",l:"Nutrição"},{id:"config",l:"Config"}];
  return (
    <div style={{ minHeight:"100vh", background:T.bg, fontFamily:"system-ui,sans-serif" }}>
      <div style={{ background:"linear-gradient(135deg, #1A1500, #0D0D00)", padding:"20px 16px 16px", borderBottom:`1px solid ${T.yellow}33` }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div>
            <p style={{ margin:0, color:T.yellow, fontSize:11, fontWeight:700, letterSpacing:1 }}>PAINEL ADMINISTRATIVO</p>
            <h1 style={{ margin:"4px 0 0", fontSize:20, fontWeight:900, color:T.text }}>IMPÉRIO</h1>
          </div>
          <button onClick={onLogout} style={{ background:"transparent", border:`1px solid ${T.border}`, borderRadius:8, padding:"8px 12px", color:T.text3, fontSize:12, cursor:"pointer" }}>Sair</button>
        </div>
        <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:4 }}>
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setSubTab(t.id)} style={{ flexShrink:0, background:subTab===t.id?T.gold:"transparent", border:`1px solid ${subTab===t.id?T.yellow:T.border}`, borderRadius:20, padding:"7px 14px", color:subTab===t.id?T.bg:T.text3, fontSize:12, fontWeight:700, cursor:"pointer" }}>{t.l}</button>
          ))}
        </div>
      </div>
      <div style={{ padding:"20px 16px 100px" }}>
        {subTab==="dashboard"&&(
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
              {[
                {v:ADMIN_STATS.totalAlunos,l:"Total Alunos",icon:"user",color:T.yellow},
                {v:ADMIN_STATS.ativos,l:"Ativos",icon:"check",color:T.green},
                {v:ADMIN_STATS.pendencias,l:"Pendências",icon:"bell",color:T.red},
                {v:ADMIN_STATS.aulasAgendadas,l:"Aulas Agendadas",icon:"calendar",color:"#9B59B6"},
              ].map(s=>(
                <Card key={s.l} style={{ padding:"16px", display:"flex", gap:12, alignItems:"center" }} ch={<>
                  <div style={{ width:40, height:40, background:s.color+"22", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center" }}><Ic n={s.icon} size={20} color={s.color}/></div>
                  <div><p style={{ margin:0, fontSize:22, fontWeight:900, color:T.text }}>{s.v}</p><p style={{ margin:0, fontSize:11, color:T.text3 }}>{s.l}</p></div>
                </>}/>
              ))}
            </div>
            <Sec title="Receita">
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {[
                  {l:"Receita total (mês)",v:ADMIN_STATS.receitaMes,color:T.green},
                  {l:"Gerada pelo app",v:ADMIN_STATS.receitaApp,color:T.yellow},
                  {l:"Nutrição contratações",v:`${ADMIN_STATS.nutriContr} contratos`,color:"#22C55E"},
                ].map(r=>(
                  <Card key={r.l} style={{ padding:"13px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }} ch={<>
                    <span style={{ color:T.text2, fontSize:14 }}>{r.l}</span>
                    <span style={{ color:r.color, fontWeight:900, fontSize:15 }}>{r.v}</span>
                  </>}/>
                ))}
              </div>
            </Sec>
          </div>
        )}
        {subTab==="alunos"&&(
          <Sec title={`Alunos (${ADMIN_STATS.totalAlunos})`}>
            {[
              {name:"João Silva",plan:"Premium",status:"Ativo",since:"Jan 2024"},
              {name:"Maria Santos",plan:"Basic",status:"Pendente",since:"Mar 2024"},
              {name:"Pedro Lima",plan:"Premium",status:"Ativo",since:"Out 2023"},
              {name:"Ana Costa",plan:"Basic",status:"Ativo",since:"Fev 2025"},
              {name:"Carlos Dias",plan:"Premium",status:"Bloqueado",since:"Jun 2023"},
            ].map(a=>(
              <Card key={a.name} style={{ padding:"13px 16px", marginBottom:10, display:"flex", alignItems:"center", gap:12 }} ch={<>
                <div style={{ width:38, height:38, borderRadius:50, background:T.yellowDim, display:"flex", alignItems:"center", justifyContent:"center" }}><Ic n="user" size={18} color={T.yellow}/></div>
                <div style={{ flex:1 }}>
                  <p style={{ margin:0, fontSize:14, fontWeight:700, color:T.text }}>{a.name}</p>
                  <p style={{ margin:"2px 0 0", color:T.text3, fontSize:12 }}>Plano {a.plan} · desde {a.since}</p>
                </div>
                <YBadge text={a.status} color={a.status==="Ativo"?T.green:a.status==="Pendente"?T.yellow:T.red}/>
              </>}/>
            ))}
          </Sec>
        )}
        {subTab==="nutri"&&(
          <Sec title="Nutrição — Visão geral">
            {[
              {l:"Alunos com cardápio ativo",v:"41",color:T.green},
              {l:"Cardápios cadastrados",v:"38",color:T.yellow},
              {l:"Vídeos publicados",v:"12",color:"#9B59B6"},
              {l:"Consultas realizadas (mês)",v:"8",color:"#3498DB"},
            ].map(r=>(
              <Card key={r.l} style={{ padding:"13px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }} ch={<>
                <span style={{ color:T.text2, fontSize:14 }}>{r.l}</span>
                <span style={{ color:r.color, fontWeight:900, fontSize:15 }}>{r.v}</span>
              </>}/>
            ))}
          </Sec>
        )}
        {subTab==="config"&&(
          <Sec title="Configurações">
            {[
              {l:"Nome da academia",v:"Império"},
              {l:"WhatsApp",v:"(11) 9 8765-4321"},
              {l:"Plano Basic",v:"R$ 79,90/mês"},
              {l:"Plano Premium",v:"R$ 99,90/mês"},
              {l:"Versão do app",v:"2.0.0"},
            ].map(c=>(
              <Card key={c.l} style={{ padding:"13px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }} ch={<>
                <span style={{ color:T.text2, fontSize:14 }}>{c.l}</span>
                <span style={{ color:T.yellow, fontWeight:700, fontSize:14 }}>{c.v}</span>
              </>}/>
            ))}
          </Sec>
        )}
      </div>
    </div>
  );
};

// ─── INSTRUCTOR PANEL ─────────────────────────────────────────────────────────
const InstructorPanel = ({ onLogout }) => (
  <div style={{ minHeight:"100vh", background:T.bg, fontFamily:"system-ui,sans-serif" }}>
    <div style={{ background:"linear-gradient(135deg, #0D0A1A, #0A0A0A)", padding:"20px 16px 16px", borderBottom:"1px solid #9B59B644" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <p style={{ margin:0, color:"#9B59B6", fontSize:11, fontWeight:700, letterSpacing:1 }}>ÁREA DO INSTRUTOR</p>
          <h1 style={{ margin:"4px 0 0", fontSize:20, fontWeight:900, color:T.text }}>Coach Bruno</h1>
        </div>
        <button onClick={onLogout} style={{ background:"transparent", border:`1px solid ${T.border}`, borderRadius:8, padding:"8px 12px", color:T.text3, fontSize:12, cursor:"pointer" }}>Sair</button>
      </div>
    </div>
    <div style={{ padding:"20px 16px 100px" }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
        {[{v:"R$ 4.260",l:"A receber",color:T.green},{v:"23",l:"Aulas (mês)",color:T.yellow},{v:"8",l:"Alunos ativos",color:"#9B59B6"},{v:"4.9⭐",l:"Avaliação",color:T.yellow}].map(s=>(
          <Card key={s.l} style={{ padding:"16px", textAlign:"center" }} ch={<><p style={{ margin:0, fontSize:20, fontWeight:900, color:s.color }}>{s.v}</p><p style={{ margin:"4px 0 0", fontSize:11, color:T.text3 }}>{s.l}</p></>}/>
        ))}
      </div>
      <Sec title="Agenda desta semana">
        {[
          {day:"SEG 23",time:"06:00",aluno:"João Silva",type:"Hipertrofia"},
          {day:"SEG 23",time:"07:00",aluno:"Pedro Lima",type:"Funcional"},
          {day:"QUA 25",time:"18:00",aluno:"Ana Costa",type:"Emagrecimento"},
          {day:"QUA 25",time:"19:00",aluno:"Carlos Dias",type:"Força"},
          {day:"SEX 27",time:"06:00",aluno:"João Silva",type:"Hipertrofia"},
        ].map((a,i)=>(
          <Card key={i} style={{ padding:"13px 16px", marginBottom:10, display:"flex", alignItems:"center", gap:14 }} ch={<>
            <div style={{ textAlign:"center", minWidth:42 }}>
              <p style={{ margin:0, fontSize:10, color:T.text3, fontWeight:700 }}>{a.day}</p>
              <p style={{ margin:"2px 0 0", fontSize:15, fontWeight:900, color:"#9B59B6" }}>{a.time}</p>
            </div>
            <div style={{ flex:1 }}>
              <p style={{ margin:0, fontSize:14, fontWeight:700, color:T.text }}>{a.aluno}</p>
              <p style={{ margin:"2px 0 0", color:T.text3, fontSize:12 }}>{a.type}</p>
            </div>
            <YBadge text="Confirmado" color={T.green}/>
          </>}/>
        ))}
      </Sec>
    </div>
  </div>
);

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const SIDE_MENU = [
  {icon:"home",label:"Início",tab:"inicio"},{icon:"dumbbell",label:"Treinos",tab:"treinos"},
  {icon:"layers",label:"Biblioteca",tab:"biblioteca"},{icon:"leaf",label:"Nutrição",tab:"nutricao"},
  {icon:"user2",label:"Personal",tab:"personal"},{icon:"credit",label:"Pagamentos",tab:"pagamentos"},
  {icon:"user",label:"Perfil",tab:"perfil"},{icon:"settings",label:"Configurações",tab:"config"},
  {icon:"logout",label:"Sair",tab:"sair",danger:true},
];
const BOT_NAV = [
  {id:"inicio",icon:"home",label:"Início"},{id:"treinos",icon:"dumbbell",label:"Treinos"},
  {id:"nutricao",icon:"leaf",label:"Nutrição"},{id:"personal",icon:"user2",label:"Personal"},
  {id:"perfil",icon:"user",label:"Perfil"},
];
const TAB_TITLES = {inicio:"Olá, João! 👋",treinos:"Meus Treinos",biblioteca:"Biblioteca",nutricao:"Nutrição",personal:"Personal Trainer",pagamentos:"Pagamentos",perfil:"Meu Perfil",config:"Configurações"};

export default function AcademiaApp() {
  const [auth,setAuth]=useState(null);
  const [tab,setTab]=useState("inicio");
  const [menuOpen,setMenuOpen]=useState(false);
  if(!auth) return <LoginScreen onLogin={role=>setAuth(role)}/>;
  if(auth==="admin") return <AdminPanel onLogout={()=>setAuth(null)}/>;
  if(auth==="instrutor") return <InstructorPanel onLogout={()=>setAuth(null)}/>;

  const renderTab = () => {
    switch(tab){
      case "inicio": return <HomeScreen setTab={setTab} setScreen={setTab}/>;
      case "treinos": return <WorkoutsScreen/>;
      case "biblioteca": return <LibraryScreen/>;
      case "nutricao": return <NutritionScreen/>;
      case "personal": return <PersonalScreen/>;
      case "pagamentos": return <PaymentsScreen/>;
      case "perfil": return <ProfileScreen onLogout={()=>setAuth(null)}/>;
      default: return <div style={{ textAlign:"center", paddingTop:60, color:T.text3 }}>Em breve</div>;
    }
  };

  return (
    <div style={{ maxWidth:430, margin:"0 auto", background:T.bg, minHeight:"100vh", fontFamily:"system-ui,-apple-system,sans-serif", position:"relative", overflow:"hidden" }}>
      {/* Overlay */}
      {menuOpen&&<div onClick={()=>setMenuOpen(false)} style={{ position:"fixed", inset:0, background:"#000C", zIndex:40, maxWidth:430, margin:"0 auto" }}/>}
      {/* Sidebar */}
      <div style={{ position:"fixed", top:0, left:menuOpen?"max(0px,calc(50vw - 215px))":"max(-290px,calc(50vw - 505px))", width:285, height:"100%", background:"#0D0D00", borderRight:`1px solid ${T.yellow}22`, zIndex:50, transition:"left 0.3s cubic-bezier(.4,0,.2,1)", overflowY:"auto" }}>
        <div style={{ background:"linear-gradient(135deg, #1A1500, #0D0D00)", padding:"32px 20px 20px", borderBottom:`1px solid ${T.yellow}22` }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:52, height:52, borderRadius:50, background:T.gold, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, boxShadow:`0 4px 20px ${T.yellow}55` }}>💪</div>
            <div><p style={{ margin:0, fontSize:16, fontWeight:900, color:T.text }}>João Silva</p><YBadge text="✦ PREMIUM" color={T.yellow}/></div>
          </div>
        </div>
        <div style={{ padding:"10px 0" }}>
          {SIDE_MENU.map(it=>(
            <div key={it.label} onClick={()=>{if(it.tab==="sair"){setAuth(null);}else setTab(it.tab);setMenuOpen(false);}} style={{ display:"flex", alignItems:"center", gap:14, padding:"13px 20px", cursor:"pointer", borderLeft:tab===it.tab?`3px solid ${T.yellow}`:"3px solid transparent", background:tab===it.tab?`${T.yellow}08`:"transparent" }}>
              <Ic n={it.icon} size={18} color={it.danger?T.red:tab===it.tab?T.yellow:T.text3}/>
              <span style={{ fontSize:14, color:it.danger?T.red:tab===it.tab?T.text:T.text2, fontWeight:it.danger||tab===it.tab?700:400 }}>{it.label}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Header */}
      <div style={{ position:"sticky", top:0, zIndex:30, background:"#0A0A0AEE", backdropFilter:"blur(14px)", borderBottom:`1px solid ${T.border}`, padding:"14px 20px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <button onClick={()=>setMenuOpen(!menuOpen)} style={{ background:"none", border:"none", cursor:"pointer", padding:0 }}>
          <Ic n={menuOpen?"x":"menu"} size={22} color={T.text}/>
        </button>
        <div style={{ textAlign:"center" }}>
          <span style={{ fontSize:16, fontWeight:800, color:T.text }}>{TAB_TITLES[tab]||"IMPÉRIO"}</span>
        </div>
        <button style={{ background:"none", border:"none", cursor:"pointer", padding:0, position:"relative" }}>
          <Ic n="bell" size={22} color={T.text}/>
          <span style={{ position:"absolute", top:-2, right:-2, width:8, height:8, background:T.red, borderRadius:50, border:`2px solid ${T.bg}` }}/>
        </button>
      </div>
      {/* Content */}
      <div style={{ padding:"20px 16px 100px" }}>{renderTab()}</div>
      {/* Bottom Nav */}
      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, background:"#0D0D00EE", borderTop:`1px solid ${T.yellow}22`, display:"flex", padding:"8px 0 16px", zIndex:30, backdropFilter:"blur(14px)" }}>
        {BOT_NAV.map(it=>{
          const active=tab===it.id;
          return (
            <button key={it.id} onClick={()=>setTab(it.id)} style={{ flex:1, background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:4, padding:"4px 0" }}>
              <div style={{ width:active?36:28, height:active?36:28, borderRadius:active?12:50, background:active?T.gold:"transparent", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s", boxShadow:active?`0 4px 14px ${T.yellow}55`:"none" }}>
                <Ic n={it.icon} size={18} color={active?T.bg:T.text3}/>
              </div>
              <span style={{ fontSize:10, color:active?T.yellow:T.text3, fontWeight:active?800:400 }}>{it.label}</span>
            </button>
          );
        })}
      </div>
      {/* WhatsApp FAB */}
      <a href="https://wa.me/5511999999999?text=Olá, preciso de ajuda pelo app da academia." target="_blank" rel="noopener noreferrer" style={{ position:"fixed", bottom:90, right:"max(20px,calc(50vw - 195px))", width:56, height:56, borderRadius:50, background:"linear-gradient(135deg, #25D366, #128C7E)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 20px #25D36688", zIndex:35, textDecoration:"none" }}>
        <Ic n="whatsapp" size={28} color={T.text}/>
      </a>
    </div>
  );
}
