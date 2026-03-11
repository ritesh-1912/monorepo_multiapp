import type { Config } from 'tailwindcss';

const config: Config = {
  presets: [require('@repo/ui/tailwind-preset')],
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}', '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
