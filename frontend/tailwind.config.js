/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      /* 设计系统：颜色 - 数字银行品牌与语义色 */
      colors: {
        primary: {
          50: '#eef9f2',
          100: '#d6f0df',
          200: '#b0e2c4',
          300: '#7dcea1',
          400: '#4ab47d',
          500: '#1a7f37',
          600: '#146530',
          700: '#115129',
          800: '#0f4223',
          900: '#0d371e',
        },
        accent: {
          50: '#fff8eb',
          100: '#ffecd1',
          200: '#ffd5a3',
          300: '#ffb86a',
          400: '#d9730d',
          500: '#b35f0b',
        },
        neutral: {
          surface: '#ffffff',
          'surface-2': '#f6f8fa',
          border: '#d0d7de',
          'text': '#1f2328',
          'text-soft': '#424a53',
          muted: '#656d76',
        },
      },
      /* 设计系统：字体 */
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'monospace'],
      },
      /* 设计系统：间距（基于 4px 基准） */
      spacing: {
        '4.5': '1.125rem',
        '18': '4.5rem',
      },
      borderRadius: {
        'DEFAULT': '10px',
        sm: '6px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
};
