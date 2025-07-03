import React, { useState, useEffect, useCallback } from 'react';
import { apiCall } from '../utils/tokenRefresh';

const UserBooks = ({ setCurrentView, user, token, logout }) => {
    const [books, setBooks] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchType, setSearchType] = useState('all');
    const [sortBy, setSortBy] = useState('title');
    const [sortDirection, setSortDirection] = useState('asc');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);

    const searchBooks = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                keyword: searchKeyword,
                searchType: searchType,
                sortBy: sortBy,
                sortDirection: sortDirection,
                page: currentPage.toString(),
                size: '10'
            });

            let response;
            if (searchKeyword.trim() === '') {
                response = await apiCall(`http://localhost:8081/api/user/books?${params}`);
            } else {
                response = await apiCall(`http://localhost:8081/api/user/books/search?${params}`);
            }

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
        } finally {
            setLoading(false);
        }
    }, [searchKeyword, searchType, sortBy, sortDirection, currentPage]);

    useEffect(() => {
        searchBooks();
    }, [searchBooks]);

    const handleSearchReset = () => {
        setSearchKeyword('');
        setSearchType('all');
        setSortBy('title');
        setSortDirection('asc');
        setCurrentPage(0);
    };

    return (
        <div className="main-content">
            <div className="content-wrapper fade-in">
                <div className="section-header">
                    <h3 className="section-title">📚 도서 검색</h3>
                    <div className="section-actions">
                        {user && user.role === 'ADMIN' && (
                            <button
                                onClick={() => setCurrentView('admin')}
                                className="btn btn-secondary"
                            >
                                관리자 화면
                            </button>
                        )}
                        <button
                            onClick={user ? logout : () => setCurrentView('login')}
                            className="btn btn-outline"
                        >
                            {user ? '로그아웃' : '로그인'}
                        </button>
                    </div>
                </div>

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

                {loading && (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p className="loading-text">검색 중...</p>
                    </div>
                )}

                {!loading && (
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
                                    검색 조건을 변경하거나 백엔드 서버가 실행 중인지 확인해주세요.<br />
                                    (http://localhost:8081)
                                </p>
                            </div>
                        )}
                    </div>
                )}

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
            </div>
        </div>
    );
};

export default UserBooks;