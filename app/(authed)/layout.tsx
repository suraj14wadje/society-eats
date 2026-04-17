import { AuthedHeader } from "@/components/authed-header";

export default function AuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AuthedHeader />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
