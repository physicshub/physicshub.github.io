import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

export function Search() {
  return (
    <form className="search-container" role="search" onSubmit={e => e.preventDefault()}>
      <input
        type="search"
        name="query"
        placeholder="Search..."
        aria-label="Search"
      />
      <button type="submit" aria-label="Submit Search">
        <FontAwesomeIcon icon={faMagnifyingGlass} />
      </button>
    </form>
  );
}
