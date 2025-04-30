import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png'; // 로고 이미지

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      flexDirection: "column", 
      justifyContent: "center", 
      alignItems: "center", 
      gap: "40px", 
      backgroundColor: "#f0f4f8",
      padding: "20px"
    }}>
      
      {/* 로고 - 클릭하면 홈으로 이동 */}
      <img 
        src={logo} 
        alt="Logo" 
        style={logoStyle}
        onClick={() => navigate('/')}
        onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
        onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
      />

      {/* 버튼들 */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", // 반응형
        gap: "20px",
        width: "100%", 
        maxWidth: "800px"
      }}>
        {menuItems.map((item) => (
          <button 
            key={item.path}
            style={buttonStyle}
            onClick={() => navigate(item.path)}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#0059b3";
              e.target.style.transform = "scale(1.05)";
              e.target.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#004080";
              e.target.style.transform = "scale(1)";
              e.target.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// 로고 스타일
const logoStyle = {
  width: "250px", // 로고 크기 조정
  height: "auto",
  marginBottom: "20px",
  cursor: "pointer",
  transition: "transform 0.3s ease"
};

// 버튼 스타일
const buttonStyle = {
  padding: "20px 0",
  fontSize: "18px",
  backgroundColor: "#004080",
  color: "white",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  width: "100%",
  height: "70px",
  transition: "all 0.3s ease"
};

// 메뉴 항목
const menuItems = [
  { path: '/list', label: '명단' },
  { path: '/status', label: '상태' },
  { path: '/dice', label: '다이스' },
  { path: '/battle', label: '전투' }
];
