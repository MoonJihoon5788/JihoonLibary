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

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    return (
        <div className="main-content">
            <div className="content-wrapper fade-in">
                <div className="section-header">
                    <h3 className="section-title">🔄 대출/반납 관리</h3>
                    <div className="section-actions">
                        <button onClick={() => setCurrentView('admin')} className="btn btn-outline">
                            돌아가기
                        </button>
                    </div>
                </div>

                {message && (
                    <div className={`message ${message.includes('완료') ? 'message-success' : 'message-error'}`}>
                        {message}
                    </div>
                )}

                {loading && (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p className="loading-text">처리 중...</p>
                    </div>
                )}

                <div className="grid grid-cols-2">
                    {/* 대출 폼 */}
                    <div className="form-container slide-up" style={{ animationDelay: '0.1s' }}>
                        <div className="form-header">
                            <h4 className="form-title">📤 도서 대출</h4>
                        </div>
                        <form onSubmit={handleLoan}>
                            <div className="form-group">
                                <label className="form-label">도서 ID:</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={loanRequest.bookId}
                                    onChange={(e) => setLoanRequest({...loanRequest, bookId: e.target.value})}
                                    placeholder="도서 ID를 입력하세요"
                                    required
                                    disabled={loading}
                                    min="1"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">회원 ID:</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={loanRequest.memberId}
                                    onChange={(e) => setLoanRequest({...loanRequest, memberId: e.target.value})}
                                    placeholder="회원 ID를 입력하세요"
                                    required
                                    disabled={loading}
                                    min="1"
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-success btn-lg"
                                disabled={loading}
                                style={{ width: '100%' }}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner" style={{ marginRight: 'var(--space-2)' }}></span>
                                        처리 중...
                                    </>
                                ) : (
                                    '대출 처리'
                                )}
                            </button>
                        </form>
                    </div>

                    {/* 반납 폼 */}
                    <div className="form-container slide-up" style={{ animationDelay: '0.2s' }}>
                        <div className="form-header">
                            <h4 className="form-title">📥 도서 반납</h4>
                        </div>
                        <form onSubmit={handleReturn}>
                            <div className="form-group">
                                <label className="form-label">도서 ID:</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={returnRequest.bookId}
                                    onChange={(e) => setReturnRequest({...returnRequest, bookId: e.target.value})}
                                    placeholder="도서 ID를 입력하세요"
                                    required
                                    disabled={loading}
                                    min="1"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">회원 ID:</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={returnRequest.memberId}
                                    onChange={(e) => setReturnRequest({...returnRequest, memberId: e.target.value})}
                                    placeholder="회원 ID를 입력하세요"
                                    required
                                    disabled={loading}
                                    min="1"
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary btn-lg"
                                disabled={loading}
                                style={{ width: '100%' }}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner" style={{ marginRight: 'var(--space-2)' }}></span>
                                        처리 중...
                                    </>
                                ) : (
                                    '반납 처리'
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* 사용 안내 */}
                <div className="card bounce-in" style={{ animationDelay: '0.3s' }}>
                    <div className="card-header">
                        <h5 className="card-title">💡 사용 안내</h5>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
                        <div>
                            <h6 style={{ color: 'var(--primary-color)', marginBottom: 'var(--space-2)' }}>📤 대출 안내</h6>
                            <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                <li>도서 ID와 회원 ID는 숫자로 입력해주세요.</li>
                                <li>해당 도서가 대출 가능한 상태여야 합니다.</li>
                                <li>최대 2권까지 동시 대출이 가능합니다.</li>
                                <li>연체된 도서가 있는 회원은 새로운 대출이 제한됩니다.</li>
                            </ul>
                        </div>
                        <div>
                            <h6 style={{ color: 'var(--primary-color)', marginBottom: 'var(--space-2)' }}>📥 반납 안내</h6>
                            <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                <li>해당 회원이 해당 도서를 대출 중이어야 합니다.</li>
                                <li>반납 완료 후 다른 회원이 대출할 수 있습니다.</li>
                                <li>연체 반납의 경우 연체료가 부과될 수 있습니다.</li>
                                <li>분실이나 손상 시 관리자에게 문의하세요.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* 빠른 팁 카드 */}
                <div className="grid grid-cols-3" style={{ marginTop: 'var(--space-6)' }}>
                    <div className="card bounce-in" style={{
                        animationDelay: '0.4s',
                        textAlign: 'center',
                        borderLeft: '4px solid var(--success-color)'
                    }}>
                        <div style={{ fontSize: 'var(--font-2xl)', marginBottom: 'var(--space-2)' }}>✅</div>
                        <h6 style={{ color: 'var(--success-color)', marginBottom: 'var(--space-2)' }}>빠른 처리</h6>
                        <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', margin: 0 }}>
                            ID만 입력하면 즉시 처리됩니다
                        </p>
                    </div>

                    <div className="card bounce-in" style={{
                        animationDelay: '0.5s',
                        textAlign: 'center',
                        borderLeft: '4px solid var(--accent-color)'
                    }}>
                        <div style={{ fontSize: 'var(--font-2xl)', marginBottom: 'var(--space-2)' }}>🔍</div>
                        <h6 style={{ color: 'var(--accent-color)', marginBottom: 'var(--space-2)' }}>자동 검증</h6>
                        <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', margin: 0 }}>
                            시스템이 자동으로 유효성을 검사합니다
                        </p>
                    </div>

                    <div className="card bounce-in" style={{
                        animationDelay: '0.6s',
                        textAlign: 'center',
                        borderLeft: '4px solid var(--warning-color)'
                    }}>
                        <div style={{ fontSize: 'var(--font-2xl)', marginBottom: 'var(--space-2)' }}>📊</div>
                        <h6 style={{ color: 'var(--warning-color)', marginBottom: 'var(--space-2)' }}>실시간 업데이트</h6>
                        <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', margin: 0 }}>
                            처리 결과가 즉시 반영됩니다
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoanManagement;