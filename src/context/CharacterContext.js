// CharacterContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, onValue, set } from 'firebase/database';

const CharacterContext = createContext();

export const useCharacters = () => {
  const context = useContext(CharacterContext);
  if (!context) {
    throw new Error('useCharacters must be used within a CharacterProvider');
  }
  return context;
};

export const CharacterProvider = ({ children }) => {
  const [characters, setCharacters] = useState([]);

  // Firebase에서 캐릭터 데이터 불러오기
  useEffect(() => {
    const charRef = ref(db, 'characters');
    const unsubscribe = onValue(charRef, (snapshot) => {
      const data = snapshot.val();
      if (Array.isArray(data)) {
        setCharacters(data);
      } else if (data) {
        setCharacters(Object.values(data));
      } else {
        setCharacters([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // 캐릭터 추가
  const addCharacter = (character) => {
    const updatedCharacters = [...characters, character];
    set(ref(db, 'characters'), updatedCharacters);
  };

  // 캐릭터 전체 업데이트
  const updateCharacters = (updatedList) => {
    set(ref(db, 'characters'), updatedList);
  };

  // 캐릭터 삭제
  const deleteCharacter = (index) => {
    const updated = [...characters];
    updated.splice(index, 1);
    set(ref(db, 'characters'), updated);
  };

  return (
    <CharacterContext.Provider value={{ characters, addCharacter, updateCharacters, deleteCharacter }}>
      {children}
    </CharacterContext.Provider>
  );
};
