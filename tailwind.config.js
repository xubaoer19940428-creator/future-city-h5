/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'city-blue': '#4cb5f7',
        'city-dark': '#00435a',
      },
    },
  },
  plugins: [],
};
