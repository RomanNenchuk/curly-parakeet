import React from "react";
import { Container, Spinner } from "react-bootstrap";
import SqSpinner from "./AltSpinner/AltSpinner";

export default function LoadingSpinner() {
  return (
    <Container className="d-flex align-items-center justify-content-center h-100">
      <SqSpinner />
    </Container>
  );
}
