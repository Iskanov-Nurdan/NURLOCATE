import { AlertCircle, CheckCircle2, CreditCard, Lock, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../../api/client";
import { Button } from "../../components/ui/Button";
import { formatPrice } from "../../utils/format";

type PaymentState = {
  planName: string;
  priceCents: number;
};

type CardForm = {
  number: string;
  expiry: string;
  cvv: string;
  name: string;
};

function formatCardNumber(v: string) {
  return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(v: string) {
  const digits = v.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
  return digits;
}

function validateCard(form: CardForm): string | null {
  const digits = form.number.replace(/\s/g, "");
  if (digits.length !== 16) return "Введите 16-значный номер карты";
  if (!/^\d{2} \/ \d{2}$/.test(form.expiry)) return "Срок действия — ММ/ГГ";
  const [mm, yy] = form.expiry.split(" / ").map(Number);
  if (mm < 1 || mm > 12) return "Неверный месяц";
  const now = new Date();
  const exp = new Date(2000 + (yy ?? 0), (mm ?? 1) - 1, 1);
  if (exp < now) return "Карта просрочена";
  if ((form.cvv ?? "").replace(/\D/g, "").length < 3) return "CVV — 3 цифры";
  if (!form.name.trim()) return "Введите имя держателя карты";
  return null;
}

export function PaymentPage() {
  const { paymentId } = useParams<{ paymentId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as PaymentState | null;

  const [card, setCard] = useState<CardForm>({ number: "", expiry: "", cvv: "", name: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleNumberChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCard((c) => ({ ...c, number: formatCardNumber(e.target.value) }));
  }
  function handleExpiryChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCard((c) => ({ ...c, expiry: formatExpiry(e.target.value) }));
  }
  function handleCvvChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCard((c) => ({ ...c, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }));
  }

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validateCard(card);
    if (validationError) { setError(validationError); return; }
    setLoading(true);
    setError(null);
    try {
      await apiRequest("/billing/confirm-test-payment/", {
        method: "POST",
        body: { payment_id: paymentId },
      });
      setDone(true);
      setTimeout(() => navigate("/app/billing"), 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ошибка оплаты";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-mint/15 text-mint">
            <CheckCircle2 size={36} />
          </div>
          <h2 className="text-xl font-semibold">Оплата прошла успешно!</h2>
          <p className="text-sm text-muted">Подписка активирована. Возвращаемся...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-4">
      <div className="w-full max-w-md space-y-5 animate-fade-in">

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-2 text-mint text-sm mb-3">
            <Lock size={14} />
            Безопасная оплата
          </div>
          <h1 className="text-2xl font-bold">Оформление подписки</h1>
          {state && (
            <p className="text-muted text-sm">
              {state.planName} — {formatPrice(state.priceCents)}/мес
            </p>
          )}
        </div>

        {/* Card form */}
        <div className="rounded-[12px] border border-border bg-panel p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <CreditCard size={16} className="text-accent" />
            Данные банковской карты
          </div>

          <form onSubmit={handlePay} className="space-y-4">
            {/* Card number */}
            <div className="space-y-1">
              <label className="text-xs text-muted font-medium">Номер карты</label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0000 0000 0000 0000"
                  value={card.number}
                  onChange={handleNumberChange}
                  maxLength={19}
                  className="w-full rounded-card border border-border bg-canvas px-3 py-2.5 font-mono text-sm text-text placeholder:text-muted/50 focus:border-accent/60 focus:outline-none transition-colors"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                  <span className="text-[10px] font-bold text-muted/60">VISA</span>
                  <span className="text-[10px] font-bold text-muted/60">MC</span>
                </div>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-1">
              <label className="text-xs text-muted font-medium">Имя держателя</label>
              <input
                type="text"
                placeholder="IVAN IVANOV"
                value={card.name}
                onChange={(e) => setCard((c) => ({ ...c, name: e.target.value.toUpperCase() }))}
                className="w-full rounded-card border border-border bg-canvas px-3 py-2.5 text-sm text-text uppercase placeholder:normal-case placeholder:text-muted/50 focus:border-accent/60 focus:outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Expiry */}
              <div className="space-y-1">
                <label className="text-xs text-muted font-medium">Срок действия</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="MM / ГГ"
                  value={card.expiry}
                  onChange={handleExpiryChange}
                  maxLength={7}
                  className="w-full rounded-card border border-border bg-canvas px-3 py-2.5 text-sm text-text placeholder:text-muted/50 focus:border-accent/60 focus:outline-none transition-colors"
                />
              </div>
              {/* CVV */}
              <div className="space-y-1">
                <label className="text-xs text-muted font-medium">CVV / CVC</label>
                <input
                  type="password"
                  inputMode="numeric"
                  placeholder="• • •"
                  value={card.cvv}
                  onChange={handleCvvChange}
                  maxLength={4}
                  className="w-full rounded-card border border-border bg-canvas px-3 py-2.5 font-mono text-sm text-text placeholder:text-muted/50 focus:border-accent/60 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Test hint */}
            <div className="rounded-card border border-accent/20 bg-accent/5 px-3 py-2 text-xs text-accent/80">
              Тестовый режим: введите любые валидные данные (напр. 4111 1111 1111 1111, 12/27, 123)
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 rounded-card border border-critical/30 bg-critical/10 px-3 py-2.5 text-sm text-critical">
                <AlertCircle size={14} className="shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              <CreditCard size={16} />
              {loading ? "Обработка..." : `Оплатить ${state ? formatPrice(state.priceCents) : ""}`}
            </Button>
          </form>
        </div>

        {/* Security badges */}
        <div className="flex items-center justify-center gap-6 text-xs text-muted">
          <span className="flex items-center gap-1"><ShieldCheck size={13} /> SSL 256-bit</span>
          <span className="flex items-center gap-1"><Lock size={13} /> PCI DSS</span>
          <span className="flex items-center gap-1"><CreditCard size={13} /> 3D Secure</span>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="w-full text-center text-sm text-muted hover:text-text transition-colors"
        >
          ← Отменить и вернуться
        </button>
      </div>
    </div>
  );
}
