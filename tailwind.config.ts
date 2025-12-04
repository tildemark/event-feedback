import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        christmas: {
          red: {
            light: '#ff6b6b',
            DEFAULT: '#dc2626',
            dark: '#991b1b',
          },
          green: {
            light: '#86efac',
            DEFAULT: '#16a34a',
            dark: '#14532d',
          },
          gold: {
            light: '#fde047',
            DEFAULT: '#eab308',
            dark: '#a16207',
          },
        },
      },
      backgroundImage: {
        'gradient-christmas': 'linear-gradient(135deg, #dc2626 0%, #16a34a 100%)',
      },
    },
  },
  plugins: [],
};
export default config;
