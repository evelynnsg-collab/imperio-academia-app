import fs from "node:fs";

const path = "src/App.jsx";
let src = fs.readFileSync(path, "utf8");

function replaceOnce(oldText, newText, label) {
  if (src.includes(newText)) {
    console.log(`✓ ${label}: já aplicado`);
    return;
  }
  if (!src.includes(oldText)) {
    throw new Error(`Trecho não encontrado para: ${label}`);
  }
  src = src.replace(oldText, newText);
  console.log(`✓ ${label}`);
}

replaceOnce(
  'import { initializeApp } from "firebase/app";',
  'import { initializeApp, getApps } from "firebase/app";',
  "Firebase app reutilizável"
);

replaceOnce(
`const fbApp  = initializeApp(firebaseConfig);\nconst fbAuth = getAuth(fbApp);\nconst db     = getFirestore(fbApp);`,
`const fbApp = getApps().find(app => app.name === "[DEFAULT]") || initializeApp(firebaseConfig);\nconst fbAuth = getAuth(fbApp);\nconst db = getFirestore(fbApp);\n\n// Auth secundário: cria/redefine contas de alunos sem trocar a sessão do admin/nutri.\nconst fbSecondaryApp = getApps().find(app => app.name === "imperio-secondary-auth") || initializeApp(firebaseConfig, "imperio-secondary-auth");\nconst fbSecondaryAuth = getAuth(fbSecondaryApp);`,
  "Auth secundário"
);

replaceOnce(
`async function criarContaAluno(cpf, senha) {\n  const email = \`${'${cpf}'}@imperio.app\`;\n  try {\n    await createUserWithEmailAndPassword(fbAuth, email, senha || cpf);\n  } catch(e) {\n    if (e.code !== "auth/email-already-in-use") throw e;\n  }\n}`,
`async function criarContaAluno(cpf, senha) {\n  const email = \`${'${cpf}'}@imperio.app\`;\n  try {\n    await createUserWithEmailAndPassword(fbSecondaryAuth, email, senha || cpf);\n  } catch(e) {\n    if (e.code !== "auth/email-already-in-use") throw e;\n  } finally {\n    if (fbSecondaryAuth.currentUser) {\n      try { await signOut(fbSecondaryAuth); } catch(e) {}\n    }\n  }\n}`,
  "Cadastro de aluno sem trocar sessão"
);

replaceOnce(
  'const Btn = ({ children, onClick, color, style={}, small=false, outline=false, danger=false }) => {',
  'const Btn = ({ children, onClick, color, style={}, small=false, outline=false, danger=false, disabled=false }) => {',
  "Btn recebe disabled"
);

replaceOnce(
  '<button onClick={onClick} style={{ background:outline?"transparent":(danger?T.red:`linear-gradient(135deg,${color},${color}DD)`), color:outline?(danger?T.red:color):textColor, border, borderRadius:10, padding:small?"8px 14px":"12px 18px", fontSize:small?12:14, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6, ...style }}>',
  '<button onClick={onClick} disabled={disabled} style={{ background:outline?"transparent":(danger?T.red:`linear-gradient(135deg,${color},${color}DD)`), color:outline?(danger?T.red:color):textColor, border, borderRadius:10, padding:small?"8px 14px":"12px 18px", fontSize:small?12:14, fontWeight:700, cursor:disabled?"not-allowed":"pointer", opacity:disabled?0.6:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, ...style }}>',
  "Btn bloqueia clique durante upload"
);

const exImgMarker = `// ─── COMPONENTE DE IMAGEM DO EXERCÍCIO (real + fallback SVG) ─────────────────\nconst ExImg = ({ nome, musculo, cor, imgUrl, videoUrl, style={} }) => {`;
const exImgReplacement = `// ─── MÍDIA DE EXERCÍCIO COM CARREGAMENTO SOB DEMANDA ──────────────────────────\nconst LazyExerciseVideo = ({ src, style={} }) => {\n  const videoRef = useRef(null);\n  const [ativo, setAtivo] = useState(false);\n\n  useEffect(() => {\n    const el = videoRef.current;\n    if (!el) return;\n    if (typeof IntersectionObserver === "undefined") {\n      setAtivo(true);\n      return;\n    }\n    const observer = new IntersectionObserver(([entry]) => {\n      setAtivo(entry.isIntersecting);\n    }, { rootMargin: "180px" });\n    observer.observe(el);\n    return () => observer.disconnect();\n  }, []);\n\n  return (\n    <video ref={videoRef} src={ativo ? src : undefined} autoPlay={ativo} loop muted playsInline preload="metadata"\n      style={{ width:"100%", height:"100%", objectFit:"contain", display:"block", ...style }}/>\n  );\n};\n\n// ─── COMPONENTE DE IMAGEM DO EXERCÍCIO (real + fallback SVG) ─────────────────\nconst ExImg = ({ nome, musculo, cor, imgUrl, videoUrl, style={} }) => {`;
replaceOnce(exImgMarker, exImgReplacement, "Lazy loading de vídeos da biblioteca");

replaceOnce(
`    return (\n      <video src={videoUrl} autoPlay loop muted playsInline preload="auto"\n        style={{ width:"100%", height:"100%", objectFit:"contain", display:"block", background:T.bg2, ...style }}/>\n    );`,
`    return <LazyExerciseVideo src={videoUrl} style={{ background:T.bg2, ...style }}/>;`,
  "Vídeos pesados sob demanda"
);

replaceOnce(
`      <img src={src} alt={nome} onError={()=>setImgOk(false)}\n        style={{ width:"100%", height:"100%", objectFit:"cover", display:"block", ...style }}/>` ,
`      <img src={src} alt={nome} loading="lazy" decoding="async" onError={()=>setImgOk(false)}\n        style={{ width:"100%", height:"100%", objectFit:"cover", display:"block", ...style }}/>` ,
  "Lazy loading de imagens da biblioteca"
);

replaceOnce(
  'const [tab,setTab]=useState("info");',
  'const [tab,setTab]=useState(soCardapio ? "cardapio" : "info");',
  "Nutricionista abre direto no cardápio"
);

replaceOnce(
  'await createUserWithEmailAndPassword(fbAuth, email, senhaAtual);',
  'await createUserWithEmailAndPassword(fbSecondaryAuth, email, senhaAtual);\n      await signOut(fbSecondaryAuth);',
  "Redefinição de acesso sem trocar sessão"
);

replaceOnce(
  '<video src={v.url} controls style={{ width:"100%", maxHeight:220, background:"#000", display:"block" }}/>',
  '<video src={v.url} controls preload="metadata" style={{ width:"100%", maxHeight:220, background:"#000", display:"block" }}/>',
  "Vídeos da nutri sem pré-carregamento completo"
);

replaceOnce(
  'const hojeStr = () => new Date().toISOString().slice(0,10);',
`const hojeStr = () => {\n    const agora = new Date();\n    const ano = agora.getFullYear();\n    const mes = String(agora.getMonth() + 1).padStart(2, "0");\n    const dia = String(agora.getDate()).padStart(2, "0");\n    return \`${'${ano}-${mes}-${dia}'}\`;\n  };`,
  "Data local do progresso"
);

const alunoFirebaseStart = src.indexOf('const AlunoAppFirebase = ({ alunoId, onLogout, installPrompt }) => {');
const appRootStart = src.indexOf('export default function App() {');
if (alunoFirebaseStart < 0 || appRootStart < 0 || appRootStart <= alunoFirebaseStart) {
  throw new Error("Não foi possível localizar AlunoAppFirebase/App");
}

const alunoFirebaseNovo = `const TelaErroCarregamento = ({ titulo, mensagem }) => (\n  <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:24,position:"relative",zIndex:0}}>\n    <Watermark/>\n    <div style={{width:"100%",maxWidth:360,textAlign:"center",background:T.card,border:\`1px solid ${'${T.red}'}44\`,borderRadius:18,padding:24}}>\n      <p style={{fontSize:34,margin:"0 0 10px"}}>⚠️</p>\n      <p style={{color:T.text,fontSize:16,fontWeight:800,margin:"0 0 8px"}}>{titulo}</p>\n      <p style={{color:T.text3,fontSize:13,lineHeight:1.5,margin:"0 0 18px"}}>{mensagem}</p>\n      <button onClick={()=>window.location.reload()} style={{width:"100%",background:T.gold,border:"none",borderRadius:12,padding:13,color:T.bg,fontWeight:900,cursor:"pointer"}}>Tentar novamente</button>\n    </div>\n  </div>\n);\n\nconst AlunoAppFirebase = ({ alunoId, onLogout, installPrompt }) => {\n  const [aluno, setAluno] = useState(null);\n  const [carregando, setCarregando] = useState(true);\n  const [erro, setErro] = useState("");\n\n  useEffect(() => {\n    setCarregando(true);\n    setErro("");\n    if (!alunoId) {\n      setErro("Não foi possível identificar o aluno conectado.");\n      setCarregando(false);\n      return;\n    }\n    const unsub = onSnapshot(\n      doc(db, "alunos", alunoId),\n      snap => {\n        setAluno(snap.exists() ? snap.data() : null);\n        setCarregando(false);\n      },\n      e => {\n        console.error("Falha ao carregar perfil do aluno:", e);\n        setErro("Não foi possível carregar seu perfil agora. Verifique a conexão e tente novamente.");\n        setCarregando(false);\n      }\n    );\n    return () => unsub();\n  }, [alunoId]);\n\n  const onUpdateAluno = async (updated) => {\n    await salvarAluno(updated);\n    setAluno(updated);\n  };\n\n  if (carregando) return (\n    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",zIndex:0}}>\n      <Watermark/>\n      <p style={{color:T.text3,fontSize:14}}>Carregando seu perfil...</p>\n    </div>\n  );\n\n  if (erro) return <TelaErroCarregamento titulo="Erro ao carregar perfil" mensagem={erro}/>;\n\n  if (!aluno) return (\n    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",zIndex:0}}>\n      <Watermark/>\n      <p style={{color:T.red,fontSize:14}}>Perfil não encontrado.</p>\n    </div>\n  );\n\n  return <AlunoApp aluno={aluno} onUpdateAluno={onUpdateAluno} onLogout={onLogout} installPrompt={installPrompt}/>;\n};\n\n`;

src = src.slice(0, alunoFirebaseStart) + alunoFirebaseNovo + src.slice(appRootStart);

const rootStart = src.indexOf('export default function App() {');
if (rootStart < 0) throw new Error("Root App não encontrado");

const rootNovo = `export default function App() {\n  const [auth,setAuth] = useState(null);\n  const [alunos,setAlunos] = useState([]);\n  const [carregando,setCarregando] = useState(true);\n  const [installPrompt,setInstallPrompt] = useState(null);\n  const [erroInicial,setErroInicial] = useState("");\n  const [carregandoAlunos,setCarregandoAlunos] = useState(false);\n  const [erroAlunos,setErroAlunos] = useState("");\n\n  // ── Captura o evento de instalação do PWA (Android/Chrome) ───────────────\n  useEffect(() => {\n    const onBeforeInstall = (e) => { e.preventDefault(); setInstallPrompt(e); };\n    const onInstalled = () => setInstallPrompt(null);\n    window.addEventListener("beforeinstallprompt", onBeforeInstall);\n    window.addEventListener("appinstalled", onInstalled);\n    return () => {\n      window.removeEventListener("beforeinstallprompt", onBeforeInstall);\n      window.removeEventListener("appinstalled", onInstalled);\n    };\n  }, []);\n\n  // ── Auth state listener ──────────────────────────────────────────────────\n  useEffect(() => {\n    const unsub = onAuthStateChanged(fbAuth, async (user) => {\n      setErroInicial("");\n      try {\n        if (!user) {\n          setAuth(null);\n          setAlunos([]);\n          setCarregandoAlunos(false);\n          return;\n        }\n\n        const CONTAS_EQUIPE = { "admin@imperio.app":"admin", "nutri@imperio.app":"nutri", "dono@imperio.app":"dono" };\n        if (CONTAS_EQUIPE[user.email]) {\n          setCarregandoAlunos(true);\n          setAuth({ role:CONTAS_EQUIPE[user.email], uid:user.uid });\n          return;\n        }\n\n        const email = user.email || "";\n        if (!email.endsWith("@imperio.app")) throw new Error("Conta autenticada inválida");\n        const cpf = email.replace("@imperio.app","");\n        const snap = await getDoc(doc(db,"alunos",cpf));\n        if (snap.exists()) {\n          setAuth({ role:"aluno", id:cpf, uid:user.uid });\n        } else {\n          await signOut(fbAuth);\n          setAuth(null);\n        }\n      } catch(e) {\n        console.error("Falha ao restaurar sessão:", e);\n        setAuth(null);\n        setErroInicial("Não foi possível carregar sua conta agora. Verifique a conexão e tente novamente.");\n      } finally {\n        setCarregando(false);\n      }\n    });\n    return () => unsub();\n  }, []);\n\n  // ── Carrega alunos em tempo real para admin, dono e nutricionista ────────\n  useEffect(() => {\n    const podeLerAlunos = auth && ["admin","dono","nutri"].includes(auth.role);\n    if (!podeLerAlunos) {\n      setCarregandoAlunos(false);\n      setErroAlunos("");\n      return;\n    }\n\n    setCarregandoAlunos(true);\n    setErroAlunos("");\n    const unsub = onSnapshot(\n      collection(db,"alunos"),\n      snap => {\n        setAlunos(snap.docs.map(d => d.data()));\n        setCarregandoAlunos(false);\n      },\n      e => {\n        console.error("Falha ao carregar alunos:", e);\n        setErroAlunos("Não foi possível carregar a lista de alunos agora. Verifique a conexão e tente novamente.");\n        setCarregandoAlunos(false);\n      }\n    );\n    return () => unsub();\n  }, [auth]);\n\n  // ── Atualiza aluno no Firestore e no state local ─────────────────────────\n  const updateAluno = useCallback(async (aluno) => {\n    await salvarAluno(aluno);\n    setAlunos(p => p.map(a => a.id === aluno.id ? aluno : a));\n  }, []);\n\n  // ── Adiciona aluno (cria auth + salva no Firestore) ──────────────────────\n  const addAluno = useCallback(async (novoAluno) => {\n    const cpfLimpo = String(novoAluno.cpf||"").replace(/\\D/g,"");\n    const senhaFinal = (novoAluno.senha && novoAluno.senha !== novoAluno.cpf) ? novoAluno.senha : cpfLimpo;\n    await criarContaAluno(cpfLimpo, senhaFinal);\n    await salvarAluno({ ...novoAluno, cpf:cpfLimpo, senha:senhaFinal, id: cpfLimpo });\n  }, []);\n\n  // ── Deleta aluno ──────────────────────────────────────────────────────────\n  const removerAluno = useCallback(async (id) => {\n    await deletarAluno(id);\n    setAlunos(p => p.filter(a => a.id !== id));\n  }, []);\n\n  const handleLogin = async (role, id) => {\n    // Login gerenciado pelo onAuthStateChanged.\n  };\n\n  const handleLogout = async () => {\n    await signOut(fbAuth);\n    setAuth(null);\n    setAlunos([]);\n  };\n\n  if (carregando) return (\n    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,position:"relative",zIndex:0}}>\n      <Watermark/>\n      <img src={LOGO_URL} alt="Império Academia" style={{width:90,height:"auto",filter:\`drop-shadow(0 8px 32px ${'${T.yellow}'}44)\`}}/>\n      <p style={{color:T.text3,fontSize:14}}>Carregando IMPÉRIO...</p>\n      <div style={{width:40,height:3,background:T.card2,borderRadius:50,overflow:"hidden"}}>\n        <div style={{width:"60%",height:"100%",background:T.gold,borderRadius:50,animation:"slide 1s ease-in-out infinite"}}/>\n      </div>\n    </div>\n  );\n\n  if (erroInicial) return <TelaErroCarregamento titulo="Erro ao carregar o app" mensagem={erroInicial}/>;\n\n  if (!auth) return <LoginScreen onLogin={handleLogin} />;\n\n  const precisaListaAlunos = ["admin","dono","nutri"].includes(auth.role);\n  if (precisaListaAlunos && carregandoAlunos) return (\n    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",zIndex:0}}>\n      <Watermark/>\n      <p style={{color:T.text3,fontSize:14}}>Carregando alunos...</p>\n    </div>\n  );\n  if (precisaListaAlunos && erroAlunos) return <TelaErroCarregamento titulo="Erro ao carregar alunos" mensagem={erroAlunos}/>;\n\n  if (auth.role === "admin" || auth.role === "dono") return (\n    <AdminPanel\n      alunos={alunos}\n      setAlunos={setAlunos}\n      onAddAluno={addAluno}\n      onUpdateAluno={updateAluno}\n      onDeleteAluno={removerAluno}\n      onLogout={handleLogout}\n      role={auth.role}\n    />\n  );\n\n  if (auth.role === "nutri") return (\n    <NutriPanel\n      alunos={alunos}\n      onUpdateAluno={updateAluno}\n      onLogout={handleLogout}\n    />\n  );\n\n  return (\n    <AlunoAppFirebase\n      alunoId={auth.id}\n      onLogout={handleLogout}\n      installPrompt={installPrompt}\n    />\n  );\n}\n`;

src = src.slice(0, rootStart) + rootNovo;

fs.writeFileSync(path, src);
console.log("✅ Patch de estabilidade aplicado em src/App.jsx");
