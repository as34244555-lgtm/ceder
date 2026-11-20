import { useEffect, useMemo, useState } from 'react';
import { Calculator, RefreshCw } from 'lucide-react';
import { DEFAULT_FITRE_TRY, fetchGoldGramPriceTry } from '../api/goldPrice';

const NISAB_GOLD_GRAMS = 80.18;
const ZAKAT_RATE = 0.025;

function parseNumber(value: string): number {
  const n = Number(value.replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

export function ZakatCalculator() {
  const [wealth, setWealth] = useState('');
  const [goldPrice, setGoldPrice] = useState('');
  const [fitreAmount, setFitreAmount] = useState(String(DEFAULT_FITRE_TRY));
  const [personCount, setPersonCount] = useState('1');
  const [goldSource, setGoldSource] = useState<string | null>(null);
  const [goldLoading, setGoldLoading] = useState(false);

  const loadGold = async () => {
    setGoldLoading(true);
    try {
      const data = await fetchGoldGramPriceTry();
      if (data) {
        setGoldPrice(data.gramTry.toFixed(0));
        setGoldSource(data.source);
      }
    } finally {
      setGoldLoading(false);
    }
  };

  useEffect(() => {
    void loadGold();
  }, []);

  const wealthNum = parseNumber(wealth);
  const goldPriceNum = parseNumber(goldPrice);
  const nisabTL = goldPriceNum > 0 ? goldPriceNum * NISAB_GOLD_GRAMS : null;
  const isAboveNisab = nisabTL !== null ? wealthNum >= nisabTL : null;
  const zakatDue = useMemo(() => {
    if (isAboveNisab === false) return 0;
    return wealthNum * ZAKAT_RATE;
  }, [wealthNum, isAboveNisab]);

  const fitreTotal = parseNumber(fitreAmount) * parseNumber(personCount || '1');

  return (
    <div className="w-full flex flex-col gap-4 fade-in-up">
      <div className="glass-card rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Calculator className="h-4 w-4 text-gold-400" />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Zekât Hesaplama</h3>
        </div>

        <label className="flex flex-col gap-1.5 text-xs text-[var(--text-muted)]">
          Zekâta tabi toplam mal varlığınız (nakit, altın, ticaret malı vb. — TL)
          <input
            inputMode="decimal"
            value={wealth}
            onChange={(e) => setWealth(e.target.value)}
            placeholder="Örn. 250000"
            className="rounded-xl bg-[var(--surface-soft)] border border-[var(--border-soft)] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-xs text-[var(--text-muted)]">
          Güncel gram altın fiyatı (TL)
          <div className="flex gap-2">
            <input
              inputMode="decimal"
              value={goldPrice}
              onChange={(e) => setGoldPrice(e.target.value)}
              placeholder="Örn. 4200"
              className="flex-1 rounded-xl bg-[var(--surface-soft)] border border-[var(--border-soft)] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none"
            />
            <button
              type="button"
              onClick={() => void loadGold()}
              disabled={goldLoading}
              className="rounded-xl px-3 bg-[var(--surface-soft)] text-gold-300 border border-[var(--border-soft)] disabled:opacity-40"
              aria-label="Altın fiyatını yenile"
            >
              <RefreshCw className={`h-4 w-4 ${goldLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          {goldSource && (
            <span className="text-[11px] text-[var(--text-faint)]">Kaynak: {goldSource}</span>
          )}
        </label>

        <div className="rounded-xl bg-[var(--accent-soft-bg)] border border-[var(--accent-soft-border)] px-4 py-3 flex flex-col gap-1">
          {nisabTL !== null && (
            <p className="text-xs text-[var(--text-muted)]">
              Nisap sınırı (≈{NISAB_GOLD_GRAMS} gr altın):{' '}
              {nisabTL.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} TL
            </p>
          )}
          <p className="text-sm font-semibold text-[var(--accent-soft-text)]">
            {isAboveNisab === false
              ? 'Mal varlığınız nisap sınırının altında; zekât farz değildir.'
              : `Ödenmesi gereken zekât (%2,5): ${zakatDue.toLocaleString('tr-TR', {
                  maximumFractionDigits: 2,
                })} TL`}
          </p>
        </div>
        <p className="text-[11px] text-[var(--text-muted)]">
          Bu hesaplama genel bir rehberdir; özel durumlar için bir din görevlisine danışın.
        </p>
      </div>

      <div className="glass-card rounded-2xl p-5 flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Fitre Hesaplama</h3>
        <label className="flex flex-col gap-1.5 text-xs text-[var(--text-muted)]">
          Kişi başı fitre (TL) — varsayılan yaklaşık tutar; Diyanet duyurusuna göre güncelleyin
          <input
            inputMode="decimal"
            value={fitreAmount}
            onChange={(e) => setFitreAmount(e.target.value)}
            className="rounded-xl bg-[var(--surface-soft)] border border-[var(--border-soft)] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-xs text-[var(--text-muted)]">
          Kişi sayısı
          <input
            inputMode="numeric"
            value={personCount}
            onChange={(e) => setPersonCount(e.target.value)}
            className="rounded-xl bg-[var(--surface-soft)] border border-[var(--border-soft)] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none"
          />
        </label>
        <div className="rounded-xl bg-[var(--accent-soft-bg)] border border-[var(--accent-soft-border)] px-4 py-3">
          <p className="text-sm font-semibold text-[var(--accent-soft-text)]">
            Toplam fitre: {fitreTotal.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} TL
          </p>
        </div>
      </div>
    </div>
  );
}
