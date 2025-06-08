import React, { useState, useEffect } from 'react';

const MemberManagement = ({ setCurrentView, token }) => {
    const [members, setMembers] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false); // 수정 폼 표시 상태
    const [selectedMember, setSelectedMember] = useState(null);
    const [editingMember, setEditingMember] = useState(null); // 수정 중인 회원
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
            const response = await fetch('http://localhost:8081/api/admin/members', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
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
        try {
            const response = await fetch('http://localhost:8081/api/admin/members', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newMember)
            });

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
        }
    };

    // 회원 수정 함수 추가
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

            // 비밀번호가 입력되었을 때만 포함
            if (editingMember.password && editingMember.password.trim() !== '') {
                updateData.password = editingMember.password;
            }

            const response = await fetch(`http://localhost:8081/api/admin/members/${editingMember.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                setMessage('회원이 성공적으로 수정되었습니다.');
                fetchMembers(); // 목록 새로고침
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

    // 수정 모드 시작
    const startEditMember = (member) => {
        setEditingMember({
            id: member.id,
            loginId: member.loginId,
            password: '', // 비밀번호는 비워둠 (선택적 수정)
            phone: member.phone,
            memo: member.memo,
            role: member.role
        });
        setShowEditForm(true);
        setShowAddForm(false);
    };

    const fetchMemberDetail = async (memberId) => {
        try {
            const response = await fetch(`http://localhost:8081/api/admin/members/${memberId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                console.log('회원 상세 데이터:', data);
                setSelectedMember(data);
            }
        } catch (err) {
            console.error('회원 상세 조회 실패', err);
        }
    };

    // 회원 삭제 함수 추가
    const handleDeleteMember = async (memberId, memberName) => {
        if (!window.confirm(`정말로 "${memberName}" 회원을 삭제하시겠습니까?`)) {
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8081/api/admin/members/${memberId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

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

    // 날짜 포맷팅 함수
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
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>회원 관리</h3>
                <div>
                    <button onClick={() => { setShowAddForm(!showAddForm); setShowEditForm(false); }} style={{ marginRight: '10px', padding: '8px 16px' }}>
                        회원 추가
                    </button>
                    <button onClick={() => setCurrentView('admin')} style={{ padding: '8px 16px' }}>
                        돌아가기
                    </button>
                </div>
            </div>

            {message && (
                <div style={{
                    padding: '10px',
                    marginBottom: '20px',
                    backgroundColor: message.includes('성공') ? '#d4edda' : '#f8d7da',
                    border: `1px solid ${message.includes('성공') ? '#c3e6cb' : '#f5c6cb'}`,
                    color: message.includes('성공') ? '#155724' : '#721c24',
                    borderRadius: '4px'
                }}>
                    {message}
                </div>
            )}

            {loading && (
                <div style={{ textAlign: 'center', padding: '10px', color: '#666' }}>
                    처리 중...
                </div>
            )}

            {/* 회원 추가 폼 */}
            {showAddForm && (
                <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc' }}>
                    <h4>새 회원 추가</h4>
                    <form onSubmit={handleAddMember}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                            <input
                                type="text"
                                placeholder="아이디"
                                value={newMember.loginId}
                                onChange={(e) => setNewMember({...newMember, loginId: e.target.value})}
                                required
                            />
                            <input
                                type="password"
                                placeholder="비밀번호"
                                value={newMember.password}
                                onChange={(e) => setNewMember({...newMember, password: e.target.value})}
                                required
                            />
                            <input
                                type="text"
                                placeholder="이름"
                                value={newMember.name}
                                onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                                required
                            />
                            <input
                                type="tel"
                                placeholder="전화번호"
                                value={newMember.phone}
                                onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                                required
                            />
                            <input
                                type="text"
                                placeholder="메모"
                                value={newMember.memo}
                                onChange={(e) => setNewMember({...newMember, memo: e.target.value})}
                            />
                            <select
                                value={newMember.role}
                                onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                            >
                                <option value="USER">사용자</option>
                                <option value="ADMIN">관리자</option>
                            </select>
                        </div>
                        <div style={{ marginTop: '10px' }}>
                            <button type="submit" style={{ marginRight: '10px' }}>추가</button>
                            <button type="button" onClick={() => setShowAddForm(false)}>취소</button>
                        </div>
                    </form>
                </div>
            )}

            {/* 회원 수정 폼 */}
            {showEditForm && editingMember && (
                <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #007bff', backgroundColor: '#f0f8ff' }}>
                    <h4>회원 수정 (ID: {editingMember.id})</h4>
                    <form onSubmit={handleEditMember}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                            <input
                                type="text"
                                placeholder="아이디"
                                value={editingMember.loginId}
                                onChange={(e) => setEditingMember({...editingMember, loginId: e.target.value})}
                                required
                            />
                            <input
                                type="password"
                                placeholder="새 비밀번호 (변경시에만 입력)"
                                value={editingMember.password}
                                onChange={(e) => setEditingMember({...editingMember, password: e.target.value})}
                            />
                            <input
                                type="tel"
                                placeholder="전화번호"
                                value={editingMember.phone}
                                onChange={(e) => setEditingMember({...editingMember, phone: e.target.value})}
                                required
                            />
                            <input
                                type="text"
                                placeholder="메모"
                                value={editingMember.memo}
                                onChange={(e) => setEditingMember({...editingMember, memo: e.target.value})}
                            />
                            <select
                                value={editingMember.role}
                                onChange={(e) => setEditingMember({...editingMember, role: e.target.value})}
                            >
                                <option value="USER">사용자</option>
                                <option value="ADMIN">관리자</option>
                            </select>
                        </div>
                        <div style={{ marginTop: '10px' }}>
                            <button type="submit" style={{ marginRight: '10px', backgroundColor: '#007bff', color: 'white' }} disabled={loading}>
                                {loading ? '수정 중...' : '수정 완료'}
                            </button>
                            <button type="button" onClick={() => { setShowEditForm(false); setEditingMember(null); }}>취소</button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                <div>
                    <h4>회원 목록</h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                        <tr style={{ backgroundColor: '#f5f5f5' }}>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>아이디</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>전화번호</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>역할</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>대출중</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>관리</th>
                        </tr>
                        </thead>
                        <tbody>
                        {members.map(member => (
                            <tr key={member.id}>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{member.loginId}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{member.phone}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{member.role}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                    {member.currentLoans}권
                                    {member.hasOverdueBooks && <span style={{ color: 'red' }}> (연체)</span>}
                                </td>
                                <td style={{ border: '1px solid #ddd', padding: '6px' }}>
                                    <button
                                        onClick={() => fetchMemberDetail(member.id)}
                                        style={{ marginRight: '3px', padding: '3px 6px', fontSize: '12px' }}
                                        disabled={loading}
                                    >
                                        상세
                                    </button>
                                    <button
                                        onClick={() => startEditMember(member)}
                                        style={{ marginRight: '3px', padding: '3px 6px', fontSize: '12px', backgroundColor: '#007bff', color: 'white' }}
                                        disabled={loading}
                                    >
                                        수정
                                    </button>
                                    <button
                                        onClick={() => handleDeleteMember(member.id, member.loginId)}
                                        style={{
                                            padding: '3px 6px',
                                            fontSize: '12px',
                                            backgroundColor: member.currentLoans > 0 ? '#cccccc' : '#ff4444',
                                            color: 'white',
                                            cursor: member.currentLoans > 0 || loading ? 'not-allowed' : 'pointer'
                                        }}
                                        disabled={member.currentLoans > 0 || loading}
                                        title={member.currentLoans > 0 ? '대출 중인 도서가 있어 삭제할 수 없습니다' : '회원 삭제'}
                                    >
                                        삭제
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                <div>
                    {selectedMember && (
                        <div>
                            <h4>회원 상세 정보</h4>
                            <div style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '15px' }}>
                                <h5 style={{ marginTop: 0, color: '#333' }}>기본 정보</h5>
                                <p><strong>이름:</strong> {selectedMember.name}</p>
                                <p><strong>아이디:</strong> {selectedMember.loginId}</p>
                                <p><strong>전화번호:</strong> {selectedMember.phone}</p>
                                <p><strong>메모:</strong> {selectedMember.memo}</p>
                                <p><strong>역할:</strong> {selectedMember.role}</p>

                                <div style={{ marginTop: '15px' }}>
                                    <button
                                        onClick={() => startEditMember(selectedMember)}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#007bff',
                                            color: 'white',
                                            marginRight: '10px'
                                        }}
                                        disabled={loading}
                                    >
                                        수정
                                    </button>
                                    <button
                                        onClick={() => handleDeleteMember(selectedMember.id, selectedMember.name)}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: selectedMember.currentLoans > 0 ? '#cccccc' : '#ff4444',
                                            color: 'white',
                                            cursor: selectedMember.currentLoans > 0 || loading ? 'not-allowed' : 'pointer'
                                        }}
                                        disabled={selectedMember.currentLoans > 0 || loading}
                                    >
                                        삭제
                                    </button>
                                </div>
                            </div>

                            <div style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '15px' }}>
                                <h5 style={{ marginTop: 0, color: '#333' }}>대출 현황</h5>
                                <p><strong>현재 대출:</strong> {selectedMember.currentLoans}권</p>
                                <p><strong>연체 도서:</strong> {selectedMember.overdueCount}권</p>
                                <p><strong>회원 상태:</strong>
                                    <span style={{
                                        color: selectedMember.memberStatus === '정상' ? 'green' :
                                            selectedMember.memberStatus === '연체중' ? 'red' : 'orange',
                                        marginLeft: '5px'
                                    }}>
                    {selectedMember.memberStatus}
                  </span>
                                </p>
                                <p><strong>총 대출 횟수:</strong> {selectedMember.totalLoanCount}회</p>
                            </div>

                            {selectedMember.currentLoanList && selectedMember.currentLoanList.length > 0 && (
                                <div style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '15px' }}>
                                    <h5 style={{ marginTop: 0, color: '#333' }}>현재 대출 중인 도서</h5>
                                    <div>
                                        {selectedMember.currentLoanList.map(loan => (
                                            <div key={loan.id} style={{
                                                marginBottom: '10px',
                                                padding: '10px',
                                                backgroundColor: loan.isOverdue ? '#ffe6e6' : '#f0f8ff',
                                                border: '1px solid #ddd',
                                                borderRadius: '4px'
                                            }}>
                                                <p style={{ margin: 0, fontWeight: 'bold' }}>{loan.bookTitle}</p>
                                                <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
                                                    저자: {loan.bookAuthor} |
                                                    대출일: {formatDate(loan.loanDate)} |
                                                    반납예정: {formatDate(loan.returnDate)}
                                                </p>
                                                <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>
                                                    상태: <span style={{ color: loan.isOverdue ? 'red' : 'blue' }}>
                            {loan.statusDescription}
                          </span>
                                                    {loan.isOverdue && <span style={{ color: 'red' }}> (연체!)</span>}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedMember.loanHistory && selectedMember.loanHistory.length > 0 && (
                                <div style={{ border: '1px solid #ddd', padding: '15px' }}>
                                    <h5 style={{ marginTop: 0, color: '#333' }}>전체 대출 이력</h5>
                                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                            <thead>
                                            <tr style={{ backgroundColor: '#f5f5f5', position: 'sticky', top: 0 }}>
                                                <th style={{ border: '1px solid #ddd', padding: '8px' }}>도서명</th>
                                                <th style={{ border: '1px solid #ddd', padding: '8px' }}>저자</th>
                                                <th style={{ border: '1px solid #ddd', padding: '8px' }}>대출일</th>
                                                <th style={{ border: '1px solid #ddd', padding: '8px' }}>반납예정</th>
                                                <th style={{ border: '1px solid #ddd', padding: '8px' }}>실제반납</th>
                                                <th style={{ border: '1px solid #ddd', padding: '8px' }}>상태</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {selectedMember.loanHistory.map(loan => (
                                                <tr key={loan.id} style={{
                                                    backgroundColor: loan.isOverdue ? '#ffe6e6' : 'white'
                                                }}>
                                                    <td style={{ border: '1px solid #ddd', padding: '6px' }}>{loan.bookTitle}</td>
                                                    <td style={{ border: '1px solid #ddd', padding: '6px' }}>{loan.bookAuthor}</td>
                                                    <td style={{ border: '1px solid #ddd', padding: '6px' }}>{formatDate(loan.loanDate)}</td>
                                                    <td style={{ border: '1px solid #ddd', padding: '6px' }}>{formatDate(loan.returnDate)}</td>
                                                    <td style={{ border: '1px solid #ddd', padding: '6px' }}>{formatDate(loan.realReturnDate)}</td>
                                                    <td style={{ border: '1px solid #ddd', padding: '6px' }}>
                              <span style={{
                                  color: loan.status === 'R' ? 'green' :
                                      loan.status === 'O' ? 'red' : 'blue'
                              }}>
                                {loan.statusDescription}
                              </span>
                                                        {loan.isOverdue && loan.status !== 'R' && (
                                                            <span style={{ color: 'red' }}> (연체)</span>
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
                                <div style={{ border: '1px solid #ddd', padding: '15px', textAlign: 'center', color: '#666' }}>
                                    <p>대출 이력이 없습니다.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {!selectedMember && (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                            <p>회원을 선택하면 상세 정보가 표시됩니다.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MemberManagement;