import { getMenu } from "@/lib/menu/get-menu";
import { OtpForm } from "@/components/screens/resident/otp-form";
import { CartHydrator } from "@/lib/cart/hydrate";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ phone?: string }>;
}) {
  const { phone } = await searchParams;
  if (!phone) redirect("/checkout");
  const menu = await getMenu();
  return (
    <>
      <CartHydrator />
      <OtpForm
        phone={phone}
        menu={menu.map((m) => ({ id: m.id, price_inr: m.price_inr }))}
      />
    </>
  );
}
