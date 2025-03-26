import { nextui } from '@nextui-org/react';
import type { Config } from 'tailwindcss';

const config: Config = {
  mode: 'jit',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    fontFamily: {
      sans: ['var(--font-noto-sans)', 'sans-serif'],
    },
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        tertiary: 'var(--tertiary)',
        success: 'var(--success)',
        error: 'var(--error)',
        danger: 'var(--error)',
        warning: 'var(--warning)',
        neutral: 'var(--neutral)',
        default: 'var(--default)',
        'gray-border': 'var(--gray-border)',
        'gray-item': 'var(--gray-item)',
        'other-gray': 'var(--other-gray)',
      },
      fontSize: {
        h1: [
          '2.25rem', // 36px
          {
            letterSpacing: '0.04em',
            lineHeight: '1.4',
          },
        ],
        h2: [
          '2rem', // 32px
          {
            letterSpacing: '0.04em',
            lineHeight: '1.5',
          },
        ],
        h3: [
          '1.75rem', // 28px
          {
            letterSpacing: '0.04em',
            lineHeight: '1.5',
          },
        ],
        h4: [
          '1.5rem', // 24px
          {
            letterSpacing: '0.04em',
            lineHeight: '1.5',
          },
        ],
        h5: [
          '1.25rem', // 20px
          {
            letterSpacing: '0.04em',
            lineHeight: '1.5',
          },
        ],
        h6: [
          '1rem', // 16px
          {
            letterSpacing: '0.04em',
            lineHeight: '1.7',
          },
        ],
      },
      screens: {
        tl: '992px',
        '2xl': '1440px',
        '3xl': '1920px',
      },
    },
  },
  plugins: [
    nextui({
      layout: {
        borderWidth: {
          small: '1px',
          medium: '1px',
          large: '2px',
        },
      },
    }),
  ],
};
export default config;
