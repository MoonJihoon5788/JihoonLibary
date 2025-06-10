// 토큰 갱신 함수
export const refreshToken = async () => {
    const refreshTokenValue = localStorage.getItem('refreshToken');
    if (!refreshTokenValue) {
        console.log('리프레시 토큰이 없습니다.');
        return null;
    }

    try {
        console.log('토큰 갱신 시도...');
        const response = await fetch('http://localhost:8081/api/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: refreshTokenValue })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('토큰 갱신 성공');

            // 새 토큰 저장
            localStorage.setItem('token', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);

            return data.accessToken;
        } else {
            console.log('토큰 갱신 실패:', response.status);
            throw new Error('토큰 갱신 실패');
        }
    } catch (error) {
        console.error('토큰 갱신 중 오류:', error);

        // 갱신 실패 시 모든 토큰 제거하고 로그인 페이지로 이동
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/';

        return null;
    }
};

// API 호출 시 자동 토큰 갱신을 포함한 fetch 래퍼
export const apiCall = async (url, options = {}) => {
    const token = localStorage.getItem('token');

    // 첫 번째 API 호출
    let response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    });

    // 401 오류 시 토큰 갱신 후 재시도
    if (response.status === 401) {
        console.log('401 오류 발생, 토큰 갱신 시도...');

        const newToken = await refreshToken();
        if (newToken) {
            console.log('새 토큰으로 API 재호출');

            // 새 토큰으로 다시 호출
            response = await fetch(url, {
                ...options,
                headers: {
                    ...options.headers,
                    'Authorization': `Bearer ${newToken}`
                }
            });
        }
    }

    return response;
};

// GET 요청 함수
export const apiGet = async (url) => {
    return apiCall(url, { method: 'GET' });
};

// POST 요청 함수
export const apiPost = async (url, data) => {
    return apiCall(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
};

// PUT 요청 함수
export const apiPut = async (url, data) => {
    return apiCall(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
};

// DELETE 요청 함수
export const apiDelete = async (url) => {
    return apiCall(url, { method: 'DELETE' });
};