import React, { useState, useEffect } from 'react';
import { apiPost } from '../utils/tokenRefresh';

const LoanManagement = ({ setCurrentView, token }) => {
    const [loanRequest, setLoanRequest] = useState({ bookId: '', memberId: '' });
    const [returnRequest, setReturnRequest] = useState({ bookId: '', memberId: '' });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLoan = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await apiPost('http://localhost:8081/api/admin/loans', {
                bookId: parseInt(loanRequest.bookId),
                memberId: parseInt(loanRequest.memberId)
            });

            if (response.ok) {
                setMessage('대출이 완료되었습니다.');
                setLoanRequest({ bookId: '', memberId: '' });
            } else {
                const errorText = await response.text();
                setMessage(`대출 실패: ${errorText || '알 수 없는 오류'}`);
            }
        } catch (err) {
            console.error('대출 처리 중 오류:', err);
            setMessage('대출 처리 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleReturn = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await apiPost('http://localhost:8081/api/admin/returns', {
                bookId: parseInt(returnRequest.bookId),
                memberId: parseInt(returnRequest.memberId)
            });

            if (response.ok) {
                setMessage('반납이 완료되었습니다.');
                setReturnRequest({ bookId: '', memberId: '' });
            } else {
                const errorText = await response.text();
                setMessage(`반납 실패: ${errorText || '알 수 없는 오류'}`);
            }
        } catch (err) {
            console.error('반납 처리 중 오류:', err);
            setMessage('반납 처리 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 메시지 자동 삭제
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>대출/반납 관리</h3>
                <button onClick={() => setCurrentView('admin')} style={{ padding: '8px 16px' }}>
                    돌아가기
                </button>
            </div>

            {/* 메시지 표시 */}
            {message && (
                <div style={{
                    padding: '10px',
                    marginBottom: '20px',
                    backgroundColor: message.includes('완료') ? '#d4edda' : '#f8d7da',
                    border: `1px solid ${message.includes('완료') ? '#c3e6cb' : '#f5c6cb'}`,
                    color: message.includes('완료') ? '#155724' : '#721c24',
                    borderRadius: '4px'
                }}>
                    {message}
                </div>
            )}

            {/* 로딩 표시 */}
            {loading && (
                <div style={{ textAlign: 'center', padding: '10px', color: '#666' }}>
                    처리 중...
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                {/* 대출 폼 */}
                <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
                    <h4>도서 대출</h4>
                    <form onSubmit={handleLoan}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                도서 ID:
                            </label>
                            <input
                                type="number"
                                value={loanRequest.bookId}
                                onChange={(e) => setLoanRequest({...loanRequest, bookId: e.target.value})}
                                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                required
                                disabled={loading}
                                min="1"
                            />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                회원 ID:
                            </label>
                            <input
                                type="number"
                                value={loanRequest.memberId}
                                onChange={(e) => setLoanRequest({...loanRequest, memberId: e.target.value})}
                                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                required
                                disabled={loading}
                                min="1"
                            />
                        </div>
                        <button
                            type="submit"
                            style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: loading ? '#cccccc' : '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '16px',
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                            disabled={loading}
                        >
                            {loading ? '처리 중...' : '대출 처리'}
                        </button>
                    </form>
                </div>

                {/* 반납 폼 */}
                <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
                    <h4>도서 반납</h4>
                    <form onSubmit={handleReturn}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                도서 ID:
                            </label>
                            <input
                                type="number"
                                value={returnRequest.bookId}
                                onChange={(e) => setReturnRequest({...returnRequest, bookId: e.target.value})}
                                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                required
                                disabled={loading}
                                min="1"
                            />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                회원 ID:
                            </label>
                            <input
                                type="number"
                                value={returnRequest.memberId}
                                onChange={(e) => setReturnRequest({...returnRequest, memberId: e.target.value})}
                                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                required
                                disabled={loading}
                                min="1"
                            />
                        </div>
                        <button
                            type="submit"
                            style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: loading ? '#cccccc' : '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '16px',
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                            disabled={loading}
                        >
                            {loading ? '처리 중...' : '반납 처리'}
                        </button>
                    </form>
                </div>
            </div>

            {/* 사용 안내 */}
            <div style={{
                marginTop: '30px',
                padding: '15px',
                backgroundColor: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '8px'
            }}>
                <h5 style={{ marginTop: 0, color: '#495057' }}>사용 안내</h5>
                <ul style={{ marginBottom: 0, color: '#6c757d' }}>
                    <li>도서 ID와 회원 ID는 숫자로 입력해주세요.</li>
                    <li>대출: 해당 도서가 대출 가능한 상태여야 합니다.</li>
                    <li>반납: 해당 회원이 해당 도서를 대출 중이어야 합니다.</li>
                    <li>연체된 도서가 있는 회원은 새로운 대출이 제한됩니다.</li>
                    <li>최대 2권까지 동시 대출이 가능합니다.</li>
                </ul>
            </div>
        </div>
    );
};

export default LoanManagement;