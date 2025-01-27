import React from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/solid';

const FormInput = ({
  type = 'text', 
  label, 
  id, 
  name, 
  value, 
  onChange, 
  error, 
  placeholder, 
  required = false,
  disabled = false,
  icon: Icon,
  className = '',
  ...props
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label 
          htmlFor={id} 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
        )}
        <input
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          className={`
            block w-full 
            ${Icon ? 'pl-10' : 'pl-3'} 
            pr-3 py-2 
            border 
            ${error 
              ? 'border-red-300 text-red-900 dark:border-red-600 dark:text-red-300 dark:bg-red-900/20 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 dark:bg-dark-secondary'
            }
            placeholder-gray-500 dark:placeholder-gray-400
            rounded-md 
            shadow-sm 
            focus:outline-none 
            focus:ring-2 
            focus:ring-indigo-500 
            dark:focus:ring-indigo-400
            transition-all 
            duration-200 
            ease-in-out
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
          </div>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormInput;
