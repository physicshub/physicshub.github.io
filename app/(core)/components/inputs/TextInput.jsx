import useTranslation from "../../hooks/useTranslation.ts";

function TextInput(props) {
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;
  return (
    <div className={`control-group ${isCompleted ? "notranslate" : ""}`}>
      <label className="input-label">{t(props.label)}</label>
      <input
        type="text"
        id="inputText"
        placeholder={t(props.placeholder)}
        className="input-text"
      />
    </div>
  );
}

export default TextInput;
