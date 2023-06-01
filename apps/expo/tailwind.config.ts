import { type Config } from "tailwindcss";

import baseConfig from "@ad-just-moment/tailwind-config";

export default {
  presets: [baseConfig],
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
} satisfies Config;
