import React, { useState, useEffect } from 'react';

const UserBooks = ({ setCurrentView, user, token, logout }) => {
    const [books, setBooks] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchType, setSearchType] = useState('all');
    const [sortBy, setSortBy] = useState('title');
    const [sortDirection, setSortDirection] = useState('asc');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        searchBooks();
    }, [searchKeyword, searchType, sortBy, sortDirection, currentPage]);

    const searchBooks = async () => {
        try {
            const params = new URLSearchParams({
                keyword: searchKeyword,
                searchType: searchType,
                sortBy: sortBy,
                sortDirection: sortDirection,
                page: currentPage.toString(),
                size: '10'
            });

            // 검색 API와 일반 목록 API 모두 시도
            let response;

            if (searchKeyword.trim() === '') {
                // 검색어가 없으면 일반 목록 API 사용
                response = await fetch(`http://localhost:8081/api/user/books?${params}`, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });
            } else {
                // 검색어가 있으면 검색 API 사용
                response = await fetch(`http://localhost:8081/api/user/books/search?${params}`, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });
            }

            if (response.ok) {
                const data = await response.json();
                setBooks(data.content || []);
                setTotalPages(data.totalPages || 0);
            } else {
                console.error('API 응답 오류:', response.status);
                // 오류가 발생하면 빈 배열로 설정
                setBooks([]);
                setTotalPages(0);
            }
        } catch (err) {
            console.error('도서 검색 실패', err);
            // 네트워크 오류 시에도 빈 배열로 설정
            setBooks([]);
            setTotalPages(0);
        }
    };

    // 검색 초기화
    const handleSearchReset = () => {
        setSearchKeyword('');
        setSearchType('all');
        setSortBy('title');
        setSortDirection('asc');
        setCurrentPage(0);
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>도서 검색</h3>
                <div>
                    {user && user.role === 'ADMIN' && (
                        <button onClick={() => setCurrentView('admin')} style={{ marginRight: '10px', padding: '8px 16px' }}>
                            관리자 화면
                        </button>
                    )}
                    {user ? (
                        <button onClick={logout} style={{ padding: '8px 16px' }}>로그아웃</button>
                    ) : (
                        <button onClick={() => setCurrentView('login')} style={{ padding: '8px 16px' }}>로그인</button>
                    )}
                </div>
            </div>

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
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                        <p>도서가 없습니다.</p>
                        <p>백엔드 서버가 실행 중인지 확인해주세요. (http://localhost:8081)</p>
                    </div>
                )}
            </div>

            {/* 페이지네이션 */}
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
        </div>
    );
};

export default UserBooks;