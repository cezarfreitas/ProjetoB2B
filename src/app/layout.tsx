import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { PublicAccessProvider } from "@/contexts/PublicAccessContext";
import { StoreSettingsProvider } from "@/contexts/StoreSettingsContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "",
  description: "Plataforma de e-commerce B2B",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const storeName = localStorage.getItem('storeName');
                if (storeName) {
                  document.title = storeName;
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <StoreSettingsProvider>
          <AuthProvider>
            <PublicAccessProvider>
              <CartProvider>
                {children}
              </CartProvider>
            </PublicAccessProvider>
          </AuthProvider>
        </StoreSettingsProvider>
      </body>
    </html>
  );
}
