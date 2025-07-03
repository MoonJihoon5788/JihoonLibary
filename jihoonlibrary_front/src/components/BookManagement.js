import React, { useState, useEffect, useCallback } from 'react';

const BookManagement = ({ setCurrentView, token }) => {
    const [books, setBooks] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchType, setSearchType] = useState('all');
    const [sortBy, setSortBy] = useState('title');
    const [sortDirection, setSortDirection] = useState('asc');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [editingBook, setEditingBook] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [newBook, setNewBook] = useState({
        title: '', author: '', publisher: '', publicationYear: '', price: ''
    });

    const searchBooks = useCallback(async () => {
        try {
            const params = new URLSearchParams({
                keyword: searchKeyword,
                searchType: searchType,
                sortBy: sortBy,
                sortDirection: sortDirection,
                page: currentPage.toString(),
                size: '10'
            });

            const response = await fetch(`http://localhost:8081/api/user/books/search?${params}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });

            if (response.ok) {
                const data = await response.json();
                setBooks(data.content || []);
                setTotalPages(data.totalPages || 0);
            } else {
                console.error('API 응답 오류:', response.status);
                setBooks([]);
                setTotalPages(0);
            }
        } catch (err) {
            console.error('도서 검색 실패', err);
            setBooks([]);
            setTotalPages(0);
        }
    }, [searchKeyword, searchType, sortBy, sortDirection, currentPage, token]);

    useEffect(() => {
        searchBooks();
    }, [searchBooks]);

    const handleAddBook = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8081/api/admin/books', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...newBook,
                    publicationYear: newBook.publicationYear,
                    price: parseInt(newBook.price)
                })
            });

            if (response.ok) {
                setMessage('도서가 성공적으로 추가되었습니다.');
                setShowAddForm(false);
                setNewBook({ title: '', author: '', publisher: '', publicationYear: '', price: '' });
                searchBooks();
            } else {
                setMessage('도서 추가에 실패했습니다.');
            }
        } catch (err) {
            setMessage('도서 추가 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleEditBook = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8081/api/admin/books/${editingBook.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: editingBook.title,
                    author: editingBook.author,
                    publisher: editingBook.publisher,
                    publicationYear: editingBook.publicationYear,
                    price: parseInt(editingBook.price)
                })
            });

            if (response.ok) {
                setMessage('도서가 성공적으로 수정되었습니다.');
                setShowEditForm(false);
                setEditingBook(null);
                setSelectedBook(null);
                searchBooks();
            } else {
                setMessage('도서 수정에 실패했습니다.');
            }
        } catch (err) {
            setMessage('도서 수정 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBook = async (bookId, bookTitle) => {
        if (!window.confirm(`정말로 "${bookTitle}" 도서를 삭제하시겠습니까?`)) {
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8081/api/admin/books/${bookId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setMessage('도서가 성공적으로 삭제되었습니다.');
                searchBooks();
                setSelectedBook(null);
            } else if (response.status === 400) {
                setMessage('대출 중인 도서는 삭제할 수 없습니다.');
            } else {
                setMessage('도서 삭제에 실패했습니다.');
            }
        } catch (err) {
            setMessage('도서 삭제 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const fetchBookDetail = async (bookId) => {
        try {
            const response = await fetch(`http://localhost:8081/api/admin/books/${bookId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setSelectedBook(data);
            }
        } catch (err) {
            setMessage('도서 상세 조회 중 오류가 발생했습니다.');
        }
    };

    const startEditBook = (book) => {
        setEditingBook({
            id: book.id,
            title: book.title,
            author: book.author,
            publisher: book.publisher,
            publicationYear: book.publicationYear,
            price: book.price
        });
        setShowEditForm(true);
        setShowAddForm(false);
    };

    const canDeleteBook = (book) => {
        return book.isAvailable === true || book.status === 'A' || book.loanStatus === '대출가능' || book.isLoaned === false;
    };

    const handleSearchReset = () => {
        setSearchKeyword('');
        setSearchType('all');
        setSortBy('title');
        setSortDirection('asc');
        setCurrentPage(0);
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
                    <h3 className="section-title">📖 도서 관리</h3>
                    <div className="section-actions">
                        <button
                            onClick={() => { setShowAddForm(!showAddForm); setShowEditForm(false); }}
                            className="btn btn-primary"
                        >
                            도서 추가
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
                            <h4 className="form-title">새 도서 추가</h4>
                        </div>
                        <form onSubmit={handleAddBook}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">제목</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="제목"
                                        value={newBook.title}
                                        onChange={(e) => setNewBook({...newBook, title: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">저자</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="저자"
                                        value={newBook.author}
                                        onChange={(e) => setNewBook({...newBook, author: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">출판사</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="출판사"
                                        value={newBook.publisher}
                                        onChange={(e) => setNewBook({...newBook, publisher: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">출간년도</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={newBook.publicationYear}
                                        onChange={(e) => setNewBook({...newBook, publicationYear: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">가격</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        placeholder="가격"
                                        value={newBook.price}
                                        onChange={(e) => setNewBook({...newBook, price: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="submit" disabled={loading} className="btn btn-primary">
                                    {loading ? '추가 중...' : '추가'}
                                </button>
                                <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-ghost">
                                    취소
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {showEditForm && editingBook && (
                    <div className="form-container">
                        <div className="form-header">
                            <h4 className="form-title">도서 수정 (ID: {editingBook.id})</h4>
                        </div>
                        <form onSubmit={handleEditBook}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">제목</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={editingBook.title}
                                        onChange={(e) => setEditingBook({...editingBook, title: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">저자</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={editingBook.author}
                                        onChange={(e) => setEditingBook({...editingBook, author: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">출판사</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={editingBook.publisher}
                                        onChange={(e) => setEditingBook({...editingBook, publisher: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">출간년도</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={editingBook.publicationYear}
                                        onChange={(e) => setEditingBook({...editingBook, publicationYear: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">가격</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={editingBook.price}
                                        onChange={(e) => setEditingBook({...editingBook, price: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="submit" disabled={loading} className="btn btn-primary">
                                    {loading ? '수정 중...' : '수정 완료'}
                                </button>
                                <button type="button" onClick={() => { setShowEditForm(false); setEditingBook(null); }} className="btn btn-ghost">
                                    취소
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="search-section">
                    <h4 className="search-title">검색 및 필터</h4>
                    <div className="filter-grid">
                        <input
                            type="text"
                            className="form-input"
                            placeholder="검색어를 입력하세요"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                        />
                        <select
                            className="form-input"
                            value={searchType}
                            onChange={(e) => setSearchType(e.target.value)}
                        >
                            <option value="all">전체</option>
                            <option value="title">제목</option>
                            <option value="author">저자</option>
                            <option value="publisher">출판사</option>
                        </select>
                        <select
                            className="form-input"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="title">제목순</option>
                            <option value="author">저자순</option>
                            <option value="publicationYear">출간년도순</option>
                        </select>
                        <select
                            className="form-input"
                            value={sortDirection}
                            onChange={(e) => setSortDirection(e.target.value)}
                        >
                            <option value="asc">오름차순</option>
                            <option value="desc">내림차순</option>
                        </select>
                    </div>
                    <div className="filter-actions">
                        <button onClick={handleSearchReset} className="btn btn-ghost">
                            검색 초기화
                        </button>
                    </div>
                </div>

                <div className="table-container">
                    {books.length > 0 ? (
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>제목</th>
                                    <th>저자</th>
                                    <th>출판사</th>
                                    <th>출간년도</th>
                                    <th>가격</th>
                                    <th>대출상태</th>
                                    <th>관리</th>
                                </tr>
                                </thead>
                                <tbody>
                                {books.map(book => (
                                    <tr key={book.id}>
                                        <td>{book.id}</td>
                                        <td>{book.title}</td>
                                        <td>{book.author}</td>
                                        <td>{book.publisher}</td>
                                        <td>{book.publicationYear}</td>
                                        <td>{book.price?.toLocaleString()}원</td>
                                        <td>
                                                <span className={`status-badge ${book.isAvailable ? 'status-available' : 'status-unavailable'}`}>
                                                    {book.loanStatus}
                                                </span>
                                        </td>
                                        <td>
                                            <div className="table-actions">
                                                <button
                                                    onClick={() => fetchBookDetail(book.id)}
                                                    className="btn btn-sm btn-primary"
                                                    disabled={loading}
                                                >
                                                    상세
                                                </button>
                                                <button
                                                    onClick={() => startEditBook(book)}
                                                    className="btn btn-sm btn-secondary"
                                                    disabled={loading}
                                                >
                                                    수정
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteBook(book.id, book.title)}
                                                    className={`btn btn-sm ${canDeleteBook(book) ? 'btn-danger' : ''}`}
                                                    disabled={!canDeleteBook(book) || loading}
                                                    title={!canDeleteBook(book) ? '대출 중인 도서는 삭제할 수 없습니다' : '도서 삭제'}
                                                    style={{
                                                        backgroundColor: canDeleteBook(book) ? '' : 'var(--gray-400)',
                                                        cursor: canDeleteBook(book) && !loading ? 'pointer' : 'not-allowed'
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
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">📚</div>
                            <h4 className="empty-state-title">도서가 없습니다</h4>
                            <p className="empty-state-description">
                                검색 조건을 변경하거나 새로운 도서를 추가해보세요.
                            </p>
                        </div>
                    )}
                </div>

                {totalPages > 0 && (
                    <div className="pagination">
                        <button
                            className="pagination-btn"
                            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                            disabled={currentPage === 0}
                        >
                            이전
                        </button>
                        <span className="pagination-info">
                            {currentPage + 1} / {totalPages}
                        </span>
                        <button
                            className="pagination-btn"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                            disabled={currentPage >= totalPages - 1}
                        >
                            다음
                        </button>
                    </div>
                )}

                {selectedBook && (
                    <div className="modal-overlay" onClick={() => setSelectedBook(null)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h4 className="modal-title">도서 상세 정보</h4>
                                <button className="modal-close" onClick={() => setSelectedBook(null)}>
                                    ×
                                </button>
                            </div>

                            <div className="card">
                                <div className="card-header">
                                    <h5 className="card-title">기본 정보</h5>
                                </div>
                                <p><strong>도서 ID:</strong> {selectedBook.id}</p>
                                <p><strong>제목:</strong> {selectedBook.title}</p>
                                <p><strong>저자:</strong> {selectedBook.author}</p>
                                <p><strong>출판사:</strong> {selectedBook.publisher}</p>
                                <p><strong>출간년도:</strong> {selectedBook.publicationYear}</p>
                                <p><strong>가격:</strong> {selectedBook.price?.toLocaleString()}원</p>
                                <p><strong>상태:</strong> {selectedBook.status}</p>
                                <p><strong>대출 상태:</strong>
                                    <span className={`status-badge ${selectedBook.isAvailable ? 'status-available' : 'status-unavailable'}`}>
                                        {selectedBook.loanStatus}
                                    </span>
                                </p>
                            </div>

                            {selectedBook.loanHistory && selectedBook.loanHistory.length > 0 && (
                                <div className="card" style={{ marginTop: 'var(--space-6)' }}>
                                    <div className="card-header">
                                        <h5 className="card-title">대출 내역</h5>
                                    </div>
                                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                        <table className="table" style={{ fontSize: 'var(--font-sm)' }}>
                                            <thead>
                                            <tr>
                                                <th>회원ID</th>
                                                <th>대출일</th>
                                                <th>반납예정</th>
                                                <th>실제반납</th>
                                                <th>상태</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {selectedBook.loanHistory.map(loan => (
                                                <tr key={loan.id} style={{
                                                    backgroundColor: loan.isOverdue ? 'rgba(231, 76, 60, 0.1)' : 'white'
                                                }}>
                                                    <td>{loan.memberLoginId}</td>
                                                    <td>{loan.loanDate ? new Date(loan.loanDate).toLocaleDateString('ko-KR') : '-'}</td>
                                                    <td>{loan.returnDate ? new Date(loan.returnDate).toLocaleDateString('ko-KR') : '-'}</td>
                                                    <td>{loan.realReturnDate ? new Date(loan.realReturnDate).toLocaleDateString('ko-KR') : '-'}</td>
                                                    <td>
                                                            <span className={`badge ${
                                                                loan.status === 'R' ? 'badge-success' :
                                                                    loan.status === 'O' ? 'badge-danger' : 'badge-info'
                                                            }`}>
                                                                {loan.statusDescription}
                                                            </span>
                                                        {loan.isOverdue && loan.status !== 'R' && (
                                                            <span className="badge badge-danger" style={{ marginLeft: 'var(--space-1)' }}>연체</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div style={{ marginTop: 'var(--space-3)', fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
                                        총 {selectedBook.loanHistory.length}건의 대출 내역
                                    </div>
                                </div>
                            )}

                            {(!selectedBook.loanHistory || selectedBook.loanHistory.length === 0) && (
                                <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                                    <div className="empty-state-icon">📋</div>
                                    <h5 className="empty-state-title">대출 내역</h5>
                                    <p className="empty-state-description">대출 내역이 없습니다.</p>
                                </div>
                            )}

                            <div className="form-actions" style={{ marginTop: 'var(--space-6)' }}>
                                <button
                                    onClick={() => { startEditBook(selectedBook); setSelectedBook(null); }}
                                    className="btn btn-primary"
                                    disabled={loading}
                                >
                                    수정
                                </button>
                                <button
                                    onClick={() => { handleDeleteBook(selectedBook.id, selectedBook.title); setSelectedBook(null); }}
                                    className={`btn ${canDeleteBook(selectedBook) ? 'btn-danger' : ''}`}
                                    disabled={!canDeleteBook(selectedBook) || loading}
                                    style={{
                                        backgroundColor: canDeleteBook(selectedBook) ? '' : 'var(--gray-400)'
                                    }}
                                >
                                    삭제
                                </button>
                                <button
                                    onClick={() => setSelectedBook(null)}
                                    className="btn btn-ghost"
                                >
                                    닫기
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookManagement;