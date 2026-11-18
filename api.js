// api.js - 백엔드 API 호출 서비스
// fetch를 래핑해서 토큰 자동 첨부, 에러 처리를 편하게!

import * as SecureStore from 'expo-secure-store';

// 개발 중에는 로컬 IP로 변경하세요!
// Mac 터미널에서 ifconfig | grep inet 으로 IP 확인
const API_URL = 'http://localhost:3000';

// SecureStore에서 토큰 가져오기
const getToken = async () => {
  try {
    return await SecureStore.getItemAsync('token');
  } catch {
    return null;
  }
};

// 공통 fetch 함수
const request = async (endpoint, options = {}) => {
  const token = await getToken();

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || '요청 실패');
  }

  return data;
};

// Auth API
export const authAPI = {
  signup: (body) => request('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request('/auth/me'),
};

// Rooms API
export const roomsAPI = {
  create: (body) => request('/rooms', { method: 'POST', body: JSON.stringify(body) }),
  getMyRooms: () => request('/rooms'),
  getDetail: (roomId) => request(`/rooms/${roomId}`),
  join: (invite_code) => request('/rooms/join', { method: 'POST', body: JSON.stringify({ invite_code }) }),
  getMembers: (roomId) => request(`/rooms/${roomId}/members`),
};

// Events API
export const eventsAPI = {
  create: (roomId, body) => request(`/rooms/${roomId}/events`, { method: 'POST', body: JSON.stringify(body) }),
  getAll: (roomId) => request(`/rooms/${roomId}/events`),
  update: (eventId, body) => request(`/events/${eventId}`, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (eventId) => request(`/events/${eventId}`, { method: 'DELETE' }),
};

// Messages API
export const messagesAPI = {
  getMessages: (roomId, before) => {
    const query = before ? `?before=${before}` : '';
    return request(`/rooms/${roomId}/messages${query}`);
  },
};

export { API_URL, getToken };
