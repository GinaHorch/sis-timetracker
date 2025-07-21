/** @type {import('tailwindcss').Config} */
export default {
  content: [],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3b5bdb', // Adjust to match your SIS logo
        },
        accent: '#f8e5b7',
        background: '#f9fafb',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
      spacing: {
        'card': '1.25rem',
  },
    },
  plugins: [],
  },
}