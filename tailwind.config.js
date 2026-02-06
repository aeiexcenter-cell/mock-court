/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--md-sys-color-primary) / <alpha-value>)',
        'on-primary': 'rgb(var(--md-sys-color-on-primary) / <alpha-value>)',
        'primary-container': 'rgb(var(--md-sys-color-primary-container) / <alpha-value>)',
        'on-primary-container': 'rgb(var(--md-sys-color-on-primary-container) / <alpha-value>)',

        secondary: 'rgb(var(--md-sys-color-secondary) / <alpha-value>)',
        'on-secondary': 'rgb(var(--md-sys-color-on-secondary) / <alpha-value>)',
        'secondary-container': 'rgb(var(--md-sys-color-secondary-container) / <alpha-value>)',
        'on-secondary-container': 'rgb(var(--md-sys-color-on-secondary-container) / <alpha-value>)',

        tertiary: 'rgb(var(--md-sys-color-tertiary) / <alpha-value>)',
        'on-tertiary': 'rgb(var(--md-sys-color-on-tertiary) / <alpha-value>)',
        'tertiary-container': 'rgb(var(--md-sys-color-tertiary-container) / <alpha-value>)',
        'on-tertiary-container': 'rgb(var(--md-sys-color-on-tertiary-container) / <alpha-value>)',

        error: 'rgb(var(--md-sys-color-error) / <alpha-value>)',
        'on-error': 'rgb(var(--md-sys-color-on-error) / <alpha-value>)',
        'error-container': 'rgb(var(--md-sys-color-error-container) / <alpha-value>)',
        'on-error-container': 'rgb(var(--md-sys-color-on-error-container) / <alpha-value>)',

        background: 'rgb(var(--md-sys-color-background) / <alpha-value>)',
        'on-background': 'rgb(var(--md-sys-color-on-background) / <alpha-value>)',

        surface: 'rgb(var(--md-sys-color-surface) / <alpha-value>)',
        'on-surface': 'rgb(var(--md-sys-color-on-surface) / <alpha-value>)',
        'surface-variant': 'rgb(var(--md-sys-color-surface-variant) / <alpha-value>)',
        'on-surface-variant': 'rgb(var(--md-sys-color-on-surface-variant) / <alpha-value>)',

        'surface-container-lowest': 'rgb(var(--md-sys-color-surface-container-lowest) / <alpha-value>)',
        'surface-container-low': 'rgb(var(--md-sys-color-surface-container-low) / <alpha-value>)',
        'surface-container': 'rgb(var(--md-sys-color-surface-container) / <alpha-value>)',
        'surface-container-high': 'rgb(var(--md-sys-color-surface-container-high) / <alpha-value>)',
        'surface-container-highest': 'rgb(var(--md-sys-color-surface-container-highest) / <alpha-value>)',

        'inverse-surface': 'rgb(var(--md-sys-color-inverse-surface) / <alpha-value>)',
        'inverse-on-surface': 'rgb(var(--md-sys-color-inverse-on-surface) / <alpha-value>)',
        'inverse-primary': 'rgb(var(--md-sys-color-inverse-primary) / <alpha-value>)',

        outline: 'rgb(var(--md-sys-color-outline) / <alpha-value>)',
        'outline-variant': 'rgb(var(--md-sys-color-outline-variant) / <alpha-value>)',

        // Role Semantic Colors
        'judge': 'rgb(var(--role-judge) / <alpha-value>)',
        'judge-bg': 'rgb(var(--role-judge-bg) / <alpha-value>)',
        'prosecutor': 'rgb(var(--role-prosecutor) / <alpha-value>)',
        'prosecutor-bg': 'rgb(var(--role-prosecutor-bg) / <alpha-value>)',
        'defense': 'rgb(var(--role-defense) / <alpha-value>)',
        'defense-bg': 'rgb(var(--role-defense-bg) / <alpha-value>)',
        'system': 'rgb(var(--role-system) / <alpha-value>)',
        'system-bg': 'rgb(var(--role-system-bg) / <alpha-value>)',

        'active': 'rgb(var(--md-sys-color-primary) / <alpha-value>)',
        'active-hover': 'rgb(var(--md-sys-color-primary-container) / <alpha-value>)',
        'start-btn': 'rgb(var(--md-sys-color-tertiary-container) / <alpha-value>)',
        'on-start-btn': 'rgb(var(--md-sys-color-on-tertiary-container) / <alpha-value>)',
        'end-btn': 'rgb(var(--md-sys-color-error-container) / <alpha-value>)',
        'on-end-btn': 'rgb(var(--md-sys-color-on-error-container) / <alpha-value>)',
      },
      fontSize: {
        xxs: ['0.625rem', { lineHeight: '1rem' }],
      },
      fontFamily: {
        sans: ['"Google Sans"', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '28px',
      }
    },
  },
  plugins: [],
}