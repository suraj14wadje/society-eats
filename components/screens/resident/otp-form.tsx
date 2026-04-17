"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TopBar } from "@/components/brand/top-bar";
import { StickyBar } from "@/components/brand/sticky-bar";
import { createClient } from "@/lib/supabase/client";
import { createOrder } from "@/lib/orders/create-order";
import { useCartStore } from "@/lib/cart/store";
import { PACKING_FEE_INR } from "@/lib/cart/types";
import { currentDeliverySlotClient } from "@/lib/kitchen/slot-client";

export function OtpForm({
  phone,
  menu,
}: {
  phone: string;
  menu: Array<{ id: string; price_inr: number }>;
}) {
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(28);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [error, setError] = useState(false);
  const [isPending, startTransition] = useTransition();
  const cart = useCartStore((s) => s.items);
  const note = useCartStore((s) => s.note);
  const clearCart = useCartStore((s) => s.clear);

  useEffect(() => {
    const t = setInterval(() => setTimer((x) => (x > 0 ? x - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const code = otp.join("");
  const complete = code.length === 6;

  const subtotal = Object.entries(cart).reduce((s, [id, q]) => {
    const price = menu.find((m) => m.id === id)?.price_inr ?? 0;
    return s + price * q;
  }, 0);
  const itemCount = Object.values(cart).reduce((s, n) => s + n, 0);
  const total = subtotal + (itemCount > 0 ? PACKING_FEE_INR : 0);

  const handleChange = (i: number, raw: string) => {
    const d = raw.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[i] = d;
    setOtp(next);
    setError(false);
    if (d && i < 5) {
      document.getElementById(`otp-${i + 1}`)?.focus();
    }
  };

  const handleKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      document.getElementById(`otp-${i - 1}`)?.focus();
    }
  };

  const handleVerify = () => {
    if (!complete || attemptsLeft <= 0 || isPending) return;
    startTransition(async () => {
      const supabase = createClient();
      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone,
        token: code,
        type: "sms",
      });
      if (verifyError) {
        setError(true);
        setOtp(["", "", "", "", "", ""]);
        document.getElementById("otp-0")?.focus();
        setAttemptsLeft((n) => n - 1);
        return;
      }

      const draftRaw =
        typeof window !== "undefined"
          ? sessionStorage.getItem("se-checkout-details")
          : null;
      if (!draftRaw) {
        toast.error("Lost your details — please re-enter.");
        router.push("/checkout");
        return;
      }
      const draft = JSON.parse(draftRaw) as {
        full_name: string;
        building_id: string;
        flat_number: string;
        landmark: string;
        phone: string;
      };

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Verification succeeded but no session — try again.");
        return;
      }

      const { data: society } = await supabase
        .from("societies")
        .select("id")
        .limit(1)
        .single();
      if (!society) {
        toast.error("Society not configured.");
        return;
      }

      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          full_name: draft.full_name,
          phone: draft.phone,
          society_id: society.id,
          building_id: draft.building_id,
          flat_number: draft.flat_number,
        },
        { onConflict: "id" },
      );
      if (profileError) {
        toast.error(profileError.message);
        return;
      }

      const items = Object.entries(cart).map(([menu_item_id, qty]) => ({
        menu_item_id,
        qty,
      }));
      const result = await createOrder({
        items,
        note,
        slot: currentDeliverySlotClient(),
      });

      sessionStorage.removeItem("se-checkout-details");

      if (result.status === "ok") {
        clearCart();
        router.push(`/orders/${result.orderId}?fresh=1`);
      } else if (result.status === "sold_out") {
        router.push(`/orders/failed?items=${result.menuItemIds.join(",")}`);
      } else if (result.status === "kitchen_paused") {
        toast.error("Kitchen paused before we could place the order.");
        router.push("/");
      } else {
        toast.error(
          result.status === "invalid"
            ? (result.issues[0] ?? "Invalid order")
            : result.status === "error"
              ? result.message
              : "Could not place order.",
        );
      }
    });
  };

  useEffect(() => {
    if (complete && !error && attemptsLeft > 0) handleVerify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complete]);

  const maskedPhone = maskPhone(phone);
  const borderColor = error ? "#d86e45" : "#c4b68f";

  return (
    <>
      <TopBar backHref="/checkout" title="Verify Mobile" />
      <div style={{ padding: "26px 20px 130px" }}>
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 28,
            fontWeight: 400,
            margin: "0 0 10px",
            color: "#1d1c17",
            letterSpacing: "-0.02em",
          }}
        >
          {error ? "That Code Didn't Match." : "We Sent A Code."}
        </h1>
        <p
          style={{
            fontSize: 13,
            color: "#5f5c4d",
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {error
            ? "Try again — we'll wait."
            : "A 6-digit code is on its way to"}
        </p>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 14,
            margin: "10px 0 0",
            color: "#1d1c17",
            textAlign: "center",
          }}
        >
          {maskedPhone}
        </p>

        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "center",
            margin: "26px 0 14px",
            animation: error ? "se-shake 360ms var(--se-ease)" : undefined,
          }}
          data-testid="otp-slots"
        >
          {otp.map((v, i) => (
            <input
              key={i}
              id={`otp-${i}`}
              inputMode="numeric"
              maxLength={1}
              value={v}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKey(i, e)}
              style={{
                width: 42,
                height: 52,
                border: `1.8px solid ${v ? (error ? "#d86e45" : "#2a2822") : borderColor}`,
                borderRadius: 12,
                background: error ? "#fdf2ec" : "#fbf8ef",
                fontFamily: "var(--font-mono)",
                fontSize: 22,
                textAlign: "center",
                color: error ? "#924021" : "#1d1c17",
                outline: "none",
              }}
            />
          ))}
        </div>

        {error && attemptsLeft > 0 && (
          <div
            style={{
              padding: "10px 14px",
              background: "#fdf2ec",
              border: "1px solid #f2b896",
              borderRadius: 10,
              fontSize: 12,
              color: "#924021",
              display: "flex",
              gap: 10,
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <span
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: "#d86e45",
                color: "#fdf2ec",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                flexShrink: 0,
                fontFamily: "var(--font-serif)",
              }}
            >
              !
            </span>
            <span>
              Incorrect Code. {attemptsLeft} Attempt
              {attemptsLeft === 1 ? "" : "s"} Left.
            </span>
          </div>
        )}

        {attemptsLeft <= 0 && (
          <div
            style={{
              padding: "10px 14px",
              background: "#fdf2ec",
              border: "1px solid #f2b896",
              borderRadius: 10,
              fontSize: 12,
              color: "#924021",
              marginBottom: 12,
            }}
          >
            Too many wrong attempts. Hit Resend below for a fresh code.
          </div>
        )}

        <p
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "#8a8674",
            margin: 0,
          }}
        >
          Didn&apos;t Get It?{" "}
          {timer > 0 ? (
            <span>Resend In 0:{String(timer).padStart(2, "0")}</span>
          ) : (
            <button
              type="button"
              onClick={async () => {
                const supabase = createClient();
                await supabase.auth.signInWithOtp({ phone });
                setTimer(28);
                setAttemptsLeft(3);
                setError(false);
                toast.success("New code sent.");
              }}
              style={{
                color: "#467132",
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                textDecoration: "underline",
                fontSize: 12,
                fontFamily: "var(--font-sans)",
              }}
            >
              Resend Code
            </button>
          )}
        </p>
      </div>

      <StickyBar
        label="Verify & Place Order"
        total={total}
        cta={isPending ? "Placing…" : "Confirm"}
        onClick={handleVerify}
        disabled={!complete || isPending || attemptsLeft <= 0}
      />
    </>
  );
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return phone;
  const last10 = digits.slice(-10);
  return `+91 ${last10.slice(0, 2)}••• •${last10.slice(-3)}`;
}
