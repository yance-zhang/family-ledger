import "./globals.css";

export const metadata = {
  title: "家庭记账",
  description: "纯前端家庭收支管理工具",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-zinc-50">{children}</body>
    </html>
  );
}
