import React, { useState, useEffect } from 'react';
import { apiCall, apiPost, apiPut, apiDelete } from '../utils/tokenRefresh';

const MemberManagement = ({ setCurrentView, token }) => {
    const [members, setMembers] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [editingMember, setEditingMember] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [newMember, setNewMember] = useState({
        loginId: '', password: '', name: '', phone: '', memo: '', role: 'USER'
    });

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const response = await apiCall('http://localhost:8081/api/admin/members');
            if (response.ok) {
                const data = await response.json();
                setMembers(data.content);
            }
        } catch (err) {
            console.error('회원 목록 조회 실패', err);
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await apiPost('http://localhost:8081/api/admin/members', newMember);

            if (response.ok) {
                fetchMembers();
                setShowAddForm(false);
                setNewMember({ loginId: '', password: '', name: '', phone: '', memo: '', role: 'USER' });
                setMessage('회원이 성공적으로 추가되었습니다.');
            } else {
                setMessage('회원 추가에 실패했습니다.');
            }
        } catch (err) {
            console.error('회원 추가 실패', err);
            setMessage('회원 추가 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleEditMember = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const updateData = {
                loginId: editingMember.loginId,
                phone: editingMember.phone,
                memo: editingMember.memo,
                role: editingMember.role
            };

            if (editingMember.password && editingMember.password.trim() !== '') {
                updateData.password = editingMember.password;
            }

            const response = await apiPut(`http://localhost:8081/api/admin/members/${editingMember.id}`, updateData);

            if (response.ok) {
                setMessage('회원이 성공적으로 수정되었습니다.');
                fetchMembers();
                setShowEditForm(false);
                setEditingMember(null);
                setSelectedMember(null);
            } else if (response.status === 404) {
                setMessage('수정하려는 회원을 찾을 수 없습니다.');
            } else {
                setMessage('회원 수정에 실패했습니다.');
            }
        } catch (err) {
            console.error('회원 수정 오류', err);
            setMessage('회원 수정 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const startEditMember = (member) => {
        setEditingMember({
            id: member.id,
            loginId: member.loginId,
            password: '',
            phone: member.phone,
            memo: member.memo,
            role: member.role
        });
        setShowEditForm(true);
        setShowAddForm(false);
    };

    const fetchMemberDetail = async (memberId) => {
        try {
            const response = await apiCall(`http://localhost:8081/api/admin/members/${memberId}`);
            if (response.ok) {
                const data = await response.json();
                setSelectedMember(data);
            }
        } catch (err) {
            console.error('회원 상세 조회 실패', err);
        }
    };

    const handleDeleteMember = async (memberId, memberName) => {
        if (!window.confirm(`정말로 "${memberName}" 회원을 삭제하시겠습니까?`)) {
            return;
        }

        setLoading(true);
        try {
            const response = await apiDelete(`http://localhost:8081/api/admin/members/${memberId}`);

            if (response.ok) {
                setMessage('회원이 성공적으로 삭제되었습니다.');
                fetchMembers();
                setSelectedMember(null);
            } else if (response.status === 404) {
                setMessage('삭제하려는 회원을 찾을 수 없습니다.');
            } else if (response.status === 400) {
                setMessage('대출 중인 도서가 있는 회원은 삭제할 수 없습니다.');
            } else {
                setMessage('회원 삭제에 실패했습니다.');
            }
        } catch (err) {
            console.error('회원 삭제 오류', err);
            setMessage('회원 삭제 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('ko-KR');
    };

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    return (
        <div className="main-content">
            <div className="content-wrapper fade-in">
                <div className="section-header">
                    <h3 className="section-title">👥 회원 관리</h3>
                    <div className="section-actions">
                        <button
                            onClick={() => { setShowAddForm(!showAddForm); setShowEditForm(false); }}
                            className="btn btn-primary"
                        >
                            회원 추가
                        </button>
                        <button onClick={() => setCurrentView('admin')} className="btn btn-outline">
                            돌아가기
                        </button>
                    </div>
                </div>

                {message && (
                    <div className={`message ${message.includes('성공') ? 'message-success' : 'message-error'}`}>
                        {message}
                    </div>
                )}

                {loading && (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p className="loading-text">처리 중...</p>
                    </div>
                )}

                {showAddForm && (
                    <div className="form-container">
                        <div className="form-header">
                            <h4 className="form-title">새 회원 추가</h4>
                        </div>
                        <form onSubmit={handleAddMember}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">아이디</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="아이디"
                                        value={newMember.loginId}
                                        onChange={(e) => setNewMember({...newMember, loginId: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">비밀번호</label>
                                    <input
                                        type="password"
                                        className="form-input"
                                        placeholder="비밀번호"
                                        value={newMember.password}
                                        onChange={(e) => setNewMember({...newMember, password: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">이름</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="이름"
                                        value={newMember.name}
                                        onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">전화번호</label>
                                    <input
                                        type="tel"
                                        className="form-input"
                                        placeholder="전화번호"
                                        value={newMember.phone}
                                        onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">메모</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="메모"
                                        value={newMember.memo}
                                        onChange={(e) => setNewMember({...newMember, memo: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">역할</label>
                                    <select
                                        className="form-input"
                                        value={newMember.role}
                                        onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                                    >
                                        <option value="USER">사용자</option>
                                        <option value="ADMIN">관리자</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? '추가 중...' : '추가'}
                                </button>
                                <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-ghost">
                                    취소
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {showEditForm && editingMember && (
                    <div className="form-container">
                        <div className="form-header">
                            <h4 className="form-title">회원 수정 (ID: {editingMember.id})</h4>
                        </div>
                        <form onSubmit={handleEditMember}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">아이디</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={editingMember.loginId}
                                        onChange={(e) => setEditingMember({...editingMember, loginId: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">새 비밀번호 (변경시에만 입력)</label>
                                    <input
                                        type="password"
                                        className="form-input"
                                        placeholder="새 비밀번호 (변경시에만 입력)"
                                        value={editingMember.password}
                                        onChange={(e) => setEditingMember({...editingMember, password: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">전화번호</label>
                                    <input
                                        type="tel"
                                        className="form-input"
                                        value={editingMember.phone}
                                        onChange={(e) => setEditingMember({...editingMember, phone: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">메모</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={editingMember.memo}
                                        onChange={(e) => setEditingMember({...editingMember, memo: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">역할</label>
                                    <select
                                        className="form-input"
                                        value={editingMember.role}
                                        onChange={(e) => setEditingMember({...editingMember, role: e.target.value})}
                                    >
                                        <option value="USER">사용자</option>
                                        <option value="ADMIN">관리자</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? '수정 중...' : '수정 완료'}
                                </button>
                                <button type="button" onClick={() => { setShowEditForm(false); setEditingMember(null); }} className="btn btn-ghost">
                                    취소
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="layout-sidebar">
                    <div>
                        <div className="card">
                            <div className="card-header">
                                <h4 className="card-title">회원 목록</h4>
                            </div>
                            <div className="table-container">
                                <div className="table-responsive">
                                    <table className="table">
                                        <thead>
                                        <tr>
                                            <th>아이디</th>
                                            <th>전화번호</th>
                                            <th>역할</th>
                                            <th>대출중</th>
                                            <th>관리</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {members.map(member => (
                                            <tr key={member.id}>
                                                <td>{member.loginId}</td>
                                                <td>{member.phone}</td>
                                                <td>
                                                        <span className={`badge ${member.role === 'ADMIN' ? 'badge-warning' : 'badge-info'}`}>
                                                            {member.role}
                                                        </span>
                                                </td>
                                                <td>
                                                    {member.currentLoans}권
                                                    {member.hasOverdueBooks && <span className="badge badge-danger" style={{marginLeft: 'var(--space-1)'}}>연체</span>}
                                                </td>
                                                <td>
                                                    <div className="table-actions">
                                                        <button
                                                            onClick={() => fetchMemberDetail(member.id)}
                                                            className="btn btn-sm btn-primary"
                                                            disabled={loading}
                                                        >
                                                            상세
                                                        </button>
                                                        <button
                                                            onClick={() => startEditMember(member)}
                                                            className="btn btn-sm btn-secondary"
                                                            disabled={loading}
                                                        >
                                                            수정
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteMember(member.id, member.loginId)}
                                                            className={`btn btn-sm ${member.currentLoans > 0 ? '' : 'btn-danger'}`}
                                                            disabled={member.currentLoans > 0 || loading}
                                                            title={member.currentLoans > 0 ? '대출 중인 도서가 있어 삭제할 수 없습니다' : '회원 삭제'}
                                                            style={{
                                                                backgroundColor: member.currentLoans > 0 ? 'var(--gray-400)' : '',
                                                                cursor: member.currentLoans > 0 || loading ? 'not-allowed' : 'pointer'
                                                            }}
                                                        >
                                                            삭제
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="sidebar">
                        {selectedMember ? (
                            <div>
                                <div className="sidebar-title">회원 상세 정보</div>

                                <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
                                    <div className="card-header">
                                        <h5 className="card-title">기본 정보</h5>
                                    </div>
                                    <p><strong>이름:</strong> {selectedMember.name}</p>
                                    <p><strong>아이디:</strong> {selectedMember.loginId}</p>
                                    <p><strong>전화번호:</strong> {selectedMember.phone}</p>
                                    <p><strong>메모:</strong> {selectedMember.memo}</p>
                                    <p><strong>역할:</strong>
                                        <span className={`badge ${selectedMember.role === 'ADMIN' ? 'badge-warning' : 'badge-info'}`} style={{marginLeft: 'var(--space-2)'}}>
                                            {selectedMember.role}
                                        </span>
                                    </p>

                                    <div className="form-actions" style={{ marginTop: 'var(--space-4)' }}>
                                        <button
                                            onClick={() => startEditMember(selectedMember)}
                                            className="btn btn-primary btn-sm"
                                            disabled={loading}
                                        >
                                            수정
                                        </button>
                                        <button
                                            onClick={() => handleDeleteMember(selectedMember.id, selectedMember.name)}
                                            className={`btn btn-sm ${selectedMember.currentLoans > 0 ? '' : 'btn-danger'}`}
                                            disabled={selectedMember.currentLoans > 0 || loading}
                                            style={{
                                                backgroundColor: selectedMember.currentLoans > 0 ? 'var(--gray-400)' : ''
                                            }}
                                        >
                                            삭제
                                        </button>
                                    </div>
                                </div>

                                <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
                                    <div className="card-header">
                                        <h5 className="card-title">대출 현황</h5>
                                    </div>
                                    <p><strong>현재 대출:</strong> {selectedMember.currentLoans}권</p>
                                    <p><strong>연체 도서:</strong> {selectedMember.overdueCount}권</p>
                                    <p><strong>회원 상태:</strong>
                                        <span className={`badge ${
                                            selectedMember.memberStatus === '정상' ? 'badge-success' :
                                                selectedMember.memberStatus === '연체중' ? 'badge-danger' : 'badge-warning'
                                        }`} style={{marginLeft: 'var(--space-2)'}}>
                                            {selectedMember.memberStatus}
                                        </span>
                                    </p>
                                    <p><strong>총 대출 횟수:</strong> {selectedMember.totalLoanCount}회</p>
                                </div>

                                {selectedMember.currentLoanList && selectedMember.currentLoanList.length > 0 && (
                                    <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
                                        <div className="card-header">
                                            <h5 className="card-title">현재 대출 중인 도서</h5>
                                        </div>
                                        <div>
                                            {selectedMember.currentLoanList.map(loan => (
                                                <div key={loan.id} className={`card ${loan.isOverdue ? 'message-error' : 'message-info'}`} style={{
                                                    marginBottom: 'var(--space-3)',
                                                    padding: 'var(--space-3)'
                                                }}>
                                                    <p style={{ margin: 0, fontWeight: 'var(--font-semibold)' }}>{loan.bookTitle}</p>
                                                    <p style={{ margin: 'var(--space-1) 0 0 0', fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
                                                        저자: {loan.bookAuthor} |
                                                        대출일: {formatDate(loan.loanDate)} |
                                                        반납예정: {formatDate(loan.returnDate)}
                                                    </p>
                                                    <p style={{ margin: 'var(--space-1) 0 0 0', fontSize: 'var(--font-sm)' }}>
                                                        상태: <span className={`badge ${loan.isOverdue ? 'badge-danger' : 'badge-info'}`}>
                                                            {loan.statusDescription}
                                                        </span>
                                                        {loan.isOverdue && <span className="badge badge-danger" style={{marginLeft: 'var(--space-1)'}}>연체!</span>}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedMember.loanHistory && selectedMember.loanHistory.length > 0 && (
                                    <div className="card">
                                        <div className="card-header">
                                            <h5 className="card-title">전체 대출 이력</h5>
                                        </div>
                                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                            <table className="table" style={{ fontSize: 'var(--font-xs)' }}>
                                                <thead>
                                                <tr>
                                                    <th>도서명</th>
                                                    <th>저자</th>
                                                    <th>대출일</th>
                                                    <th>반납예정</th>
                                                    <th>실제반납</th>
                                                    <th>상태</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {selectedMember.loanHistory.map(loan => (
                                                    <tr key={loan.id} style={{
                                                        backgroundColor: loan.isOverdue ? 'rgba(231, 76, 60, 0.1)' : 'white'
                                                    }}>
                                                        <td>{loan.bookTitle}</td>
                                                        <td>{loan.bookAuthor}</td>
                                                        <td>{formatDate(loan.loanDate)}</td>
                                                        <td>{formatDate(loan.returnDate)}</td>
                                                        <td>{formatDate(loan.realReturnDate)}</td>
                                                        <td>
                                                                <span className={`badge ${
                                                                    loan.status === 'R' ? 'badge-success' :
                                                                        loan.status === 'O' ? 'badge-danger' : 'badge-info'
                                                                }`}>
                                                                    {loan.statusDescription}
                                                                </span>
                                                            {loan.isOverdue && loan.status !== 'R' && (
                                                                <span className="badge badge-danger" style={{marginLeft: 'var(--space-1)'}}>연체</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {(!selectedMember.loanHistory || selectedMember.loanHistory.length === 0) && (
                                    <div className="empty-state" style={{ padding: 'var(--space-6)' }}>
                                        <div className="empty-state-icon">📋</div>
                                        <p className="empty-state-description">대출 이력이 없습니다.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                                <div className="empty-state-icon">👤</div>
                                <h4 className="empty-state-title">회원을 선택하세요</h4>
                                <p className="empty-state-description">
                                    회원을 선택하면 상세 정보가 표시됩니다.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemberManagement;