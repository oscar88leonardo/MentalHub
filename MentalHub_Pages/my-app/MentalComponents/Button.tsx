import React from 'react';

const Button: React.FC<{
  children: React.ReactElement | string;
  onClick: () => void;
  disabled?: boolean;
}> = ({ children, onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      className={`bg-green-100 px-4 py-3 rounded-lg text-black ${
        disabled ? 'opacity-50' : ''
      }`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
