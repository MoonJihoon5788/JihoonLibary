import React, { useState } from 'react';

const LoanManagement = ({ setCurrentView, token }) => {
    const [loanRequest, setLoanRequest] = useState({ bookId: '', memberId: '' });
    const [returnRequest, setReturnRequest] = useState({ bookId: '', memberId: '' });
    const [message, setMessage] = useState('');

    const handleLoan = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8081/api/admin/loans', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    bookId: parseInt(loanRequest.bookId),
                    memberId: parseInt(loanRequest.memberId)
                })
            });

            if (response.ok) {
                setMessage('대출이 완료되었습니다.');
                setLoanRequest({ bookId: '', memberId: '' });
            } else {
                setMessage('대출 실패');
            }
        } catch (err) {
            setMessage('대출 처리 중 오류 발생');
        }
    };

    const handleReturn = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8081/api/admin/returns', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    bookId: parseInt(returnRequest.bookId),
                    memberId: parseInt(returnRequest.memberId)
                })
            });

            if (response.ok) {
                setMessage('반납이 완료되었습니다.');
                setReturnRequest({ bookId: '', memberId: '' });
            } else {
                setMessage('반납 실패');
            }
        } catch (err) {
            setMessage('반납 처리 중 오류 발생');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>대출/반납 관리</h3>
                <button onClick={() => setCurrentView('admin')} style={{ padding: '8px 16px' }}>
                    돌아가기
                </button>
            </div>

            {message && (
                <div style={{ padding: '10px', marginBottom: '20px', backgroundColor: '#e7f3ff', border: '1px solid #b3d9ff' }}>
                    {message}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                {/* 대출 폼 */}
                <div style={{ padding: '20px', border: '1px solid #ddd' }}>
                    <h4>도서 대출</h4>
                    <form onSubmit={handleLoan}>
                        <div style={{ marginBottom: '15px' }}>
                            <label>도서 ID:</label>
                            <input
                                type="number"
                                value={loanRequest.bookId}
                                onChange={(e) => setLoanRequest({...loanRequest, bookId: e.target.value})}
                                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                                required
                            />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label>회원 ID:</label>
                            <input
                                type="number"
                                value={loanRequest.memberId}
                                onChange={(e) => setLoanRequest({...loanRequest, memberId: e.target.value})}
                                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                                required
                            />
                        </div>
                        <button type="submit" style={{ width: '100%', padding: '10px' }}>대출 처리</button>
                    </form>
                </div>

                {/* 반납 폼 */}
                <div style={{ padding: '20px', border: '1px solid #ddd' }}>
                    <h4>도서 반납</h4>
                    <form onSubmit={handleReturn}>
                        <div style={{ marginBottom: '15px' }}>
                            <label>도서 ID:</label>
                            <input
                                type="number"
                                value={returnRequest.bookId}
                                onChange={(e) => setReturnRequest({...returnRequest, bookId: e.target.value})}
                                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                                required
                            />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label>회원 ID:</label>
                            <input
                                type="number"
                                value={returnRequest.memberId}
                                onChange={(e) => setReturnRequest({...returnRequest, memberId: e.target.value})}
                                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                                required
                            />
                        </div>
                        <button type="submit" style={{ width: '100%', padding: '10px' }}>반납 처리</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoanManagement;