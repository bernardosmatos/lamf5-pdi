import { DM_Sans, DM_Serif_Display } from "next/font/google";
import "./globals.css";

// 1. Configure the Main Font (DM Sans)
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"], // Normal, Medium, Bold
  variable: "--font-dm-sans", // Creates a custom CSS variable
});

// 2. Configure the Title Font (DM Serif Display)
const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"], // Serif Display usually only has one weight
  variable: "--font-dm-serif", // Creates a custom CSS variable
});

export const metadata = {
  title: "Sistema LAMF5",
  description: "Portal Institucional da Liga Acadêmica de Mercado Financeiro",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      {/* 3. Inject both font variables into the body of your site */}
      <body className={`${dmSans.variable} ${dmSerif.variable}`}>
        {children}
      </body>
    </html>
  );
}