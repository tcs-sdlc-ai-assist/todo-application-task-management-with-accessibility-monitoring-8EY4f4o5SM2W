import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "hc-bg": "var(--hc-bg, #ffffff)",
        "hc-fg": "var(--hc-fg, #000000)",
        "hc-border": "var(--hc-border, #000000)",
        "hc-link": "var(--hc-link, #0000ee)",
        "hc-focus": "var(--hc-focus, #005fcc)",
        "hc-error": "var(--hc-error, #d00000)",
        "hc-success": "var(--hc-success, #007a00)",
      },
      ringColor: {
        focus: "var(--hc-focus, #005fcc)",
      },
      ringOffsetWidth: {
        "3": "3px",
      },
      outlineOffset: {
        "3": "3px",
      },
    },
  },
  plugins: [
    function ({ addUtilities }: { addUtilities: Function }) {
      addUtilities({
        ".focus-ring": {
          "@apply ring-2 ring-focus ring-offset-2 outline-none": {},
        },
        ".focus-ring-inset": {
          "@apply ring-2 ring-focus ring-inset outline-none": {},
        },
      });
    },
  ],
};

export default config;