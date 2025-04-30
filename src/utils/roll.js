// 다이스 롤 함수: 공통적인 다이스 롤 처리
export const rollDice = (statValue, action) => {
  const target = 20 + 15 * (statValue - 1);
  const dice = Math.floor(Math.random() * 100) + 1;

  let outcome = '';
  if (dice <= 3) outcome = '대성공';
  else if (dice >= 98) outcome = '대실패';
  else if (dice <= target / 4) outcome = '극단적 성공';
  else if (dice <= target / 2) outcome = '어려운 성공';
  else if (dice <= target) outcome = '성공';
  else outcome = '실패';

  return { dice, outcome };
};

// 물림 부위 리스트
const noSideParts = ["목", "사타구니"];
const sideParts = ["어깨", "허리", "골반", "윗팔", "아래팔", "손목", "손", "허벅지", "종아리", "발목"];
const sides = ["왼쪽", "오른쪽"];

// 랜덤한 물림 부위 생성 함수
export const getRandomParts = () => {
  // 물림 부위가 좌우 구분이 없는 부위일 경우
  const isSidePart = Math.random() > 0.5; // 좌우 부위 선택 여부 결정 (50% 확률로)
  if (isSidePart) {
      const sidePart = sideParts[Math.floor(Math.random() * sideParts.length)];
      const side = sides[Math.floor(Math.random() * sides.length)];
      return `${side} ${sidePart}`;
  } else {
      return noSideParts[Math.floor(Math.random() * noSideParts.length)];
  }
};

// 참가자 중 살아있는 사람들 중 무작위로 좀비 타겟을 정하는 함수
export const getZombieTargets = (zombieCount, participants, knockedOutZombies = []) => {
  let availableParticipants = participants.filter(p => !knockedOutZombies.includes(p.selectedChar.id));

  if (availableParticipants.length < zombieCount) zombieCount = availableParticipants.length;

  const selectedTargets = [];
  const availableZombies = [];

  // 무작위로 참가자 선택
  for (let i = 0; i < zombieCount; i++) {
      const randomIndex = Math.floor(Math.random() * availableParticipants.length);
      const selectedParticipant = availableParticipants[randomIndex];
      selectedTargets.push(selectedParticipant);
      availableZombies.push(i + 1); // 좀비 번호 (1부터 시작)
      availableParticipants.splice(randomIndex, 1);
  }

  return { selectedTargets, availableZombies };
};
