/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['"Press Start 2P"', 'cursive'],
      },
      colors: {
        primary: {
          DEFAULT: '#BDFF00', // Acid Green
          hover: '#A3DB00',
        },
        secondary: {
          DEFAULT: '#FF0099', // Hot Pink
          hover: '#DB0083',
        },
        background: '#050505', // Almost Black
        surface: '#121212', // Dark Gray
        text: {
          main: '#F0F0F0', // Off-white
          muted: '#888888', // Gray
          inverse: '#050505',
        },
        border: {
          DEFAULT: '#333333',
          strong: '#FFFFFF', // High contrast white border
        }
      },
      borderRadius: {
        'none': '0',
        'sm': '0',
        DEFAULT: '0',
        'md': '0',
        'lg': '0',
        'xl': '0',
        '2xl': '0',
        '3xl': '0',
        'full': '0', // Even full is square in brutalism usually, or keep it for avatars
      },
      boxShadow: {
        'neo': '4px 4px 0px 0px #BDFF00',
        'neo-hover': '6px 6px 0px 0px #BDFF00',
        'neo-white': '4px 4px 0px 0px #FFFFFF',
        'neo-white-hover': '6px 6px 0px 0px #FFFFFF',
        'neo-pink': '4px 4px 0px 0px #FF0099',
      },
      animation: {
        'glitch': 'glitch 1s linear infinite',
      },
      keyframes: {
        glitch: {
          '2%, 64%': { transform: 'translate(2px,0) skew(0deg)' },
          '4%, 60%': { transform: 'translate(-2px,0) skew(0deg)' },
          '62%': { transform: 'translate(0,0) skew(5deg)' },
        }
      }
    },
  },
  plugins: [],
};
