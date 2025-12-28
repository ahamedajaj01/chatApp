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
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="mb-3">
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
      ) : isPassword ? (
        <div className="input-group">
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
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
          >
            <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} />
          </button>
        </div>
      ) : (
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
      )}
    </div>
  );
};

export default forwardRef(Input);
