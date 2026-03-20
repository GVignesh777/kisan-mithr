module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        playfair: ['"Playfair Display"', 'serif'],
        spacegrotesk: ['"Space Grotesk"', 'serif'],
        plusJakartaSans: ['"Plus Jakarta Sans"', 'serif'],
        hind: ['Hind', 'sans-serif'],
        anek: ['"Anek Telugu"', 'serif'],
      },

      /* ── Logo Animation Keyframes ───────────────────── */
      keyframes: {
        leafDraw: {
          'to': { strokeDashoffset: '0' },
        },
        dotFade: {
          '0%':   { opacity: '0',   transform: 'scale(0.5)' },
          '60%':  { opacity: '1',   transform: 'scale(1.4)' },
          '100%': { opacity: '0.8', transform: 'scale(1)'   },
        },
        softGlow: {
          '0%':   { opacity: '0',   transform: 'scale(0.6)'  },
          '50%':  { opacity: '1',   transform: 'scale(1.15)' },
          '100%': { opacity: '0.7', transform: 'scale(1)'    },
        },
        logoFadeScale: {
          '0%':   { opacity: '0', transform: 'scale(0.88)', filter: 'blur(8px)'  },
          '60%':  { opacity: '1',                           filter: 'blur(0px)'  },
          '80%':  {               transform: 'scale(1.04)'                        },
          '100%': { opacity: '1', transform: 'scale(1)',    filter: 'blur(0px)'  },
        },
        blurEntrance: {
          '0%':   { opacity: '0.6' },
          '100%': { opacity: '0'   },
        },
        leafFloat: {
          '0%, 100%': { transform: 'translateY(0px)  rotate(0deg)'    },
          '25%':      { transform: 'translateY(-6px) rotate(0.5deg)'  },
          '75%':      { transform: 'translateY(6px)  rotate(-0.5deg)' },
        },
        pageFadeOut: {
          '0%':   { opacity: '1' },
          '100%': { opacity: '0', pointerEvents: 'none' },
        },
      },

      /* ── Animation Utilities ────────────────────────── */
      animation: {
        'leaf-draw':     'leafDraw 1.2s ease-out forwards',
        'dot-fade':      'dotFade 0.4s ease-out forwards',
        'soft-glow':     'softGlow 0.9s ease-out forwards',
        'logo-reveal':   'logoFadeScale 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'blur-entrance': 'blurEntrance 0.7s ease-out forwards',
        'leaf-float':    'leafFloat 6s ease-in-out infinite',
        'page-fade-out': 'pageFadeOut 0.6s ease-in-out forwards',
      },
    },
  },

  plugins: [require('@tailwindcss/typography')],
}

