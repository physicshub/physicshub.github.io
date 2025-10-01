import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faCircleHalfStroke } from '@fortawesome/free-solid-svg-icons';

interface Props {
  mode: 'light' | 'dark' | 'system';
  onToggle: () => void;
}

export function Theme({ mode, onToggle }: Props) {
  return (
    <button
      className="theme-toggle"
      onClick={onToggle}
      aria-label="Toggle theme"
    >
     <FontAwesomeIcon icon={
    mode === 'dark' ? faMoon :
    mode === 'light' ? faSun :
    faCircleHalfStroke
} />
    </button>
  );
}
