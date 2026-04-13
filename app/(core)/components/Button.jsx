import Link from "next/link";
import useTranslation from "../hooks/useTranslation.ts";

function Button(props) {
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;

  if (props.link) {
    return (
      <Link href={props.link}>
        <button className={`btn-glow ${isCompleted ? "notranslate" : ""}`}>
          {t(props.content)}
        </button>
      </Link>
    );
  } else if (props.onClick) {
    return (
      <button
        className={`btn-glow ${isCompleted ? "notranslate" : ""}`}
        onClick={props.onClick}
      >
        {t(props.content)}
      </button>
    );
  } else {
    return (
      <button
        className={`btn-glow ${isCompleted ? "notranslate" : ""}`}
        disabled
      >
        {t(props.content)}
      </button>
    );
  }
}

export default Button;
