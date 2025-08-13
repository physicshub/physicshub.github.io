import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faHome } from '@fortawesome/free-solid-svg-icons';
import React from "react";

interface BaseProps {
  type?: 'full' | 'icon';
  arrowPosition?: 'left' | 'right';
}

interface FullLinkProps extends BaseProps {
  type: 'full';
  content: React.ReactNode;
  link: string;
  onClick?: never;
}

interface IconLinkProps extends BaseProps {
  type?: 'icon';
  content?: never;
  link: string;
  onClick?: never;
}

interface FullButtonProps extends BaseProps {
  type: 'full';
  content: React.ReactNode;
  link?: undefined;
  onClick: () => void;
}

interface IconButtonProps extends BaseProps {
  type?: 'icon';
  content?: never;
  link?: undefined;
  onClick: () => void;
}

type Props =
  | FullLinkProps
  | IconLinkProps
  | FullButtonProps
  | IconButtonProps;


function Back({
  content = "",
  link,
  onClick,
  type = "icon",
  arrowPosition = "left"
}: Props) {

  const arrowIcon = (
    <span className="back-to-home__icon" aria-hidden="true">
      <FontAwesomeIcon icon={arrowPosition === 'left' ? faArrowLeft : faArrowRight} />
    </span>
  );

  const mainIcon =
    type === "full"
      ? arrowIcon
      : (
        <span className="back-to-home__icon" aria-hidden="true">
          <FontAwesomeIcon icon={faHome} />
        </span>
      );

  const text = type === "full" && (
    <span className="back-to-home__text">{content}</span>
  );

  const className = "btn-glow back-to-home__link";

  const InnerContent = (
    <>
      {arrowPosition === 'left' && mainIcon}
      {text}
      {arrowPosition === 'right' && mainIcon}
    </>
  );

  return (
    <div className="back-to-home">
      {link ? (
        <Link to={link} className={className}>
          {InnerContent}
        </Link>
      ) : (
        <button type="button" onClick={onClick} className={className}>
          {InnerContent}
        </button>
      )}
    </div>
  );
}

export default Back;
