/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#050505",
          paper: "#0A0A0A",
          subtle: "#121212",
        },
        primary: {
          DEFAULT: "#00F0FF",
          foreground: "#000000",
        },
        secondary: {
          DEFAULT: "#FF003C",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#FFE600",
          foreground: "#000000",
        },
        muted: {
          DEFAULT: "#1A1A1A",
          foreground: "#A3A3A3",
        },
        border: "rgba(255, 255, 255, 0.1)",
      },
      fontFamily: {
        orbitron: ["Orbitron", "sans-serif"],
        rajdhani: ["Rajdhani", "sans-serif"],
        inter: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        neon: "0 0 20px rgba(0, 240, 255, 0.5)",
        "neon-lg": "0 0 30px rgba(0, 240, 255, 0.6)",
        "neon-red": "0 0 20px rgba(255, 0, 60, 0.5)",
        "neon-yellow": "0 0 20px rgba(255, 230, 0, 0.5)",
      },
      animation: {
        "pulse-neon": "pulseNeon 2s ease-in-out infinite",
        "glow": "glow 1.5s ease-in-out infinite alternate",
        "slide-up": "slideUp 0.5s ease-out",
        "fade-in": "fadeIn 0.5s ease-out",
      },
      keyframes: {
        pulseNeon: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(0, 240, 255, 0.5)" },
          "50%": { boxShadow: "0 0 40px rgba(0, 240, 255, 0.8)" },
        },
        glow: {
          "0%": { textShadow: "0 0 10px rgba(0, 240, 255, 0.5)" },
          "100%": { textShadow: "0 0 20px rgba(0, 240, 255, 0.8)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
