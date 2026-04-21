import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    // Scan the @level9/brand package so classes used inside canonical
    // components (ConsoleGraphic, ForgeCube, motion primitives, layout
    // primitives) get generated. Without this, Tailwind strips classes
    // like "top-3 right-3 w-80 max-w-[90%]" that only appear in
    // node_modules and the components render with broken positioning.
    "./node_modules/@level9/brand/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
        editorial: ["var(--font-playfair)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
