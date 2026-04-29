import { Imprima, Inter } from "next/font/google";
import { Metadata } from "next";
import QueryProvider from "@/components/provider/query-provider";
import { AuthProvider } from "@/components/provider";
import { Toaster } from "sonner";
import { SocketProvider } from "@/context/SocketProvider";
import './globals.css'
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AuthNext App",
  description: "Secure authentication with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <QueryProvider>
          <AuthProvider>
            <SocketProvider>{children}</SocketProvider>
          </AuthProvider>
          <Toaster position="top-right" duration={5000} />
        </QueryProvider>
      </body>
    </html>
  );
}
