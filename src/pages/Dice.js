import { useState } from 'react';
import { useCharacters } from '../context/CharacterContext';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const DicePage = () => {
  const navigate = useNavigate();
  const { characters } = useCharacters();
  const statNames = ['근력', '민첩', '지능', '행운', '특기', '정신력'];

  const [diceWindows, setDiceWindows] = useState([{
    id: Date.now(),
    selectedChar: null,
    selectedStat: '근력',
    result: ''
  }]);

  const addDiceWindow = () => {
    setDiceWindows(prev => [
      ...prev,
      { id: Date.now(), selectedChar: null, selectedStat: '근력', result: '' }
    ]);
  };

  const removeDiceWindow = (id) => {
    setDiceWindows(prev => prev.filter(win => win.id !== id));
  };

  const updateDiceWindow = (id, field, value) => {
    setDiceWindows(prev => prev.map(win => 
      win.id === id ? { ...win, [field]: value } : win
    ));
  };

  const rollDice = (id) => {
    setDiceWindows(prev => prev.map(win => {
      if (win.id !== id) return win;
      if (!win.selectedChar) return win;

      const statIndex = statNames.indexOf(win.selectedStat);
      const statValue = win.selectedChar.stats[statIndex];
      const target = 20 + 15 * (statValue - 1);

      const dice = Math.floor(Math.random() * 100) + 1;
      let outcome = '';

      if (dice <= 3) outcome = '대성공';
      else if (dice >= 98) outcome = '대실패';
      else if (dice <= target / 4) outcome = '극단적 성공';
      else if (dice <= target / 2) outcome = '어려운 성공';
      else if (dice <= target) outcome = '성공';
      else outcome = '실패';

      return { ...win, result: `[${dice}/${outcome}]` };
    }));
  };

  return (
    <div style={{ position:'relative', minHeight:'100vh', background:'#f0f4f8', padding:'20px' }}>
      <img
        src={logo} alt="로고"
        onClick={() => navigate('/')}
        style={{ position:'absolute', top:20, left:20, width:60, cursor:'pointer' }}
      />

      <div style={{
        display:'flex',
        gap:10,
        marginTop:80,
        marginBottom:20,
        justifyContent:'center'
      }}>
        {[{ path:'/list', label:'명단' }, { path:'/status', label:'상태' }, { path:'/dice', label:'다이스' }, { path:'/battle', label:'전투' }]
          .map(i => (
            <button key={i.path}
              onClick={() => navigate(i.path)}
              style={{
                flex:1,
                padding:'10px 0',
                backgroundColor: i.path === '/dice' ? '#004080' : '#fff',
                color: i.path === '/dice' ? '#fff' : '#004080',
                border:'1px solid #004080',
                borderRadius:6,
                cursor:'pointer'
              }}
            >{i.label}</button>
          ))}
      </div>

      <div style={{ textAlign:'center', marginBottom:20 }}>
        <button onClick={addDiceWindow} style={{ padding:'10px 20px', backgroundColor:'#008000', color:'#fff', border:'none', borderRadius:6, cursor:'pointer' }}>
          다이스 창 추가
        </button>
      </div>

      {diceWindows.map(win => (
        <div key={win.id} style={{ marginBottom:30, background:'#ffffff', padding:20, borderRadius:8, boxShadow:'0 2px 5px rgba(0,0,0,0.1)' }}>
          
          {/* 캐릭터 선택 */}
          <div style={{ marginBottom:10 }}>
            <b>캐릭터</b>
            <select value={win.selectedChar?.name || ''} onChange={e => {
              const found = characters.find(c => c.name === e.target.value);
              updateDiceWindow(win.id, 'selectedChar', found);
            }} style={{ marginLeft:10, padding:4 }}>
              <option value="">선택</option>
              {characters.map(c => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* 캐릭터 정보 */}
          {win.selectedChar && (
            <div style={{ marginBottom: 10 }}>
              <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                <li>나이: {win.selectedChar.age}</li>
                <li>성별: {win.selectedChar.gender}</li>
                <li>직업: {win.selectedChar.job}</li>
                <li>특기: {win.selectedChar.skill}</li>
              </ul>
            </div>
          )}

          {/* 스탯 테이블 */}
          {win.selectedChar && (
            <table style={{ borderCollapse:'collapse', width:'100%', background:'#fff', marginBottom:10 }}>
              <thead>
                <tr>
                  {statNames.map(s => (
                    <th key={s} style={th}>{s}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {win.selectedChar.stats.map((s,i)=>(<td key={i} style={td}>{s}</td>))}
                </tr>
              </tbody>
            </table>
          )}

          {/* 판정 스탯 선택 */}
          <div style={{ marginBottom:10 }}>
            <b>판정 스탯</b>
            <select value={win.selectedStat} onChange={e => updateDiceWindow(win.id, 'selectedStat', e.target.value)} style={{ marginLeft:10, padding:4 }}>
              {statNames.map(s => (<option key={s} value={s}>{s}</option>))}
            </select>
          </div>

          {/* 주사위 굴리기 */}
          <div style={{ textAlign:'center', marginBottom:10 }}>
            <button onClick={() => rollDice(win.id)} style={{ padding:'10px 20px', backgroundColor:'#004080', color:'#fff', border:'none', borderRadius:6, cursor:'pointer' }}>
              주사위 굴리기
            </button>
          </div>

          {/* 결과 출력 */}
          {win.result && (
            <div style={{ background:'#e0e0e0', padding:20, textAlign:'center', fontSize:'1.2rem', fontWeight:'bold', borderRadius:4 }}>
              {win.result}
            </div>
          )}

          {/* 삭제 버튼 */}
          <div style={{ textAlign:'center', marginTop:10 }}>
            <button onClick={() => removeDiceWindow(win.id)} style={{ padding:'5px 10px', backgroundColor:'#ff4444', color:'#fff', border:'none', borderRadius:6, cursor:'pointer' }}>
              삭제
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

const th = {
  border:'1px solid #ccc',
  padding:8,
  background:'#e0e0e0',
  textAlign:'center'
};
const td = {
  border:'1px solid #ccc',
  padding:8,
  textAlign:'center'
};

export default DicePage;
