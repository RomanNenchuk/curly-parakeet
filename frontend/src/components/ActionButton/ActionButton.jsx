import { Button } from "react-bootstrap";
import styles from "./ActionButton.module.css";

export default function ActionButton({
  label,
  loading,
  variant = "primary",
  type = "submit",
  className,
  onClick,
}) {
  return (
    <div className={`${styles["button-container"]} ${className}`}>
      <Button
        disabled={loading}
        className={styles["submit-button"]}
        variant={variant}
        type={type}
        onClick={onClick}
        style = {loading ? {color: "#659287",backgroundColor: "white", border: "1px solid #659287"} : {}}
      >
        {label}
      </Button>
    </div>
  );
}
