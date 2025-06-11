import React, { useState } from 'react';

const Login = ({ setCurrentView, setUser, setToken }) => {
    const [loginData, setLoginData] = useState({ loginId: '', password: '' });
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8081/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData)
            });

            if (response.ok) {
                const data = await response.json();
                setToken(data.accessToken);
                localStorage.setItem('token', data.accessToken);
                localStorage.setItem('refreshToken', data.refreshToken);
                localStorage.setItem('userRole', data.role); // 역할 정보 저장
                localStorage.setItem('loginId', data.loginId); // 로그인 ID도 저장
                setUser({ loginId: data.loginId, role: data.role });

                if (data.role === 'ADMIN') {
                    setCurrentView('admin');
                } else {
                    setCurrentView('userBooks');
                }
            } else {
                setError('로그인 실패');
            }
        } catch (err) {
            setError('서버 연결 오류');
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
            <h2>도서관 로그인</h2>
            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
            <form onSubmit={handleLogin}>
                <div style={{ marginBottom: '10px' }}>
                    <label>아이디:</label>
                    <input
                        type="text"
                        value={loginData.loginId}
                        onChange={(e) => setLoginData({...loginData, loginId: e.target.value})}
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                        required
                    />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label>비밀번호:</label>
                    <input
                        type="password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                        required
                    />
                </div>
                <button type="submit" style={{ width: '100%', padding: '10px' }}>로그인</button>
            </form>
            <div style={{ marginTop: '10px', textAlign: 'center', fontSize: '14px', color: '#666' }}>
                <p>테스트 계정:</p>
                <p>관리자: jihun5788 / jihun1</p>
                <p>사용자: user01 / user123</p>
            </div>
        </div>
    );
};

export default Login;