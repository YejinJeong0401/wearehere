// List.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacters } from '../context/CharacterContext';
import logo from '../assets/logo.png';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxNu_5w-5iWb8SMp5tzK3U7X2yDtJkDzdhD0Ut5OmNniaThuFLCA_29ghDsrvp8Bakj/exec';

const statusData = JSON.parse(localStorage.getItem('characterStatusData') || '{}');

export default function List() {
  const { characters, addCharacter, updateCharacters, deleteCharacter } = useCharacters();
  const navigate = useNavigate();

  const statLabels = ['근력', '민첩', '지능', '행운', '특기', '정신력'];
  const stackLabels = ['부상', '인지도', '감염'];

  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: '',
    job: '',
    skill: '',
    stats: [0, 0, 0, 0, 0, 0],
    stack: { wound: 0, attention: 0, infection: 0 },
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedRows, setEditedRows] = useState([]);

  useEffect(() => {
    setEditedRows(characters);
  }, [characters]);

  useEffect(() => {
    const formattedData = characters.map(c => [
      c.name, c.age, c.gender, c.job, c.skill,
      ...c.stats,
      c.stack.wound, c.stack.attention, c.stack.infection
    ]);

    if (formattedData.length > 0) {
      fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData)
      });
    }
  }, [characters]);

  const handleAddCharacter = () => {
    if (
      form.name &&
      form.age &&
      form.gender &&
      form.job &&
      form.skill &&
      form.stats.every(stat => !isNaN(stat))
    ) {
      addCharacter({ ...form });
      setForm({
        name: '',
        age: '',
        gender: '',
        job: '',
        skill: '',
        stats: [0, 0, 0, 0, 0, 0],
        stack: { wound: 0, attention: 0, infection: 0 }
      });
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      updateCharacters(editedRows);
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (rowIndex, field, value) => {
    const updated = [...editedRows];
    updated[rowIndex][field] = value;
    setEditedRows(updated);
  };

  const handleStatChange = (rowIndex, statIndex, value) => {
    const updated = [...editedRows];
    updated[rowIndex].stats[statIndex] = Number(value);
    setEditedRows(updated);
  };

  const handleStackChange = (rowIndex, stackKey, value) => {
    const updated = [...editedRows];
    updated[rowIndex].stack[stackKey] = Number(value);
    setEditedRows(updated);
  };

  const handleDelete = (index) => {
    deleteCharacter(index);
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: '#f0f4f8', padding: '20px' }}>
      <img src={logo} alt="로고" onClick={() => navigate('/')} style={{ position: 'absolute', top: 20, left: 20, width: 80, cursor: 'pointer' }} />

      <div style={{ display: 'flex', gap: 10, marginTop: 100, marginBottom: 20, justifyContent: 'center' }}>
        {[{ path: '/list', label: '명단' }, { path: '/status', label: '상태' }, { path: '/dice', label: '다이스' }, { path: '/battle', label: '전투' }].map(i => (
          <button key={i.path} onClick={() => navigate(i.path)} style={{ flex: 1, padding: '10px 0', backgroundColor: i.path === '/list' ? '#004080' : '#fff', color: i.path === '/list' ? '#fff' : '#004080', border: '1px solid #004080', borderRadius: 6, cursor: 'pointer' }}>{i.label}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
        <input placeholder="이름" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
        <input placeholder="나이" type="number" value={form.age} onChange={e => setForm({ ...form, age: Number(e.target.value) })} style={inputStyle} />
        <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} style={inputStyle}>
          <option value="">성별</option>
          <option value="남">남</option>
          <option value="여">여</option>
        </select>
        <input placeholder="직업" value={form.job} onChange={e => setForm({ ...form, job: e.target.value })} style={inputStyle} />
        <input placeholder="특기" value={form.skill} onChange={e => setForm({ ...form, skill: e.target.value })} style={inputStyle} />
        {statLabels.map((label, i) => (
          <input key={i} placeholder={label} type="number" value={form.stats[i]} onChange={e => {
            const updated = [...form.stats];
            updated[i] = Number(e.target.value);
            setForm({ ...form, stats: updated });
          }} style={{ ...inputStyle, width: 60 }} />
        ))}
        <button onClick={handleAddCharacter} style={buttonStyle}>추가</button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 10 }}>
        <button onClick={handleEditToggle} style={buttonStyle}>
          {isEditing ? '저장' : '수정'}
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <thead>
            <tr>
              <th rowSpan={2} style={th}>이름</th>
              <th rowSpan={2} style={th}>나이</th>
              <th rowSpan={2} style={th}>성별</th>
              <th rowSpan={2} style={th}>직업</th>
              <th rowSpan={2} style={th}>특기</th>
              <th colSpan={6} style={th}>스탯</th>
              <th colSpan={3} style={th}>스택</th>
              {isEditing && <th rowSpan={2} style={th}>삭제</th>}
            </tr>
            <tr>
              {[...statLabels, ...stackLabels].map((label, i) => (
                <th key={i} style={th}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {editedRows.map((char, i) => (
              <tr key={i} style={{
                backgroundColor:
                  statusData[char.name]?.state === '사망' ? '#000' :
                  statusData[char.name]?.state === '좀비' ? '#6e2e2e' :
                  statusData[char.name]?.state === '감염' ? '#ffe0e0' :
                  '#fff',
                color:
                  statusData[char.name]?.state === '사망' ? '#fff' :
                  statusData[char.name]?.state === '좀비' ? '#fff' :
                  '#000'
              }}>
                {['name', 'age', 'gender', 'job', 'skill'].map((field, j) => (
                  <td key={j} style={td}>
                    {isEditing ? (
                      <input type="text" value={char[field]} onChange={e => handleInputChange(i, field, e.target.value)} style={cellInput} />
                    ) : char[field]}
                  </td>
                ))}
                {char.stats.map((s, j) => (
                  <td key={j} style={td}>
                    {isEditing ? (
                      <input type="number" value={s} onChange={e => handleStatChange(i, j, e.target.value)} style={cellInput} />
                    ) : s}
                  </td>
                ))}
                {['wound', 'attention', 'infection'].map((key, j) => (
                  <td key={j} style={td}>
                    {isEditing ? (
                      <input type="number" value={char.stack[key]} onChange={e => handleStackChange(i, key, e.target.value)} style={cellInput} />
                    ) : char.stack[key]}
                  </td>
                ))}
                {isEditing && (
                  <td style={td}>
                    <button onClick={() => handleDelete(i)} style={{ ...buttonStyle, backgroundColor: 'red' }}>삭제</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: '10px',
  borderRadius: '5px',
  border: '1px solid #ccc',
  minWidth: '50px'
};

const th = {
  border: '1px solid #ccc',
  padding: 8,
  background: '#e0e0e0',
  textAlign: 'center'
};

const td = {
  border: '1px solid #ccc',
  padding: 6,
  textAlign: 'center'
};

const buttonStyle = {
  padding: '10px 20px',
  backgroundColor: '#004080',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer'
};

const cellInput = {
  width: '100%',
  padding: '4px',
  textAlign: 'center'
};
