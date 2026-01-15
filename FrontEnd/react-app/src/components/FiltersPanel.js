import React from 'react';

function FiltersPanel({ filters = {}, options = {}, onChange }) {
  const toggleArrayValue = (key, val) => {
    const arr = filters[key] || [];
    const next = arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
    onChange && onChange({ ...filters, [key]: next });
  };

  return (
    <aside className="filters-panel">
      {options.genres && (
        <div className="filter-group">
          <h4>Genres</h4>
          {options.genres.map(g => (
            <label key={g}>
              <input
                type="checkbox"
                checked={(filters.genres || []).includes(g)}
                onChange={() => toggleArrayValue('genres', g)}
              />
              {g}
            </label>
          ))}
        </div>
      )}

      {options.platforms && (
        <div className="filter-group">
          <h4>Plateformes</h4>
          {options.platforms.map(p => (
            <label key={p}>
              <input
                type="checkbox"
                checked={(filters.platforms || []).includes(p)}
                onChange={() => toggleArrayValue('platforms', p)}
              />
              {p}
            </label>
          ))}
        </div>
      )}
    </aside>
  );
}

export default FiltersPanel;
