// controls/SaveButton.jsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave } from "@fortawesome/free-solid-svg-icons";

export default function SaveButton({ inputs, simulation }) {
  const handleSave = () => {
    localStorage.setItem(simulation, JSON.stringify(inputs));
    alert("Inputs value saved in local memory for " + simulation + "!");
  };

  return <button onClick={handleSave} className="btn-glow" title="Save inputs to local memory">
    <FontAwesomeIcon icon={faSave} />
  </button>;
}
