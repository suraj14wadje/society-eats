"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";
import { createClient } from "@/lib/supabase/client";
import { otpSchema } from "@/lib/auth/schemas";

export function VerifyForm({ phone }: { phone: string }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = otpSchema.safeParse(code);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid code");
      return;
    }

    setSubmitting(true);
    setError(null);
    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      phone,
      token: parsed.data,
      type: "sms",
    });

    if (verifyError) {
      setSubmitting(false);
      setError(verifyError.message);
      toast.error("Couldn't verify the code", {
        description: verifyError.message,
      });
      return;
    }

    router.replace("/onboarding");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Enter your code</CardTitle>
        <CardDescription>
          Sent to{" "}
          <span className="font-mono text-foreground">{maskPhone(phone)}</span>.{" "}
          <Link href="/signin" className="underline underline-offset-4">
            Change number
          </Link>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate>
          <FieldGroup>
            <Field data-invalid={error ? true : undefined}>
              <FieldLabel htmlFor="otp" className="sr-only">
                6-digit verification code
              </FieldLabel>
              <InputOTP
                id="otp"
                maxLength={6}
                value={code}
                onChange={(value) => {
                  setCode(value);
                  if (error) setError(null);
                }}
                disabled={submitting}
                containerClassName="justify-center"
                aria-invalid={error ? true : undefined}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              {error ? (
                <FieldError>{error}</FieldError>
              ) : (
                <FieldDescription className="text-center">
                  Enter the 6-digit code we just sent.
                </FieldDescription>
              )}
            </Field>
            <Button type="submit" disabled={submitting || code.length !== 6}>
              {submitting ? <Spinner data-icon="inline-start" /> : null}
              Verify
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

function maskPhone(phone: string): string {
  // +919876543210 → +91 ••••• 43210
  return `${phone.slice(0, 3)} ••••• ${phone.slice(-5)}`;
}
