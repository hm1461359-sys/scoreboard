import { useState, useEffect } from "react";

const COLORS = ["#a78bfa","#f472b6","#34d399","#fbbf24","#60a5fa","#f87171","#818cf8","#2dd4bf","#fb923c","#c084fc"];

function toPersian(n) {
  return String(n).replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[d]);
}

function Confetti() {
  const pieces = Array.from({length: 22}, (_, i) => ({
    id: i, color: COLORS[i % COLORS.length],
    left: `${Math.random()*100}%`,
    delay: `${Math.random()*1.2}s`,
    size: 7 + Math.random() * 7,
    duration: `${1.8 + Math.random()}s`,
  }));
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:99,overflow:"hidden"}}>
      <style>{`@keyframes fall{0%{transform:translateY(-30px) rotate(0deg);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}`}</style>
      {pieces.map(p => (
        <div key={p.id} style={{
          position:"absolute",top:0,left:p.left,
          width:p.size,height:p.size,borderRadius:Math.random()>.5?"50%":"2px",
          background:p.color,opacity:.85,
          animation:`fall ${p.duration} ${p.delay} ease-in infinite`,
        }}/>
      ))}
    </div>
  );
}

function Avatar({name, color, size=36}) {
  return (
    <div style={{
      width:size,height:size,borderRadius:"50%",
      background:`${color}22`,border:`2px solid ${color}`,
      display:"flex",alignItems:"center",justifyContent:"center",
      color:color,fontWeight:800,fontSize:size*.38,flexShrink:0,
    }}>
      {name[0]}
    </div>
  );
}

export default function Scoreboard() {
  const [screen, setScreen] = useState("setup");
  const [nameInput, setNameInput] = useState("");
  const [players, setPlayers] = useState([]);
  const [round, setRound] = useState(1);
  const [scores, setScores] = useState({});
  const [history, setHistory] = useState([]);
  const [scoreLimit, setScoreLimit] = useState("");
  const [scoreLimitInput, setScoreLimitInput] = useState("");
  const [winners, setWinners] = useState([]);
  const [losers, setLosers] = useState([]);
  const [flash, setFlash] = useState(null);

  const addPlayer = () => {
    const n = nameInput.trim();
    if (!n || players.find(p => p.name === n)) return;
    setPlayers(prev => [...prev, { name: n, color: COLORS[prev.length % COLORS.length], total: 0 }]);
    setNameInput("");
  };

  const startGame = () => {
    if (players.length < 2) return;
    const limit = parseInt(scoreLimitInput);
    if (!limit || limit < 1) return;
    setScoreLimit(limit);
    setRound(1); setScores({}); setHistory([]); setWinners([]); setLosers([]);
    setPlayers(prev => prev.map(p => ({ ...p, total: 0 })));
    setScreen("game");
  };

  // بازی جدید با همان بازیکنان — فقط امتیازها ریست
  const newGameSamePlayers = () => {
    const limit = parseInt(scoreLimitInput) || scoreLimit;
    setScoreLimit(limit);
    setRound(1); setScores({}); setHistory([]); setWinners([]); setLosers([]);
    setPlayers(prev => prev.map(p => ({ ...p, total: 0 })));
    setScreen("game");
  };

  // بازی کاملاً جدید
  const fullReset = () => {
    setPlayers([]); setNameInput(""); setRound(1); setScores({});
    setHistory([]); setScoreLimit(""); setScoreLimitInput(""); setWinners([]); setLosers([]);
    setScreen("setup");
  };

  const submitRound = () => {
    const roundScores = {};
    const currentLosers = losers.map(l => l.name);
    players.filter(p => !currentLosers.includes(p.name)).forEach(p => {
      roundScores[p.name] = Number(scores[p.name] || 0);
    });

    const updated = players.map(p =>
      currentLosers.includes(p.name) ? p : { ...p, total: p.total + (roundScores[p.name] || 0) }
    );

    // هر کس به سقف رسید بازنده میشه
    const newLosers = updated.filter(p => p.total >= scoreLimit && !currentLosers.includes(p.name));

    setHistory(h => [...h, { round, scores: roundScores }]);
    setPlayers(updated);
    setScores({});
    setRound(r => r + 1);

    if (newLosers.length > 0) {
      setFlash(newLosers.map(p => p.name).join("، "));
      const allLosers = [...losers, ...newLosers];
      setLosers(allLosers);
      const allLoserNames = allLosers.map(l => l.name);
      // بازی تموم میشه چون کسی به سقف رسیده
      const remaining = updated.filter(p => !allLoserNames.includes(p.name));
      // برنده‌ها کسانی‌اند که هنوز حذف نشدن
      setTimeout(() => {
        setWinners(remaining);
        setScreen("winner");
      }, 900);
    }
  };

  const endGame = () => {
    const loserNames = losers.map(l => l.name);
    const remaining = players.filter(p => !loserNames.includes(p.name));
    setWinners(remaining.length ? remaining : players);
    setScreen("winner");
  };

  useEffect(() => {
    if (flash) { const t = setTimeout(() => setFlash(null), 2200); return () => clearTimeout(t); }
  }, [flash]);

  const loserNames = losers.map(l => l.name);
  const activePlayers = players.filter(p => !loserNames.includes(p.name));
  const sorted = [...players].sort((a, b) => a.total - b.total);

  return (
    <div style={S.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;600;800&display=swap');
        *{box-sizing:border-box}
        input::placeholder{color:#4a5568}
        input:focus{outline:none;border-color:#a78bfa!important;box-shadow:0 0 0 3px rgba(167,139,250,.15)}
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:#2d3748;border-radius:4px}
        @keyframes slideIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        @keyframes popIn{0%{transform:scale(.7);opacity:0}80%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
        .screen{animation:slideIn .3s ease}
        .pop{animation:popIn .5s ease}
      `}</style>

      {screen === "winner" && <Confetti />}

      {flash && (
        <div className="pop" style={{
          position:"fixed",top:24,left:"50%",transform:"translateX(-50%)",
          background:"#1a1a2e",border:"1.5px solid #f472b6",
          borderRadius:16,padding:"12px 24px",color:"#f472b6",
          fontWeight:700,fontSize:15,zIndex:100,
          boxShadow:"0 8px 32px rgba(244,114,182,.25)",
          fontFamily:"Vazirmatn,Tahoma,sans-serif",direction:"rtl",whiteSpace:"nowrap",
        }}>
          💀 {flash} به سقف رسید!
        </div>
      )}

      <div style={S.card}>
        {/* Header */}
        <div style={S.header}>
          <div style={S.logoWrap}><span style={{fontSize:20}}>🎮</span></div>
          <h1 style={S.title}>امتیازنامه</h1>
          {screen === "game" && <button style={S.ghostBtn} onClick={() => setScreen("history")}>📋 تاریخچه</button>}
          {screen === "history" && <button style={S.ghostBtn} onClick={() => setScreen("game")}>← بازگشت</button>}
        </div>

        {/* ── SETUP ── */}
        {screen === "setup" && (
          <div style={S.body} className="screen">
            <div style={S.section}>
              <label style={S.label}>🎯 سقف امتیاز</label>
              <input style={S.input} type="number" placeholder="مثلاً ۱۰۰"
                value={scoreLimitInput} onChange={e => setScoreLimitInput(e.target.value)} />
            </div>
            <div style={S.section}>
              <label style={S.label}>👥 بازیکنان</label>
              <div style={{display:"flex",gap:8}}>
                <input style={S.input} placeholder="اسم بازیکن..." value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addPlayer()} />
                <button style={S.addBtn} onClick={addPlayer}>+</button>
              </div>
            </div>
            {players.length > 0 && (
              <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
                {players.map((p, i) => (
                  <div key={p.name} style={S.playerCard}>
                    <Avatar name={p.name} color={p.color} size={34} />
                    <span style={{color:"#e2e8f0",fontSize:15,flex:1}}>{p.name}</span>
                    <button style={S.removeBtn} onClick={() => setPlayers(players.filter((_, j) => j !== i))}>✕</button>
                  </div>
                ))}
              </div>
            )}
            {players.length >= 2 && scoreLimitInput
              ? <button style={S.primaryBtn} onClick={startGame}>شروع بازی ▶</button>
              : <p style={S.hint}>{players.length < 2 ? "حداقل ۲ بازیکن اضافه کن" : "سقف امتیاز را وارد کن"}</p>
            }
          </div>
        )}

        {/* ── GAME ── */}
        {screen === "game" && (
          <div style={S.body} className="screen">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <div style={S.badge}>دور {toPersian(round)}</div>
              <div style={{color:"#718096",fontSize:13}}>سقف: <span style={{color:"#a78bfa",fontWeight:700}}>{toPersian(scoreLimit)}</span></div>
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:16}}>
              {sorted.map((p, i) => {
                const isOut = loserNames.includes(p.name);
                const isFirst = i === 0 && !isOut;
                const pct = Math.min(100, Math.round((p.total / scoreLimit) * 100));
                return (
                  <div key={p.name} style={{
                    ...S.leaderCard, opacity: isOut ? .35 : 1,
                    border:`1px solid ${isOut?"#2d3748":isFirst?p.color+"55":"rgba(255,255,255,0.06)"}`,
                    background: isFirst ? `${p.color}0d` : "rgba(255,255,255,0.03)",
                  }}>
                    <span style={{color:isFirst?p.color:"#4a5568",fontSize:13,fontWeight:700,width:20,textAlign:"center"}}>
                      {isFirst ? "👑" : toPersian(i + 1)}
                    </span>
                    <Avatar name={p.name} color={p.color} size={32} />
                    <div style={{flex:1}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span style={{color:isOut?"#4a5568":"#e2e8f0",fontSize:14,fontWeight:600}}>
                          {p.name}{isOut ? " 💀" : ""}
                        </span>
                        <span style={{color:p.color,fontWeight:800,fontSize:16}}>{toPersian(p.total)}</span>
                      </div>
                      <div style={S.barBg}>
                        <div style={{...S.barFill,width:`${pct}%`,background:`linear-gradient(90deg,${p.color}88,${p.color})`}} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={S.divider} />
            <p style={S.label}>✏️ امتیاز این دور</p>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
              {activePlayers.map(p => (
                <div key={p.name} style={{display:"flex",alignItems:"center",gap:10}}>
                  <Avatar name={p.name} color={p.color} size={30} />
                  <span style={{color:"#cbd5e0",fontSize:14,flex:1}}>{p.name}</span>
                  <input style={{...S.input,maxWidth:90,textAlign:"center",direction:"ltr",padding:"8px 10px"}}
                    type="number" placeholder="0" value={scores[p.name] || ""}
                    onChange={e => setScores(s => ({...s, [p.name]: e.target.value}))} />
                </div>
              ))}
            </div>

            <div style={{display:"flex",gap:8}}>
              <button style={{...S.primaryBtn,flex:2}} onClick={submitRound}>ثبت دور ✓</button>
              <button style={{...S.primaryBtn,flex:1,background:"linear-gradient(135deg,#f093fb,#f5576c)"}} onClick={endGame}>پایان 🏆</button>
            </div>
          </div>
        )}

        {/* ── WINNER ── */}
        {screen === "winner" && (
          <div style={{...S.body,textAlign:"center"}} className="screen">
            <div style={{fontSize:60,marginBottom:8}} className="pop">🏆</div>
            {winners.length === 0 ? (
              <p style={{color:"#718096",fontSize:14,marginBottom:20}}>همه به سقف رسیدن! بازی مساوی شد 🤝</p>
            ) : winners.length === 1 ? (
              <>
                <p style={{color:"#718096",margin:"0 0 8px",fontSize:13}}>برنده بازی</p>
                <div style={{display:"flex",justifyContent:"center",marginBottom:8}}>
                  <Avatar name={winners[0].name} color={winners[0].color} size={56} />
                </div>
                <div style={{color:winners[0].color,fontSize:26,fontWeight:800,marginBottom:4}}>{winners[0].name}</div>
                <div style={{color:"#4a5568",fontSize:13,marginBottom:22}}>{toPersian(winners[0].total)} امتیاز</div>
              </>
            ) : (
              <>
                <p style={{color:"#718096",margin:"0 0 12px",fontSize:13}}>برندگان بازی 🎊</p>
                <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap",marginBottom:22}}>
                  {winners.map(w => (
                    <div key={w.name} style={{textAlign:"center"}}>
                      <Avatar name={w.name} color={w.color} size={48} />
                      <div style={{color:w.color,fontWeight:800,fontSize:16,marginTop:6}}>{w.name}</div>
                      <div style={{color:"#4a5568",fontSize:12}}>{toPersian(w.total)} امتیاز</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:20}}>
              {sorted.map((p, i) => {
                const isOut = loserNames.includes(p.name);
                return (
                  <div key={p.name} style={{...S.leaderCard,opacity:isOut?.35:1,border:"1px solid rgba(255,255,255,0.06)"}}>
                    <span style={{color:"#4a5568",fontSize:13,width:20,textAlign:"center"}}>{toPersian(i+1)}</span>
                    <Avatar name={p.name} color={p.color} size={28} />
                    <span style={{color:isOut?"#4a5568":"#e2e8f0",fontSize:14,flex:1}}>{p.name}{isOut?" 💀":""}</span>
                    <span style={{color:p.color,fontWeight:700}}>{toPersian(p.total)}</span>
                  </div>
                );
              })}
            </div>

            {/* دکمه‌های پایان */}
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              <button style={{...S.primaryBtn}} onClick={newGameSamePlayers}>
                🔄 بازی جدید — همان بازیکنان
              </button>
              <button style={{...S.primaryBtn,background:"rgba(255,255,255,0.07)"}} onClick={fullReset}>
                ➕ بازی کاملاً جدید
              </button>
            </div>
          </div>
        )}

        {/* ── HISTORY ── */}
        {screen === "history" && (
          <div style={S.body} className="screen">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
              <p style={{...S.label,margin:0}}>📋 تاریخچه دورها</p>
              {history.length > 0 && (
                <button style={{...S.ghostBtn,color:"#f472b6",borderColor:"rgba(244,114,182,.3)"}}
                  onClick={() => { setHistory([]); setRound(1); }}>
                  🗑 پاک کردن
                </button>
              )}
            </div>
            {history.length === 0 && <p style={S.hint}>هنوز دوری ثبت نشده</p>}
            {[...history].reverse().map(h => (
              <div key={h.round} style={{...S.leaderCard,flexDirection:"column",alignItems:"stretch",gap:8,marginBottom:10,border:"1px solid rgba(255,255,255,0.06)"}}>
                <div style={{color:"#a78bfa",fontWeight:700,fontSize:13,marginBottom:2}}>دور {toPersian(h.round)}</div>
                {Object.entries(h.scores).map(([name, sc]) => {
                  const p = players.find(x => x.name === name);
                  return (
                    <div key={name} style={{display:"flex",alignItems:"center",gap:8}}>
                      <Avatar name={name} color={p?.color||"#aaa"} size={24} />
                      <span style={{color:"#cbd5e0",fontSize:14,flex:1}}>{name}</span>
                      <span style={{color:sc>=0?"#34d399":"#f472b6",fontWeight:700,fontSize:14}}>
                        {sc >= 0 ? "+" : ""}{toPersian(sc)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const S = {
  root:{
    minHeight:"100vh",
    background:"#0d0d1a",
    backgroundImage:"radial-gradient(ellipse at 20% 50%,rgba(167,139,250,.08) 0%,transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(244,114,182,.06) 0%,transparent 50%)",
    display:"flex",alignItems:"flex-start",justifyContent:"center",
    padding:"20px 16px 40px",
    fontFamily:"Vazirmatn,Tahoma,sans-serif",direction:"rtl",
  },
  card:{
    background:"rgba(255,255,255,0.03)",backdropFilter:"blur(20px)",
    borderRadius:24,border:"1px solid rgba(255,255,255,0.08)",
    width:"100%",maxWidth:460,
    boxShadow:"0 25px 80px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,0.05)",
  },
  header:{
    display:"flex",alignItems:"center",gap:10,
    padding:"16px 20px 14px",borderBottom:"1px solid rgba(255,255,255,0.06)",
  },
  logoWrap:{
    width:36,height:36,borderRadius:11,
    background:"linear-gradient(135deg,rgba(167,139,250,.2),rgba(244,114,182,.2))",
    border:"1px solid rgba(167,139,250,.3)",
    display:"flex",alignItems:"center",justifyContent:"center",
  },
  title:{color:"#f7fafc",fontSize:18,fontWeight:800,margin:0,flex:1},
  ghostBtn:{
    background:"rgba(255,255,255,0.06)",color:"#a0aec0",
    border:"1px solid rgba(255,255,255,0.1)",
    borderRadius:10,padding:"6px 12px",cursor:"pointer",fontSize:12,fontFamily:"inherit",
  },
  body:{padding:"18px 20px 26px",maxHeight:"84vh",overflowY:"auto"},
  section:{marginBottom:18},
  label:{color:"#718096",fontSize:12,marginBottom:8,display:"block",fontWeight:600},
  hint:{color:"#4a5568",fontSize:13,textAlign:"center",marginTop:10},
  input:{
    width:"100%",background:"rgba(255,255,255,0.05)",
    border:"1px solid rgba(255,255,255,0.1)",
    borderRadius:12,color:"#f7fafc",fontSize:14,
    padding:"10px 14px",direction:"rtl",transition:"all .2s",
    fontFamily:"Vazirmatn,Tahoma,sans-serif",
  },
  addBtn:{
    background:"linear-gradient(135deg,#a78bfa,#7c3aed)",color:"#fff",border:"none",
    borderRadius:12,width:44,height:44,fontSize:22,cursor:"pointer",fontWeight:700,flexShrink:0,
  },
  playerCard:{
    display:"flex",alignItems:"center",gap:10,
    background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",
    borderRadius:14,padding:"10px 14px",
  },
  removeBtn:{background:"none",border:"none",color:"#4a5568",cursor:"pointer",fontSize:13,padding:0,fontFamily:"inherit"},
  primaryBtn:{
    background:"linear-gradient(135deg,#a78bfa,#7c3aed)",color:"#fff",border:"none",
    borderRadius:13,padding:"12px 18px",fontSize:14,fontWeight:700,
    cursor:"pointer",width:"100%",fontFamily:"inherit",
    boxShadow:"0 4px 20px rgba(167,139,250,.25)",
  },
  badge:{
    display:"inline-flex",alignItems:"center",
    background:"rgba(167,139,250,.12)",color:"#a78bfa",
    border:"1px solid rgba(167,139,250,.3)",
    borderRadius:20,padding:"4px 14px",fontSize:13,fontWeight:700,
  },
  leaderCard:{
    display:"flex",alignItems:"center",gap:10,
    borderRadius:14,padding:"10px 12px",transition:"all .3s",
  },
  barBg:{height:3,background:"rgba(255,255,255,0.06)",borderRadius:4,marginTop:6,overflow:"hidden"},
  barFill:{height:"100%",borderRadius:4,transition:"width .6s cubic-bezier(.4,0,.2,1)"},
  divider:{height:1,background:"rgba(255,255,255,0.06)",margin:"14px 0"},
};
