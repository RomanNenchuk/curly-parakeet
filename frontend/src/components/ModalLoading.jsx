import React from "react";
import { Card } from "react-bootstrap";
import LoadingSpinner from "./Spinner";

export default function ModalLoading({ modalLoading, children }) {
  const styles = {
    maxHeight: modalLoading ? "400px" : "1000px",
    minHeight: "400px",
    display: "flex",
    justifyContent: "center",
    transition: "all 0.3s ease-in-out",
    opacity: modalLoading ? 0.5 : 1,
    overflow: "hidden",
  };
  return (
    <Card className = "card-profile" style={styles}>{modalLoading ? <LoadingSpinner /> : children}</Card>
  );
}
