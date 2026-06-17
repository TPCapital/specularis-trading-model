import React, { useState, useEffect, useCallback } from "react";

function ls(k,d){try{var v=localStorage.getItem(k);return v!==null?v:d}catch(e){return d}}
function lsSet(k,v){try{localStorage.setItem(k,v)}catch(e){}}
const TODAY=new Date().toDateString();
const BUILD_ID="v7.5.0 macro bar · yields + calendar · 2026-06-18";

const PRE_ZH=[
  {t:"今日有无重大数据（FOMC/CPI/NFP）发布？",w:"有 → 降低预期或跳过当天"},
  {t:"VIX是否高于25？",w:"是 → 期权贵，缩仓或跳过"},
  {t:"QQQ IV Rank是否高于50%？",w:"是 → 需更大方向移动才盈利"},
  {t:"今日开盘缺口与昨收方向？",w:"反向缺口 → 谨慎执行"},
  {t:"SpotGamma GEX已读取并填入系统？",w:"正GEX偏震荡；负GEX偏趋势"},
];
const PRE_EN=[
  {t:"Any major data releases today (FOMC/CPI/NFP)?",w:"Yes → lower expectations or skip"},
  {t:"Is VIX above 25?",w:"Yes → options expensive, reduce or skip"},
  {t:"Is QQQ IV Rank above 50%?",w:"Yes → needs bigger move to profit"},
  {t:"Today's gap vs yesterday's close direction?",w:"Gap against trend = caution"},
  {t:"SpotGamma GEX read and entered?",w:"Pos GEX = range; Neg GEX = trend"},
];
const DAY_ZH=[
  "GEX环境已填入：正/负GEX已确认，Flip和Call/Put Wall价位已记录。",
  "标的已确认为QQQ，固定1张合约。",
  "时间已确认在09:45–11:30 ET窗口内。",
  "VWAP方向明确（价格不在VWAP附近横跳）。",
  "EMA确认：9EMA在21EMA上/下方且发散（不粘合）。",
  "量能确认：当前量 > 前5根K线平均量 × 1.5倍。",
  "四项入场条件全部满足（VWAP + EMA + 量能 + 时间）。",
  "失效位已写清：止损 −$20，具体出场价已确定。",
  "VIX未超过25，IV Rank未超过50%。",
  "未触发熔断：当日未亏$50 / 未连亏2笔。",
  "今日无FOMC/CPI发布前后15分钟内。",
  "情绪正常：无回本、报复、补偿心理。",
  "今日GEX环境与操作方向一致。",
];
const DAY_EN=[
  "GEX entered: Pos/Neg confirmed, Flip and Call/Put Wall logged.",
  "Instrument confirmed as QQQ, 1 contract fixed.",
  "Time confirmed within 09:45–11:30 ET window.",
  "VWAP direction clear (not choppy near VWAP).",
  "EMA confirmed: 9EMA above/below 21EMA and diverging.",
  "Volume confirmed: current bar > prior 5-bar avg × 1.5×.",
  "All 4 entry conditions satisfied (VWAP + EMA + Volume + Time).",
  "Invalidation written: stop = −$20, exact exit price defined.",
  "VIX below 25 and IV Rank below 50%.",
  "No circuit breakers: daily loss < $50, consecutive losses < 2.",
  "No FOMC/CPI release within 15 min.",
  "Emotional state normal: no chasing, revenge, or compensation urge.",
  "GEX environment aligns with intended trade direction.",
];
const SC_ZH=[
  "基本面筛选通过：营收/利润连续增长，行业景气度正向。",
  "无重大负面事件（诉讼/退市/会计问题）。",
  "周线趋势不坏：处于关键支撑或突破回踩位置。",
  "日线结构完整：确认支撑，未破主结构低点。",
  "60分钟入场确认：拒绝K线 + 量能启动。",
  "VIX环境允许：VIX未急速上行（<25优先）。",
  "仓位已计算：符合整体配置比例，非单次押注。",
  "止损位在主结构下方，不因短期波动出场。",
];
const SC_EN=[
  "Fundamental screen passed: consistent revenue/profit growth, positive sector.",
  "No major negatives (litigation, delisting, accounting issues).",
  "Weekly trend intact: at key support or post-breakout pullback.",
  "Daily structure intact: support confirmed, major low not broken.",
  "60-min entry confirmation: rejection candle + volume.",
  "VIX environment permits: VIX not surging (<25 preferred).",
  "Position sized correctly within overall portfolio allocation.",
  "Stop placed below major structure, not triggered by short-term noise.",
];
const GC_ZH=[
  "宏观方向确认：DXY与实际利率未同时走强（做多黄金前）。",
  "日线主结构方向明确，处于有利面（多或空）。",
  "在Kill Zone时间窗口内（伦敦15:00–17:00 / 纽约21:30–23:30）。",
  "4H/1H找到流动性位置：BSL/SSL已扫出，FVG/OB/POC有重叠。",
  "15M/5M确认信号：出现CHoCH/BOS + 长影线拒绝 + 量能启动。",
  "已确认不是只扫不收（价格真正收回结构区）。",
  "今日无FOMC/CPI/NFP发布，或发布后已等到二次确认。",
  "止损位放在结构外（扫单高点/低点之外）。",
  "RR比值 ≥ 1:2，到1:1.5先锁一半利润。",
];
const GC_EN=[
  "Macro confirmed: DXY and real rates not both rising (before long).",
  "Daily major structure direction clear and favorable.",
  "Within Kill Zone (London 15:00–17:00 / NY 21:30–23:30 BJ).",
  "4H/1H liquidity level found: BSL/SSL swept, FVG/OB/POC confluence.",
  "15M/5M confirmation: CHoCH/BOS + long wick rejection + volume.",
  "Confirmed reclaim (not just sweep without recovery).",
  "No FOMC/CPI/NFP today, or second confirmation already waited.",
  "Stop placed outside structure (beyond sweep high/low).",
  "RR ratio ≥ 1:2; lock 50% at 1:1.5.",
];
const EC_ZH=[
  "趋势环境确认：EMA 9/21/55顺排，且ADX > 25。",
  "在Kill Zone时间窗口内（伦敦15:00–17:00 / 纽约21:30–23:30）。",
  "Kill Zone已扫出前高/前低，方向已确立。",
  "回踩到EMA21或关键结构支撑位。",
  "等到拒绝K线确认（影线 + 阳线/阴线收实体）。",
  "ADX当前 > 20，均线未缠绕。",
  "今日无重大数据发布前后（FOMC/ECB/CPI/NFP）。",
  "不是第一根破位K线（等回踩，不追动量）。",
  "RR比值 ≥ 1:2；设好止损在结构外。",
];
const EC_EN=[
  "Trend environment confirmed: EMA 9/21/55 aligned, ADX > 25.",
  "Within Kill Zone (London 15:00–17:00 / NY 21:30–23:30 BJ).",
  "Kill Zone has swept prior high/low, direction established.",
  "Price pulled back to EMA21 or key structural support.",
  "Rejection candle confirmed (wick + solid close body).",
  "ADX currently above 20, EMAs not tangled.",
  "No major data release nearby (FOMC/ECB/CPI/NFP).",
  "Not the first breakout candle (waiting for pullback).",
  "RR ratio ≥ 1:2; stop placed outside structure.",
];

const RULES_OPT_ZH=["只做QQQ，不碰个股","固定1张，永不加张（重建阶段）","前15分钟只看不动","四项入场条件缺一不可","亏$20无条件出场","日亏$50停止交易","11:30后不开新仓","补偿心理出现 → 立刻停止","盈利后积累执行记录，不放大","系统高于感觉 · 纪律高于判断"];
const RULES_OPT_EN=["Trade QQQ only — no individual stocks","Fixed 1 contract, never scale up","First 15 min: observe only","All 4 entry conditions required","−$20 stop: unconditional exit","Daily −$50: stop trading","No new positions after 11:30 ET","Revenge psychology → stop immediately","After profits, build record before scaling","System over instinct"];
const RULES_STOCK_ZH=["先筛基本面，再看技术位置","周线级别持有，不做日内","止损放主结构下方，不因噪音出场","突破确认后才加仓，不摊平下跌","不因K线好看或热点消息入场","VIX急速上行时降低仓位或观望"];
const RULES_STOCK_EN=["Fundamental screen before technical timing","Hold at weekly timeframe — no intraday","Stop below major structure, not noise","Add only after confirmed breakout","Never enter on aesthetics or hype","Reduce size or observe when VIX spikes"];
const RULES_GOLD_ZH=["DXY与实际利率双向压制时禁止做多","在Kill Zone内找入场，不在亚洲盘中间位追","等CHoCH/BOS确认，不在测试区抢跑","只拿中间段，止损放结构外","扫单不收回 → 放弃，不入场","FOMC/CPI发布瞬间不进，等二次确认"];
const RULES_GOLD_EN=["No longs when DXY and real rates both rising","Find entries in Kill Zone, not Asian midrange","Wait for CHoCH/BOS, don't front-run test zones","Take middle leg only, stop outside structure","Sweep without reclaim → abandon","Don't chase FOMC/CPI release — wait for 2nd confirm"];
const RULES_EUR_ZH=["ADX<20 + 均线缠绕 → 系统无效，不做","等Kill Zone扫出前高低再找入场方向","回踩EMA21/结构位，等拒绝K线确认","不追第一根破位K线，等回踩","RR≥1:2；到1:1.5先锁一半","重大数据发布前后15分钟不入场"];
const RULES_EUR_EN=["ADX<20 + tangled EMAs → system invalid","Wait for Kill Zone sweep before direction","Pullback to EMA21/structure, wait for rejection","Never chase the first breakout candle","RR ≥ 1:2; lock 50% at 1:1.5","No entries within 15 min of major data release"];

const MACRO_GOLD_ZH=[
  {s:"实际利率↓ + DXY↓",a:"最友好环境，主动做多",c:"green"},
  {s:"单向利多（其一）",a:"偏多，需结构确认",c:"blue"},
  {s:"双向平稳",a:"中性，用SMC结构确认方向",c:"slate"},
  {s:"单向压制（其一）",a:"谨慎，降仓，等更好位置",c:"amber"},
  {s:"实际利率↑ + DXY↑",a:"禁止做多，宏观双向压制",c:"red"},
];
const MACRO_GOLD_EN=[
  {s:"Real rates↓ + DXY↓",a:"Most favorable — actively seek longs",c:"green"},
  {s:"Single tailwind (either)",a:"Bullish bias — require confirmation",c:"blue"},
  {s:"Both stable",a:"Neutral — use SMC to confirm direction",c:"slate"},
  {s:"Single headwind (either)",a:"Caution — reduce size, wait for better",c:"amber"},
  {s:"Real rates↑ + DXY↑",a:"NO longs — dual macro headwind",c:"red"},
];

function useTheme(){
  const [dark,setDark]=useState(()=>ls("sea-theme-v7","dark")!=="light");
  const toggle=()=>{setDark(d=>{const n=!d;lsSet("sea-theme-v7",n?"dark":"light");return n;});};
  return {dark,toggle};
}
function useLang(){
  const [zh,setZh]=useState(()=>ls("sea-lang-v7","zh")!=="en");
  const toggle=()=>{setZh(z=>{lsSet("sea-lang-v7",z?"en":"zh");return !z;});};
  return {zh,toggle};
}
function useGEX(){
  const EMPTY={state:null,flip:"",call:"",put:"",vol:""};
  const [gex,setGex]=useState(()=>{
    try{const s=ls("sea-gex-v7",null);if(s){const p=JSON.parse(s);if(p.date===TODAY)return p;}}catch(e){}
    return EMPTY;
  });
  const save=useCallback((data)=>{lsSet("sea-gex-v7",JSON.stringify({...data,date:TODAY}));setGex({...data,date:TODAY});},[]);
  return {gex,save,isToday:!!gex.state&&gex.date===TODAY};
}
function useChecks(key){
  const [c,setC]=useState(()=>{try{return JSON.parse(ls("sea-chk-"+key,"{}"));}catch(e){return{};}});
  const toggle=useCallback((i)=>{setC(p=>{const n={...p,[i]:!p[i]};lsSet("sea-chk-"+key,JSON.stringify(n));return n;});},[key]);
  const reset=useCallback(()=>{setC({});lsSet("sea-chk-"+key,"{}");},[key]);
  return {c,toggle,reset,count:Object.values(c).filter(Boolean).length};
}
function useQuotes(){
  const [ticks,setTicks]=useState({});
  const [status,setStatus]=useState("connecting");
  const fetch1=useCallback(async(sym)=>{
    try{
      const r=await fetch(`/api/quote?symbol=${encodeURIComponent(sym)}`);
      if(!r.ok)return null;
      const d=await r.json();
      return d;
    }catch(e){return null;}
  },[]);
  const refresh=useCallback(async()=>{
    const pairs=[["QQQ","QQQ"],["SPY","SPY"],["GLD","GLD"],["^VIX","VIX"],["EURUSD=X","EUR"],["UUP","DXY"]];
    const res={};let ok=false;
    for(const[sym,key]of pairs){const d=await fetch1(sym);if(d){res[key]=d;ok=true;}}
    setTicks(res);setStatus(ok?"live":"offline");
  },[fetch1]);
  useEffect(()=>{refresh();const id=setInterval(refresh,90000);return()=>clearInterval(id);},[refresh]);
  return{ticks,status};
}
function useClock(){
  const [t,setT]=useState("--:-- ET");
  useEffect(()=>{
    const tick=()=>{try{const et=new Date(new Date().toLocaleString("en-US",{timeZone:"America/New_York"}));const p=n=>String(n).padStart(2,"0");setT(`${p(et.getHours())}:${p(et.getMinutes())} ET`);}catch(e){}};
    tick();const id=setInterval(tick,30000);return()=>clearInterval(id);
  },[]);
  return t;
}
function useMacro(){
  const [macro,setMacro]=useState(null);
  const [macroStatus,setMacroStatus]=useState("loading");
  const fetchMacro=useCallback(async()=>{
    try{
      const r=await fetch("/api/macro");
      if(!r.ok){setMacroStatus("error");return;}
      const d=await r.json();
      setMacro(d);setMacroStatus("ok");
    }catch(e){setMacroStatus("error");}
  },[]);
  useEffect(()=>{fetchMacro();const id=setInterval(fetchMacro,180000);return()=>clearInterval(id);},[fetchMacro]);
  return{macro,macroStatus};
}

const C={
  teal:"#10d9b8",red:"#f87171",amber:"#fbbf24",blue:"#60a5fa",green:"#34d399",violet:"#a78bfa",coral:"#f97316",
};
const darkVars={bg:"#0d1117",bg2:"#161b27",bg3:"#1c2333",bg4:"#242e42",t1:"rgba(255,255,255,0.92)",t2:"rgba(255,255,255,0.55)",t3:"rgba(255,255,255,0.28)",bd:"rgba(255,255,255,0.09)",bd2:"rgba(255,255,255,0.18)"};
const lightVars={bg:"#f8f9fb",bg2:"#ffffff",bg3:"#f0f2f5",bg4:"#e8eaf0",t1:"#0f1117",t2:"#4a5568",t3:"#9aa3b3",bd:"rgba(0,0,0,0.08)",bd2:"rgba(0,0,0,0.16)"};

// ─── MACRO BAR: yields + economic calendar ───────────────────────────────────
function YieldCell({label,yld,warn}){
  if(!yld)return(
    <div style={{display:"flex",flexDirection:"column",gap:2,padding:"6px 14px",borderRight:"1px solid var(--bd)"}}>
      <div style={{fontSize:9,letterSpacing:".12em",color:"var(--t3)",fontWeight:700,textTransform:"uppercase"}}>{label}</div>
      <div style={{fontSize:16,fontWeight:800,fontFamily:"monospace",color:"var(--bg4)"}}>—</div>
    </div>
  );
  const col=warn?yld.chg>0?"var(--red)":"var(--green)":"var(--t2)";
  const chgCol=yld.chg>0?"var(--red)":yld.chg<0?"var(--green)":"var(--t3)";
  return(
    <div style={{display:"flex",flexDirection:"column",gap:2,padding:"6px 14px",borderRight:"1px solid var(--bd)"}}>
      <div style={{fontSize:9,letterSpacing:".12em",color:"var(--t3)",fontWeight:700,textTransform:"uppercase"}}>{label}</div>
      <div style={{display:"flex",alignItems:"baseline",gap:5}}>
        <div style={{fontSize:18,fontWeight:800,fontFamily:"monospace",color:col,lineHeight:1}}>{yld.price.toFixed(2)}<span style={{fontSize:10,color:"var(--t3)",fontWeight:400}}>%</span></div>
        <span style={{fontSize:10,fontWeight:700,color:chgCol}}>{yld.chg>=0?"+":""}{yld.chg.toFixed(2)}</span>
      </div>
    </div>
  );
}

function EventBadge({ev,zh}){
  const riskColor={extreme:"var(--red)",high:"var(--amber)",medium:"var(--blue)"}[ev.risk]||"var(--t3)";
  const labelZh={FOMC:"FOMC利率",CPI:"CPI通胀",NFP:"非农",PPI:"PPI",GDP:"GDP",PCE:"PCE"}[ev.key]||ev.key;
  const warnZh={extreme:"极高风险 · 考虑跳过",high:"高风险 · 降低预期",medium:"中风险 · 注意时间"}[ev.risk]||"";
  const warnEn={extreme:"Extreme risk · consider skip",high:"High risk · lower expectations",medium:"Medium risk · watch timing"}[ev.risk]||"";
  return(
    <div style={{display:"flex",alignItems:"center",gap:6,padding:"4px 11px",borderRadius:5,border:`1px solid color-mix(in srgb,${riskColor} 40%,transparent)`,background:`color-mix(in srgb,${riskColor} 12%,transparent)`}}>
      <span style={{fontSize:13}}>{ev.emoji}</span>
      <div>
        <div style={{fontSize:11,fontWeight:800,color:riskColor,letterSpacing:".06em"}}>{zh?labelZh:ev.key}</div>
        <div style={{fontSize:9,color:"var(--t2)",marginTop:1,letterSpacing:".04em"}}>{zh?warnZh:warnEn}</div>
      </div>
    </div>
  );
}

function MacroBar({macro,zh}){
  const riskColors={extreme:"var(--red)",high:"var(--amber)",medium:"var(--blue)",clear:"var(--green)"};
  const riskLabels={
    extreme:{zh:"⚠ 极高风险日 · 建议跳过或大幅缩仓",en:"⚠ Extreme Risk Day · skip or drastically reduce"},
    high:{zh:"⚡ 高风险数据日 · 降低仓位预期",en:"⚡ High Risk Data Day · lower expectations"},
    medium:{zh:"📌 中级数据日 · 注意发布时间",en:"📌 Medium Risk Day · watch release time"},
    clear:{zh:"✓ 今日无重大数据发布",en:"✓ No major data releases today"},
  };
  const loading=!macro;
  return(
    <div style={{borderBottom:"1px solid var(--bd)",background:"var(--bg3)",display:"flex",alignItems:"stretch",flexWrap:"wrap",minHeight:52}}>
      {/* Section label */}
      <div style={{display:"flex",alignItems:"center",padding:"0 14px",borderRight:"1px solid var(--bd)",minWidth:72,flexShrink:0}}>
        <div style={{fontSize:8,letterSpacing:".18em",color:"var(--t3)",fontWeight:700,textTransform:"uppercase",lineHeight:1.4}}>MACRO<br/>DATA</div>
      </div>

      {/* Yield cells */}
      <YieldCell label="5Y YIELD" yld={loading?null:macro.yields?.y5} warn/>
      <YieldCell label="10Y YIELD" yld={loading?null:macro.yields?.y10} warn/>
      <YieldCell label="30Y YIELD" yld={loading?null:macro.yields?.y30}/>

      {/* Spread 10Y-5Y */}
      {!loading&&macro.yields?.y10&&macro.yields?.y5&&(()=>{
        const spread=macro.yields.y10.price-macro.yields.y5.price;
        const col=spread>=0?"var(--green)":"var(--red)";
        return(
          <div style={{display:"flex",flexDirection:"column",gap:2,padding:"6px 14px",borderRight:"1px solid var(--bd)"}}>
            <div style={{fontSize:9,letterSpacing:".12em",color:"var(--t3)",fontWeight:700,textTransform:"uppercase"}}>{zh?"10Y-5Y利差":"10Y-5Y SPREAD"}</div>
            <div style={{display:"flex",alignItems:"baseline",gap:4}}>
              <div style={{fontSize:18,fontWeight:800,fontFamily:"monospace",color:col,lineHeight:1}}>{spread>=0?"+":""}{spread.toFixed(2)}<span style={{fontSize:10,color:"var(--t3)",fontWeight:400}}>%</span></div>
              <span style={{fontSize:9,color:"var(--t3)"}}>{spread>=0?(zh?"正常曲线":"Normal"):(zh?"倒挂警告":"Inverted ⚠")}</span>
            </div>
          </div>
        );
      })()}

      {/* Calendar events / day status */}
      <div style={{flex:1,display:"flex",alignItems:"center",gap:7,padding:"8px 14px",flexWrap:"wrap",minWidth:200}}>
        {loading?(
          <div style={{fontSize:10,color:"var(--t3)",letterSpacing:".08em"}}>{zh?"加载宏观数据…":"Loading macro data…"}</div>
        ):macro.events.length===0?(
          <div style={{display:"flex",alignItems:"center",gap:8,padding:"5px 12px",borderRadius:5,border:"1px solid color-mix(in srgb,var(--green) 30%,transparent)",background:"color-mix(in srgb,var(--green) 8%,transparent)"}}>
            <span style={{fontSize:13}}>✅</span>
            <div>
              <div style={{fontSize:11,fontWeight:800,color:"var(--green)",letterSpacing:".06em"}}>{zh?"今日无重大数据":"No Major Releases Today"}</div>
              <div style={{fontSize:9,color:"var(--t2)",marginTop:1}}>{zh?"交易环境清晰，正常执行系统":"Clean trading environment"}</div>
            </div>
          </div>
        ):(
          macro.events.map(ev=><EventBadge key={ev.key} ev={ev} zh={zh}/>)
        )}
      </div>

      {/* Risk summary pill if events exist */}
      {!loading&&macro.events.length>0&&(
        <div style={{display:"flex",alignItems:"center",padding:"0 14px",borderLeft:"1px solid var(--bd)",flexShrink:0}}>
          <div style={{padding:"5px 12px",borderRadius:20,fontSize:9,fontWeight:800,letterSpacing:".1em",border:`1px solid color-mix(in srgb,${riskColors[macro.dayRisk]} 40%,transparent)`,background:`color-mix(in srgb,${riskColors[macro.dayRisk]} 15%,transparent)`,color:riskColors[macro.dayRisk],textAlign:"center",lineHeight:1.4,maxWidth:140}}>
            {(zh?riskLabels[macro.dayRisk]?.zh:riskLabels[macro.dayRisk]?.en)||macro.dayRisk.toUpperCase()}
          </div>
        </div>
      )}
    </div>
  );
}

function ThemeProvider({dark,children}){
  const v=dark?darkVars:lightVars;
  const style={
    "--bg":v.bg,"--bg2":v.bg2,"--bg3":v.bg3,"--bg4":v.bg4,
    "--t1":v.t1,"--t2":v.t2,"--t3":v.t3,"--bd":v.bd,"--bd2":v.bd2,
    "--teal":dark?C.teal:"#0a9e87","--red":dark?C.red:"#dc2626",
    "--amber":dark?C.amber:"#d97706","--blue":dark?C.blue:"#2563eb",
    "--green":dark?C.green:"#059669","--violet":dark?C.violet:"#7c3aed",
    background:"var(--bg)",color:"var(--t1)",minHeight:"100vh",
    fontFamily:"'SF Mono','Fira Code',ui-monospace,monospace",fontSize:13,
  };
  return <div style={style}>{children}</div>;
}

// ─── TICKER: 大数字 + 变化
function Tick({sym,label,data,fmt}){
  const loading=!data;
  const price=data?.price;
  const formatted=price!=null?(fmt?fmt(price):price.toFixed(sym==="EUR"?4:2)):"—";
  const chgStr=data?`${data.chg>=0?"+":""}${data.chg.toFixed(2)}`:"—";
  const pctStr=data?`${data.pct>=0?"+":""}${data.pct.toFixed(2)}%`:"—";
  const col=!data?"var(--t3)":data.chg>0?"var(--green)":data.chg<0?"var(--red)":"var(--t3)";
  return(
    <div style={{background:"var(--bg)",padding:"10px 14px",borderRight:"1px solid var(--bd)",display:"flex",flexDirection:"column",justifyContent:"space-between",minWidth:0}}>
      <div style={{fontSize:9,letterSpacing:".14em",color:"var(--t3)",fontWeight:700,textTransform:"uppercase",marginBottom:4}}>{label||sym}</div>
      <div style={{fontSize:22,fontWeight:800,fontFamily:"monospace",letterSpacing:"-.02em",color:loading?"var(--bg4)":"var(--t1)",animation:loading?"pulse 1.2s infinite":"none",lineHeight:1}}>{loading?"———":formatted}</div>
      <div style={{display:"flex",gap:6,marginTop:4,alignItems:"center"}}>
        <span style={{fontSize:11,fontWeight:700,color:col}}>{loading?"—":chgStr}</span>
        <span style={{fontSize:10,color:col,opacity:.8}}>{loading?"—":pctStr}</span>
      </div>
    </div>
  );
}

function VixBadge({vix}){
  if(!vix) return null;
  const z=vix<15?{c:"var(--green)",t:"LOW VOL"}:vix<25?{c:"var(--blue)",t:"NORMAL"}:vix<35?{c:"var(--amber)",t:"ELEVATED"}:{c:"var(--red)",t:"EXTREME"};
  return(
    <span style={{fontSize:9,letterSpacing:".1em",padding:"2px 7px",borderRadius:4,fontWeight:800,border:`1px solid ${z.c}66`,background:`color-mix(in srgb,${z.c} 15%,transparent)`,color:z.c}}>{z.t}</span>
  );
}

function VixZones({vix}){
  const zones=[
    {r:"VIX<15",c:"var(--green)",a:vix&&vix<15},
    {r:"15–25",c:"var(--blue)",a:vix&&vix>=15&&vix<25},
    {r:"25–35",c:"var(--amber)",a:vix&&vix>=25&&vix<35},
    {r:">35 SKIP",c:"var(--red)",a:vix&&vix>=35},
  ];
  return(
    <div style={{display:"flex",gap:4}}>
      {zones.map(z=>(
        <span key={z.r} style={{fontSize:9,letterSpacing:".07em",padding:"2px 7px",borderRadius:4,fontWeight:700,border:`1px solid ${z.a?z.c+"88":"var(--bd)"}`,background:z.a?`color-mix(in srgb,${z.c} 15%,transparent)`:"transparent",color:z.a?z.c:"var(--t3)"}}>
          {z.r}
        </span>
      ))}
    </div>
  );
}

// ─── CHECKLIST 条目：更大、行高更宽松
function CheckItem({text,warn,checked,onClick}){
  return(
    <div onClick={onClick} style={{display:"flex",alignItems:"flex-start",gap:9,padding:"8px 12px",borderBottom:"1px solid var(--bd)",cursor:"pointer",background:checked?"color-mix(in srgb,var(--teal) 6%,transparent)":"transparent",transition:"background .15s"}}>
      <div style={{width:18,height:18,borderRadius:4,border:`1.5px solid ${checked?"var(--teal)":"var(--bd2)"}`,background:checked?"var(--teal)":"transparent",flexShrink:0,marginTop:1,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s"}}>
        {checked&&<svg width="10" height="10" viewBox="0 0 12 10" fill="none" stroke="var(--bg)" strokeWidth="2.5"><polyline points="1,5 4.5,9 11,1"/></svg>}
      </div>
      <div style={{flex:1}}>
        <div style={{fontSize:11,lineHeight:1.5,color:checked?"var(--t2)":"var(--t1)",textDecoration:checked?"line-through":"none",wordBreak:"break-word",overflowWrap:"anywhere",textDecorationColor:"var(--bd2)"}}>{text}</div>
        {warn&&<div style={{fontSize:10,color:"var(--amber)",marginTop:2,fontWeight:600}}>{warn}</div>}
      </div>
    </div>
  );
}

// ─── 进度条更粗 + 数字更大
function Checklist({items,checks,onToggle,label,readyText}){
  const count=Object.values(checks).filter(Boolean).length;
  const total=items.length;
  const pct=Math.round(count/total*100);
  const barColor=count===total?"var(--green)":pct>60?"var(--amber)":"var(--red)";
  return(
    <div>
      <div style={{background:"var(--bg3)",border:"1px solid var(--bd)",borderRadius:8,overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",borderBottom:"1px solid var(--bd)"}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:"var(--t1)"}}>{label}</div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{fontSize:18,fontWeight:800,fontFamily:"monospace",color:barColor,lineHeight:1}}>{count}<span style={{fontSize:11,color:"var(--t3)",fontWeight:400}}>/{total}</span></div>
          </div>
        </div>
        {/* 4px 进度条 */}
        <div style={{height:4,background:"var(--bd)"}}><div style={{height:"100%",width:`${pct}%`,background:barColor,transition:"width .3s,background .3s",borderRadius:"0 2px 2px 0"}}/></div>
        {items.map((item,i)=>{
          const text=typeof item==="string"?item:item.t;
          const warn=typeof item==="object"?item.w:null;
          return <CheckItem key={i} text={text} warn={warn} checked={!!checks[i]} onClick={()=>onToggle(i)}/>;
        })}
      </div>
      {count===total&&<div style={{marginTop:6,borderRadius:6,padding:"8px 12px",textAlign:"center",fontSize:12,fontWeight:800,letterSpacing:".1em",background:"color-mix(in srgb,var(--green) 14%,transparent)",border:"1px solid color-mix(in srgb,var(--green) 40%,transparent)",color:"var(--green)"}}>{readyText}</div>}
    </div>
  );
}

// ─── 铁律：更大字体 + 关键项高亮
function Rules({items,hotIdx=[]}){
  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr",gap:6,height:"100%",alignContent:"start"}}>
      {items.map((r,i)=>{
        const hot=hotIdx.includes(i);
        return(
          <div key={i} style={{background:"var(--bg3)",border:`1px solid ${hot?"color-mix(in srgb,var(--red) 35%,transparent)":"var(--bd)"}`,borderRadius:6,padding:"7px 10px",display:"flex",gap:8,alignItems:"flex-start",minHeight:34,overflow:"hidden"}}>
            <div style={{width:20,height:20,borderRadius:4,background:hot?"color-mix(in srgb,var(--red) 22%,transparent)":"var(--bg4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:hot?"var(--red)":"var(--t3)",flexShrink:0}}>{i+1}</div>
            <div style={{fontSize:11,lineHeight:1.4,color:hot?"var(--red)":"var(--t1)",fontWeight:hot?700:400,minWidth:0,wordBreak:"break-word",overflowWrap:"anywhere"}}>{r}</div>
          </div>
        );
      })}
    </div>
  );
}

// ─── StepRail：步骤编号更大，主文字更大
function StepRail({steps,color="var(--teal)"}){
  return(
    <div style={{display:"flex",gap:0,overflow:"hidden",borderRadius:7,border:"1px solid var(--bd)"}}>
      {steps.map((s,i)=>(
        <div key={i} style={{flex:1,padding:"10px 12px",background:"var(--bg3)",borderRight:i<steps.length-1?"1px solid var(--bd)":"none"}}>
          <div style={{fontSize:9,letterSpacing:".12em",color,fontWeight:800,textTransform:"uppercase",marginBottom:4}}>{s.n}</div>
          <div style={{fontSize:12,fontWeight:800,color:"var(--t1)",marginBottom:3}}>{s.t}</div>
          <div style={{fontSize:10,color:"var(--t2)",lineHeight:1.45}}>{s.d}</div>
        </div>
      ))}
    </div>
  );
}

// ─── KZGrid：时间更大更突出
function KZGrid({zones}){
  return(
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:7,height:"100%",alignItems:"stretch"}}>
      {zones.map((z,i)=>(
        <div key={i} style={{borderRadius:7,padding:"10px 12px",border:`1px solid color-mix(in srgb,${z.c} 40%,transparent)`,background:`color-mix(in srgb,${z.c} 8%,transparent)`,minHeight:72,height:"100%",display:"flex",flexDirection:"column",justifyContent:"center"}}>
          <div style={{fontSize:10,fontWeight:800,color:z.c,marginBottom:5,letterSpacing:".06em",textTransform:"uppercase"}}>{z.title}</div>
          <div style={{fontSize:16,fontWeight:800,fontFamily:"monospace",letterSpacing:"-.01em",color:"var(--t1)",marginBottom:4,lineHeight:1}}>{z.time}</div>
          <div style={{fontSize:10,color:"var(--t2)",lineHeight:1.45}}>{z.note}</div>
        </div>
      ))}
    </div>
  );
}

function SL({children}){return <div style={{fontSize:9,letterSpacing:".18em",color:"var(--t3)",fontWeight:700,textTransform:"uppercase",marginBottom:5}}>{children}</div>;}
function AlignCol({children}){return <div style={{height:"100%",display:"flex",flexDirection:"column",minWidth:0}}>{children}</div>;}
function Divider(){return <div style={{height:1,background:"var(--bd)",margin:"2px 0"}}/>;}
function Ibtn({children,onClick,active}){return <button onClick={onClick} style={{background:active?"color-mix(in srgb,var(--teal) 15%,transparent)":"transparent",border:`1px solid ${active?"var(--teal)":"var(--bd2)"}`,color:active?"var(--teal)":"var(--t2)",borderRadius:6,padding:"5px 12px",fontSize:10,cursor:"pointer",fontFamily:"inherit",letterSpacing:".08em"}}>{children}</button>;}
function Rbtn({children,onClick}){return <button onClick={onClick} style={{background:"transparent",border:"1px solid var(--bd)",color:"var(--t3)",borderRadius:4,padding:"3px 8px",fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>{children}</button>;}
function SectionHead({children,actions}){return <div style={{height:28,display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,marginBottom:6,flexShrink:0}}><div style={{fontSize:9,letterSpacing:".18em",color:"var(--t3)",fontWeight:700,textTransform:"uppercase",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{children}</div>{actions&&<div style={{display:"flex",alignItems:"center",gap:7,flexShrink:0}}>{actions}</div>}</div>;}
function PairGrid({children}){return <div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) minmax(0,1fr)",gap:10,alignItems:"stretch"}}>{children}</div>;}
function StrictCol({title,actions,children}){return <div style={{height:"100%",minWidth:0,display:"flex",flexDirection:"column"}}><SectionHead actions={actions}>{title}</SectionHead><div style={{flex:1,minHeight:0,minWidth:0}}>{children}</div></div>;}
function RuleCol({title,items,hotIdx=[]}){return <StrictCol title={title}><Rules items={items} hotIdx={hotIdx}/></StrictCol>;}


// ─── GEX Panel：数值放大到 20px
function GEXPanel({zh,gex,onSave,isToday}){
  const [editing,setEditing]=useState(!isToday);
  const [local,setLocal]=useState({state:gex.state,flip:gex.flip,call:gex.call,put:gex.put,vol:gex.vol});
  const setG=s=>setLocal(l=>({...l,state:s}));
  const handleSave=()=>{if(!local.state)return;onSave(local);setEditing(false);};
  const handleEdit=()=>{setLocal({state:gex.state,flip:gex.flip,call:gex.call,put:gex.put,vol:gex.vol});setEditing(true);};
  if(!editing&&isToday){
    return(
      <div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}><SL>{zh?"GEX 今日设置":"GEX Today"}</SL><Ibtn onClick={handleEdit}>{zh?"编辑":"Edit"}</Ibtn></div>
        {/* 模式Badge + 四格大数值 */}
        <div style={{marginBottom:8}}>
          {gex.state==="positive"
            ?<div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"5px 12px",borderRadius:6,border:"1px solid color-mix(in srgb,var(--blue) 40%,transparent)",background:"color-mix(in srgb,var(--blue) 10%,transparent)"}}>
              <span style={{fontSize:14,fontWeight:800,color:"var(--blue)",letterSpacing:".04em"}}>{zh?"✦ 正GEX · 震荡模式":"✦ Positive GEX · Range"}</span>
              <span style={{fontSize:10,color:"var(--t2)"}}>{zh?"偏区间 · 等回踩":"Range bias · wait pullback"}</span>
            </div>
            :<div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"5px 12px",borderRadius:6,border:"1px solid color-mix(in srgb,var(--amber) 40%,transparent)",background:"color-mix(in srgb,var(--amber) 10%,transparent)"}}>
              <span style={{fontSize:14,fontWeight:800,color:"var(--amber)",letterSpacing:".04em"}}>{zh?"⚡ 负GEX · 趋势模式":"⚡ Negative GEX · Trend"}</span>
              <span style={{fontSize:10,color:"var(--t2)"}}>{zh?"偏顺势 · 等破位":"Trend bias · wait break"}</span>
            </div>
          }
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
          {[["Gamma Flip",gex.flip,"var(--teal)"],["Call Wall",gex.call,"var(--red)"],["Put Wall",gex.put,"var(--green)"],["Vol Trigger",gex.vol,"var(--amber)"]].map(([n,v,c])=>(
            <div key={n} style={{background:"var(--bg3)",border:`1px solid ${v?"color-mix(in srgb,"+c+" 30%,transparent)":"var(--bd)"}`,borderRadius:6,padding:"10px 12px"}}>
              <div style={{fontSize:8,letterSpacing:".1em",color:"var(--t3)",fontWeight:700,textTransform:"uppercase",marginBottom:5}}>{n}</div>
              <div style={{fontSize:20,fontWeight:800,fontFamily:"monospace",letterSpacing:"-.01em",color:v?c:"var(--bg4)",lineHeight:1}}>{v?"$"+v:"—"}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return(
    <div>
      <SL>{zh?"GEX 每日设置（必填）":"GEX Daily Setup (required)"}</SL>
      <div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) minmax(0,1fr)",gap:6,marginBottom:8}}>
        {[{s:"positive",label:zh?"正 GEX · 震荡模式":"Positive GEX · Range",sub:zh?"偏区间 · 少追突破 · 等回踩":"Range bias · avoid chasing · wait pullback",c:"var(--blue)"},{s:"negative",label:zh?"负 GEX · 趋势模式":"Negative GEX · Trend",sub:zh?"偏顺势 · 等破位 · VWAP第一参考":"Trend bias · wait break · VWAP = regime line",c:"var(--amber)"}].map(b=>(
          <button key={b.s} onClick={()=>setG(b.s)} style={{border:`1px solid ${local.state===b.s?b.c+"88":"var(--bd2)"}`,borderRadius:7,padding:"11px 13px",background:local.state===b.s?`color-mix(in srgb,${b.c} 12%,transparent)`:"var(--bg3)",textAlign:"left",cursor:"pointer",fontFamily:"inherit"}}>
            <div style={{fontSize:11,fontWeight:800,textTransform:"uppercase",letterSpacing:".08em",color:b.c,marginBottom:3}}>{b.label}</div>
            <div style={{fontSize:10,color:"var(--t2)"}}>{b.sub}</div>
          </button>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:8}}>
        {[{k:"flip",n:"Gamma Flip",h:zh?"正负切换位":"Regime flip",p:"480.00",c:"var(--teal)"},{k:"call",n:"Call Wall",h:zh?"上方压力":"Overhead",p:"490.00",c:"var(--red)"},{k:"put",n:"Put Wall",h:zh?"下方支撑":"Support",p:"470.00",c:"var(--green)"},{k:"vol",n:"Vol Trigger",h:zh?"波动启动":"Vol expand",p:"475.00",c:"var(--amber)"}].map(f=>(
          <div key={f.k} style={{background:"var(--bg3)",border:"1px solid var(--bd)",borderRadius:6,padding:"10px 12px"}}>
            <div style={{fontSize:8,letterSpacing:".1em",color:"var(--t3)",fontWeight:700,textTransform:"uppercase",marginBottom:4}}>{f.n}</div>
            <input value={local[f.k]} onChange={e=>setLocal(l=>({...l,[f.k]:e.target.value}))} placeholder={f.p} inputMode="decimal" style={{background:"transparent",border:"none",color:f.c,fontSize:20,fontWeight:800,fontFamily:"monospace",width:"100%",outline:"none",letterSpacing:"-.01em"}}/>
            <div style={{fontSize:9,color:"var(--t3)",marginTop:2}}>{f.h}</div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",justifyContent:"flex-end"}}>
        <button onClick={handleSave} style={{background:"var(--teal)",border:"none",color:"var(--bg)",borderRadius:5,padding:"6px 20px",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"inherit",letterSpacing:".08em"}}>{zh?"保存设置":"Save Setup"}</button>
      </div>
    </div>
  );
}

const TABS=[
  {id:"opt",labelZh:"QQQ 期权",labelEn:"QQQ Options",color:"var(--teal)"},
  {id:"stock",labelZh:"正股 配置",labelEn:"Equities",color:"var(--violet)"},
  {id:"gold",labelZh:"黄金 XAU",labelEn:"Gold XAU",color:"var(--amber)"},
  {id:"eur",labelZh:"EUR/USD",labelEn:"EUR/USD",color:"var(--blue)"},
];

export default function App(){
  const {dark,toggle:toggleTheme}=useTheme();
  const {zh,toggle:toggleLang}=useLang();
  const {gex,save:saveGex,isToday:gexIsToday}=useGEX();
  const {ticks,status}=useQuotes();
  const {macro}=useMacro();
  const clock=useClock();
  const [tab,setTab]=useState(0);
  const pre=useChecks("pre");
  const day=useChecks("day");
  const sc=useChecks("sc");
  const gold=useChecks("gold");
  const eur=useChecks("eur");

  const t=(a,b)=>zh?a:b;
  const vix=ticks.VIX?.price;

  const handleSaveGex=useCallback((data)=>{
    saveGex(data);
    if(!day.c[0])day.toggle(0);
  },[saveGex,day]);

  const gexBadge=!gexIsToday
    ?{cls:"red",txt:t("GEX 未设置","GEX not set")}
    :gex.state==="positive"?{cls:"blue",txt:t("正GEX","+ GEX")}:{cls:"amber",txt:t("负GEX","− GEX")};
  const badgeColor={red:"var(--red)",blue:"var(--blue)",amber:"var(--amber)"}[gexBadge.cls];

  return(
    <ThemeProvider dark={dark}>
      <style>{`
        @keyframes pulse{0%,100%{opacity:.3}50%{opacity:1}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}
        *{box-sizing:border-box;margin:0;padding:0}
        input,button{font-family:inherit}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:var(--bg)}
        ::-webkit-scrollbar-thumb{background:var(--bg4);border-radius:2px}
      `}</style>

      {/* ─── HEADER ─── */}
      <div style={{borderBottom:"2px solid var(--teal)",padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,flexWrap:"wrap",background:"var(--bg)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
          <div style={{fontSize:15,fontWeight:800,letterSpacing:".18em",color:"var(--teal)"}}>SEA TRADING OS</div>
          <span style={{padding:"3px 10px",borderRadius:20,fontSize:10,fontWeight:800,letterSpacing:".1em",textTransform:"uppercase",border:`1px solid color-mix(in srgb,${badgeColor} 40%,transparent)`,background:`color-mix(in srgb,${badgeColor} 16%,transparent)`,color:badgeColor}}>{gexBadge.txt}</span>
          {vix&&<VixBadge vix={vix}/>}
          <div style={{display:"flex",alignItems:"center",gap:5}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:status==="live"?"var(--green)":"var(--amber)",animation:status==="live"?"blink 1.6s infinite":"none"}}/>
            <span style={{fontSize:9,color:"var(--t3)",letterSpacing:".1em"}}>{status}</span>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          <div style={{fontSize:11,color:"var(--t2)",fontFamily:"monospace",letterSpacing:".06em",fontWeight:600}}>{clock}</div>
          <Ibtn onClick={toggleTheme}>{dark?"☀":"☾"}</Ibtn>
          <Ibtn onClick={toggleLang}>{zh?"EN":"中"}</Ibtn>
        </div>
      </div>

      {/* ─── TICKER STRIP: 6列大数字 ─── */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",background:"var(--bd)"}}>
        <Tick sym="QQQ" data={ticks.QQQ}/>
        <Tick sym="VIX" data={ticks.VIX}/>
        <Tick sym="SPY" data={ticks.SPY}/>
        <Tick sym="GLD" data={ticks.GLD}/>
        <Tick sym="EUR" label="EUR/USD" data={ticks.EUR}/>
        <Tick sym="DXY" label="DXY(UUP)" data={ticks.DXY} style={{borderRight:"none"}}/>
      </div>

      {/* ─── MACRO BAR: yields + calendar ─── */}
      <MacroBar macro={macro} zh={zh}/>

      {/* ─── TABS ─── */}
      <div style={{display:"flex",gap:2,padding:"9px 16px 0",borderBottom:"1px solid var(--bd)",background:"var(--bg)"}}>
        {TABS.map((tb,i)=>(
          <button key={tb.id} onClick={()=>setTab(i)} style={{padding:"7px 15px",borderRadius:"7px 7px 0 0",fontSize:12,fontWeight:700,cursor:"pointer",border:`1px solid ${tab===i?"var(--bd)":"transparent"}`,borderBottom:tab===i?`2px solid ${tb.color}`:"1px solid transparent",background:tab===i?"var(--bg2)":"transparent",color:tab===i?tb.color:"var(--t3)",fontFamily:"inherit",letterSpacing:".06em",marginBottom:tab===i?-1:0}}>
            {zh?tb.labelZh:tb.labelEn}
          </button>
        ))}
      </div>

      {/* ─── CONTENT ─── */}
      <div style={{background:"var(--bg2)",padding:"10px 14px",display:"flex",flexDirection:"column",gap:8}}>

        {/* === QQQ Options === */}
        {tab===0&&<>
          <GEXPanel zh={zh} gex={gex} onSave={handleSaveGex} isToday={gexIsToday}/>
          <Divider/>
          <PairGrid>
            <StrictCol title={t("开盘前清单","Pre-Market Checklist")} actions={<><VixZones vix={vix}/><Rbtn onClick={pre.reset}>{t("重置","Reset")}</Rbtn></>}>
              <Checklist items={zh?PRE_ZH:PRE_EN} checks={pre.c} onToggle={pre.toggle} label={t("开盘前检查","Pre-Market Check")} readyText={t("✓ 开盘前检查完毕","✓ Pre-market check complete")}/>
            </StrictCol>
            <StrictCol title={t("时间窗口 (ET)","Time Windows (ET)")}>
              <KZGrid zones={[{title:t("禁做","Banned"),time:"09:30–09:45",note:t("开盘乱流 · 绝对禁区","Opening chaos — no-entry zone"),c:"var(--red)"},{title:t("主战窗口","Primary Window"),time:"09:45–11:30",note:t("趋势确立后入场","Enter after trend establishes"),c:"var(--green)"},{title:t("禁做","Banned"),time:"11:30–16:00",note:t("11:30后不开新仓","No new positions after 11:30 ET"),c:"var(--red)"}]}/>
            </StrictCol>
          </PairGrid>
          <Divider/>
          <PairGrid>
            <StrictCol title={t("入场清单 · 缺一不可","Entry Checklist · All Required")} actions={<Rbtn onClick={day.reset}>{t("重置","Reset")}</Rbtn>}>
              <Checklist items={zh?DAY_ZH:DAY_EN} checks={day.c} onToggle={day.toggle} label={t("入场条件","Entry Conditions")} readyText={t("✓ 全部确认 · 可以入场","✓ All confirmed · Ready to enter")}/>
            </StrictCol>
            <RuleCol title={t("执行铁律","Iron Rules")} items={zh?RULES_OPT_ZH:RULES_OPT_EN} hotIdx={[7]}/>
          </PairGrid>
        </>}

        {/* === Equities === */}
        {tab===1&&<>
          <div>
            <SL>{t("美股正股 · 低频配置系统","US Equities · Low-Frequency System")}</SL>
            <div style={{background:`color-mix(in srgb,var(--violet) 8%,transparent)`,border:`1px solid color-mix(in srgb,var(--violet) 30%,transparent)`,borderRadius:7,padding:"10px 13px",fontSize:11,color:"var(--t2)",lineHeight:1.65,marginBottom:9}}>
              {t("底仓系统，非当前主战场。先筛公司质量，再等技术位置，低频持有。不做日内，不追热点。","Foundation system — not the primary battleground. Screen quality first, wait for technical levels, hold low-frequency. No intraday, no hype-chasing.")}
            </div>
            <StepRail color="var(--violet)" steps={[{n:t("第一步","Step 1"),t:t("基本面筛选","Fundamental Screen"),d:t("营收/利润连续增长 · 行业景气 · 无重大负面","Consistent revenue/profit growth · positive sector · no major negatives")},{n:t("第二步","Step 2"),t:t("技术择时","Technical Timing"),d:t("周线趋势不坏 · 关键支撑 · 突破回踩日线确认","Weekly trend intact · key support · breakout pullback + daily confirm")},{n:t("第三步","Step 3"),t:t("持仓管理","Position Management"),d:t("周线级别持有 · 结构下方止损 · 不摊平下跌","Weekly timeframe hold · stop below structure · never average down")}]}/>
          </div>
          <Divider/>
          <div>
            <SL>{t("VIX 宏观过滤","VIX Macro Filter")}</SL>
            <div style={{display:"flex",gap:6}}>
              {[{r:t("VIX<15","VIX<15"),n:t("低波·低成本·正常参与","Low vol·low cost·normal"),c:"var(--green)",a:vix&&vix<15},{r:t("15–25","15–25"),n:t("正常执行，全力参与","Normal — full participation"),c:"var(--blue)",a:vix&&vix>=15&&vix<25},{r:t("25–35","25–35"),n:t("降低仓位，提高目标","Reduce size · raise targets"),c:"var(--amber)",a:vix&&vix>=25&&vix<35},{r:t(">35 跳过",">35 skip"),n:t("方向混沌，不参与","Direction chaotic — stay out"),c:"var(--red)",a:vix&&vix>=35}].map(z=>(
                <div key={z.r} style={{flex:1,borderRadius:6,border:`1px solid ${z.a?"color-mix(in srgb,"+z.c+" 40%,transparent)":"var(--bd)"}`,padding:"8px 10px",background:z.a?`color-mix(in srgb,${z.c} 10%,transparent)`:"var(--bg3)",opacity:z.a?1:.5,transition:"all .2s"}}>
                  <div style={{fontSize:11,fontWeight:800,color:z.c,marginBottom:3}}>{z.r}</div>
                  <div style={{fontSize:10,color:"var(--t2)",lineHeight:1.4}}>{z.n}</div>
                </div>
              ))}
            </div>
          </div>
          <Divider/>
          <PairGrid>
            <StrictCol title={t("正股入场清单","Stock Entry Checklist")} actions={<Rbtn onClick={sc.reset}>{t("重置","Reset")}</Rbtn>}>
              <Checklist items={zh?SC_ZH:SC_EN} checks={sc.c} onToggle={sc.toggle} label={t("入场确认","Entry Confirmation")} readyText={t("✓ 正股入场确认","✓ Stock entry confirmed")}/>
            </StrictCol>
            <RuleCol title={t("执行铁律","Iron Rules")} items={zh?RULES_STOCK_ZH:RULES_STOCK_EN}/>
          </PairGrid>
        </>}

        {/* === Gold === */}
        {tab===2&&<>
          <div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:5}}>
              <SL>{t("黄金 XAU/USD · 紧凑执行系统","Gold XAU/USD · Compact Execution System")}</SL>
              <span style={{fontSize:10,color:"var(--amber)",letterSpacing:".08em",fontWeight:700}}>{t("宏观→结构→时间→确认","Macro→Structure→Time→Confirm")}</span>
            </div>
            <StepRail color="var(--amber)" steps={[{n:"D/4H",t:t("定向+找位","Bias + Level"),d:t("DXY/实际利率 + OB/FVG/POC重叠","DXY/real rates + OB/FVG/POC confluence")},{n:"KZ",t:t("只等窗口","Only Window"),d:t("伦敦15–17 / 纽约21:30–23:30","London 15–17 / NY 21:30–23:30 BJ")},{n:"5M/15M",t:t("确认入场","Confirm"),d:t("CHoCH/BOS + 拒绝 + 收回结构","CHoCH/BOS + rejection + reclaim")},{n:t("风控","Risk"),t:t("只拿中段","Middle Leg"),d:t("止损结构外 · RR≥1:2","Stop outside · RR≥1:2")}]}/>
          </div>

          <PairGrid>
            <StrictCol title={t("宏观过滤 · DXY + 实际利率","Macro Filter · DXY + Real Rates")}>
              <div style={{display:"flex",flexDirection:"column",gap:4,height:"100%"}}>
                {(zh?MACRO_GOLD_ZH:MACRO_GOLD_EN).map((item,i)=>{
                  const col={green:"var(--green)",blue:"var(--blue)",slate:"var(--t3)",amber:"var(--amber)",red:"var(--red)"}[item.c];
                  return(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:7,padding:"6px 10px",borderRadius:5,border:`1px solid ${i===4?"color-mix(in srgb,var(--red) 28%,transparent)":"var(--bd)"}`,background:i===4?"color-mix(in srgb,var(--red) 7%,transparent)":"var(--bg3)",minHeight:34}}>
                      <div style={{fontSize:11,fontWeight:700,flex:1,color:col,minWidth:0,wordBreak:"break-word"}}>{item.s}</div>
                      <div style={{fontSize:10,color:"var(--t2)",textAlign:"right",minWidth:0,wordBreak:"break-word"}}>{item.a}</div>
                    </div>
                  );
                })}
              </div>
            </StrictCol>
            <StrictCol title={t("Kill Zone 时间窗口","Kill Zones")}>
              <KZGrid zones={[{title:t("伦敦","London"),time:"15:00–17:00",note:t("扫亚洲高低 · 定日内方向","Sweep Asia · set direction"),c:"var(--amber)"},{title:t("纽约","New York"),time:"21:30–23:30",note:t("扫伦敦后走主段","Sweep London · main leg"),c:"var(--blue)"},{title:t("禁区","Banned"),time:t("亚盘中间","Asian Mid"),note:t("不追 · 数据瞬间不进","No chase · no data spike"),c:"var(--red)"}]}/>
            </StrictCol>
          </PairGrid>

          <PairGrid>
            <StrictCol title={t("黄金入场清单","Gold Entry Checklist")} actions={<Rbtn onClick={gold.reset}>{t("重置","Reset")}</Rbtn>}>
              <Checklist items={zh?GC_ZH:GC_EN} checks={gold.c} onToggle={gold.toggle} label={t("三层对齐确认","Three-Layer Alignment")} readyText={t("✓ 三层对齐 · 可以入场","✓ Three layers aligned · Enter")}/>
            </StrictCol>
            <RuleCol title={t("执行铁律","Iron Rules")} items={zh?RULES_GOLD_ZH:RULES_GOLD_EN} hotIdx={[0]}/>
          </PairGrid>
        </>}

        {/* === EUR/USD === */}
        {tab===3&&<>
          <div>
            <SL>{t("EUR/USD · 趋势跟踪系统","EUR/USD · Trend-Following System")}</SL>
            <div style={{background:`color-mix(in srgb,var(--blue) 8%,transparent)`,border:`1px solid color-mix(in srgb,var(--blue) 30%,transparent)`,borderRadius:7,padding:"10px 13px",fontSize:11,color:"var(--t2)",lineHeight:1.65,marginBottom:9}}>
              {t("EMA顺排 + ADX>25确认趋势环境 → Kill Zone回踩结构位等确认 → 只拿中间段。ADX<20 + 均线缠绕时系统无效，不做。","EMA aligned + ADX>25 confirms trend → Kill Zone pullback to structure for entry → take middle leg only. ADX<20 + tangled EMAs = system invalid.")}
            </div>
            <StepRail color="var(--blue)" steps={[{n:"Step 1",t:t("趋势过滤","Trend Filter"),d:t("EMA 9/21/55顺排 + ADX>25，先确认趋势环境","EMA 9/21/55 aligned + ADX>25 — confirm trend first")},{n:"Step 2",t:"Kill Zone",d:t("伦敦/纽约开盘窗口，扫前高低点后定方向","London/NY open — sweep prior levels then set direction")},{n:"Step 3",t:t("找回踩位","Find Pullback"),d:t("回踩EMA21或关键结构位，等拒绝K线确认","Pullback to EMA21 or key structure, wait for rejection candle")},{n:"Step 4",t:t("执行","Execute"),d:t("RR≥1:2 · 到1:1.5先锁一半 · 不追第一根破位","RR ≥ 1:2 · lock 50% at 1:1.5 · never chase the first breakout candle")}]}/>
          </div>
          <Divider/>
          <div>
            <SL>{t("Kill Zone 时间窗口 (北京时间)","Kill Zones (Beijing Time)")}</SL>
            <KZGrid zones={[{title:t("伦敦 Kill Zone","London Kill Zone"),time:"15:00–17:00",note:t("EUR主要方向常在此确立","EUR's primary direction usually established here"),c:"var(--blue)"},{title:t("纽约 Kill Zone","New York Kill Zone"),time:"21:30–23:30",note:t("美国数据/纽约开盘是EUR第二主要时段","US data / NY open is EUR's second major session"),c:"var(--green)"},{title:t("禁区","Banned Zone"),time:"ADX<20",note:t("均线缠绕 · ADX<20 · 重大数据前后","Tangled EMAs · ADX<20 · around major data releases"),c:"var(--red)"}]}/>
          </div>
          <Divider/>
          <PairGrid>
            <StrictCol title={t("EUR/USD 入场清单","EUR/USD Entry Checklist")} actions={<Rbtn onClick={eur.reset}>{t("重置","Reset")}</Rbtn>}>
              <Checklist items={zh?EC_ZH:EC_EN} checks={eur.c} onToggle={eur.toggle} label={t("趋势确认","Trend Confirmation")} readyText={t("✓ 趋势确认 · 可以入场","✓ Trend confirmed · Enter")}/>
            </StrictCol>
            <RuleCol title={t("执行铁律","Iron Rules")} items={zh?RULES_EUR_ZH:RULES_EUR_EN} hotIdx={[0]}/>
          </PairGrid>
        </>}

        <div style={{textAlign:"center",paddingTop:6}}>
          <div style={{fontSize:9,color:"var(--t3)",letterSpacing:".15em"}}>SEA TRADING OS v7.5.0 · macro bar · yields + calendar · 弱水三千，只取一瓢 · 先活下来，再赚钱</div>
        </div>
      </div>
    </ThemeProvider>
  );
}
