/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Background Colors
        'bg-body': '#000000',
        'bg-card': '#181A20',
        'bg-card-alt': '#1E2128',
        'bg-hover': '#1D2027',
        
        // Accent Colors
        'accent-primary': '#C6FF3F',
        'accent-yellow': '#FFE56A',
        'accent-orange': '#FFB347',
        'accent-pink': '#FF4D73',
        'accent-teal': '#4DE2C2',
        'accent-blue': '#58A6FF',
        
        // Text Colors
        'text-primary': '#F5F7FB',
        'text-secondary': '#9BA0B5',
        'text-muted': '#5D6273',
        
        // Status Colors
        'status-success': '#5BE88A',
        'status-warning': '#FFC857',
        'status-danger': '#FF5C7A',
      },
      fontFamily: {
        sans: ['Neue Haas Grotesk'],
      },
      borderRadius: {
        'sm': '12px',
        'md': '20px',
        'lg': '24px',
        'pill': '999px',
      },
      boxShadow: {
        'card': '0 18px 40px rgba(0, 0, 0, 0.65)',
        'hover': '0 24px 48px rgba(0, 0, 0, 0.75)',
      },
      spacing: {
        'xs': '8px',
        'sm': '12px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
      },
    },
  },
  plugins: [],
}

