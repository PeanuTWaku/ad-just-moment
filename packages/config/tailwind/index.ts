import type { Config } from "tailwindcss";

export default {
  content: [""],
  theme: {
    extend: {
      colors: {
        snooze: {
          gray: "#838383",
          white: "#FFFFFF",
          panel: "#985757",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
