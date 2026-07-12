/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Tokens do OpsFlow — ver docs/arquitetura.md
        ink: "#14161F",
        slate: {
          DEFAULT: "#5B6072",
          light: "#9297A6",
        },
        surface: "#F5F6F8",
        border: "#E2E5EA",
        sidebar: {
          DEFAULT: "#12152B",
          hover: "#1B1F3B",
          muted: "#9297B0",
        },
        primary: {
          DEFAULT: "#3457D5",
          dark: "#2841AD",
          light: "#EAEFFC",
        },
        accent: "#E0A62C",
        priority: {
          critica: "#DC4C3F",
          alta: "#E08A2C",
          media: "#3457D5",
          baixa: "#2F9E68",
        },
        statusc: {
          aberto: "#0EA5E9",
          andamento: "#3457D5",
          aguardando: "#E0A62C",
          resolvido: "#2F9E68",
          fechado: "#9CA3AF",
          reaberto: "#DC4C3F",
        },
      },
      fontFamily: {
        sans: ["'IBM Plex Sans'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
