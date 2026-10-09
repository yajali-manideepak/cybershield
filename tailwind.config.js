/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#080D18',
          sidebar: '#0D1525',
          card: '#111C2F',
          cardHover: '#16243C',
          border: '#1E2D4A',
          borderLight: '#2A3F66',
          primary: '#38BDF8',
          secondary: '#6366F1',
          critical: '#EF4444',
          high: '#F97316',
          medium: '#FACC15',
          low: '#38BDF8',
          success: '#22C55E',
          text: '#F8FAFC',
          muted: '#94A3B8',
          darkMuted: '#64748B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 15px -3px rgba(56, 189, 248, 0.3)',
        'glow-indigo': '0 0 15px -3px rgba(99, 102, 241, 0.3)',
        'glow-critical': '0 0 15px -3px rgba(239, 68, 68, 0.35)',
        'cyber-card': '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(30, 45, 74, 0.6)',
      }
    },
  },
  plugins: [],
}
