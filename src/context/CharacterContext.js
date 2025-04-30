import { createContext, useContext, useState, useEffect } from 'react';

const CharacterContext = createContext();

export const useCharacters = () => {
  const context = useContext(CharacterContext);
  if (!context) {
    throw new Error('useCharacters must be used within a CharacterProvider');
  }
  return context;
};

export const CharacterProvider = ({ children }) => {
  const [characters, setCharacters] = useState(() => {
    const saved = localStorage.getItem('characterList');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('characterList', JSON.stringify(characters));
  }, [characters]);

  const addCharacter = (character) => {
    setCharacters(prev => [...prev, character]);
  };

  return (
    <CharacterContext.Provider value={{ characters, addCharacter }}>
      {children}
    </CharacterContext.Provider>
  );
};
