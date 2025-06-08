import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import MemberManagement from './components/MemberManagement';
import BookManagement from './components/BookManagement';
import LoanManagement from './components/LoanManagement';
import UserBooks from './components/UserBooks';

const App = () => {
  const [currentView, setCurrentView] = useState('login');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // 로그아웃 함수
  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await fetch('http://localhost:8081/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });
      }
    } catch (err) {
      console.error('로그아웃 요청 실패', err);
    }

    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setUser(null);
    setCurrentView('login');
  };

  // 초기 로드시 토큰 확인
  useEffect(() => {
    if (token) {
      setCurrentView('userBooks');
    }
  }, []);

  // 현재 뷰에 따라 컴포넌트 렌더링
  const renderCurrentView = () => {
    switch (currentView) {
      case 'login':
        return (
            <Login
                setCurrentView={setCurrentView}
                setUser={setUser}
                setToken={setToken}
            />
        );
      case 'admin':
        return (
            <AdminDashboard
                setCurrentView={setCurrentView}
                logout={logout}
            />
        );
      case 'memberManagement':
        return (
            <MemberManagement
                setCurrentView={setCurrentView}
                token={token}
            />
        );
      case 'bookManagement':
        return (
            <BookManagement
                setCurrentView={setCurrentView}
                token={token}
            />
        );
      case 'loanManagement':
        return (
            <LoanManagement
                setCurrentView={setCurrentView}
                token={token}
            />
        );
      case 'userBooks':
        return (
            <UserBooks
                setCurrentView={setCurrentView}
                user={user}
                token={token}
                logout={logout}
            />
        );
      default:
        return (
            <Login
                setCurrentView={setCurrentView}
                setUser={setUser}
                setToken={setToken}
            />
        );
    }
  };

  return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        {renderCurrentView()}
      </div>
  );
};

export default App;