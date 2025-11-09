import { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";

export default function UploadButton({ onLoad, simulation }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (onLoad) onLoad(parsed);
        alert("Inputs for the simulation" + simulation + " uploaded successfully!");
      } catch (err) {
        alert("Error: JSON file is not valid.");
        console.error(err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <button
        type="button"
        className="btn-glow"
        title="Upload simulation settings (JSON)"
        onClick={() => fileInputRef.current.click()}
      >
        <FontAwesomeIcon icon={faUpload} />
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </>
  );
}
