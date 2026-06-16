import { useState, useRef, useEffect } from "react";
import { Ruler, ChevronDown, ChevronUp, Info, CheckCircle2 } from "lucide-react";

type Category = "lenceria" | "bikinis" | "pijamas";
type Size = "XS" | "S" | "M" | "L" | "XL" | "XXL";

interface Measurements {
  busto: string;
  cintura: string;
  cadera: string;
  talle: string;
}

interface SizeRow {
  size: Size;
  busto: [number, number];
  cintura: [number, number];
  cadera: [number, number];
  talle?: [number, number];
}

const sizeCharts: Record<Category, SizeRow[]> = {
  lenceria: [
    { size: "XS",  busto: [74, 79],   cintura: [57, 62],  cadera: [82, 87]   },
    { size: "S",   busto: [80, 85],   cintura: [63, 68],  cadera: [88, 93]   },
    { size: "M",   busto: [86, 91],   cintura: [69, 74],  cadera: [94, 99]   },
    { size: "L",   busto: [92, 97],   cintura: [75, 80],  cadera: [100, 105] },
    { size: "XL",  busto: [98, 103],  cintura: [81, 86],  cadera: [106, 111] },
    { size: "XXL", busto: [104, 110], cintura: [87, 93],  cadera: [112, 118] },
  ],
  bikinis: [
    { size: "XS",  busto: [74, 82],   cintura: [56, 62],  cadera: [80, 88]   },
    { size: "S",   busto: [82, 88],   cintura: [62, 68],  cadera: [88, 94]   },
    { size: "M",   busto: [88, 94],   cintura: [68, 74],  cadera: [94, 100]  },
    { size: "L",   busto: [94, 100],  cintura: [74, 80],  cadera: [100, 106] },
    { size: "XL",  busto: [100, 108], cintura: [80, 88],  cadera: [106, 114] },
    { size: "XXL", busto: [108, 116], cintura: [88, 96],  cadera: [114, 122] },
  ],
  pijamas: [
    { size: "XS",  busto: [74, 82],   cintura: [56, 64],  cadera: [80, 88],   talle: [150, 158] },
    { size: "S",   busto: [82, 88],   cintura: [64, 70],  cadera: [88, 94],   talle: [158, 163] },
    { size: "M",   busto: [88, 94],   cintura: [70, 76],  cadera: [94, 100],  talle: [163, 168] },
    { size: "L",   busto: [94, 100],  cintura: [76, 82],  cadera: [100, 106], talle: [166, 171] },
    { size: "XL",  busto: [100, 108], cintura: [82, 90],  cadera: [106, 114], talle: [170, 175] },
    { size: "XXL", busto: [108, 116], cintura: [90, 98],  cadera: [114, 122], talle: [173, 180] },
  ],
};

function getRecommendedSize(cat: Category, m: Measurements): Size | null {
  const b  = parseFloat(m.busto);
  const c  = parseFloat(m.cintura);
  const ca = parseFloat(m.cadera);
  const t  = parseFloat(m.talle);
  if ([b, c, ca].every(isNaN)) return null;

  const chart = sizeCharts[cat];
  let best: Size | null = null;
  let bestScore = -Infinity;

  for (const row of chart) {
    let score = 0;
    if (!isNaN(b)) {
      const mid = (row.busto[0] + row.busto[1]) / 2;
      score += b >= row.busto[0] && b <= row.busto[1] ? 10 : -Math.abs(b - mid) * 0.5;
    }
    if (!isNaN(c)) {
      const mid = (row.cintura[0] + row.cintura[1]) / 2;
      score += c >= row.cintura[0] && c <= row.cintura[1] ? 10 : -Math.abs(c - mid) * 0.5;
    }
    if (!isNaN(ca)) {
      const mid = (row.cadera[0] + row.cadera[1]) / 2;
      score += ca >= row.cadera[0] && ca <= row.cadera[1] ? 10 : -Math.abs(ca - mid) * 0.5;
    }
    if (cat === "pijamas" && !isNaN(t) && row.talle) {
      const mid = (row.talle[0] + row.talle[1]) / 2;
      score += t >= row.talle[0] && t <= row.talle[1] ? 8 : -Math.abs(t - mid) * 0.3;
    }
    if (score > bestScore) { bestScore = score; best = row.size; }
  }
  return best;
}

const categoryConfig: Record<Category, { label: string; emoji: string }> = {
  lenceria: { label: "Lencería",  emoji: "🌸" },
  bikinis:  { label: "Bikinis",   emoji: "🌊" },
  pijamas:  { label: "Pijamas",   emoji: "🌙" },
};

const measurementTips: Record<Category, string[]> = {
  lenceria: [
    "Busto — sobre la parte más prominente del pecho, cinta nivelada por la espalda.",
    "Cintura — en la parte más angosta, 2 cm por encima del ombligo.",
    "Cadera — en la parte más ancha, a la altura de los glúteos, pies juntos.",
  ],
  bikinis: [
    "Busto — sobre la parte más plena del pecho.",
    "Cintura — la parte más angosta del torso.",
    "Cadera — la parte más ancha, a la altura de los glúteos.",
  ],
  pijamas: [
    "Busto — cinta nivelada, sobre la parte más prominente del pecho.",
    "Cintura — parte más angosta, sin apretar.",
    "Cadera — la parte más ancha, a la altura de los glúteos.",
    "Altura — de pie, desde la coronilla hasta el piso.",
  ],
};

const sizeGradient: Record<Size, string> = {
  XS:  "#C9A0B8",
  S:   "#B88BA8",
  M:   "#A77695",
  L:   "#966183",
  XL:  "#854C70",
  XXL: "#7B4462",
};

export default function App() {
  const [category, setCategory]     = useState<Category>("lenceria");
  const [measurements, setMeasurements] = useState<Measurements>({ busto: "", cintura: "", cadera: "", talle: "" });
  const [showGuide, setShowGuide]   = useState(false);
  const [showChart, setShowChart]   = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const recommended = getRecommendedSize(category, measurements);
  const hasAnyInput = Object.values(measurements).some((v) => v !== "");
  const hasTalle    = category === "pijamas";

  const handleInput = (field: keyof Measurements) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^\d.,]/g, "").replace(",", ".");
    setMeasurements((prev) => ({ ...prev, [field]: val }));
  };

  useEffect(() => {
    if (recommended && hasAnyInput && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [recommended]);

  const chart = sizeCharts[category];

  return (
    <div
      className="flex flex-col bg-background text-foreground"
      style={{
        fontFamily: "'DM Sans', sans-serif",
        minHeight: "100dvh",
        paddingBottom: "calc(72px + env(safe-area-inset-bottom))",
      }}
    >
      {/* ── Status bar spacer (iOS/Android) ── */}
      <div style={{ height: "env(safe-area-inset-top)", background: "var(--background)" }} />

      {/* ── Top header ── */}
      <header
        className="sticky top-0 z-30 bg-background/90 border-b border-border flex items-center justify-between px-4 py-3"
        style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
      >
        <div className="flex items-center gap-1.5">
          <Ruler size={16} className="text-primary opacity-60" />
          <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-medium">
            Guía de Talles
          </span>
        </div>
        <span
          className="text-sm italic text-muted-foreground"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          para ella
        </span>
      </header>

      {/* ── Scrollable content ── */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 pt-8 pb-6 space-y-5">

          {/* Hero */}
          <div className="text-center mb-2">
            <h1
              className="text-3xl font-medium italic leading-tight mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Encontrá tu talle
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ingresá tus medidas en centímetros y te recomendamos el talle ideal.
            </p>
          </div>

          {/* ── Measurement card ── */}
          <section className="bg-card rounded-2xl border border-border overflow-hidden">
            {/* Card header */}
            <div className="px-5 pt-5 pb-4">
              <p className="text-xs tracking-[0.18em] uppercase text-muted-foreground font-medium mb-4">
                Tus medidas — cm
              </p>

              <div className="space-y-3">
                <MeasurementRow
                  label="Busto"
                  value={measurements.busto}
                  onChange={handleInput("busto")}
                  placeholder="ej. 88"
                />
                <MeasurementRow
                  label="Cintura"
                  value={measurements.cintura}
                  onChange={handleInput("cintura")}
                  placeholder="ej. 68"
                />
                <MeasurementRow
                  label="Cadera"
                  value={measurements.cadera}
                  onChange={handleInput("cadera")}
                  placeholder="ej. 96"
                />
                {hasTalle && (
                  <MeasurementRow
                    label="Altura"
                    value={measurements.talle}
                    onChange={handleInput("talle")}
                    placeholder="ej. 165"
                  />
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Result zone */}
            <div ref={resultRef} className="px-5 py-5">
              {recommended && hasAnyInput ? (
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-medium text-white flex-shrink-0 shadow-sm"
                    style={{
                      backgroundColor: sizeGradient[recommended],
                      fontFamily: "'Playfair Display', serif",
                    }}
                  >
                    {recommended}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <CheckCircle2 size={14} className="text-primary opacity-70 flex-shrink-0" />
                      <span className="text-xs tracking-widest uppercase text-primary font-medium opacity-80">
                        Talle recomendado
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Si estás entre dos talles, elegí el mayor para mayor comodidad.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 opacity-40">
                  <div
                    className="w-16 h-16 rounded-2xl border-2 border-dashed border-muted-foreground flex items-center justify-center flex-shrink-0"
                  >
                    <span className="text-xl text-muted-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>?</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Completá al menos una medida para ver tu talle.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* ── How to measure (accordion) ── */}
          <section className="bg-card rounded-2xl border border-border overflow-hidden">
            <button
              onClick={() => setShowGuide((v) => !v)}
              className="w-full flex items-center justify-between px-5 py-4 active:bg-secondary/60 transition-colors"
              style={{ minHeight: 56 }}
              aria-expanded={showGuide}
            >
              <div className="flex items-center gap-2.5">
                <Info size={15} className="text-primary opacity-70 flex-shrink-0" />
                <span className="text-sm font-medium">Cómo tomar las medidas</span>
              </div>
              <div className="text-muted-foreground">
                {showGuide ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </button>

            {showGuide && (
              <div className="border-t border-border px-5 pb-5 pt-4 space-y-3">
                {measurementTips[category].map((tip, i) => {
                  const [label, desc] = tip.split(" — ");
                  return (
                    <div key={i} className="flex gap-3">
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: sizeGradient["M"] }}
                      >
                        {i + 1}
                      </span>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        <strong className="text-foreground font-medium">{label}</strong>
                        {desc ? ` — ${desc}` : ""}
                      </p>
                    </div>
                  );
                })}
                <div className="mt-1 p-3.5 rounded-xl bg-secondary text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Tip:</strong> usá una cinta métrica flexible. Tomá las medidas en ropa interior o sin ropa. La cinta debe estar ajustada pero no apretada.
                </div>
              </div>
            )}
          </section>

          {/* ── Size chart (accordion) ── */}
          <section className="bg-card rounded-2xl border border-border overflow-hidden">
            <button
              onClick={() => setShowChart((v) => !v)}
              className="w-full flex items-center justify-between px-5 py-4 active:bg-secondary/60 transition-colors"
              style={{ minHeight: 56 }}
              aria-expanded={showChart}
            >
              <span className="text-sm font-medium">
                Tabla de talles — {categoryConfig[category].label}
              </span>
              <div className="text-muted-foreground">
                {showChart ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </button>

            {showChart && (
              <div className="border-t border-border overflow-x-auto">
                <table className="w-full text-sm min-w-[280px]">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50">
                      <th className="px-4 py-3 text-left text-xs tracking-widest uppercase text-muted-foreground font-medium">
                        Talle
                      </th>
                      <th className="px-3 py-3 text-center text-xs tracking-widest uppercase text-muted-foreground font-medium">
                        Busto
                      </th>
                      <th className="px-3 py-3 text-center text-xs tracking-widest uppercase text-muted-foreground font-medium">
                        Cintura
                      </th>
                      <th className="px-3 py-3 text-center text-xs tracking-widest uppercase text-muted-foreground font-medium">
                        Cadera
                      </th>
                      {hasTalle && (
                        <th className="px-3 py-3 text-center text-xs tracking-widest uppercase text-muted-foreground font-medium">
                          Altura
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {chart.map((row, idx) => {
                      const isRec = recommended === row.size && hasAnyInput;
                      return (
                        <tr
                          key={row.size}
                          className={`border-b border-border last:border-0 transition-colors ${
                            isRec ? "bg-primary/5" : idx % 2 === 0 ? "" : "bg-secondary/30"
                          }`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-medium text-white flex-shrink-0"
                                style={{ backgroundColor: sizeGradient[row.size] }}
                              >
                                {row.size}
                              </span>
                              {isRec && (
                                <CheckCircle2 size={14} className="text-primary opacity-70" />
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-center text-muted-foreground tabular-nums text-xs">
                            {row.busto[0]}–{row.busto[1]}
                          </td>
                          <td className="px-3 py-3 text-center text-muted-foreground tabular-nums text-xs">
                            {row.cintura[0]}–{row.cintura[1]}
                          </td>
                          <td className="px-3 py-3 text-center text-muted-foreground tabular-nums text-xs">
                            {row.cadera[0]}–{row.cadera[1]}
                          </td>
                          {hasTalle && (
                            <td className="px-3 py-3 text-center text-muted-foreground tabular-nums text-xs">
                              {row.talle![0]}–{row.talle![1]}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Footer note */}
          <p
            className="text-xs text-muted-foreground text-center italic pb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Los talles pueden variar según el diseño y el estilo de cada prenda.
          </p>
        </div>
      </main>

      {/* ── Bottom tab bar ── */}
      <nav
        className="fixed bottom-0 inset-x-0 z-40 bg-background/95 border-t border-border"
        style={{
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="flex">
          {(["lenceria", "bikinis", "pijamas"] as Category[]).map((cat) => {
            const active = category === cat;
            const { label, emoji } = categoryConfig[cat];
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className="flex-1 flex flex-col items-center justify-center gap-1 transition-colors"
                style={{ minHeight: 56, paddingTop: 10, paddingBottom: 10 }}
                aria-current={active ? "page" : undefined}
              >
                <span className="text-lg leading-none" style={{ filter: active ? "none" : "grayscale(0.6) opacity(0.5)" }}>
                  {emoji}
                </span>
                <span
                  className="text-xs font-medium transition-colors"
                  style={{ color: active ? "var(--primary)" : "var(--muted-foreground)" }}
                >
                  {label}
                </span>
                {active && (
                  <span
                    className="absolute bottom-0 w-8 h-0.5 rounded-full"
                    style={{ backgroundColor: "var(--primary)" }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

interface MeasurementRowProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}

function MeasurementRow({ label, value, onChange, placeholder }: MeasurementRowProps) {
  return (
    <div className="flex items-center gap-3 bg-input-background rounded-xl px-4 transition-colors focus-within:ring-2 focus-within:ring-ring/30">
      <label className="text-sm font-medium text-foreground w-16 flex-shrink-0 py-3.5 select-none">
        {label}
      </label>
      <div className="flex-1 flex items-center gap-1">
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="flex-1 bg-transparent py-3.5 text-foreground placeholder-muted-foreground/40 focus:outline-none min-w-0"
          style={{ fontSize: 16 }}
        />
        <span className="text-xs text-muted-foreground/60 flex-shrink-0">cm</span>
      </div>
    </div>
  );
}
