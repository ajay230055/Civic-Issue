import React from 'react';

const SearchBar: React.FC<{ value: string; onChange: (v: string) => void }>=({ value, onChange })=>{
  return (
    <div className="field" style={{ marginBottom: 8 }}>
      <label>Search</label>
      <input placeholder="Search issues…" value={value} onChange={(e)=>onChange(e.target.value)} />
    </div>
  );
};

export default SearchBar;


