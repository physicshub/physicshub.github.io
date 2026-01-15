"use client";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faHome } from '@fortawesome/free-solid-svg-icons';
import React from "react";
import Link from 'next/link';
import { useIsMobile } from '../hooks/useMobile';

interface BaseProps {
  type?: 'full' | 'icon' | 'responsive';
  arrowPosition?: 'left' | 'right';
}

interface FullLinkProps extends BaseProps {
  type: 'full' | 'responsive';
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
  type: 'full' | 'responsive';
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
  
  const isMobile = useIsMobile();

  const arrowIcon = (
    <span className="back-to-home__icon" aria-hidden="true">
      <FontAwesomeIcon icon={arrowPosition === 'left' ? faArrowLeft : faArrowRight} />
    </span>
  );

  // Determina l'icona da mostrare
  const mainIcon = (type === "full" || type === "responsive")
      ? arrowIcon
      : (
        <span className="back-to-home__icon" aria-hidden="true">
          <FontAwesomeIcon icon={faHome} />
        </span>
      );

  const shouldShowText = type === "full" || (type === "responsive" && !isMobile);

  const text = shouldShowText && (
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
        <Link href={link} className={className}>
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