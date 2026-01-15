import React, { useState, useEffect } from 'react';

function SearchBar({ value = '', onChange, placeholder = 'Rechercher...', debounceMs = 300 }) {
  const [input, setInput] = useState(value);

  useEffect(() => setInput(value), [value]);

  useEffect(() => {
    const id = setTimeout(() => {
      if (onChange) onChange(input);
    }, debounceMs);
    return () => clearTimeout(id);
  }, [input, onChange, debounceMs]);

  return (
    <div className="search-bar">
      <input
        type="search"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        aria-label="Recherche jeux"
      />
    </div>
  );
}

export default SearchBar;
