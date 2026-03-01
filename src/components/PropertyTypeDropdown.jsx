import { useState, useRef, useEffect } from 'react';

function PropertyTypeDropdown({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Ensure value is always an array
  const selectedValues = Array.isArray(value) ? value : [];

  const propertyTypes = [
    { value: 'house', label: 'House' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'land', label: 'Land' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'villa', label: 'Villa' },
  ];

  const handleCheckboxChange = (type) => {
    const newValue = selectedValues.includes(type)
      ? selectedValues.filter(item => item !== type)
      : [...selectedValues, type];
    onChange(newValue);
  };

  const handleSelectAll = () => {
    if (selectedValues.length === propertyTypes.length) {
      onChange([]);
    } else {
      onChange(propertyTypes.map(type => type.value));
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayText = selectedValues.length === 0 
    ? 'Select Property Type'
    : selectedValues.length === propertyTypes.length
    ? 'All Selected'
    : `${selectedValues.length} Selected`;

  return (
    <div className="relative" ref={dropdownRef} style={{overflow: 'visible'}}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-midnight-800 border border-midnight-700 text-text-primary rounded-input focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition text-left flex items-center justify-between"
      >
        <span className="truncate">{displayText}</span>
        <svg 
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-midnight-800 border border-midnight-700 rounded-lg shadow-lg z-50">
          {/* Select All Option */}
          <div className="border-b border-midnight-700 p-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedValues.length === propertyTypes.length}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded border-midnight-600 text-gold focus:ring-gold cursor-pointer"
              />
              <span className="text-sm font-semibold text-text-primary">Select All</span>
            </label>
          </div>

          {/* Individual Options */}
          <div className="max-h-64 overflow-y-auto">
            {propertyTypes.map((type) => (
              <label
                key={type.value}
                className="flex items-center gap-3 px-4 py-2 hover:bg-midnight-700 cursor-pointer transition"
              >
                <input
                  type="checkbox"
                  checked={selectedValues.includes(type.value)}
                  onChange={() => handleCheckboxChange(type.value)}
                  className="w-4 h-4 rounded border-midnight-600 text-gold focus:ring-gold cursor-pointer"
                />
                <span className="text-sm text-text-primary">{type.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PropertyTypeDropdown;
