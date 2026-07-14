import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        // Design System namespace — premium enterprise (ver globals.css)
        ds: {
          canvas: "var(--ds-canvas)",
          surface: "var(--ds-surface)",
          "surface-2": "var(--ds-surface-2)",
          border: "var(--ds-border)",
          "border-strong": "var(--ds-border-strong)",
          fg: "var(--ds-fg)",
          "fg-muted": "var(--ds-fg-muted)",
          "fg-subtle": "var(--ds-fg-subtle)",
          primary: "var(--ds-primary)",
          "primary-hover": "var(--ds-primary-hover)",
          "primary-tint": "var(--ds-primary-tint)",
          "on-primary": "var(--ds-on-primary)",
          success: "var(--ds-success)",
          "success-tint": "var(--ds-success-tint)",
          warning: "var(--ds-warning)",
          "warning-tint": "var(--ds-warning-tint)",
          danger: "var(--ds-danger)",
          "danger-tint": "var(--ds-danger-tint)",
          ring: "var(--ds-ring)",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.625rem",
        sm: "0.5rem",
        control: "var(--ds-radius-control)",
        card: "var(--ds-radius-card)",
      },
      height: {
        control: "var(--ds-h-control)",
        "control-dense": "var(--ds-h-control-dense)",
      },
      boxShadow: {
        "ds-sm": "var(--ds-shadow-sm)",
        ds: "var(--ds-shadow)",
        "ds-lg": "var(--ds-shadow-lg)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
