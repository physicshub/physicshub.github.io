import useTranslation from "../../hooks/useTranslation.ts";

function TextInput(props) {
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;
  return (
    <div
      className={`sim-field sim-field--stepper ${isCompleted ? "notranslate" : ""}`}
    >
      <div className="sim-field__head">
        {props.symbol && (
          <span className="sim-field__symbol">{props.symbol}</span>
        )}
        <label className="sim-field__label" htmlFor={props.name}>
          {t(props.label)}
        </label>
        {props.unit && <span className="sim-field__unit">{props.unit}</span>}
      </div>
      <div className="sim-field__body sim-field__body--stepper">
        <div className="sim-field__valuebox">
          <input
            type="text"
            id={props.name}
            name={props.name}
            placeholder={t(props.placeholder)}
            className="sim-field__value"
            value={props.value}
            onChange={props.onChange}
          />
        </div>
      </div>
    </div>
  );
}

export default TextInput;
