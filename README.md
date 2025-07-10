## API 엔드포인트 목록

### 인증 API

| API 설명 | HTTP 메서드 | API 엔드포인트 | 요청 본문 (Request Body) | 응답 본문 (Response Body) |
| --- | --- | --- | --- | --- |
| 로그인 | POST | /api/auth/login | **LoginDto** { "loginId": "String", "password": "String" } | **TokenDto** { "accessToken": "String", "refreshToken": "String", "tokenType": "String", "expiresIn": "Long", "role": "String", "loginId": "String" } |
| 토큰 갱신 | POST | /api/auth/refresh | **RefreshTokenRequestDto** { "refreshToken": "String" } | **TokenDto** { "accessToken": "String", "refreshToken": "String", "tokenType": "String", "expiresIn": "Long", "role": "String", "loginId": "String" } |
| 로그아웃 | POST | /api/auth/logout | **RefreshTokenRequestDto** { "refreshToken": "String" } | "로그아웃 성공" |

### 관리자 - 회원 관리 API

| API 설명 | HTTP 메서드 | API 엔드포인트 | 요청 본문 (Request Body) | 응답 본문 (Response Body) |
| --- | --- | --- | --- | --- |
| 회원 등록 | POST | /api/admin/members | **MemberJoinDto** { "loginId": "String", "password": "String", "name": "String", "phone": "String", "memo": "String", "role": "String" } | **MemberDto** { "id": "Long", "loginId": "String", "name": "String", "phone": "String", "memo": "String", "role": "String" } |
| 회원 목록 조회 | GET | /api/admin/members | Query Parameters: page: int (default: 0), size: int (default: 10), sortBy: String (default: "name"), sortDirection: String (default: "asc") | **Page<MemberResponseDto>** { "content": [{ "id": "Long", "loginId": "String", "phone": "String", "memo": "String", "role": "String", "currentLoans": "int", "hasOverdueBooks": "boolean" }], "totalElements": "long", "totalPages": "int" } |
| 회원 상세 조회 | GET | /api/admin/members/{memberId} | Path Variable: memberId: Long | **MemberDetailDto** { "id": "Long", "loginId": "String", "name": "String", "phone": "String", "memo": "String", "role": "String", "currentLoans": "int", "overdueCount": "int", "hasOverdueBooks": "boolean", "memberStatus": "String", "currentLoanList": "Array", "loanHistory": "Array", "totalLoanCount": "int" } |
| 회원 수정 | PUT | /api/admin/members/{memberId} | **MemberUpdateDto** { "loginId": "String", "password": "String", "phone": "String", "memo": "String", "role": "String" } | **MemberResponseDto** { "id": "Long", "loginId": "String", "phone": "String", "memo": "String", "role": "String", "currentLoans": "int", "hasOverdueBooks": "boolean" } |
| 회원 삭제 | DELETE | /api/admin/members/{memberId} | Path Variable: memberId: Long | HTTP 200 OK |

### 관리자 - 도서 관리 API

| API 설명 | HTTP 메서드 | API 엔드포인트 | 요청 본문 (Request Body) | 응답 본문 (Response Body) |
| --- | --- | --- | --- | --- |
| 도서 등록 | POST | /api/admin/books | **BookCreateDto** { "title": "String", "author": "String", "publisher": "String", "publicationYear": "LocalDate", "price": "Integer" } | **BookDto** { "id": "Long", "title": "String", "author": "String", "publisher": "String", "publicationYear": "LocalDate", "price": "Integer", "status": "Character", "isLoaned": "boolean", "isAvailable": "boolean", "loanStatus": "String" } |
| 도서 수정 | PUT | /api/admin/books/{bookId} | **BookUpdateDto** { "title": "String", "author": "String", "publisher": "String", "publicationYear": "LocalDate", "price": "Integer" } | **BookDto** { "id": "Long", "title": "String", "author": "String", "publisher": "String", "publicationYear": "LocalDate", "price": "Integer", "status": "Character", "isLoaned": "boolean", "isAvailable": "boolean", "loanStatus": "String" } |
| 도서 삭제 | DELETE | /api/admin/books/{bookId} | Path Variable: bookId: Long | HTTP 200 OK |
| 도서 상세 조회 | GET | /api/admin/books/{bookId} | Path Variable: bookId: Long | **BookDetailDto** { "id": "Long", "title": "String", "author": "String", "publisher": "String", "publicationYear": "LocalDate", "price":"Integer", "status":"Character", "isLoaned":"boolean", "isAvailable":"boolean", "loanStatus": "String" ,"loanHistory":"Array"} |

### 사용자 - 도서 조회 API

| API 설명 | HTTP 메서드 | API 엔드포인트 | 요청 본문 (Request Body) | 응답 본문 (Response Body) |
| --- | --- | --- | --- | --- |
| 도서 목록 조회 | GET | /api/user/books | Query Parameters: page: int (default: 0), size: int (default: 10), sortBy: String (default: "title"), sortDirection: String (default: "asc") | **Page<BookDto>** { "content": [{ "id": "Long", "title": "String", "author": "String", "publisher": "String", "publicationYear": "LocalDate", "price": "Integer", "status": "Character", "isLoaned": "boolean", "isAvailable": "boolean", "loanStatus": "String" }], "totalElements": "long", "totalPages": "int" } |
| 도서 검색 | GET | /api/user/books/search | **BookSearchDto (Query Parameters)** keyword: String, searchType: String (default: "all"), sortBy: String (default: "title"), sortDirection: String (default: "asc"), page: int (default: 0), size: int (default: 10) | **Page<BookDto>** { "content": [{ "id": "Long", "title": "String", "author": "String", "publisher": "String", "publicationYear": "LocalDate", "price": "Integer", "status": "Character", "isLoaned": "boolean", "isAvailable": "boolean", "loanStatus": "String" }], "totalElements": "long", "totalPages": "int" } |

### 관리자 - 대출 관리 API

| API 설명 | HTTP 메서드 | API 엔드포인트 | 요청 본문 (Request Body) | 응답 본문 (Response Body) |
| --- | --- | --- | --- | --- |
| 도서 대출 | POST | /api/admin/loans | **LoanRequestDto** { "bookId": "Long", "memberId": "Long" } | **LoanDto** { "id": "Long", "bookId": "Long", "bookTitle": "String", "bookAuthor": "String", "memberId": "Long", "memberLoginId": "String", "memberPhone": "String", "loanDate": "LocalDate", "returnDate": "LocalDate", "realReturnDate": "LocalDate", "status": "Character", "statusDescription": "String", "isOverdue": "boolean" } |
| 도서 반납 | POST | /api/admin/returns | **ReturnRequestDto** { "bookId": "Long", "memberId": "Long" } | **LoanDto** { "id": "Long", "bookId": "Long", "bookTitle": "String", "bookAuthor": "String", "memberId": "Long", "memberLoginId": "String", "memberPhone": "String", "loanDate": "LocalDate", "returnDate": "LocalDate", "realReturnDate": "LocalDate", "status": "Character", "statusDescription": "String", "isOverdue": "boolean" } |

## 인증 정보

### 헤더 설정

```
Authorization: Bearer {access_token}
Content-Type: application/json

```

### 기본 계정 정보

- **관리자**: jihun5788 / jihun1
- **일반 사용자**: user01 / user123, user02 / user123

## 비즈니스 규칙

### 대출 규칙

- 한 사용자는 최대 2권까지 대출 가능
- 연체된 도서가 있으면 추가 대출 불가
- 대출 기간은 15일
- 반납 예정일 경과 시 자동으로 연체 상태로 변경 (1분마다 스케줄링)

### 도서 상태

- 'A': Available (대출가능)
- 'L': Loaned (대출중)

### 대출 상태

- 'L': Loan (대출중)
- 'O': Overdue (연체)
- 'R': Returned (반납완료)
