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

export function PaymentPage() {
  const { paymentId } = useParams<{ paymentId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as PaymentState | null;

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiRequest("/billing/webhooks/payment/", {
        method: "POST",
        body: { payment_id: paymentId, status: "succeeded" },
      });
      setDone(true);
      setTimeout(() => navigate("/app/billing"), 2000);
    } catch {
      setError("Ошибка обработки платежа. Попробуйте ещё раз.");
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
          <p className="text-sm text-muted">Возвращаемся к подпискам...</p>
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
            <p className="text-muted">
              {state.planName} — {formatPrice(state.priceCents)}/мес
            </p>
          )}
        </div>

        {/* Card form */}
        <div className="rounded-[12px] border border-border bg-panel p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <CreditCard size={16} className="text-accent" />
            Данные карты
          </div>

          <form onSubmit={handlePay} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-muted">Номер карты</label>
              <input
                type="text"
                defaultValue="4242 4242 4242 4242"
                readOnly
                className="w-full rounded-card border border-border bg-canvas px-3 py-2.5 font-mono text-sm text-text"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted">Срок действия</label>
                <input
                  type="text"
                  defaultValue="12 / 27"
                  readOnly
                  className="w-full rounded-card border border-border bg-canvas px-3 py-2.5 text-sm text-text"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted">CVV</label>
                <input
                  type="text"
                  defaultValue="• • •"
                  readOnly
                  className="w-full rounded-card border border-border bg-canvas px-3 py-2.5 font-mono text-sm text-text"
                />
              </div>
            </div>

            <div className="rounded-card border border-accent/20 bg-accent/5 px-3 py-2 text-xs text-accent/80">
              Тестовый режим — карта заполнена автоматически
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-card border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-500">
                <AlertCircle size={14} className="shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              <CreditCard size={16} />
              {loading
                ? "Обработка..."
                : `Оплатить ${state ? formatPrice(state.priceCents) : ""}`}
            </Button>
          </form>
        </div>

        {/* Security badges */}
        <div className="flex items-center justify-center gap-4 text-xs text-muted">
          <span className="flex items-center gap-1"><ShieldCheck size={13} /> SSL-шифрование</span>
          <span className="flex items-center gap-1"><Lock size={13} /> PCI DSS</span>
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
