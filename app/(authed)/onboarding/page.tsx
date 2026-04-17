import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "./onboarding-form";

export const metadata = {
  title: "Welcome — society-eats",
};

export default async function OnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const { data: buildings } = await supabase
    .from("buildings")
    .select("id, name, society_id")
    .order("name", { ascending: true });

  const safeBuildings = buildings ?? [];

  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <OnboardingForm
        userId={user.id}
        phone={user.phone ?? ""}
        buildings={safeBuildings}
      />
    </main>
  );
}
