import React, { forwardRef, useState } from "react";

const Input = (
  {
    label,
    type = "text",
    name,
    value,
    onChange,
    placeholder,
    className = "",
    options = [],
    ...props
  },
  ref
) => {
  const [showPassword, setShowPassword] = useState(false);

  const isSelect = type === "select";
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="mb-3 position-relative">
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
        </label>
      )}

      {isSelect ? (
        <select
          id={name}
          ref={ref}
          name={name}
          value={value}
          onChange={onChange}
          className={`form-select ${className}`}
          {...props}
        >
          <option value="">Select {label}</option>
          {options.map((opt) => (
            <option key={opt} value={opt.toLowerCase()}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <>
          <input
            id={name}
            ref={ref}
            type={inputType}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`form-control ${className}`}
            {...props}
          />
          {/* Eye icon for password toggle */}
          {isPassword && (
            <i
             className={`fa-solid ${
  showPassword ? "fa-eye" : "fa-eye-slash"
} position-absolute top-50 my-3 end-0 translate-middle-y me-2 text-muted cursor-pointer`}

              style={{ cursor: "pointer" }}
              onClick={() => setShowPassword(!showPassword)}
            />
          )}
        </>
      )}
    </div>
  );
};

export default forwardRef(Input);
