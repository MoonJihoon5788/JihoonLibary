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
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태 추가

  // JWT 토큰에서 사용자 정보 파싱
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

  // 초기 로드시 토큰 확인 및 자동 로그인
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedRefreshToken = localStorage.getItem('refreshToken');

      if (storedToken && storedRefreshToken) {
        console.log('저장된 토큰 발견, 유효성 검사 중...');

        try {
          // 간단한 API 호출로 토큰 유효성 검사
          const response = await fetch('http://localhost:8081/api/user/books?size=1', {
            headers: { 'Authorization': `Bearer ${storedToken}` }
          });

          if (response.ok) {
            console.log('토큰 유효함, 자동 로그인 처리');

            // JWT에서 사용자 정보 추출 (선택사항)
            const payload = parseJWT(storedToken);
            const userRole = payload?.role || 'USER'; // JWT에 역할 정보가 있다면
            const loginId = payload?.sub || 'unknown'; // JWT의 subject에서 사용자 ID

            setToken(storedToken);
            setUser({ loginId, role: userRole });

            // 사용자 역할에 따라 적절한 화면으로 이동
            if (userRole === 'ADMIN') {
              setCurrentView('admin');
            } else {
              setCurrentView('userBooks');
            }
          } else if (response.status === 401) {
            console.log('토큰 만료, 갱신 시도...');

            // 토큰 갱신 시도
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

              if (refreshData.role === 'ADMIN') {
                setCurrentView('admin');
              } else {
                setCurrentView('userBooks');
              }
            } else {
              console.log('토큰 갱신 실패, 로그인 화면으로 이동');
              localStorage.removeItem('token');
              localStorage.removeItem('refreshToken');
              setCurrentView('login');
            }
          } else {
            console.log('토큰 유효성 검사 실패');
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            setCurrentView('login');
          }
        } catch (error) {
          console.error('자동 로그인 처리 중 오류:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          setCurrentView('login');
        }
      } else {
        console.log('저장된 토큰 없음, 로그인 화면 표시');
        setCurrentView('login');
      }

      setIsLoading(false); // 로딩 완료
    };

    initializeAuth();
  }, []);

  // 로딩 화면
  if (isLoading) {
    return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f5f5f5'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h3>도서관 관리 시스템</h3>
            <p>로딩 중...</p>
          </div>
        </div>
    );
  }

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