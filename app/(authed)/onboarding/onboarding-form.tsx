"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { createClient } from "@/lib/supabase/client";
import { profileSchema, type ProfileInput } from "@/lib/auth/schemas";

type Building = {
  id: string;
  name: string;
  society_id: string;
};

export function OnboardingForm({
  userId,
  phone,
  buildings,
}: {
  userId: string;
  phone: string;
  buildings: Building[];
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: "", building_id: "", flat_number: "" },
  });

  const errors = form.formState.errors;

  async function onSubmit(values: ProfileInput) {
    const building = buildings.find((b) => b.id === values.building_id);
    if (!building) {
      toast.error("Pick a building");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.from("profiles").insert({
      id: userId,
      full_name: values.full_name,
      phone: normalizePhone(phone),
      society_id: building.society_id,
      building_id: building.id,
      flat_number: values.flat_number,
    });
    setSubmitting(false);

    if (error) {
      toast.error("Couldn't save your profile", {
        description: error.message,
      });
      return;
    }

    router.replace("/menu");
    router.refresh();
  }

  if (buildings.length === 0) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Setup pending</CardTitle>
          <CardDescription>
            No buildings are configured for this society yet. Please reach out
            to the kitchen owner.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Welcome to society-eats</CardTitle>
        <CardDescription>
          Tell us where to deliver. You can only set this once — message the
          owner if you ever change flats.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={errors.full_name ? true : undefined}>
              <FieldLabel htmlFor="full_name">Full name</FieldLabel>
              <Input
                id="full_name"
                autoComplete="name"
                maxLength={80}
                aria-invalid={errors.full_name ? true : undefined}
                disabled={submitting}
                {...form.register("full_name")}
              />
              {errors.full_name ? (
                <FieldError>{errors.full_name.message}</FieldError>
              ) : null}
            </Field>

            <Field data-invalid={errors.building_id ? true : undefined}>
              <FieldLabel htmlFor="building_id">Building</FieldLabel>
              <Controller
                control={form.control}
                name="building_id"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={submitting}
                  >
                    <SelectTrigger
                      id="building_id"
                      aria-invalid={errors.building_id ? true : undefined}
                    >
                      <SelectValue placeholder="Select your building" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {buildings.map((b) => (
                          <SelectItem key={b.id} value={b.id}>
                            {b.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.building_id ? (
                <FieldError>{errors.building_id.message}</FieldError>
              ) : null}
            </Field>

            <Field data-invalid={errors.flat_number ? true : undefined}>
              <FieldLabel htmlFor="flat_number">Flat number</FieldLabel>
              <Input
                id="flat_number"
                autoComplete="off"
                maxLength={16}
                placeholder="e.g. A-101"
                aria-invalid={errors.flat_number ? true : undefined}
                disabled={submitting}
                {...form.register("flat_number")}
              />
              {errors.flat_number ? (
                <FieldError>{errors.flat_number.message}</FieldError>
              ) : (
                <FieldDescription>
                  Up to 16 characters. Example: A-101 or 12B.
                </FieldDescription>
              )}
            </Field>

            <Button type="submit" disabled={submitting}>
              {submitting ? <Spinner data-icon="inline-start" /> : null}
              Continue
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

function normalizePhone(phone: string): string {
  if (!phone) return phone;
  return phone.startsWith("+") ? phone : `+${phone}`;
}
