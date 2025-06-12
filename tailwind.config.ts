import { fontFamily } from "tailwindcss/defaultTheme";
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,js,jsx,mdx}",
    "./components/**/*.{ts,tsx,js,jsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        heading: "hsl(var(--heading))",
        subheading: "hsl(var(--subheading))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        "card-border": "hsl(var(--card-border))",
      },
      fontFamily: {
        sans: ["Open Sans", ...fontFamily.sans],
        heading: ["DM Serif Display", ...fontFamily.serif],
        subheading: ["Inter", ...fontFamily.sans],
      },
    },
  },
  plugins: [
    ({ addBase }: { addBase: (rules: Record<string, any>) => void }) => {
      addBase({
        "button, a": { "@apply font-sans": {} },
      });
    },
    require("@tailwindcss/typography"),
  ],
};

export default config;
