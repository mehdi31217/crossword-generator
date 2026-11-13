/** @type {import('tailwindcss').Config} */

/* =====================================================================
   «خاک و کاغذ» — palette remap.

   The components were written against Tailwind's cool palette (slate /
   indigo / violet / emerald / rose ...). Rather than rewriting ~1500 class
   strings across 40 components, the families are remapped here to the clay
   and paper ramps. Shade numbers keep their relative luminance, so every
   existing contrast relationship (bg-700 + text-100, text-600 on white …)
   survives the swap without touching a component.
   ===================================================================== */
export default {
  // Matches the previous `tailwind.config = { darkMode: 'class' }` from the Play CDN.
  darkMode: 'class',
  content: [
    './index.html',
    './*.{ts,tsx}',
    './api/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './data/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
    './net/**/*.{ts,tsx}',
    './services/**/*.{ts,tsx}',
    './utils/**/*.{ts,tsx}',
    './workers/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // warm clay neutral — replaces the cool grays of the old UI
        slate: {
          50: '#FBF6EE', 100: '#F5ECDF', 200: '#EADCC7', 300: '#D9C3A6',
          400: '#B99C7C', 500: '#907154', 600: '#71563F', 700: '#55402F',
          800: '#3D2D21', 900: '#2A1E16', 950: '#1A120D',
        },
        gray: {
          50: '#FBF6EE', 100: '#F5ECDF', 200: '#EADCC7', 300: '#D9C3A6',
          400: '#B99C7C', 500: '#907154', 600: '#71563F', 700: '#55402F',
          800: '#3D2D21', 900: '#2A1E16', 950: '#1A120D',
        },
        stone: {
          50: '#FBF6EE', 100: '#F5ECDF', 200: '#EADCC7', 300: '#D9C3A6',
          400: '#B99C7C', 500: '#907154', 600: '#71563F', 700: '#55402F',
          800: '#3D2D21', 900: '#2A1E16', 950: '#1A120D',
        },
        // terracotta — the app's primary action colour
        indigo: {
          50: '#FDF1EA', 100: '#FAE0D2', 200: '#F2C4AC', 300: '#E8A588',
          400: '#DB8A69', 500: '#C97B5A', 600: '#B4644A', 700: '#944E39',
          800: '#6E3A2C', 900: '#4A2A21', 950: '#2C1913',
        },
        // plum clay — secondary accent (merge / online)
        violet: {
          50: '#F8F0F2', 100: '#F1E1E5', 200: '#E2C6CD', 300: '#CFA5AF',
          400: '#B8858F', 500: '#A06A75', 600: '#87545F', 700: '#6D414A',
          800: '#52303A', 900: '#3A2129', 950: '#241318',
        },
        purple: {
          50: '#F7F0F4', 100: '#EFE0E9', 200: '#DFC3D4', 300: '#C9A1BA',
          400: '#AE80A0', 500: '#946386', 600: '#7A4D6D', 700: '#623C58',
          800: '#492C42', 900: '#331E2E', 950: '#20121C',
        },
        fuchsia: {
          50: '#F7F0F4', 100: '#EFE0E9', 200: '#DFC3D4', 300: '#C9A1BA',
          400: '#AE80A0', 500: '#946386', 600: '#7A4D6D', 700: '#623C58',
          800: '#492C42', 900: '#331E2E', 950: '#20121C',
        },
        // dusty blue — maps, water, info
        blue: {
          50: '#EFF4F8', 100: '#DFEAF1', 200: '#C2D5E2', 300: '#9FBBCE',
          400: '#86A6BC', 500: '#6F8FA8', 600: '#5A768D', 700: '#485F72',
          800: '#364757', 900: '#26333F', 950: '#161F27',
        },
        sky: {
          50: '#EEF6FA', 100: '#DCEBF3', 200: '#BBD7E6', 300: '#93BDD3',
          400: '#7BA7BF', 500: '#6795AD', 600: '#547A90', 700: '#436274',
          800: '#324A59', 900: '#22323D', 950: '#141E25',
        },
        cyan: {
          50: '#EFF6F2', 100: '#DDEDE4', 200: '#BCDACA', 300: '#96C1AC',
          400: '#79AC94', 500: '#63977E', 600: '#4F7C66', 700: '#3F6352',
          800: '#2F4A3E', 900: '#20332A', 950: '#132019',
        },
        teal: {
          50: '#EFF6F2', 100: '#DDEDE4', 200: '#BCDACA', 300: '#96C1AC',
          400: '#79AC94', 500: '#63977E', 600: '#4F7C66', 700: '#3F6352',
          800: '#2F4A3E', 900: '#20332A', 950: '#132019',
        },
        // sage — success, unlocked, "completed"
        emerald: {
          50: '#F1F5EE', 100: '#E2EBDC', 200: '#C7D8BD', 300: '#A8C09B',
          400: '#93AE85', 500: '#7F9469', 600: '#66794F', 700: '#51613F',
          800: '#3E4B32', 900: '#2C3625', 950: '#1A2116',
        },
        green: {
          50: '#F1F5EE', 100: '#E2EBDC', 200: '#C7D8BD', 300: '#A8C09B',
          400: '#93AE85', 500: '#7F9469', 600: '#66794F', 700: '#51613F',
          800: '#3E4B32', 900: '#2C3625', 950: '#1A2116',
        },
        lime: {
          50: '#F4F7EC', 100: '#E9F0D8', 200: '#D4E2B6', 300: '#BACD90',
          400: '#A2B872', 500: '#8AA05C', 600: '#6E8148', 700: '#576639',
          800: '#42502C', 900: '#2E3920', 950: '#1A2112',
        },
        // saffron — coins, rewards, rarity
        amber: {
          50: '#FBF5E7', 100: '#F7EACA', 200: '#EFD79C', 300: '#E3BE68',
          400: '#D6A93F', 500: '#C8952B', 600: '#AC7C1E', 700: '#8A6415',
          800: '#6A4C12', 900: '#4A350F', 950: '#2D2009',
        },
        yellow: {
          50: '#FCF7E6', 100: '#F8EEC6', 200: '#F1DE95', 300: '#E8CB60',
          400: '#DDB93C', 500: '#CBA527', 600: '#AD881D', 700: '#8A6B16',
          800: '#685011', 900: '#48370C', 950: '#2B2107',
        },
        orange: {
          50: '#FCF3EA', 100: '#F8E4D0', 200: '#F0C9A6', 300: '#E5A876',
          400: '#D88F55', 500: '#C9793F', 600: '#AC6231', 700: '#8B4E27',
          800: '#6B3C1E', 900: '#4B2914', 950: '#2D180C',
        },
        // dusty rose — hearts, losses, soft highlights
        rose: {
          50: '#FBF1F1', 100: '#F7E2E3', 200: '#EEC8CB', 300: '#E5BCC0',
          400: '#D9A6AE', 500: '#C48C96', 600: '#AE6F79', 700: '#8E5862',
          800: '#6B4149', 900: '#4A2C32', 950: '#2C1A1E',
        },
        pink: {
          50: '#FBF1F1', 100: '#F7E2E3', 200: '#EEC8CB', 300: '#E5BCC0',
          400: '#D9A6AE', 500: '#C48C96', 600: '#AE6F79', 700: '#8E5862',
          800: '#6B4149', 900: '#4A2C32', 950: '#2C1A1E',
        },
        // brick — errors only
        red: {
          50: '#FCF1EE', 100: '#F8DFD8', 200: '#F0C0B4', 300: '#E29B8A',
          400: '#D47C67', 500: '#C05F4C', 600: '#A34A3A', 700: '#843A2E',
          800: '#642B23', 900: '#461D18', 950: '#2A100D',
        },
      },
      borderRadius: {
        '4xl': '30px',
        '5xl': '38px',
      },
      fontFamily: {
        clay: ['Vazirmatn', 'system-ui', 'sans-serif'],
        ink: ['Vazirmatn', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        // a slab of clay resting on the table
        clay: '0 1px 0 rgba(255,255,255,.62) inset, 0 -2px 0 rgba(122,80,52,.16) inset, 0 18px 32px -18px rgba(86,52,33,.55)',
        'clay-sm': '0 1px 0 rgba(255,255,255,.55) inset, 0 -1.5px 0 rgba(122,80,52,.14) inset, 0 10px 20px -14px rgba(86,52,33,.5)',
        'clay-press': '0 2px 6px rgba(122,80,52,.22) inset, 0 -1px 0 rgba(255,255,255,.45) inset',
        // a printed sheet lying on the clay
        paper: '0 1px 0 rgba(255,255,255,.7) inset, 0 14px 26px -18px rgba(70,45,30,.6)',
      },
    },
  },
  plugins: [],
};
