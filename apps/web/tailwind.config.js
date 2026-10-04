/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Government & Enterprise Light Palette
        govt: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        navy: {
          900: '#0B192C',
          800: '#1E2E4A',
          700: '#25396E',
        },
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        // Restrained status colors
        status: {
          critical: {
            bg: '#FEF2F2',
            text: '#991B1B',
            border: '#F87171',
            badge: '#DC2626',
          },
          warning: {
            bg: '#FFFBEB',
            text: '#92400E',
            border: '#FBBF24',
            badge: '#D97706',
          },
          healthy: {
            bg: '#F0FDF4',
            text: '#166534',
            border: '#86EFAC',
            badge: '#16A34A',
          },
          info: {
            bg: '#EFF6FF',
            text: '#1E40AF',
            border: '#93C5FD',
            badge: '#2563EB',
          },
        },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', '"Source Sans 3"', '"Noto Sans"', 'sans-serif'],
      },
      borderRadius: {
        govt: '4px',
        card: '6px',
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        card: '0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px -1px rgba(15, 23, 42, 0.05)',
      },
    },
  },
  plugins: [],
};
