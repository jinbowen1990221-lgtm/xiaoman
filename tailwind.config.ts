import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        base: "var(--bg-base)",
        card: "var(--card-bg)",
        "card-deep": "var(--card-deep)",
        accent: "var(--accent)",
        "accent-light": "var(--accent-light)",
        "accent-deep": "var(--accent-deep)",
        "ball-red-light": "var(--ball-red-light)",
        "ball-red-deep": "var(--ball-red-deep)",
        "ball-blue-light": "var(--ball-blue-light)",
        "ball-blue-deep": "var(--ball-blue-deep)",
        "ball-green": "var(--ball-green)",
        "haze-blue": "var(--ball-blue-light)",
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        tertiary: "var(--text-tertiary)",
        "btn-dark": "var(--btn-dark)",
        "glass-light": "var(--card-bg)",
        "glass-deep": "var(--card-deep)",
        "border-glass": "var(--border-glass)",
        "border-glass-strong": "var(--border-glass-strong)"
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "PingFang SC",
          "Helvetica Neue",
          "-apple-system",
          "sans-serif"
        ],
        serif: [
          "var(--font-serif)",
          "Noto Serif SC",
          "Songti SC",
          "serif"
        ],
        garamond: [
          "var(--font-garamond)",
          "EB Garamond",
          "Georgia",
          "serif"
        ]
      },
      borderWidth: {
        hairline: "0.5px"
      },
      maxWidth: {
        app: "480px"
      }
    }
  },
  plugins: []
};

export default config;
