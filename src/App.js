import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { CharacterProvider } from './context/CharacterContext';
import List from './pages/List';
import Dice from './pages/Dice';
import Status from './pages/Status';
import Battle from './pages/Battle';
import Home from './pages/Home'; // 홈 컴포넌트 추가

function App() {
  return (
    <CharacterProvider>
      <Router>
        <Routes>
          {/* 기본 경로 설정 */}
          <Route path="/" element={<Home />} /> {/* 기본 홈 페이지 추가 */}

          {/* 나머지 라우트 */}
          <Route path="/list" element={<List />} />
          <Route path="/dice" element={<Dice />} />
          <Route path="/status" element={<Status />} />
          <Route path="/battle" element={<Battle />} />
        </Routes>
      </Router>
    </CharacterProvider>
  );
}

export default App;
