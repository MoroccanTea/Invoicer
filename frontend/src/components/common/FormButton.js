import React from 'react';

const FormButton = ({
  type = 'button', 
  variant = 'primary', 
  disabled = false, 
  loading = false, 
  children, 
  className = '',
  ...props
}) => {
  const variantStyles = {
    primary: `
      bg-indigo-600 
      hover:bg-indigo-700 
      focus:ring-indigo-500 
      dark:bg-indigo-500 
      dark:hover:bg-indigo-600
      text-white
    `,
    secondary: `
      bg-gray-200 
      hover:bg-gray-300 
      focus:ring-gray-500 
      dark:bg-gray-700 
      dark:hover:bg-gray-600
      text-gray-800 
      dark:text-gray-200
    `,
    danger: `
      bg-red-600 
      hover:bg-red-700 
      focus:ring-red-500 
      dark:bg-red-500 
      dark:hover:bg-red-600
      text-white
    `
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`
        w-full 
        flex 
        justify-center 
        py-2 
        px-4 
        border 
        border-transparent 
        text-sm 
        font-medium 
        rounded-md 
        focus:outline-none 
        focus:ring-2 
        focus:ring-offset-2 
        transition-all 
        duration-200 
        ease-in-out
        ${variantStyles[variant]}
        ${(disabled || loading) ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <svg 
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            ></circle>
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default FormButton;
