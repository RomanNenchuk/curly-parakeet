import { Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import gooleLogo from "../assets/google-logo.svg";

export default function GoogleAuthButton({ onClick, className = "" }) {
  const { t } = useTranslation();
  return (
    <Button
      onClick={onClick}
      variant="light"
      className={`d-flex align-items-center gap-3 px-3 py-2 w-100 shadow-sm ${className}`}
      style={{
        justifyContent: "center",
        border: "1px solid #d9d9d9",
        borderRadius: "20px",
        fontWeight: "500",
        color: "#000",
        backgroundColor: "#d9d9d9",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          position: "absolute",
          left: "10px",
        }}
      >
        <img src={gooleLogo} alt="Google" />
      </div>
      <span className="for-text" style={{ textAlign: "center", flex: 1 }}>
        {t("auth.continueWithGoogle")}
      </span>
    </Button>
  );
}
