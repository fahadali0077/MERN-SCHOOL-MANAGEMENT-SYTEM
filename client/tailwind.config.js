/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0D0D1A',
          secondary: '#111827',
          tertiary: '#1A1A2E',
          card: '#111111',
        },
        text: {
          primary: '#F1F1EE',
          secondary: '#888888',
          tertiary: '#555555',
        },
        accent: {
          DEFAULT: '#0066FF',
          hover: '#0052CC',
          glow: 'rgba(0,102,255,0.35)',
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        border: 'rgba(255,255,255,0.08)',
      },
      fontFamily: {
        display: ['Clash Display', 'sans-serif'],
        body: ['Satoshi', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        card: '16px',
        btn: '8px',
      },
      boxShadow: {
        glow: '0 0 30px rgba(0,102,255,0.35)',
        'glow-sm': '0 0 15px rgba(0,102,255,0.2)',
        card: '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.6)',
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, #667eea, #0066FF)',
        'gradient-card': 'linear-gradient(135deg, #111827, #1A1A2E)',
        'gradient-accent': 'linear-gradient(135deg, #0066FF, #667eea)',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-in': 'slideIn 0.3s ease forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'marquee': 'marquee 30s linear infinite',
        'marquee-reverse': 'marqueeReverse 20s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: 0, transform: 'translateY(30px)' },
          to: { opacity: 1, transform: 'translateY(0)' }
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 }
        },
        slideIn: {
          from: { opacity: 0, transform: 'translateX(-20px)' },
          to: { opacity: 1, transform: 'translateX(0)' }
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0,102,255,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(0,102,255,0.6)' }
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' }
        },
        marqueeReverse: {
          from: { transform: 'translateX(-50%)' },
          to: { transform: 'translateX(0)' }
        }
      }
    }
  },
  plugins: []
};
