// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'savage': {
          'black': '#0a0a0a',
          'steel': '#1a1a1a',
          'neon-blue': '#00f5ff',
          'neon-green': '#39ff14',
          'neon-orange': '#ff6b35', 
          'neon-purple': '#8a2be2',
        }
      },
      fontFamily: {
        'savage': ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'savage-gradient': 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
      },
      animation: {
        'pulse-aggressive': 'pulse-aggressive 2s ease-in-out infinite',
        'pump': 'pump 0.5s ease-in-out',
        'barbell-lift': 'barbell-lift 3s ease-in-out infinite',
        'neon-flicker': 'neon-flicker 1.5s infinite',
      }
    },
  },
  plugins: [],
}

export default config