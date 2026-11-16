import animate from 'tailwindcss-animate'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: Object.fromEntries([
        'background', 'foreground', 'card', 'card-foreground', 'muted',
        'muted-foreground', 'border', 'ring',
        'chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'
      ].map(token => [token, `rgb(from var(--color-${token}) r g b / <alpha-value>)`])),
      fontFamily: {
        sans: ['Google Sans', 'Open Sans', 'system-ui', 'sans-serif'],
        mono: ['Google Sans Code', 'Roboto Mono', 'ui-monospace', 'monospace']
      }
    }
  },
  plugins: [animate]
}
