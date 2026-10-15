import { Bricolage_Grotesque, Public_Sans } from "next/font/google";

export const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bricolage",
  weight: ["700", "800"],
});

/** Public Sans: the plain, highly legible face of government service sites, used for body copy. */
export const publicSans = Public_Sans({ subsets: ["latin"], display: "swap", variable: "--font-body" });
