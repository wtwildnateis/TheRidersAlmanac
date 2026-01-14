/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,jsx,ts,tsx}"]
,
  theme: {
    extend: {
      colors: {
        ink:   "#0f1115",
        paper: "#f7f8fb",
        ring:  "#e6e7ea",
        // TRA palette
        ra: {
          bg:   "#0a0b0f",
          card: "#0e1310",
          pin:  "#1D381B",
          accent:"#7EE1A9",
          grid: "rgba(255,255,255,0.03)",
        },
      },
      boxShadow: {
        ra: "0 10px 24px rgba(0,0,0,.35)",
      },
      borderRadius: {
        '2xl': "1rem",
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'], // swap to your heading font later
      },
    },
  },
  plugins: [],
};