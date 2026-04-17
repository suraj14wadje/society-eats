import { redirect } from "next/navigation";
import { phoneE164Schema } from "@/lib/auth/schemas";
import { VerifyForm } from "./verify-form";

export const metadata = {
  title: "Verify code — society-eats",
};

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ phone?: string }>;
}) {
  const { phone } = await searchParams;
  const parsed = phoneE164Schema.safeParse(phone);
  if (!parsed.success) {
    redirect("/signin");
  }
  return <VerifyForm phone={parsed.data} />;
}
