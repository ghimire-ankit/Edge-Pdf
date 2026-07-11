import type { Metadata } from "next";
import { Outfit, Inter, Newsreader, Caveat, Dancing_Script, Reenie_Beanie } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  style: ["normal", "italic"],
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  weight: ["400", "700"],
});

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing-script",
  weight: ["400", "700"],
});

const reenieBeanie = Reenie_Beanie({
  subsets: ["latin"],
  variable: "--font-reenie-beanie",
  weight: "400",
});

export const metadata: Metadata = {
  title: "Edge-Pdf | Local-first PDF Editor",
  description: "Secure, client-side PDF editing in your browser sandbox.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${inter.variable} ${newsreader.variable} ${caveat.variable} ${dancingScript.variable} ${reenieBeanie.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
