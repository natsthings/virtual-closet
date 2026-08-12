/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        plum: "#3D2C4A",
        "plum-deep": "#2A1E33",
        blush: "#E8C4C4",
        "blush-soft": "#F3DEDE",
        gold: "#C9A876",
        cream: "#FAF6F1",
        ink: "#2B2530",
        clean: "#4F8B6E",
        dirty: "#B5563C"
      },
      fontFamily: {
        display: ["Playfair Display", "Georgia", "serif"],
        body: ["Inter", "system-ui", "sans-serif"]
      },
      borderRadius: {
        tag: "2px"
      }
    }
  },
  plugins: []
};
