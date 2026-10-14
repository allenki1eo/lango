import { Bricolage_Grotesque, Figtree } from "next/font/google";

export const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bricolage",
  weight: ["700", "800"],
});
export const figtree = Figtree({ subsets: ["latin"], display: "swap", variable: "--font-figtree" });
