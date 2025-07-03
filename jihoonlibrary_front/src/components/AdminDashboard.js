import React from 'react';

const AdminDashboard = ({ setCurrentView, logout }) => {
    return (
        <div className="admin-dashboard">
            <div className="admin-header slide-up">
                <h2 className="admin-title">관리자 대시보드</h2>
                <button onClick={logout} className="btn btn-outline">로그아웃</button>
            </div>

            <div className="dashboard-grid">
                <div
                    className="dashboard-card bounce-in"
                    onClick={() => setCurrentView('memberManagement')}
                    style={{ animationDelay: '0.1s' }}
                >
                    <div className="dashboard-card-icon"></div>
                    <h3 className="dashboard-card-title">회원 관리</h3>
                    <p className="dashboard-card-description">
                        회원 정보를 관리하고 대출 현황을 확인하세요
                    </p>
                </div>

                <div
                    className="dashboard-card bounce-in"
                    onClick={() => setCurrentView('bookManagement')}
                    style={{ animationDelay: '0.2s' }}
                >
                    <div className="dashboard-card-icon"></div>
                    <h3 className="dashboard-card-title">도서 관리</h3>
                    <p className="dashboard-card-description">
                        도서를 추가, 수정, 삭제하고 재고를 관리하세요
                    </p>
                </div>

                <div
                    className="dashboard-card bounce-in"
                    onClick={() => setCurrentView('loanManagement')}
                    style={{ animationDelay: '0.3s' }}
                >
                    <div className="dashboard-card-icon"></div>
                    <h3 className="dashboard-card-title">대출/반납 관리</h3>
                    <p className="dashboard-card-description">
                        도서 대출과 반납 업무를 처리하세요
                    </p>
                </div>
            </div>

            <div className="decorative-books"></div>
        </div>
    );
};

export default AdminDashboard;