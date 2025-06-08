import React from 'react';

const AdminDashboard = ({ setCurrentView, logout }) => {
    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>관리자 대시보드</h2>
                <button onClick={logout} style={{ padding: '8px 16px' }}>로그아웃</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                <button
                    onClick={() => setCurrentView('memberManagement')}
                    style={{ padding: '20px', fontSize: '16px' }}
                >
                    회원 관리
                </button>
                <button
                    onClick={() => setCurrentView('bookManagement')}
                    style={{ padding: '20px', fontSize: '16px' }}
                >
                    도서 관리
                </button>
                <button
                    onClick={() => setCurrentView('loanManagement')}
                    style={{ padding: '20px', fontSize: '16px' }}
                >
                    대출/반납 관리
                </button>
            </div>
        </div>
    );
};

export default AdminDashboard;