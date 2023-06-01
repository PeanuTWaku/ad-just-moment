import type { Config } from "tailwindcss";

import baseConfig from "@ad-just-moment/tailwind-config";

export default {
  content: ["./src/**/*.tsx"],
  presets: [baseConfig],
} satisfies Config;
