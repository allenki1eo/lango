import { Inter_Tight, Source_Serif_4 } from "next/font/google";

/** Serif display for the big, quiet headlines. Variable, with an optical-size axis so large sizes stay crisp. */
export const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-serif",
  axes: ["opsz"],
});

/** Tight grotesque for interface text and section headings. */
export const interTight = Inter_Tight({ subsets: ["latin"], display: "swap", variable: "--font-inter-tight" });
