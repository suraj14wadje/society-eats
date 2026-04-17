import type { Metadata, Viewport } from "next";
import { Instrument_Serif, JetBrains_Mono, Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Society Eats",
  description: "Home-cooked thalis from the kitchen two floors up.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#fbf8ef",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${jetBrainsMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--se-cream-50)] text-[var(--se-ink-700)]">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col bg-[var(--se-cream-50)]">
          {children}
        </div>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
