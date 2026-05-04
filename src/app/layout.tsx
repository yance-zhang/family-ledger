import "./globals.css";
import { LocaleProvider } from "@/i18n/LocaleContext";

export const metadata = {
  title: "Family Ledger",
  description: "Frontend-only family finance tracker",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-50">
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
