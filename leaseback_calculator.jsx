import { useState, useMemo } from "react";

const formatPct = (val) => `${val.toFixed(1)}%`;
const wan = (v) => `${Math.round(Math.abs(v) / 10000).toLocaleString()}万`;

// 2列グリッド用カード: ラベルと入力が1行に収まる
const NumInput = ({ label, value, onChange, unit, step, min, max }) => {
  const [raw, setRaw] = useState(String(value));
  const commit = (str) => {
    const n = parseFloat(str);
    if (!isNaN(n)) {
      const clamped = Math.max(min ?? -Infinity, Math.min(max ?? Infinity, n));
      onChange(clamped); setRaw(String(clamped));
    } else setRaw(String(value));
  };
  return (
    <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #1e2d3d", borderRadius: "8px", padding: "8px 10px", display: "flex", alignItems: "center", gap: "4px", minWidth: 0 }}>
      <span style={{ fontSize: "13px", color: "#7a8fa8", flexShrink: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>{label}</span>
      <input
        type="number" value={raw} step={step ?? 1}
        onChange={(e) => setRaw(e.target.value)}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && commit(raw)}
        style={{ width: "52px", flexShrink: 0, background: "rgba(255,255,255,0.08)", border: "1px solid #2a3d50", borderRadius: "4px", outline: "none", color: "#e8f4fd", fontFamily: "monospace", fontSize: "15px", fontWeight: "800", padding: "4px 5px", textAlign: "right", marginLeft: "auto" }}
      />
      <span style={{ fontSize: "12px", color: "#00d4aa", fontWeight: "600", flexShrink: 0 }}>{unit}</span>
    </div>
  );
};

const NumInputWide = NumInput;

const SectionLabel = ({ children, color }) => (
  <div style={{ fontSize: "12px", color: color || "#00d4aa", letterSpacing: "0.12em", fontFamily: "monospace", marginBottom: "10px", marginTop: "18px" }}>{children}</div>
);

const Badge = ({ ok, warn, text }) => (
  <span style={{
    fontSize: "14px", fontWeight: "600", padding: "4px 11px", borderRadius: "20px",
    background: ok ? "#003322" : warn ? "#332200" : "#330011",
    color: ok ? "#00d4aa" : warn ? "#ffaa00" : "#ff4466",
    border: `1px solid ${ok ? "#00d4aa44" : warn ? "#ffaa0044" : "#ff446644"}`
  }}>{text}</span>
);

export default function App() {
  const [purchasePrice, setPurchasePrice] = useState(2500);
  const [monthlyRent, setMonthlyRent] = useState(18);
  const [renovationCost, setRenovationCost] = useState(800);
  const [fireInsurance, setFireInsurance] = useState(5);
  const [propertyTax, setPropertyTax] = useState(10);
  const [acquisitionCost, setAcquisitionCost] = useState(80);
  const [equity, setEquity] = useState(0);
  const [loanRate, setLoanRate] = useState(2.5);
  const [loanRatio, setLoanRatio] = useState(80);
  const [loanTerm, setLoanTerm] = useState(15);
  const [landTsubo, setLandTsubo] = useState(58.7);
  const [pricePerTsubo, setPricePerTsubo] = useState(20);
  const [demolishCost, setDemolishCost] = useState(200);
  const [catCount, setCatCount] = useState(15);
  const [earlyYears, setEarlyYears] = useState(5);
  const [exitMode, setExitMode] = useState("reform");
  const [majorReformCost, setMajorReformCost] = useState(1000);
  const [calcPeriod, setCalcPeriod] = useState(20);
  const [tab, setTab] = useState("input");

  const c = useMemo(() => {
    const pw = purchasePrice * 10000;
    const equityWan = equity * 10000;
    const loan = Math.max(0, pw - equityWan);
    const loanRatioCalc = pw > 0 ? (loan / pw) * 100 : 0;
    const mr = loanRate / 100 / 12;
    const tp = loanTerm * 12;
    const monthlyLoan = mr === 0 ? loan / tp : loan * (mr * Math.pow(1 + mr, tp)) / (Math.pow(1 + mr, tp) - 1);
    const totalInterest = monthlyLoan * tp - loan;
    const annualRent = monthlyRent * 10000 * 12;
    const acquisitionCostWan = acquisitionCost;
    const annualFixedWan = fireInsurance + propertyTax;
    const reno = renovationCost * 10000;
    const catFactor = catCount > 10 ? 1.5 : catCount > 5 ? 1.2 : 1.0;
    const renoAdj = reno * catFactor;
    const exitLandValue = Math.round(landTsubo * pricePerTsubo);
    const exitVal = exitLandValue * 10000; // 解体費は解体売却時のみ別途引く
    const surfYield = (annualRent / pw) * 100;
    const netYield = (annualRent - annualFixedWan * 10000) / pw * 100;

    let breakevenYears = null;
    for (let y = 1; y <= 50; y++) {
      const r = annualRent * y;
      const f = annualFixedWan * 10000 * y + acquisitionCostWan * 10000;
      const i = totalInterest * Math.min(1, y / loanTerm);
      if ((r + exitVal) - (pw + f + renoAdj + i) >= 0) { breakevenYears = y; break; }
    }

    const leasePeriod = calcPeriod;
    const totalRent = annualRent * leasePeriod;
    const totalFixed = (annualFixedWan * 10000 * leasePeriod) + acquisitionCostWan * 10000;
    const interest = totalInterest * Math.min(1, leasePeriod / loanTerm);
    const net = (totalRent + exitVal) - (pw + totalFixed + renoAdj + interest);

    const earlyRent = annualRent * earlyYears;
    const earlyFixed = (annualFixedWan * 10000 * earlyYears) + acquisitionCostWan * 10000;
    const earlyInterest = totalInterest * Math.min(1, earlyYears / loanTerm);
    const earlyReformCost = exitMode === "reform" ? majorReformCost * 10000 * catFactor : 0;
    const earlyDemolishCost = exitMode === "demolish" ? demolishCost * 10000 : 0;
    const earlyLandVal = exitLandValue * 10000;
    const earlyExitVal = exitMode === "demolish" ? earlyLandVal - earlyDemolishCost : earlyLandVal;
    const earlyExitCost = earlyReformCost + earlyDemolishCost;
    const earlyNet = (earlyRent + earlyExitVal) - (pw + earlyFixed + earlyExitCost + earlyInterest);

    return { loan, monthlyLoan, totalInterest, totalRent, totalFixed, renoAdj, catFactor, interest, exitVal, net, surfYield, netYield, pw, breakevenYears, earlyRent, earlyFixed, earlyInterest, earlyExitCost, earlyExitVal, earlyNet, earlyReformCost, earlyDemolishCost, earlyLandVal, acquisitionCostWan, annualFixedWan };
  }, [purchasePrice, monthlyRent, renovationCost, fireInsurance, propertyTax, acquisitionCost, loanRate, loanRatio, loanTerm, landTsubo, pricePerTsubo, demolishCost, catCount, earlyYears, exitMode, majorReformCost]);

  const profit = c.net >= 0;

  const TabBtn = ({ id, label }) => (
    <button onClick={() => setTab(id)} style={{
      flex: 1, padding: "11px 4px", border: "none", cursor: "pointer", fontWeight: "700",
      fontSize: "14px", fontFamily: "monospace",
      background: tab === id ? "#00d4aa" : "transparent",
      color: tab === id ? "#040d1a" : "#8a9bb0",
      borderRadius: "8px", transition: "all 0.15s"
    }}>{label}</button>
  );

  const Grid = ({ children }) => <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "4px" }}>{children}</div>;

  const S = {
    card: { background: "rgba(255,255,255,0.04)", border: "1px solid #1e2d3d", borderRadius: "10px", padding: "14px", marginBottom: "10px" },
    row: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #0a1520" },
    rowLast: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" },
    lbl: { fontSize: "15px", color: "#8a9bb0" },
  };

  return (
    <div style={{ background: "#040d1a", minHeight: "100vh", color: "#e8f4fd", fontFamily: "'Segoe UI', sans-serif", width: "100%", boxSizing: "border-box", overflowX: "hidden" }}>

      <style>{`*{box-sizing:border-box}input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}input[type=number]{-moz-appearance:textfield}`}</style>
      {/* Header */}
      <div style={{ background: "linear-gradient(90deg,#001a2e,#002a44)", padding: "14px 16px", display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid #0a3050" }}>
        <div style={{ width: "36px", height: "36px", background: "linear-gradient(135deg,#00d4aa,#0088cc)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>🏠</div>
        <div>
          <div style={{ fontSize: "15px", fontWeight: "800", fontFamily: "monospace" }}>LEASEBACK ANALYZER</div>
          <div style={{ fontSize: "11px", color: "#00d4aa", letterSpacing: "0.08em" }}>リースバック投資シミュレーター</div>
        </div>
      </div>

      {/* Verdict Strip */}
      <div style={{
        background: profit ? "linear-gradient(90deg,#003322,#004433)" : "linear-gradient(90deg,#2a0011,#3a0022)",
        borderBottom: `2px solid ${profit ? "#00d4aa" : "#ff4466"}`,
        padding: "13px 16px", display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <div>
          <div style={{ fontSize: "11px", color: profit ? "#00d4aa" : "#ff4466", letterSpacing: "0.08em", marginBottom: "2px" }}>
            {profit ? "▲ 収益見込みあり" : "▼ 収益リスク高"}
          </div>
          <div style={{ fontSize: "22px", fontWeight: "900", fontFamily: "monospace" }}>
            {profit ? "+" : "-"}{wan(c.net)}円
          </div>
          <div style={{ fontSize: "11px", color: "#8a9bb0" }}>{calcPeriod}年居住した場合の総収支</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "11px", color: "#8a9bb0", marginBottom: "3px" }}>何年住めばプラス？</div>
          <div style={{ fontSize: "20px", fontWeight: "800", color: c.breakevenYears ? "#ffd700" : "#ff4466", fontFamily: "monospace" }}>
            {c.breakevenYears ? `${c.breakevenYears}年以上` : "50年超"}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "6px", padding: "10px 16px 0" }}>
        <TabBtn id="input" label="📋 入力" />
        <TabBtn id="breakeven" label="📊 損益分岐" />
        <TabBtn id="risk" label="⚠️ リスク" />
      </div>

      <div style={{ padding: "12px 16px 40px" }}>

        {/* INPUT TAB */}
        {tab === "input" && <>
          <SectionLabel>▌ 物件・収益</SectionLabel>
          <Grid>
            <NumInput label="購入価格" value={purchasePrice} onChange={setPurchasePrice} unit="万円" step={50} min={100} max={50000} />
            <NumInput label="想定月額家賃" value={monthlyRent} onChange={setMonthlyRent} unit="万円/月" step={1} min={1} max={200} />
          </Grid>

          <SectionLabel>▌ 融資条件</SectionLabel>
          <Grid>
            <NumInput label="自己資金" value={equity} onChange={setEquity} unit="万円" step={50} min={0} max={50000} />
            <NumInput label="金利" value={loanRate} onChange={setLoanRate} unit="%" step={0.1} min={0} max={20} />
            <NumInput label="返済期間" value={loanTerm} onChange={setLoanTerm} unit="年" step={1} min={1} max={50} />
          </Grid>

          <div style={{ fontSize: "12px", color: "#556677", padding: "3px 0 8px", fontFamily: "monospace" }}>
            融資額 {Math.round((purchasePrice * 10000 - equity * 10000) / 10000).toLocaleString()}万円 / LTV {purchasePrice > 0 ? Math.round(Math.max(0, purchasePrice - equity) / purchasePrice * 100) : 0}%
          </div>
          <SectionLabel>▌ コスト</SectionLabel>
          <Grid>
            <NumInput label="固定資産税" value={propertyTax} onChange={setPropertyTax} unit="万円/年" step={1} min={0} max={200} />
            <NumInput label="火災保険料" value={fireInsurance} onChange={setFireInsurance} unit="万円/年" step={1} min={0} max={100} />
            <NumInput label="不動産取得費" value={acquisitionCost} onChange={setAcquisitionCost} unit="万円" step={10} min={0} max={1000} />
            <NumInput label="退去後リフォーム費" value={renovationCost} onChange={setRenovationCost} unit="万円" step={50} min={0} max={10000} />
          </Grid>

          <SectionLabel>▌ 出口（土地）</SectionLabel>
          <Grid>
            <NumInput label="土地面積" value={landTsubo} onChange={setLandTsubo} unit="坪" step={0.1} min={0} max={1000} />
            <NumInput label="坪単価" value={pricePerTsubo} onChange={setPricePerTsubo} unit="万円/坪" step={1} min={0} max={500} />
            <NumInput label="解体費用" value={demolishCost} onChange={setDemolishCost} unit="万円" step={10} min={0} max={2000} />
            <div style={{ background: "rgba(0,212,170,0.08)", border: "1px solid #00d4aa33", borderRadius: "8px", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontSize: "12px", color: "#7a8fa8", marginBottom: "4px" }}>土地値（自動）</div>
              <div style={{ fontSize: "17px", fontWeight: "800", color: "#00d4aa", fontFamily: "monospace" }}>{Math.round(landTsubo * pricePerTsubo).toLocaleString()}万</div>
            </div>
          </Grid>

          <SectionLabel color="#ff8844">▌ 🐾 ペット・入居条件</SectionLabel>
          <Grid>
            <NumInput label="ペット頭数" value={catCount} onChange={setCatCount} unit="頭" step={1} min={0} max={100} />
            <div style={{ background: "rgba(255,136,68,0.1)", border: "1px solid #ff884433", borderRadius: "8px", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontSize: "12px", color: "#ff8844", marginBottom: "4px" }}>リフォーム倍率</div>
              <div style={{ fontSize: "20px", fontWeight: "800", color: "#ff8844", fontFamily: "monospace" }}>×{c.catFactor.toFixed(1)}</div>
              <div style={{ fontSize: "11px", color: "#aa6633" }}>{catCount > 10 ? "多頭・要注意" : catCount > 5 ? "複数・注意" : catCount > 0 ? "飼育あり" : "飼育なし"}</div>
            </div>
          </Grid>

          <SectionLabel color="#ff6644">▌ 🚨 短期解約シナリオ</SectionLabel>
          <NumInputWide label="早期退去想定" value={earlyYears} onChange={setEarlyYears} unit="年後" step={1} min={1} max={30} />
          <div style={{ display: "flex", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #0a1828", gap: "8px" }}>
            <span style={{ fontSize: "14px", color: "#8a9bb0", flexShrink: 0 }}>退去後の対応</span>
            <div style={{ flex: 1 }} />
            <div style={{ display: "flex", gap: "6px" }}>
              {[["reform","大規模リフォーム"],["demolish","解体売却"]].map(([v,l]) => (
                <button key={v} onClick={() => setExitMode(v)} style={{
                  padding: "5px 12px", borderRadius: "6px", border: "none", cursor: "pointer",
                  fontSize: "12px", fontWeight: "700",
                  background: exitMode === v ? "#ff6644" : "rgba(255,255,255,0.07)",
                  color: exitMode === v ? "#fff" : "#8a9bb0"
                }}>{l}</button>
              ))}
            </div>
          </div>
          {exitMode === "reform" && (
            <NumInputWide label="大規模リフォーム費" value={majorReformCost} onChange={setMajorReformCost} unit="万円" step={50} min={0} max={5000} />
          )}
          <div style={{ background: "rgba(255,100,68,0.06)", border: "1px solid #ff664433", borderRadius: "8px", padding: "12px", marginTop: "10px" }}>
            <div style={{ fontSize: "12px", color: "#ff8866", fontFamily: "monospace", marginBottom: "10px" }}>📊 {earlyYears}年後早期退去 内訳</div>
            {[
              ["＋ 家賃収入（" + earlyYears + "年）", c.earlyRent, true],
              ["＋ 売却収入（土地値）", c.earlyLandVal, true],
              ["－ 購入費用", -c.pw, false],
              ["－ 不動産取得費", -c.acquisitionCostWan * 10000, false],
              ["－ 固定費（" + earlyYears + "年）", -(c.annualFixedWan * 10000 * earlyYears), false],
              ["－ 融資利息（" + earlyYears + "年）", -c.earlyInterest, false],
              exitMode === "reform"
                ? ["－ 大規模リフォーム（猫×" + c.catFactor + "）", -c.earlyReformCost, false]
                : ["－ 解体費用", -c.earlyDemolishCost, false],
            ].map(([label, val, pos], i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #1a1a2a", fontSize: "13px" }}>
                <span style={{ color: "#8a9bb0" }}>{label}</span>
                <span style={{ fontFamily: "monospace", fontWeight: "700", color: pos ? "#00d4aa" : "#ff6688" }}>
                  {pos ? "+" : ""}{Math.round(val / 10000).toLocaleString()}万
                </span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", paddingTop: "8px", borderTop: "2px solid #ff664455" }}>
              <span style={{ fontSize: "14px", fontWeight: "700", color: "#ff9977" }}>収支合計</span>
              <span style={{ fontFamily: "monospace", fontWeight: "900", fontSize: "17px", color: c.earlyNet >= 0 ? "#00d4aa" : "#ff4466" }}>
                {c.earlyNet >= 0 ? "+" : ""}{Math.round(c.earlyNet / 10000).toLocaleString()}万円
              </span>
            </div>
          </div>
        </>}

        {/* RESULT TAB */}
        {tab === "breakeven" && <>
          <SectionLabel>▌ 条件を変えてシミュレーション</SectionLabel>
          <Grid>
            <NumInput label="購入価格" value={purchasePrice} onChange={setPurchasePrice} unit="万円" step={50} min={100} max={50000} />
            <NumInput label="月額家賃" value={monthlyRent} onChange={setMonthlyRent} unit="万円/月" step={1} min={1} max={200} />
            <NumInput label="自己資金" value={equity} onChange={setEquity} unit="万円" step={50} min={0} max={50000} />
            <NumInput label="居住年数" value={calcPeriod} onChange={setCalcPeriod} unit="年" step={1} min={1} max={50} />
            <NumInput label="金利" value={loanRate} onChange={setLoanRate} unit="%" step={0.1} min={0} max={20} />
            <NumInput label="返済期間" value={loanTerm} onChange={setLoanTerm} unit="年" step={1} min={1} max={50} />
          </Grid>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px", marginTop: "10px" }}>
            {[
              { label: "表面利回り", val: formatPct(c.surfYield), ok: c.surfYield >= 8, warn: c.surfYield < 5 },
              { label: "実質利回り", val: formatPct(c.netYield), ok: c.netYield >= 6, warn: c.netYield < 4 },
              { label: "月額ローン", val: `${Math.round(c.monthlyLoan / 10000)}万円` },
              { label: "自己資金", val: `${Math.round((c.pw - c.loan) / 10000)}万円` },
            ].map((m, i) => (
              <div key={i} style={{
                background: m.ok ? "#003322" : m.warn ? "#330011" : "rgba(255,255,255,0.04)",
                border: `1px solid ${m.ok ? "#00d4aa44" : m.warn ? "#ff446644" : "#1e2d3d"}`,
                borderRadius: "10px", padding: "12px", textAlign: "center"
              }}>
                <div style={{ fontSize: "12px", color: "#8a9bb0", marginBottom: "4px" }}>{m.label}</div>
                <div style={{ fontSize: "18px", fontWeight: "800", fontFamily: "monospace", color: m.ok ? "#00d4aa" : m.warn ? "#ff4466" : "#e8f4fd" }}>{m.val}</div>
              </div>
            ))}
          </div>

          <div style={S.card}>
            <div style={{ fontSize: "12px", color: "#00d4aa", fontFamily: "monospace", marginBottom: "12px" }}>▌ キャッシュフロー内訳（{calcPeriod}年）</div>
            {[
              ["家賃収入合計", c.totalRent, true],
              ["売却収入（土地値）", c.exitVal, true],
              ["購入費用", -c.pw, false],
              ["固定費合計（" + calcPeriod + "年）", -c.totalFixed, false],
              [`退去後リフォーム（猫×${c.catFactor}）`, -c.renoAdj, false],
              ["融資利息（20年中）", -c.interest, false],
            ].map(([label, val, pos], i, arr) => (
              <div key={i} style={i < arr.length - 1 ? S.row : S.rowLast}>
                <span style={S.lbl}>{label}</span>
                <span style={{ fontSize: "15px", fontWeight: "700", color: pos ? "#00d4aa" : "#ff6688", fontFamily: "monospace" }}>
                  {pos ? "+" : ""}{wan(val)}円
                </span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", paddingTop: "10px", borderTop: "2px solid #1e3050" }}>
              <span style={{ fontSize: "15px", fontWeight: "700" }}>総収支</span>
              <span style={{ fontSize: "22px", fontWeight: "900", fontFamily: "monospace", color: profit ? "#00d4aa" : "#ff4466" }}>
                {profit ? "+" : "-"}{wan(c.net)}円
              </span>
            </div>
          </div>
        </>}

        {/* RISK TAB */}
        {tab === "risk" && <>
          <div style={{ fontSize: "12px", color: "#00d4aa", fontFamily: "monospace", marginBottom: "10px", marginTop: "12px" }}>▌ リスク判定</div>
          {[
            {
              label: "🐾 ペットダメージ",
              ok: catCount <= 5, warn: catCount > 5 && catCount <= 10,
              detail: catCount > 10 ? `${catCount}頭・リフォーム×1.5倍（多頭飼育）` : catCount > 5 ? `${catCount}頭・×1.2倍` : catCount > 0 ? `${catCount}頭・×1.0（標準）` : "飼育なし・補正なし"
            },
            {
              label: "📈 利回り",
              ok: c.surfYield >= 8, warn: c.surfYield >= 6 && c.surfYield < 8,
              detail: `表面${formatPct(c.surfYield)} / 実質${formatPct(c.netYield)}`
            },
            {
              label: "🏁 出口（売却）",
              ok: c.exitVal >= c.pw * 0.5, warn: c.exitVal > 0 && c.exitVal < c.pw * 0.5,
              detail: c.exitVal <= 0 ? "土地値＜解体費：追加費用発生" : `売却収入 ${wan(c.exitVal)}円（購入額の${Math.round(c.exitVal / c.pw * 100)}%）`
            },
            {
              label: "🏦 融資コスト",
              ok: loanRate < 2.5, warn: loanRate >= 2.5 && loanRate < 3.5,
              detail: `金利${loanRate}% / 総利息${wan(c.totalInterest)}円`
            },
            {
              label: "💰 損益分岐年数",
              ok: !!c.breakevenYears && c.breakevenYears <= 15,
              warn: !!c.breakevenYears && c.breakevenYears > 15,
              detail: c.breakevenYears
                ? `${c.breakevenYears}年以上住み続けると収支がプラスに転換。`
                : "50年以内に損益分岐しない。購入価格の見直しを推奨。"
            },
            {
              label: "🚨 短期解約リスク",
              ok: c.earlyNet >= 0,
              warn: c.earlyNet < 0 && c.earlyNet >= -c.pw * 0.2,
              detail: `${earlyYears}年で早期退去・${exitMode === "reform" ? `大規模リフォーム${majorReformCost}万（猫×${c.catFactor}）後売却` : `解体${demolishCost}万後土地売却`}の場合：${c.earlyNet >= 0 ? "+" : ""}${Math.round(c.earlyNet / 10000).toLocaleString()}万円`
            },
            {
              label: "🔨 退去後コスト",
              ok: false, warn: exitMode === "reform",
              detail: exitMode === "reform"
                ? `大規模リフォーム（猫補正込）${Math.round(majorReformCost * c.catFactor).toLocaleString()}万円。リフォーム後の賃貸・売却が前提。`
                : `解体費用${demolishCost}万円。築39年木造・猫多頭飼育歴ありのため解体売却も現実的。`
            },
          ].map((r, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #1e2d3d", borderRadius: "10px", padding: "14px", marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "15px", fontWeight: "700" }}>{r.label}</span>
                <Badge ok={r.ok} warn={r.warn} text={r.ok ? "低リスク" : r.warn ? "要注意" : "高リスク"} />
              </div>
              <div style={{ fontSize: "14px", color: "#8a9bb0", lineHeight: "1.6" }}>{r.detail}</div>
            </div>
          ))}
          <div style={{ padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "8px", fontSize: "12px", color: "#445566", lineHeight: "1.7" }}>
            ※ 参考用シミュレーターです。実際の投資判断は不動産・税務の専門家にご相談ください。
          </div>
        </>}
      </div>
    </div>
  );
}
