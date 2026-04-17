export const metadata = {
  title: "Today's menu — society-eats",
};

export default function MenuPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold">Today&apos;s menu</h1>
        <p className="mt-2 text-muted-foreground">
          Menu is coming in ticket #3. You&apos;re signed in — use the header to
          sign out.
        </p>
      </div>
    </main>
  );
}
