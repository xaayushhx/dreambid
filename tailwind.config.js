/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // DreamBid Brand Colors
        'midnight': {
          950: '#0B1423', // Top gradient
          900: '#0E1A2B', // Bottom gradient
          800: '#111C2E', // Card background
          700: '#1F2A3D', // Card border
        },
        'gold': {
          DEFAULT: '#CBA135',
          hover: '#D4AF37',
        },
        'status': {
          live: '#22C55E', // Bidding Live Green
        },
        'text': {
          primary: '#FFFFFF',
          soft: '#E6EDF7',
          muted: '#A9B7C9',
          secondary: '#94A3B8',
          nav: '#C7D2E0',
        },
        // Legacy colors kept for compatibility
        primary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        // Hero Typography
        'h1-hero': ['72px', { lineHeight: '82px', fontWeight: '700' }],
        // Section Headings
        'h2': ['48px', { lineHeight: '58px', fontWeight: '700' }],
        // Card Titles
        'h3': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        // Step Titles
        'h4': ['22px', { lineHeight: '30px', fontWeight: '600' }],
        // Body Text
        'body-lg': ['20px', { lineHeight: '1.6', fontWeight: '400' }],
        'body': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.6', fontWeight: '400' }],
      },
      borderRadius: {
        'btn': '12px',
        'card': '16px',
        'input': '10px',
      },
      boxShadow: {
        'dark-elevation': '0 10px 30px rgba(0, 0, 0, 0.35)',
        'soft': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'medium': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      spacing: {
        // Section spacing
        'section-gap': '120px',
        'title-gap': '56px',
        'card-gap': '40px',
        'hero-margin': '80px',
        'trust-margin': '110px',
        // Safe area padding for notch/status bar
        'safe': 'max(0px, env(safe-area-inset-top))',
      },
      padding: {
        'safe': 'env(safe-area-inset-top)',
      },
    },
  },
  plugins: [],
}