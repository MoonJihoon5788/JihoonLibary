import React, { useState, useEffect, useCallback } from 'react';

const BookManagement = ({ setCurrentView, token }) => {
    const [books, setBooks] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchType, setSearchType] = useState('all');
    const [sortBy, setSortBy] = useState('title');
    const [sortDirection, setSortDirection] = useState('asc');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // 관리자 기능 상태
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

            // 항상 검색 API 사용 (빈 검색어면 모든 도서 검색)
            const response = await fetch(`http://localhost:8081/api/user/books/search?${params}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });

            if (response.ok) {
                const data = await response.json();
                console.log('=== 전체 응답 데이터 ===');
                console.log(data);
                console.log('=== 도서 목록 (data.content) ===');
                console.log(data.content);
                console.log('=== 페이지 정보 ===');
                console.log('totalPages:', data.totalPages);
                console.log('totalElements:', data.totalElements);
                console.log('현재 페이지:', data.number);
                console.log('페이지 크기:', data.size);
                console.log('마지막 페이지 여부:', data.last);

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

    // 도서 추가
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
                searchBooks(); // 목록 새로고침
            } else {
                setMessage('도서 추가에 실패했습니다.');
            }
        } catch (err) {
            setMessage('도서 추가 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 도서 수정
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
                searchBooks(); // 목록 새로고침
            } else {
                setMessage('도서 수정에 실패했습니다.');
            }
        } catch (err) {
            setMessage('도서 수정 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 도서 삭제
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
                searchBooks(); // 목록 새로고침
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

    // 도서 상세 조회
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

    // 수정 모드 시작
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

    // 삭제 가능 여부 확인
    const canDeleteBook = (book) => {
        return book.isAvailable === true || book.status === 'A' || book.loanStatus === '대출가능' || book.isLoaned === false;
    };

    // 검색 초기화
    const handleSearchReset = () => {
        setSearchKeyword('');
        setSearchType('all');
        setSortBy('title');
        setSortDirection('asc');
        setCurrentPage(0);
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
            {/* 헤더 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>도서 관리</h3>
                <div>
                    <button
                        onClick={() => { setShowAddForm(!showAddForm); setShowEditForm(false); }}
                        style={{ marginRight: '10px', padding: '8px 16px', backgroundColor: '#28a745', color: 'white' }}
                    >
                        도서 추가
                    </button>
                    <button onClick={() => setCurrentView('admin')} style={{ padding: '8px 16px' }}>
                        돌아가기
                    </button>
                </div>
            </div>

            {/* 메시지 표시 */}
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

            {/* 도서 추가 폼 */}
            {showAddForm && (
                <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #28a745', backgroundColor: '#f8fff9' }}>
                    <h4>새 도서 추가</h4>
                    <form onSubmit={handleAddBook}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                            <input
                                type="text"
                                placeholder="제목"
                                value={newBook.title}
                                onChange={(e) => setNewBook({...newBook, title: e.target.value})}
                                required
                            />
                            <input
                                type="text"
                                placeholder="저자"
                                value={newBook.author}
                                onChange={(e) => setNewBook({...newBook, author: e.target.value})}
                                required
                            />
                            <input
                                type="text"
                                placeholder="출판사"
                                value={newBook.publisher}
                                onChange={(e) => setNewBook({...newBook, publisher: e.target.value})}
                                required
                            />
                            <input
                                type="date"
                                value={newBook.publicationYear}
                                onChange={(e) => setNewBook({...newBook, publicationYear: e.target.value})}
                                required
                            />
                            <input
                                type="number"
                                placeholder="가격"
                                value={newBook.price}
                                onChange={(e) => setNewBook({...newBook, price: e.target.value})}
                                required
                            />
                        </div>
                        <div style={{ marginTop: '10px' }}>
                            <button type="submit" disabled={loading} style={{ marginRight: '10px', backgroundColor: '#28a745', color: 'white' }}>
                                {loading ? '추가 중...' : '추가'}
                            </button>
                            <button type="button" onClick={() => setShowAddForm(false)}>취소</button>
                        </div>
                    </form>
                </div>
            )}

            {/* 도서 수정 폼 */}
            {showEditForm && editingBook && (
                <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #007bff', backgroundColor: '#f0f8ff' }}>
                    <h4>도서 수정 (ID: {editingBook.id})</h4>
                    <form onSubmit={handleEditBook}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                            <input
                                type="text"
                                placeholder="제목"
                                value={editingBook.title}
                                onChange={(e) => setEditingBook({...editingBook, title: e.target.value})}
                                required
                            />
                            <input
                                type="text"
                                placeholder="저자"
                                value={editingBook.author}
                                onChange={(e) => setEditingBook({...editingBook, author: e.target.value})}
                                required
                            />
                            <input
                                type="text"
                                placeholder="출판사"
                                value={editingBook.publisher}
                                onChange={(e) => setEditingBook({...editingBook, publisher: e.target.value})}
                                required
                            />
                            <input
                                type="date"
                                value={editingBook.publicationYear}
                                onChange={(e) => setEditingBook({...editingBook, publicationYear: e.target.value})}
                                required
                            />
                            <input
                                type="number"
                                placeholder="가격"
                                value={editingBook.price}
                                onChange={(e) => setEditingBook({...editingBook, price: e.target.value})}
                                required
                            />
                        </div>
                        <div style={{ marginTop: '10px' }}>
                            <button type="submit" disabled={loading} style={{ marginRight: '10px', backgroundColor: '#007bff', color: 'white' }}>
                                {loading ? '수정 중...' : '수정 완료'}
                            </button>
                            <button type="button" onClick={() => { setShowEditForm(false); setEditingBook(null); }}>취소</button>
                        </div>
                    </form>
                </div>
            )}

            {/* 검색 필터 - UserBooks와 동일 */}
            <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '10px' }}>
                    <input
                        type="text"
                        placeholder="검색어를 입력하세요"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        style={{ padding: '8px' }}
                    />
                    <select
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                        style={{ padding: '8px' }}
                    >
                        <option value="all">전체</option>
                        <option value="title">제목</option>
                        <option value="author">저자</option>
                        <option value="publisher">출판사</option>
                    </select>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        style={{ padding: '8px' }}
                    >
                        <option value="title">제목순</option>
                        <option value="author">저자순</option>
                        <option value="publicationYear">출간년도순</option>
                    </select>
                    <select
                        value={sortDirection}
                        onChange={(e) => setSortDirection(e.target.value)}
                        style={{ padding: '8px' }}
                    >
                        <option value="asc">오름차순</option>
                        <option value="desc">내림차순</option>
                    </select>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <button onClick={handleSearchReset} style={{ padding: '8px 16px' }}>
                        검색 초기화
                    </button>
                </div>
            </div>

            {/* 도서 목록 테이블 */}
            <div>
                {books.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                        <tr style={{ backgroundColor: '#f5f5f5' }}>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>ID</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>제목</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>저자</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>출판사</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>출간년도</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>가격</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>대출상태</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>관리</th>
                        </tr>
                        </thead>
                        <tbody>
                        {books.map(book => (
                            <tr key={book.id}>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{book.id}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{book.title}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{book.author}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{book.publisher}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{book.publicationYear}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{book.price?.toLocaleString()}원</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    <span style={{ color: book.isAvailable ? 'green' : 'red' }}>
                      {book.loanStatus}
                    </span>
                                </td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                    <button
                                        onClick={() => fetchBookDetail(book.id)}
                                        style={{ marginRight: '3px', padding: '3px 6px', fontSize: '12px' }}
                                        disabled={loading}
                                    >
                                        상세
                                    </button>
                                    <button
                                        onClick={() => startEditBook(book)}
                                        style={{ marginRight: '3px', padding: '3px 6px', fontSize: '12px', backgroundColor: '#007bff', color: 'white' }}
                                        disabled={loading}
                                    >
                                        수정
                                    </button>
                                    <button
                                        onClick={() => handleDeleteBook(book.id, book.title)}
                                        style={{
                                            padding: '3px 6px',
                                            fontSize: '12px',
                                            backgroundColor: canDeleteBook(book) ? '#dc3545' : '#6c757d',
                                            color: 'white',
                                            cursor: canDeleteBook(book) && !loading ? 'pointer' : 'not-allowed'
                                        }}
                                        disabled={!canDeleteBook(book) || loading}
                                        title={!canDeleteBook(book) ? '대출 중인 도서는 삭제할 수 없습니다' : '도서 삭제'}
                                    >
                                        삭제
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                        <p>도서가 없습니다.</p>
                    </div>
                )}
            </div>

            {/* 페이지네이션 - UserBooks와 동일 */}
            {totalPages > 0 && (
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                        disabled={currentPage === 0}
                        style={{ marginRight: '10px', padding: '8px 12px' }}
                    >
                        이전
                    </button>
                    <span style={{ margin: '0 15px' }}>
            {currentPage + 1} / {totalPages}
          </span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                        disabled={currentPage >= totalPages - 1}
                        style={{ marginLeft: '10px', padding: '8px 12px' }}
                    >
                        다음
                    </button>
                </div>
            )}

            {/* 도서 상세 정보 모달 스타일 */}
            {selectedBook && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '8px',
                        maxWidth: '800px',
                        width: '90%',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }}>
                        <h4>도서 상세 정보</h4>

                        {/* 기본 정보 */}
                        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
                            <h5 style={{ marginTop: 0, color: '#333' }}>기본 정보</h5>
                            <p><strong>도서 ID:</strong> {selectedBook.id}</p>
                            <p><strong>제목:</strong> {selectedBook.title}</p>
                            <p><strong>저자:</strong> {selectedBook.author}</p>
                            <p><strong>출판사:</strong> {selectedBook.publisher}</p>
                            <p><strong>출간년도:</strong> {selectedBook.publicationYear}</p>
                            <p><strong>가격:</strong> {selectedBook.price?.toLocaleString()}원</p>
                            <p><strong>상태:</strong> {selectedBook.status}</p>
                            <p><strong>대출 상태:</strong>
                                <span style={{ color: selectedBook.isAvailable ? 'green' : 'red', marginLeft: '5px' }}>
                  {selectedBook.loanStatus}
                </span>
                            </p>
                        </div>

                        {/* 대출 내역 */}
                        {selectedBook.loanHistory && selectedBook.loanHistory.length > 0 && (
                            <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
                                <h5 style={{ marginTop: 0, color: '#333' }}>대출 내역</h5>
                                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                        <thead>
                                        <tr style={{ backgroundColor: '#f5f5f5', position: 'sticky', top: 0 }}>
                                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>회원ID</th>
                                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>대출일</th>
                                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>반납예정</th>
                                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>실제반납</th>
                                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>상태</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {selectedBook.loanHistory.map(loan => (
                                            <tr key={loan.id} style={{
                                                backgroundColor: loan.isOverdue ? '#ffe6e6' : 'white'
                                            }}>
                                                <td style={{ border: '1px solid #ddd', padding: '6px' }}>{loan.memberLoginId}</td>
                                                <td style={{ border: '1px solid #ddd', padding: '6px' }}>
                                                    {loan.loanDate ? new Date(loan.loanDate).toLocaleDateString('ko-KR') : '-'}
                                                </td>
                                                <td style={{ border: '1px solid #ddd', padding: '6px' }}>
                                                    {loan.returnDate ? new Date(loan.returnDate).toLocaleDateString('ko-KR') : '-'}
                                                </td>
                                                <td style={{ border: '1px solid #ddd', padding: '6px' }}>
                                                    {loan.realReturnDate ? new Date(loan.realReturnDate).toLocaleDateString('ko-KR') : '-'}
                                                </td>
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
                                <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                                    총 {selectedBook.loanHistory.length}건의 대출 내역
                                </div>
                            </div>
                        )}

                        {/* 대출 내역이 없는 경우 */}
                        {(!selectedBook.loanHistory || selectedBook.loanHistory.length === 0) && (
                            <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px', textAlign: 'center', color: '#666' }}>
                                <h5 style={{ marginTop: 0, color: '#333' }}>대출 내역</h5>
                                <p>대출 내역이 없습니다.</p>
                            </div>
                        )}

                        {/* 버튼들 */}
                        <div style={{ marginTop: '20px', textAlign: 'center' }}>
                            <button
                                onClick={() => setSelectedBook(null)}
                                style={{ marginRight: '10px', padding: '8px 16px' }}
                            >
                                닫기
                            </button>
                            <button
                                onClick={() => { startEditBook(selectedBook); setSelectedBook(null); }}
                                style={{ marginRight: '10px', padding: '8px 16px', backgroundColor: '#007bff', color: 'white' }}
                                disabled={loading}
                            >
                                수정
                            </button>
                            <button
                                onClick={() => { handleDeleteBook(selectedBook.id, selectedBook.title); setSelectedBook(null); }}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: canDeleteBook(selectedBook) ? '#dc3545' : '#6c757d',
                                    color: 'white'
                                }}
                                disabled={!canDeleteBook(selectedBook) || loading}
                            >
                                삭제
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookManagement;