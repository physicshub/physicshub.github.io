// controls/SaveButton.jsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useTranslation from "../../hooks/useTranslation.ts";
import useAuth from "../../hooks/useAuth.ts";
import { saveCloudConfig } from "../../lib/community.ts";
import { faSave } from "@fortawesome/free-solid-svg-icons";

export default function SaveButton({ inputs, simulation, simId }) {
  const { t, meta } = useTranslation();
  const { signedIn, user } = useAuth();
  const isCompleted = meta?.completed || false;
  const handleSave = async () => {
    localStorage.setItem(simulation, JSON.stringify(inputs));
    // Signed in: also keep it on the account, so it follows the user around.
    if (user && simId) {
      const { error } = await saveCloudConfig(user.id, simId, inputs);
      if (error) {
        alert(t("Saved on this device, but not to your account: ") + t(error));
        return;
      }
      alert(t("Inputs saved to your account for ") + simulation + "!");
      return;
    }
    alert(t("Inputs value saved in local memory for ") + simulation + "!");
  };

  return (
    <button
      onClick={handleSave}
      className={`btn-glow ${isCompleted ? "notranslate" : ""}`}
      title={
        signedIn
          ? t("Save inputs to this device and your account")
          : t("Save inputs to local memory")
      }
    >
      <FontAwesomeIcon icon={faSave} />
    </button>
  );
}
