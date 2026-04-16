/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#171b22',
        'on-primary': '#ffffff',
        secondary: '#bc0000',
        surface: '#f8f9fa',
        'surface-container-low': '#f3f4f5',
        'surface-container-lowest': '#ffffff',
        'surface-container-high': '#e8e9ea',
        'surface-container-highest': '#e1e3e4',
        'on-surface': '#171b22',
        'on-surface-variant': '#6b7280',
        error: '#ba1a1a',
        outline: 'rgba(23,27,34,0.15)',
      },
      borderRadius: {
        none: '0',
        sm: '8px',
        DEFAULT: '16px',
        md: '20px',
        lg: '32px',
        xl: '48px',
        full: '9999px',
      },
      fontFamily: {
        'newsreader': ['Newsreader_400Regular'],
        'newsreader-bold': ['Newsreader_700Bold'],
        'newsreader-italic': ['Newsreader_400Regular_Italic'],
        'sans': ['WorkSans_400Regular'],
        'sans-medium': ['WorkSans_500Medium'],
        'sans-bold': ['WorkSans_700Bold'],
      },
    },
  },
  plugins: [],
};
