import React, { forwardRef } from 'react';

const Button = (
  {
    children,
    type = "button",
    variant = "primary",
    size = "md",
    className = "",
    disabled = false,
    ...props
  },
  ref
) => {
  // Bootstrap button base classes
  const base = "btn";

  // Bootstrap variant mapping
  const variantStyles = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    outline: "btn-outline-primary",
  };

  // Bootstrap size mapping
  const sizeStyles = {
    sm: "btn-sm",
    md: "", // default
    lg: "btn-lg",
  };

  // Compose final class string
  const finalClass = `${base} ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size] || ""} ${className}`;

  return (
    <button
      ref={ref}
      type={type}
      className={finalClass}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default forwardRef(Button);
