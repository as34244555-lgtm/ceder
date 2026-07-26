import { useMemo, useState } from 'react';
import { Calculator } from 'lucide-react';

const NISAB_GOLD_GRAMS = 80.18;
const ZAKAT_RATE = 0.025;

function parseNumber(value: string): number {
  const n = Number(value.replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

export function ZakatCalculator() {
  const [wealth, setWealth] = useState('');
  const [goldPrice, setGoldPrice] = useState('');
  const [fitreAmount, setFitreAmount] = useState('');
  const [personCount, setPersonCount] = useState('1');

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
          Güncel gram altın fiyatı (nisap sınırını hesaplamak için, TL)
          <input
            inputMode="decimal"
            value={goldPrice}
            onChange={(e) => setGoldPrice(e.target.value)}
            placeholder="Örn. 4200"
            className="rounded-xl bg-[var(--surface-soft)] border border-[var(--border-soft)] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none"
          />
        </label>

        <div className="rounded-xl bg-[var(--accent-soft-bg)] border border-[var(--accent-soft-border)] px-4 py-3 flex flex-col gap-1">
          {nisabTL !== null && (
            <p className="text-xs text-[var(--text-muted)]">
              Nisap sınırı (≈{NISAB_GOLD_GRAMS} gr altın): {nisabTL.toLocaleString('tr-TR', {
                maximumFractionDigits: 0,
              })}{' '}
              TL
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
          Bu hesaplama genel bir rehberdir; borç, ticaret malı, hayvan zekâtı gibi özel durumlar
          için bir din görevlisine danışmanız önerilir.
        </p>
      </div>

      <div className="glass-card rounded-2xl p-5 flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Fitre Hesaplama</h3>
        <label className="flex flex-col gap-1.5 text-xs text-[var(--text-muted)]">
          Bu yılki kişi başı fitre miktarı (Diyanet'in duyurduğu güncel tutar — TL)
          <input
            inputMode="decimal"
            value={fitreAmount}
            onChange={(e) => setFitreAmount(e.target.value)}
            placeholder="Örn. 170"
            className="rounded-xl bg-[var(--surface-soft)] border border-[var(--border-soft)] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-xs text-[var(--text-muted)]">
          Kişi sayısı (aile bireyleri)
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
        <p className="text-[11px] text-[var(--text-muted)]">
          Güncel fitre miktarını Diyanet İşleri Başkanlığı'nın yıllık duyurusundan öğrenebilirsiniz.
        </p>
      </div>
    </div>
  );
}
