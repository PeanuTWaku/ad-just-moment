import type { Config } from "tailwindcss";

export default {
  content: [""],
  theme: {
    extend: {
      colors: {
        snooze: {
          gray: "#838383",
          white: "#FFFFFF",
          darkgray: "#5F5F5F",
          panel: "#985757",
          button: "#985757",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
