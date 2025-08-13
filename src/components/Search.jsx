// src/components/Search.jsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

export function Search({ onSearch }) {
  const [value, setValue] = useState('');

  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    onSearch?.(newValue); // Passa il valore al padre
  };

  return (
    <form
      className="search-container"
      role="search"
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        type="search"
        name="query"
        placeholder="Search..."
        aria-label="Search"
        value={value}
        onChange={handleChange}
      />
      <button type="submit" aria-label="Submit Search">
        <FontAwesomeIcon icon={faMagnifyingGlass} />
      </button>
    </form>
  );
}
