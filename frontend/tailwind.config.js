/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Marca — ver docs/design-system.md sobre a convenção de nomenclatura
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          soft: 'var(--color-primary-soft)',
          900: 'var(--primary-900)',
          800: 'var(--primary-800)',
          700: 'var(--primary-700)',
          600: 'var(--primary-600)',
          500: 'var(--primary-500)',
          400: 'var(--primary-400)',
          300: 'var(--primary-300)',
          200: 'var(--primary-200)',
          100: 'var(--primary-100)',
        },
        background: {
          DEFAULT: 'var(--color-background)',
          secondary: 'var(--color-background-secondary)',
        },
        surface: 'var(--color-surface)',
        sidebar: 'var(--color-sidebar)',
        border: 'var(--color-border)',

        // Hierarquia de texto (ver nota de nomenclatura em index.css)
        ink: {
          DEFAULT: 'var(--text-ink)',
          secondary: 'var(--text-ink-secondary)',
          disabled: 'var(--text-ink-disabled)',
        },

        // Semântico
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        danger: 'var(--color-danger)',
        info: 'var(--color-info)',

        // Status do ticket
        status: {
          aberto: 'var(--status-aberto)',
          andamento: 'var(--status-andamento)',
          aguardando: 'var(--status-aguardando)',
          resolvido: 'var(--status-resolvido)',
          fechado: 'var(--status-fechado)',
          reaberto: 'var(--status-reaberto)',
          vencido: 'var(--status-vencido)',
        },

        // Prioridade do ticket
        priority: {
          critica: 'var(--priority-critica)',
          alta: 'var(--priority-alta)',
          media: 'var(--priority-media)',
          baixa: 'var(--priority-baixa)',
        },
      },
      fontFamily: {
        sans: ["Manrope", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        card: 'var(--shadow-card)',
        hover: 'var(--shadow-hover)',
        lg: 'var(--shadow-lg)',
      },
      transitionDuration: {
        DEFAULT: '200ms',
      },
    },
  },
  plugins: [],
};
