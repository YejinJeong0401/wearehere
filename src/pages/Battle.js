// Battle.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacters } from '../context/CharacterContext';
import { rollDice, getRandomParts } from '../utils/roll';
import logo from '../assets/logo.png';

export default function Battle() {
  const { characters } = useCharacters();
  const navigate = useNavigate();
  const [battles, setBattles] = useState([]);

  const createBattle = () => {
    setBattles([...battles, {
      id: Date.now(),
      participants: [],
      logs: [],
      zombies: 0,
      knockedOutZombies: [],
    }]);
  };

  const addParticipant = (battleId) => {
    setBattles(battles.map(b =>
      b.id === battleId
        ? {
            ...b,
            participants: [
              ...b.participants,
              {
                selectedChar: null,
                action: '공격',
                targetZombie: 1,
                result: '',
                stack: 0,
                isKnockedOut: false,
                isDisabled: false,
                attackSuccessMap: {},
              }
            ]
          }
        : b
    ));
  };

  const deleteParticipant = (battleId, index) => {
    setBattles(battles.map(b => {
      if (b.id !== battleId) return b;
      const updated = [...b.participants];
      updated.splice(index, 1);
      return { ...b, participants: updated };
    }));
  };

  const updateParticipant = (battleId, index, field, value) => {
    setBattles(battles.map(b => {
      if (b.id !== battleId) return b;
      const updated = [...b.participants];
      updated[index] = { ...updated[index], [field]: value };
      return { ...b, participants: updated };
    }));
  };

  const rollAllDice = (battleId) => {
    setBattles(battles.map(b => {
      if (b.id !== battleId) return b;

      const logs = [...b.logs, '⚔ 참가자 턴'];
      const updated = [...b.participants];

      updated.forEach((p, index) => {
        if (!p.selectedChar || p.isKnockedOut || p.isDisabled) return;

        if (p.action === '휴식') {
          p.result = `${p.selectedChar.name}은 휴식 중이다.`;
          logs.push(p.result);
          return;
        }

        const statIndex = p.action === '공격' ? 0 : p.action === '회피' ? 1 : 4;
        const statValue = p.selectedChar.stats[statIndex];
        const { dice, outcome } = rollDice(statValue, p.action);
        let resultText = `[${dice}/${outcome}]`;

        if (p.action === '공격') {
          p.result = `${p.selectedChar.name} 공격 ${resultText}`;
          const target = p.targetZombie;
          if (!p.attackSuccessMap) p.attackSuccessMap = {};

          if (outcome === '대성공') {
            p.isKnockedOut = true;
            if (!b.knockedOutZombies.includes(target)) {
              b.knockedOutZombies.push(target);
              logs.push(`🧟 좀비 ${target}이 쓰러졌다!`);
            }
          } else if (outcome === '성공') {
            p.attackSuccessMap[target] = (p.attackSuccessMap[target] || 0) + 1;
            if (p.attackSuccessMap[target] >= 3 && !b.knockedOutZombies.includes(target)) {
              b.knockedOutZombies.push(target);
              p.isKnockedOut = true;
              logs.push(`🧟 좀비 ${target}이 쓰러졌다!`);
            }
          }

        } else if (p.action === '회피') {
          let damage = 0;
          if (outcome === '실패') {
            damage = Math.ceil(Math.random() * 3);
            p.stack += 1;
            if (p.stack >= 2) {
              const part = getRandomParts();
              logs.push(`☠️ ${p.selectedChar.name} 회피 실패로 물림 판정! [${part}]`);
            }
          } else if (outcome === '대실패') {
            damage = 3;
            const part = getRandomParts();
            logs.push(`☠️ ${p.selectedChar.name} 대실패! 피해 3 + 물림 판정 [${part}]`);
          } else {
            p.stack = 0;
          }
          resultText += ` ${damage}`;
          p.result = `${p.selectedChar.name} 회피 ${resultText}`;
        }

        logs.push(p.result);
      });

      return { ...b, participants: updated, logs };
    }));
  };

  const handleZombieCountChange = (battleId, count) => {
    setBattles(battles.map(b =>
      b.id === battleId ? { ...b, zombies: count } : b
    ));
  };

  const handleZombieTurn = (battleId) => {
    setBattles(battles.map(b => {
      if (b.id !== battleId) return b;
      const logs = [...b.logs, '🧟 좀비 턴'];
      const aliveParticipants = b.participants.filter(p => !p.isKnockedOut && !p.isDisabled && p.selectedChar);
      const aliveZombies = Array.from({ length: b.zombies }, (_, i) => i + 1).filter(z => !b.knockedOutZombies.includes(z));

      if (aliveParticipants.length === 0 || aliveZombies.length === 0) {
        logs.push('⚠️ 좀비 턴 실행 불가: 참가자 또는 좀비가 없음');
        return { ...b, logs };
      }

      const attacks = {};
      aliveZombies.forEach(zId => {
        const target = aliveParticipants[Math.floor(Math.random() * aliveParticipants.length)];
        if (!attacks[target.selectedChar.name]) {
          attacks[target.selectedChar.name] = [];
        }
        attacks[target.selectedChar.name].push(zId);
      });

      Object.entries(attacks).forEach(([name, zombies]) => {
        logs.push(`${name}에게 좀비 ${zombies.join(', ')}가 달려든다.`);
      });

      return { ...b, logs };
    }));
  };

  const resetBattle = (battleId) => {
    setBattles(battles.map(b =>
      b.id === battleId
        ? { ...b, participants: [], logs: [], zombies: 0, knockedOutZombies: [] }
        : b
    ));
  };

  const deleteBattle = (battleId) => {
    setBattles(battles.filter(b => b.id !== battleId));
  };

  return (
    <div style={{ padding: 20, background: '#eef2f5', minHeight: '100vh' }}>
      <img src={logo} alt="로고" onClick={() => navigate('/')} style={{ width: 80, cursor: 'pointer', marginBottom: 20 }} />

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {[{ path: '/list', label: '명단' }, { path: '/status', label: '상태' }, { path: '/dice', label: '다이스' }, { path: '/battle', label: '전투' }].map(({ path, label }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            style={{
              padding: '10px 0', flex: 1,
              backgroundColor: path === '/battle' ? '#004080' : '#fff',
              color: path === '/battle' ? '#fff' : '#004080',
              border: '1px solid #004080', borderRadius: 6,
              cursor: 'pointer'
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <button onClick={createBattle} style={{ background: '#004080', color: '#fff', padding: '10px 20px', marginBottom: 20 }}>+ 새 전투 생성</button>

      {battles.map(b => (
        <div key={b.id} style={{ background: '#fff', padding: 20, marginBottom: 30, borderRadius: 8, boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
          <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
            <div>
              좀비 수:
              <input type="number" min={1} value={b.zombies} onChange={e => handleZombieCountChange(b.id, Number(e.target.value))} style={{ width: 60, marginLeft: 10 }} />
              <button onClick={() => handleZombieTurn(b.id)} style={{ marginLeft: 10, padding: '5px 10px', background: '#333', color: '#fff', borderRadius: 4 }}>🧟 좀비 턴</button>
            </div>
            <div>
              <button onClick={() => resetBattle(b.id)} style={{ background: 'orange', marginRight: 10, color: '#fff' }}>♻️ 초기화</button>
              <button onClick={() => deleteBattle(b.id)} style={{ background: 'red', color: '#fff' }}>✖ 삭제</button>
            </div>
          </div>

          {b.participants.map((p, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', marginBottom: 8 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <select value={p.selectedChar?.name || ''} onChange={e => updateParticipant(b.id, i, 'selectedChar', characters.find(c => c.name === e.target.value))}>
                  <option value="">캐릭터 선택</option>
                  {characters.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>

                <select value={p.action} onChange={e => updateParticipant(b.id, i, 'action', e.target.value)}>
                  <option value="공격">공격</option>
                  <option value="회피">회피</option>
                  <option value="휴식">휴식</option>
                </select>

                {p.action === '공격' && (
                  <select value={p.targetZombie} onChange={e => updateParticipant(b.id, i, 'targetZombie', Number(e.target.value))}>
                    {Array.from({ length: b.zombies }, (_, zi) => (
                      <option key={zi + 1} value={zi + 1}>좀비 {zi + 1}</option>
                    ))}
                  </select>
                )}

                <label style={{ fontSize: 12 }}>
                  <input type="checkbox" checked={p.isDisabled} onChange={e => updateParticipant(b.id, i, 'isDisabled', e.target.checked)} style={{ marginRight: 5 }} />
                  전투 불능
                </label>

                <button onClick={() => deleteParticipant(b.id, i)} style={{ fontSize: 12, color: 'red', marginLeft: 5 }}>삭제</button>
              </div>

              <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>
                {p.selectedChar && `(${p.selectedChar.stats.join('/')})`}
              </div>
              <div><span>{p.result}</span></div>
            </div>
          ))}

          <button onClick={() => addParticipant(b.id)} style={{ background: '#008000', color: '#fff', marginTop: 10, padding: '6px 10px' }}>+ 참가자 추가</button>
          <button onClick={() => rollAllDice(b.id)} style={{ background: '#333', color: '#fff', marginTop: 10, marginLeft: 10, padding: '6px 10px' }}>🎲 전체 굴리기</button>

          <div style={{ marginTop: 10 }}>
            {b.logs.map((log, i) => <div key={i}>📝 {log}</div>)}
          </div>
        </div>
      ))}
    </div>
  );
}
