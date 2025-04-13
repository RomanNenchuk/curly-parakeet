import React, { useRef } from "react";
import { Form } from "react-bootstrap";
import addCoverIcon from "../assets/add-cover.svg";

const FileButtonUploader = ({ files, setFiles }) => {
  const fileRef = useRef();

  return (
    <Form.Group id="file" style={{ marginBottom: "1vh" }}>
      {files.map((el, index) => (
        <span key={index}>{el.name}</span>
      ))}
      <div className="file-upload-container">
        <img
          src={addCoverIcon}
          onClick={() => {
            fileRef.current.click();
          }}
        />
        <input
          type="file"
          style={{ display: "none" }}
          ref={fileRef}
          onChange={e => {
            setFiles(prevState => [
              ...prevState,
              ...Array.from(e.target.files).map(file => ({
                data: file,
                name: file.name,
              })),
            ]);
          }}
        />
      </div>
    </Form.Group>
  );
};

export default FileButtonUploader;
