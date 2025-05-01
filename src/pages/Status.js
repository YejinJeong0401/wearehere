// Status.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacters } from '../context/CharacterContext';
import logo from '../assets/logo.png';
import { db } from '../firebase';
import { ref, onValue, set } from 'firebase/database';

export default function Status() {
  const { characters } = useCharacters();
  const navigate = useNavigate();

  const [statuses, setStatuses] = useState({});

  // 상태 정보를 Firebase에서 가져오기
  useEffect(() => {
    const statusRef = ref(db, 'characterStatuses');
    const unsubscribe = onValue(statusRef, (snapshot) => {
      const data = snapshot.val();
      setStatuses(data || {});
    });
    return () => unsubscribe();
  }, []);

  // Firebase에 상태 저장
  const updateStatus = (name, field, value) => {
    const updated = {
      ...statuses,
      [name]: {
        ...statuses[name],
        [field]: value,
      },
    };
    setStatuses(updated);
    set(ref(db, 'characterStatuses'), updated);
  };

  const getRowStyle = (state) => {
    if (state === '사망') return { background: '#e0e0e0', color: '#666' };
    if (state === '좀비') return { background: '#ffe0e0', color: '#a00' };
    if (state === '감염') return { background: '#fff8dc', color: '#aa6600' };
    return { background: '#fff', color: '#000' };
  };

  return (
    <div style={{ padding: 20, background: '#f0f4f8', minHeight: '100vh' }}>
      <img src={logo} alt="로고" onClick={() => navigate('/')} style={{ width: 80, cursor: 'pointer', marginBottom: 20 }} />
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {[{ path: '/list', label: '명단' }, { path: '/status', label: '상태' }, { path: '/dice', label: '다이스' }, { path: '/battle', label: '전투' }].map(({ path, label }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            style={{
              padding: '10px 0',
              flex: 1,
              backgroundColor: path === '/status' ? '#004080' : '#fff',
              color: path === '/status' ? '#fff' : '#004080',
              border: '1px solid #004080',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <h2>🩺 캐릭터 상태 관리</h2>

      {characters.map((char, idx) => {
        const status = statuses[char.name] || { state: '생존', wound: '', health: '' };
        return (
          <div
            key={idx}
            style={{
              padding: 15,
              marginBottom: 10,
              borderRadius: 6,
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flexWrap: 'wrap',
              ...getRowStyle(status.state),
            }}
          >
            <strong style={{ width: 80 }}>{char.name}</strong>

            <select
              value={status.state}
              onChange={e => updateStatus(char.name, 'state', e.target.value)}
            >
              <option value="생존">생존</option>
              <option value="감염">감염</option>
              <option value="좀비">좀비</option>
              <option value="사망">사망</option>
            </select>

            <input
              type="text"
              placeholder="부상 내용"
              value={status.wound || ''}
              onChange={e => updateStatus(char.name, 'wound', e.target.value)}
              style={{ flex: 1, minWidth: 120 }}
            />

            <input
              type="text"
              placeholder="건강 상태 이상"
              value={status.health || ''}
              onChange={e => updateStatus(char.name, 'health', e.target.value)}
              style={{ flex: 1, minWidth: 120 }}
            />
          </div>
        );
      })}
    </div>
  );
}
