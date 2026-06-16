/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--background-rgb) / <alpha-value>)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        border: 'var(--border)',
        primary: 'rgb(var(--primary-rgb) / <alpha-value>)',
        'primary-foreground': '#FFFFFF',
        secondary: 'rgb(var(--secondary-rgb) / <alpha-value>)',
        'secondary-foreground': 'var(--foreground)',
        'muted-foreground': 'var(--muted-foreground)',
        ring: 'rgb(var(--ring-rgb) / <alpha-value>)',
        'input-background': 'var(--input-background)',
      },
    },
  },
  plugins: [],
}
