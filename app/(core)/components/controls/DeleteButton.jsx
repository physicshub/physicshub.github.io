// controls/DeleteButton.jsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

export default function DeleteButton({ simulation }) {
  const handleDelete = () => {
    localStorage.removeItem(simulation);
    alert("Simulation Inputs deleted for " + simulation + "!");
  };

  return (
    <button
      onClick={handleDelete}
      className="btn-glow"
      title="Delete saved inputs from local memory"
    >
      <FontAwesomeIcon icon={faTrash} />
    </button>
  );
}
