"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TopBar } from "@/components/brand/top-bar";
import { StickyBar } from "@/components/brand/sticky-bar";
import { createClient } from "@/lib/supabase/client";
import { phoneDigitsSchema, toE164 } from "@/lib/auth/schemas";
import { checkoutDetailsSchema } from "@/lib/orders/schemas";

type Tower = { id: string; name: string };

export type CheckoutDetailsDraft = {
  full_name: string;
  phone: string;
  building_id: string;
  flat_number: string;
  landmark: string;
};

export function DetailsForm({
  towers,
  total,
}: {
  towers: Tower[];
  total: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [draft, setDraft] = useState<CheckoutDetailsDraft>({
    full_name: "",
    phone: "",
    building_id: "",
    flat_number: "",
    landmark: "",
  });

  const set = <K extends keyof CheckoutDetailsDraft>(
    k: K,
    v: CheckoutDetailsDraft[K],
  ) => setDraft((d) => ({ ...d, [k]: v }));

  const valid =
    draft.full_name.trim().length >= 2 &&
    /^[0-9]{10}$/.test(draft.phone) &&
    draft.building_id !== "" &&
    draft.flat_number.trim().length >= 1;

  const handleSubmit = () => {
    const phoneResult = phoneDigitsSchema.safeParse(draft.phone);
    if (!phoneResult.success) {
      toast.error(phoneResult.error.issues[0]?.message ?? "Invalid phone");
      return;
    }
    const detailsResult = checkoutDetailsSchema.safeParse({
      full_name: draft.full_name,
      building_id: draft.building_id,
      flat_number: draft.flat_number,
      landmark: draft.landmark,
    });
    if (!detailsResult.success) {
      toast.error(detailsResult.error.issues[0]?.message ?? "Invalid details");
      return;
    }

    startTransition(async () => {
      const supabase = createClient();
      const e164 = toE164(phoneResult.data);
      const { error } = await supabase.auth.signInWithOtp({
        phone: e164,
        options: { shouldCreateUser: true },
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      sessionStorage.setItem(
        "se-checkout-details",
        JSON.stringify({ ...detailsResult.data, phone: e164 }),
      );
      router.push(`/checkout/verify?phone=${encodeURIComponent(e164)}`);
    });
  };

  return (
    <>
      <TopBar backHref="/cart" title="Your Details" />
      <div style={{ padding: "14px 20px 130px" }}>
        <p
          style={{
            fontSize: 13,
            color: "#5f5c4d",
            lineHeight: 1.5,
            margin: "0 0 18px",
          }}
        >
          First time ordering from Meera&apos;s kitchen — welcome. We only need
          these once.
        </p>

        <Field label="Name">
          <input
            type="text"
            value={draft.full_name}
            onChange={(e) => set("full_name", e.target.value.slice(0, 80))}
            placeholder="Rohan Iyer"
            style={inputStyle}
          />
        </Field>

        <Field label="Mobile Number">
          <input
            type="tel"
            inputMode="numeric"
            value={draft.phone}
            onChange={(e) =>
              set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            placeholder="98214 10302"
            style={inputStyle}
          />
        </Field>

        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1.3 }}>
            <Field label="Tower">
              <select
                value={draft.building_id}
                onChange={(e) => set("building_id", e.target.value)}
                style={{ ...inputStyle, appearance: "none" }}
              >
                <option value="">Select…</option>
                {towers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div style={{ flex: 1 }}>
            <Field label="Flat No.">
              <input
                type="text"
                inputMode="numeric"
                value={draft.flat_number}
                onChange={(e) =>
                  set(
                    "flat_number",
                    e.target.value.replace(/[^0-9]/g, "").slice(0, 4),
                  )
                }
                placeholder="0807"
                style={inputStyle}
              />
            </Field>
          </div>
        </div>

        <Field label="Landmark / Note (Optional)">
          <input
            type="text"
            value={draft.landmark}
            onChange={(e) => set("landmark", e.target.value.slice(0, 120))}
            placeholder="Ring Bell Twice"
            style={inputStyle}
          />
        </Field>
      </div>

      <StickyBar
        label={valid ? `Verify Mobile — ₹${total}` : "Fill The Details Above"}
        total={total}
        cta={isPending ? "Sending…" : "Send OTP"}
        onClick={valid ? handleSubmit : undefined}
        disabled={!valid || isPending}
      />
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          fontSize: 10,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#8a8674",
          fontWeight: 500,
          marginBottom: 5,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 44,
  padding: "0 12px",
  background: "#fbf8ef",
  border: "1.5px solid #c4b68f",
  borderRadius: 12,
  fontFamily: "var(--font-sans)",
  fontSize: 16,
  color: "#1d1c17",
  outline: "none",
  boxSizing: "border-box",
};
