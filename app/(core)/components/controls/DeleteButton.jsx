// controls/DeleteButton.jsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useTranslation from "../../hooks/useTranslation.ts";
import useAuth from "../../hooks/useAuth.ts";
import { deleteCloudConfig } from "../../lib/community.ts";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

export default function DeleteButton({ simulation, simId }) {
  const { t, meta } = useTranslation();
  const { user } = useAuth();
  const isCompleted = meta?.completed || false;
  const handleDelete = async () => {
    localStorage.removeItem(simulation);
    if (user && simId) await deleteCloudConfig(user.id, simId);
    alert(t("Simulation Inputs deleted for ") + simulation + "!");
  };

  return (
    <button
      onClick={handleDelete}
      className={`btn-glow ${isCompleted ? "notranslate" : ""}`}
      title={t("Delete saved inputs from local memory")}
    >
      <FontAwesomeIcon icon={faTrash} />
    </button>
  );
}
