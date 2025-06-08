import { fontFamily } from "tailwindcss/defaultTheme";
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,js,jsx,mdx}",
    "./components/**/*.{ts,tsx,js,jsx,mdx}",
  ],
  theme: {
    /* … your existing theme setup … */
  },
  plugins: [
    // <-- annotate addBase so it isn't implicitly any
    ({ addBase }: { addBase: (rules: Record<string, any>) => void }) => {
      addBase({
        "button, a": { "@apply font-sans": {} },
      });
    },
    require("@tailwindcss/typography"),
  ],
};

export default config;
