// src/utils/helpers.js
export const getRandomBiteLocation = () => {
    const noSideParts = ["목", "사타구니"];
    const sideParts = ["어깨", "허리", "골반", "윗팔", "아래팔", "손목", "손", "허벅지", "종아리", "발목"];
    const sides = ["왼쪽", "오른쪽"];
  
    // 목과 사타구니는 좌우 구분 없이 선택
    const randomNoSidePart = noSideParts[Math.floor(Math.random() * noSideParts.length)];
  
    // 좌우 구분이 필요한 부위는 좌우를 랜덤으로 선택
    const randomSidePart = sideParts[Math.floor(Math.random() * sideParts.length)];
    const randomSide = sides[Math.floor(Math.random() * sides.length)];
  
    return Math.random() > 0.5 ? randomNoSidePart : `${randomSide} ${randomSidePart}`;
  };
  