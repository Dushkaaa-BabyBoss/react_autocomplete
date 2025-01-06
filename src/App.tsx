import React, { useEffect, useState } from 'react';
import './App.scss';
import { peopleFromServer } from './data/people';
import { Person } from './types/Person';

const Autocomplete: React.FC<{
  people: Person[];
  debounseDelay?: number;
  onSelected: (person: Person | null) => void;
}> = ({ people, debounseDelay = 300, onSelected }) => {
  const [inputValue, setInputValue] = useState('');
  const [filteredPeaople, setFilteredPeaople] = useState<Person[]>([]);
  const [selectedPersone, setSelectedPersone] = useState<Person | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [lastSearch, setLastSearch] = useState('');

  const debounce = (func: () => void, delay: number) => {
    let timer: NodeJS.Timeout;

    return () => {
      clearTimeout(timer);
      timer = setTimeout(func, delay);
    };
  };

  const handleChange = (value: string) => {
    setInputValue(value);
    setShowDropdown(true);

    if (value === lastSearch) {
      return;
    }

    debounce(() => {
      const searchValue = value.trim().toLowerCase();

      const filterPeaple = people.filter(person =>
        person.name.toLowerCase().includes(searchValue),
      );

      setFilteredPeaople(searchValue ? filterPeaple : people);
      setLastSearch(value);
    }, debounseDelay)();
  };

  const handleSelect = (person: Person) => {
    setInputValue(person.name);
    setSelectedPersone(person);
    setShowDropdown(false);
    onSelected(person);
  };

  const handleFocus = () => {
    setShowDropdown(true);

    if (!inputValue) {
      setFilteredPeaople(people);
    }
  };

  const handleClearSelection = () => {
    setSelectedPersone(null);
    onSelected(null);
  };

  useEffect(() => {
    if (selectedPersone && inputValue !== selectedPersone.name) {
      handleClearSelection();
    }
  }, [inputValue, selectedPersone]);

  return (
    <div className="autocomplete">
      <input
        type="text"
        value={inputValue}
        placeholder="Enter a part of the name"
        className="input"
        onChange={e => handleChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
      />
      {showDropdown && (
        <div className="dropdown is-active">
          <div className="dropdown-menu" role="menu">
            <div className="dropdown-content">
              {filteredPeaople.length > 0 ? (
                filteredPeaople.map(person => (
                  <div
                    key={person.slug}
                    className="dropdown-item"
                    onClick={() => handleSelect(person)}
                  >
                    <p className="has-text-link">{person.name}</p>
                  </div>
                ))
              ) : (
                <div className="dropdown-item" data-cy="no-suggestions-message">
                  <p className="has-text-danger">No matching suggestions</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  const [selectedPersone, setSelectedPersone] = useState<Person | null>(null);

  return (
    <div className="container">
      <main className="section is-flex is-flex-direction-column">
        <h1 className="title" data-cy="title">
          {selectedPersone
            ? `${selectedPersone.name} (${selectedPersone.born} - ${selectedPersone.died})`
            : 'No selected persone'}
        </h1>

        <Autocomplete
          people={peopleFromServer}
          onSelected={setSelectedPersone}
          debounseDelay={300}
        />
      </main>
    </div>
  );
};
