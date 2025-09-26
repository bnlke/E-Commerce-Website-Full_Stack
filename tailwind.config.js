/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
      keyframes: {
        'slide-left': {
          '0%': { transform: 'translateX(10px)' },
          '100%': { transform: 'translateX(-10px)' }
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        }
      },
      animation: {
        'slide-left': 'slide-left 1s ease-in-out infinite alternate',
        'spin-slow': 'spin-slow 3s linear infinite',
      }
    },
  },
  plugins: [],
};
