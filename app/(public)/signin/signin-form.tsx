"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { createClient } from "@/lib/supabase/client";
import { phoneDigitsSchema, toE164 } from "@/lib/auth/schemas";
import { z } from "zod";

const formSchema = z.object({ digits: phoneDigitsSchema });
type FormValues = z.infer<typeof formSchema>;

export function SigninForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { digits: "" },
  });

  const digitsError = form.formState.errors.digits;

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    const phone = toE164(values.digits);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      phone,
      options: { shouldCreateUser: true },
    });
    setSubmitting(false);

    if (error) {
      toast.error("Couldn't send the code", {
        description: error.message,
      });
      return;
    }

    router.push(`/verify?phone=${encodeURIComponent(phone)}`);
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>
          We&apos;ll text you a 6-digit code to confirm your number.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={digitsError ? true : undefined}>
              <FieldLabel htmlFor="phone-digits">Mobile number</FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <InputGroupText>+91</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id="phone-digits"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder="98765 43210"
                  maxLength={10}
                  aria-invalid={digitsError ? true : undefined}
                  disabled={submitting}
                  {...form.register("digits")}
                />
              </InputGroup>
              {digitsError ? (
                <FieldError>{digitsError.message}</FieldError>
              ) : (
                <FieldDescription>Indian mobile number only.</FieldDescription>
              )}
            </Field>
            <Button type="submit" disabled={submitting}>
              {submitting ? <Spinner data-icon="inline-start" /> : null}
              Send code
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
