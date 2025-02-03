module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
      "./public/index.html"
    ],
    darkMode: 'class', // Enable dark mode with class-based toggling
    theme: {
      extend: {
        // Add some custom dark mode colors if needed
        colors: {
          dark: {
            background: '#121212',
            text: '#ffffff',
            secondary: '#1e1e1e'
          }
        },
        // Add custom animations
        keyframes: {
          'fade-in': {
            '0%': { opacity: '0', transform: 'translateY(-10px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' }
          }
        },
        animation: {
          'fade-in': 'fade-in 0.3s ease-out'
        }
      },
    },
    plugins: [],
  }
