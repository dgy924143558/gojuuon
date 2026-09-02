/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bronze: '#CD7F32',
        'bronze-light': '#E8A87C',
        'bronze-dark': '#8B4513',
        solana: '#9945FF',
        'solana-green': '#14F195',
      },
      backgroundImage: {
        'medal-gradient': 'linear-gradient(135deg, #CD7F32 0%, #E8A87C 50%, #CD7F32 100%)',
      },
    },
  },
  plugins: [],
};
