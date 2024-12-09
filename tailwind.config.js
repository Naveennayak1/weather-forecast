/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        customBg: "#eff3f9", // Replace with your custom hex color
      },
      width: {
        "custom-90": "90%",
        "custom-80": "80%",
        "custom-70": "70%", // Custom width of 18rem (equivalent to 288px)
        "custom-60": "60%",
        "custom-50": "50%",
        "custom-40": "40%",
        "custom-30": "30%",
        "custom-20": "20%",

        // Custom width of 45% for percentage
      },
    },
  },
  plugins: [],
};
