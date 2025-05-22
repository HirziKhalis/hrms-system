import React from "react";

const InputField = ({ label, type, name, value, onChange, placeholder, error }) => {
  return (
    <div className="form-group" style={{ marginBottom: "1rem" }}>
      {label && <label htmlFor={name}>{label}</label>}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`form-control ${error ? "input-error" : ""}`}
        style={{ padding: "0.5rem", width: "100%" }}
      />
      {error && <div style={{ color: "red", marginTop: "0.25rem" }}>{error}</div>}
    </div>
  );
};

export default InputField;
