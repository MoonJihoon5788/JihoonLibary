import React, { useState, useEffect } from 'react';
import './App.css';
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
  const [isLoading, setIsLoading] = useState(true);

  const parseJWT = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('JWT 파싱 오류:', error);
      return null;
    }
  };

  const handleSetCurrentView = (view) => {
    setCurrentView(view);
    if (view !== 'login') {
      localStorage.setItem('currentView', view);
    } else {
      localStorage.removeItem('currentView');
    }
  };

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
    localStorage.removeItem('currentView');
    localStorage.removeItem('userRole');
    localStorage.removeItem('loginId');
    setToken(null);
    setUser(null);
    setCurrentView('login');
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedRefreshToken = localStorage.getItem('refreshToken');

      if (storedToken && storedRefreshToken) {
        console.log('저장된 토큰 발견, 유효성 검사 중...');

        try {
          const response = await fetch('http://localhost:8081/api/user/books?size=1', {
            headers: { 'Authorization': `Bearer ${storedToken}` }
          });

          if (response.ok) {
            console.log('토큰 유효함, 자동 로그인 처리');

            const userRole = localStorage.getItem('userRole') || 'USER';
            const loginId = localStorage.getItem('loginId') || 'unknown';

            console.log('localStorage에서 가져온 userRole:', userRole, 'loginId:', loginId);

            setToken(storedToken);
            setUser({ loginId, role: userRole });

            const savedView = localStorage.getItem('currentView');

            if (savedView) {
              const adminPages = ['admin', 'memberManagement', 'bookManagement', 'loanManagement'];

              if (adminPages.includes(savedView) && userRole !== 'ADMIN') {
                handleSetCurrentView('userBooks');
              } else if (userRole === 'ADMIN' && savedView === 'userBooks') {
                handleSetCurrentView(savedView);
              } else {
                handleSetCurrentView(savedView);
              }
            } else {
              handleSetCurrentView(userRole === 'ADMIN' ? 'admin' : 'userBooks');
            }

          } else if (response.status === 401) {
            console.log('토큰 만료, 갱신 시도...');

            const refreshResponse = await fetch('http://localhost:8081/api/auth/refresh', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken: storedRefreshToken })
            });

            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              console.log('토큰 갱신 성공');

              localStorage.setItem('token', refreshData.accessToken);
              localStorage.setItem('refreshToken', refreshData.refreshToken);

              setToken(refreshData.accessToken);
              setUser({ loginId: refreshData.loginId, role: refreshData.role });

              const savedView = localStorage.getItem('currentView');

              if (savedView) {
                const adminPages = ['admin', 'memberManagement', 'bookManagement', 'loanManagement'];

                if (adminPages.includes(savedView) && refreshData.role !== 'ADMIN') {
                  handleSetCurrentView('userBooks');
                } else {
                  handleSetCurrentView(savedView);
                }
              } else {
                handleSetCurrentView(refreshData.role === 'ADMIN' ? 'admin' : 'userBooks');
              }
            } else {
              console.log('토큰 갱신 실패, 로그인 화면으로 이동');
              localStorage.removeItem('token');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('currentView');
              localStorage.removeItem('userRole');
              localStorage.removeItem('loginId');
              setCurrentView('login');
            }
          } else {
            console.log('토큰 유효성 검사 실패');
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('currentView');
            localStorage.removeItem('userRole');
            localStorage.removeItem('loginId');
            setCurrentView('login');
          }
        } catch (error) {
          console.error('자동 로그인 처리 중 오류:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('currentView');
          localStorage.removeItem('userRole');
          localStorage.removeItem('loginId');
          setCurrentView('login');
        }
      } else {
        console.log('저장된 토큰 없음, 로그인 화면 표시');
        setCurrentView('login');
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  if (isLoading) {
    return (
        <div className="App">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <h3 className="loading-text">도서관 관리 시스템</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>로딩 중...</p>
          </div>
        </div>
    );
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'login':
        return (
            <Login
                setCurrentView={handleSetCurrentView}
                setUser={setUser}
                setToken={setToken}
            />
        );
      case 'admin':
        return (
            <AdminDashboard
                setCurrentView={handleSetCurrentView}
                logout={logout}
            />
        );
      case 'memberManagement':
        return (
            <MemberManagement
                setCurrentView={handleSetCurrentView}
                token={token}
            />
        );
      case 'bookManagement':
        return (
            <BookManagement
                setCurrentView={handleSetCurrentView}
                token={token}
            />
        );
      case 'loanManagement':
        return (
            <LoanManagement
                setCurrentView={handleSetCurrentView}
                token={token}
            />
        );
      case 'userBooks':
        return (
            <UserBooks
                setCurrentView={handleSetCurrentView}
                user={user}
                token={token}
                logout={logout}
            />
        );
      default:
        return (
            <Login
                setCurrentView={handleSetCurrentView}
                setUser={setUser}
                setToken={setToken}
            />
        );
    }
  };

  return (
      <div className="App">
        {renderCurrentView()}
      </div>
  );
};

export default App;