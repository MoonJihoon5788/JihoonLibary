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
                localStorage.setItem('userRole', data.role);
                localStorage.setItem('loginId', data.loginId);
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
        <div className="login-container">
            <div className="login-card fade-in">
                <div className="login-header">
                    <h2 className="login-title">도서관 로그인</h2>
                    <p className="login-subtitle">계정으로 로그인하세요</p>
                </div>

                {error && <div className="login-error">{error}</div>}

                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label className="form-label">아이디:</label>
                        <input
                            type="text"
                            className="form-input"
                            value={loginData.loginId}
                            onChange={(e) => setLoginData({...loginData, loginId: e.target.value})}
                            placeholder="아이디를 입력하세요"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">비밀번호:</label>
                        <input
                            type="password"
                            className="form-input"
                            value={loginData.password}
                            onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                            placeholder="비밀번호를 입력하세요"
                            required
                        />
                    </div>
                    <button type="submit" className="login-btn">로그인</button>
                </form>
            </div>
        </div>
    );
};

export default Login;