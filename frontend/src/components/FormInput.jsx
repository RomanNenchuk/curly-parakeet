import React, { useState, forwardRef } from "react";
import { Form } from "react-bootstrap";
import eye from "../assets/eye.svg";
import eyeSlash from "../assets/eye-slash.svg";

const styles = {
  input: { borderRadius: "20px" },
};

const FormInput = forwardRef(
  ({ id, type, placeholder, className, defaultValue, required }, ref) => {
    const [inputType, setInputType] = useState(type);

    const togglePasswordVisibility = () => {
      setInputType(prevType => (prevType === "password" ? "text" : "password"));
    };

    return (
      <div className="form-floating my-2">
        <Form.Control
          id={id}
          type={inputType}
          placeholder={placeholder}
          className={`${className ? className : ""}`}
          style={styles.input}
          defaultValue={defaultValue}
          size="sm"
          ref={ref}
          autoComplete="off"
          required={required}
        />

        <label htmlFor={id} style={styles.label}>
          {placeholder}{" "}
        </label>

        {type === "password" && (
          <span
            onClick={togglePasswordVisibility}
            className="position-absolute"
            style={{
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer",
              color: "#6c757d",
            }}
          >
            <img src={inputType === "password" ? eye : eyeSlash} alt="show" />
          </span>
        )}
      </div>
    );
  }
);

export default FormInput;
