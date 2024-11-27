/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        palette: {
          'primary-color': '#97FB57', //verde
          'secundary-color': 'rgb(51 51 51)', //gris
          'tertiary-color': 'rgb(26 26 26)', //negro opacidad baja
          'background-color': 'rgb(51 51 51)', //fondo negro
          'accent-color': 'rgb(0 100 0)', //
          'nav-color': 'rgb(0, 100, 0, .4)'
        },
      },
    },
  },
  plugins: [],
}
