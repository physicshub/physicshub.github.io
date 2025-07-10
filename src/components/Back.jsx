import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'

function Back({ content, link, onClick }) {
  const Component = link ? Link : "button";
  const componentProps = link
    ? { to: link }
    : { type: "button", onClick };

  return (
    <div className="back-to-home">
      <Component
        className="btn-glow back-to-home__link"
        {...componentProps}
      >
        <span className="back-to-home__icon" aria-hidden="true">
          <FontAwesomeIcon icon={faArrowLeft}/>
        </span>
        <span className="back-to-home__text">{content}</span>
      </Component>
    </div>
  );
}

export default Back