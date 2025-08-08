import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider/theme-provider";
import { ModalProvider } from "@/contexts/modal-context"
import { AuthProvider } from "@/contexts/AuthContext";
import QueryProvider from "@/components/QueryProvider";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Hypertek Dental Management",
  description: "Hệ thống quản lý toàn diện cho phòng khám nha khoa với tích hợp AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className}`}>
        <QueryProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <ModalProvider>
              <AuthProvider>
                {children}
              </AuthProvider>
            </ModalProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
