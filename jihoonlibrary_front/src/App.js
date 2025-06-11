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

  // currentView 변경 시 localStorage에 저장하는 헬퍼 함수
  const handleSetCurrentView = (view) => {
    setCurrentView(view);
    // login 페이지가 아닐 때만 저장 (로그아웃 시 login으로 가는 것은 저장하지 않음)
    if (view !== 'login') {
      localStorage.setItem('currentView', view);
    } else {
      localStorage.removeItem('currentView');
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
    localStorage.removeItem('currentView'); // currentView도 제거
    localStorage.removeItem('userRole'); // 역할 정보도 제거
    localStorage.removeItem('loginId'); // 로그인 ID도 제거
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

            // localStorage에서 사용자 정보 가져오기
            const userRole = localStorage.getItem('userRole') || 'USER';
            const loginId = localStorage.getItem('loginId') || 'unknown';

            console.log('localStorage에서 가져온 userRole:', userRole, 'loginId:', loginId);

            setToken(storedToken);
            setUser({ loginId, role: userRole });

            // 저장된 currentView가 있고, 권한이 맞으면 복원
            const savedView = localStorage.getItem('currentView');

            if (savedView) {
              // 관리자가 아닌데 관리자 페이지에 접근하려 하면 기본 페이지로
              const adminPages = ['admin', 'memberManagement', 'bookManagement', 'loanManagement'];

              if (adminPages.includes(savedView) && userRole !== 'ADMIN') {
                handleSetCurrentView('userBooks');
              } else if (userRole === 'ADMIN' && savedView === 'userBooks') {
                // 관리자인데 userBooks 페이지면 그대로 유지
                handleSetCurrentView(savedView);
              } else {
                // 권한이 맞으면 저장된 페이지로 복원
                handleSetCurrentView(savedView);
              }
            } else {
              // 저장된 페이지가 없으면 기본 페이지로
              handleSetCurrentView(userRole === 'ADMIN' ? 'admin' : 'userBooks');
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

              // 토큰 갱신 후에도 저장된 페이지 복원
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
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        {renderCurrentView()}
      </div>
  );
};

export default App;