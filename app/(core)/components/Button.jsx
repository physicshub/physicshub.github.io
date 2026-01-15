import Link from "next/link";

function Button(props) {
  if (props.link) {
    return (
      <Link href={props.link}>
        <button className="btn-glow">{props.content}</button>
      </Link>
    );
  } else if (props.onClick) {
    return (
      <button className="btn-glow" onClick={props.onClick}>
        {props.content}
      </button>
    );
  } else {
    return (
      <button className="btn-glow" disabled>
        {props.content}
      </button>
    );
  }
}

export default Button;
