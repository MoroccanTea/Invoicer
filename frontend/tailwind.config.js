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
        }
      },
    },
    plugins: [],
  }
