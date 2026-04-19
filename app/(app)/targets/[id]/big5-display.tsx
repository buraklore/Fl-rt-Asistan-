type Big5 = {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
};

const LABELS: Record<keyof Big5, { label: string; low: string; high: string }> = {
  openness: { label: "Açıklık", low: "gelenekçi", high: "yaratıcı" },
  conscientiousness: {
    label: "Öz-disiplin",
    low: "spontane",
    high: "planlı",
  },
  extraversion: { label: "Dışa dönüklük", low: "içe dönük", high: "sosyal" },
  agreeableness: { label: "Uzlaşmacılık", low: "rekabetçi", high: "uyumlu" },
  neuroticism: { label: "Duygusal hassaslık", low: "sakin", high: "yoğun" },
};

export function Big5Display({ big5 }: { big5: Big5 }) {
  const entries = Object.entries(big5) as [keyof Big5, number][];
  return (
    <div>
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-ink-400">
        big five profili
      </p>
      <div className="space-y-3">
        {entries.map(([key, value]) => {
          const meta = LABELS[key];
          const pct = Math.round(value * 100);
          return (
            <div key={key}>
              <div className="mb-1 flex items-baseline justify-between">
                <span className="text-sm text-ink-200">{meta.label}</span>
                <span className="font-display text-sm italic text-brand-400">
                  {pct}
                </span>
              </div>
              <div className="relative h-1.5 overflow-hidden rounded-full bg-ink-800">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-brand-600 to-brand-400"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-ink-500">
                <span>{meta.low}</span>
                <span>{meta.high}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
