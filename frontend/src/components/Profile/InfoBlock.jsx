import React from "react";

export default function InfoBlock({ title, caption }) {
  return (
    <div className="info-block">
      <div className="info-caption">{caption}</div>
      <div className="info-title">{title}</div>
    </div>
  );
}
