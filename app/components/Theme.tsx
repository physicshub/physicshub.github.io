import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

interface Props {
  mode: 'light' | 'dark';
  onToggle: () => void;
}

export function Theme({ mode, onToggle }: Props) {
  return (
    <button
      className="theme-toggle"
      onClick={onToggle}
      aria-label="Toggle theme"
    >
     <FontAwesomeIcon icon={mode === 'dark' ? faMoon : faSun} />
    </button>
  );
}
