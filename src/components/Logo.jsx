import { Link } from 'react-router-dom';
import logoSrc from '/icon.png';

export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="Home">
      <img src={logoSrc} alt="Nome Azienda" draggable={false} />
    </Link>
  );
}
