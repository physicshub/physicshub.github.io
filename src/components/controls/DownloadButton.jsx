// controls/DownloadButton.jsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";


export default function DownloadButton({ inputs, simulation }) {
  const handleDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(inputs, null, 2));
    const link = document.createElement("a");
    link.href = dataStr;
    link.download = "simulation-inputs-" + simulation + ".json";
    link.click();
  };

  return <button onClick={handleDownload} className="btn-glow" title="Download inputs as JSON file">
    <FontAwesomeIcon icon={faDownload}/>
  </button>;
}
