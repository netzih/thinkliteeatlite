import type { Metadata } from "next";
import { Crimson_Text, Inter } from "next/font/google";
import "./globals.css";

// Brand fonts - Crimson Text for headings
const crimson = Crimson_Text({
  weight: ['400', '600', '700'],
  subsets: ["latin"],
  variable: '--font-crimson',
  display: 'swap',
});

// Inter for body text (clean, readable)
const inter = Inter({
  subsets: ["latin"],
  variable: '--font-sans',
  display: 'swap',
});

// Note: Vistral font (script) will be loaded separately for the tagline

export const metadata: Metadata = {
  title: "Think Lite Eat Lite | Break Free from YoYo Dieting Forever",
  description: "Transform your relationship with food and break free from the cycle of yo-yo dieting. Get access to our free 8-minute course and start your journey today.",
  keywords: ["nutrition", "diet", "weight loss", "healthy eating", "yo-yo dieting", "wellness"],
  authors: [{ name: "Think Lite Eat Lite" }],
  openGraph: {
    title: "Think Lite Eat Lite",
    description: "Break Free from YoYo Dieting Forever",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${crimson.variable} ${inter.variable}`}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
