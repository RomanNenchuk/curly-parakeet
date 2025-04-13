import React from "react";
import { Row, Col } from "react-bootstrap";
import { IoArrowBackSharp, IoCloseCircleOutline } from "react-icons/io5";

export default function HeaderCard({ title, onClose, onBack }) {
  return (
    <Row className="header-card align-items-center my-2 mx-2 flex-nowrap">
      <Col xs="auto" className="back-icon" onClick={onBack}>
        <IoArrowBackSharp
          size={35}
          style={{
            cursor: "pointer",
            visibility: onBack ? "visible" : "hidden",
          }}
        />
      </Col>
      <Col className="title text-center">
        <h3 className="mb-0 mt-4 fw-semibold">{title}</h3>
      </Col>
      <Col xs="auto" className="close-icon text-end" onClick={onClose}>
        <IoCloseCircleOutline size={35} style={{ cursor: "pointer" }} />
      </Col>
    </Row>
  );
}
