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
    setBattles([
      ...battles,
      {
        id: Date.now(),
        participants: [],
        logs: [],
        zombies: 0,
        knockedOutZombies: [],
        zombieHitCounts: {},
        turn: 1,
      },
    ]);
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
              },
            ],
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

      const logs = [...b.logs];
      logs.push(`⚔ 참가자 턴`);
      logs.unshift(`🔁 ${b.turn} 턴 시작`);

      const updated = [...b.participants];
      const zombieHitCounts = { ...b.zombieHitCounts };
      const knockedOutZombies = [...b.knockedOutZombies];

      updated.forEach((p) => {
        if (!p.selectedChar || p.isKnockedOut || p.isDisabled) return;

        if (p.action === '휴식') {
          p.result = `${p.selectedChar.name}은 휴식 중이다.`;
          logs.push(p.result);
          return;
        }

        const statIndex =
          p.action === '공격' ? 0 :   // 근력
          p.action === '회피' ? 1 :   // 민첩
          p.action === '특기' ? 4 :   // 특기
          0;

        const statValue = p.selectedChar.stats[statIndex];
        const { dice, outcome } = rollDice(statValue, p.action);
        let resultText = `[${dice}/${outcome}]`;

        if (p.action === '공격') {
          p.result = `${p.selectedChar.name} 공격 ${resultText}`;
          const target = p.targetZombie;
          if (!p.attackSuccessMap) p.attackSuccessMap = {};

          if (outcome === '대성공') {
            p.isKnockedOut = true;
            if (!knockedOutZombies.includes(target)) {
              knockedOutZombies.push(target);
              logs.push(`🧟 좀비 ${target}이 쓰러졌다!`);
            }
            zombieHitCounts[target] = (zombieHitCounts[target] || 0) + 1;
          } else if (outcome === '성공') {
            p.attackSuccessMap[target] = (p.attackSuccessMap[target] || 0) + 1;
            zombieHitCounts[target] = (zombieHitCounts[target] || 0) + 1;
            if (p.attackSuccessMap[target] >= 2 && !knockedOutZombies.includes(target)) {
              knockedOutZombies.push(target);
              p.isKnockedOut = true;
              logs.push(`🧟 좀비 ${target}이 쓰러졌다!`);
            }
          }
        } else if (p.action === '회피') {
          let damage = 0;
          if (outcome === '실패') {
            damage = Math.ceil(Math.random() * 3);
            const luckStat = p.selectedChar.stats[3]; // 행운
            const luckResult = rollDice(luckStat, '행운');
            const part = getRandomParts();
            if (luckResult.outcome === '실패' || luckResult.outcome === '대실패') {
              logs.push(`☠️ ${p.selectedChar.name} 회피 실패 + 행운 실패로 물림! [${part}]`);
            } else {
              logs.push(`😮 ${p.selectedChar.name} 회피 실패했지만 행운으로 피함!`);
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
        } else if (p.action === '특기') {
          p.result = `${p.selectedChar.name} 특기 판정 ${resultText}`;
        }

        logs.push(p.result);
      });

      return {
        ...b,
        participants: updated,
        logs,
        zombieHitCounts,
        knockedOutZombies,
        turn: b.turn + 1,
      };
    }));
  };

  const handleZombieCountChange = (battleId, count) => {
    setBattles(battles.map(b =>
      b.id === battleId
        ? {
            ...b,
            zombies: count,
            zombieHitCounts: Object.fromEntries(
              Array.from({ length: count }, (_, i) => [i + 1, b.zombieHitCounts[i + 1] || 0])
            ),
          }
        : b
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
        ? {
            ...b,
            participants: [],
            logs: [],
            zombies: 0,
            knockedOutZombies: [],
            zombieHitCounts: {},
            turn: 1,
          }
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
        {[
          { path: '/list', label: '명단' },
          { path: '/status', label: '상태' },
          { path: '/dice', label: '다이스' },
          { path: '/battle', label: '전투' },
        ].map(({ path, label }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            style={{
              padding: '10px 0',
              flex: 1,
              backgroundColor: path === '/battle' ? '#004080' : '#fff',
              color: path === '/battle' ? '#fff' : '#004080',
              border: '1px solid #004080',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <button onClick={createBattle} style={{ background: '#004080', color: '#fff', padding: '10px 20px', marginBottom: 20 }}>
        + 새 전투 생성
      </button>

      <div>
        {battles.map(b => (
          <div key={b.id} style={{ marginBottom: 20, border: '1px solid #ddd', padding: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h3>전투 {b.id}</h3>
              <div>
                <button onClick={() => deleteBattle(b.id)} style={{ background: '#f44336', color: '#fff', padding: '5px 10px' }}>삭제</button>
                <button onClick={() => resetBattle(b.id)} style={{ background: '#4caf50', color: '#fff', padding: '5px 10px', marginLeft: 10 }}>초기화</button>
              </div>
            </div>

            <div style={{ marginBottom: 10 }}>
              <label>좀비 수: </label>
              <input
                type="number"
                value={b.zombies}
                onChange={(e) => handleZombieCountChange(b.id, parseInt(e.target.value))}
                min={0}
                style={{ width: 50 }}
              />
              <button onClick={() => handleZombieTurn(b.id)} style={{ background: '#ff9800', color: '#fff', padding: '5px 10px', marginLeft: 10 }}>
                좀비 턴
              </button>
            </div>

            <div style={{ marginBottom: 10 }}>
              <button onClick={() => addParticipant(b.id)} style={{ background: '#3f51b5', color: '#fff', padding: '5px 10px' }}>
                참가자 추가
              </button>
            </div>

            <div>
              {b.participants.map((p, idx) => (
                <div key={idx} style={{ marginBottom: 10 }}>
                  <div>
                    <label>{p.selectedChar ? p.selectedChar.name : '참가자 없음'}</label>
                    <button onClick={() => deleteParticipant(b.id, idx)} style={{ background: '#f44336', color: '#fff', padding: '5px 10px', marginLeft: 10 }}>
                      삭제
                    </button>
                  </div>
                  <div>상태: {p.result}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 20 }}>
              <h4>전투 로그</h4>
              <ul>
                {b.logs.map((log, idx) => (
                  <li key={idx}>{log}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
