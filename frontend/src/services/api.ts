import axios from 'axios';

const API_URL =
  import.meta.env.VITE_API_URL || 'http://13.62.103.92:5000/api';
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('[API Response Error]', {
        status: error.response.status,
        data: error.response.data,
        message: error.response.data?.error || 'Server error'
      });
    } else if (error.request) {
      // Request made but no response
      console.error('[API Request Error - No Response]', error.request);
    } else {
      // Error setting up request
      console.error('[API Error]', error.message);
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authService = {
  register: async (name: string, email: string, password: string) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error: any) {
      throw error.response?.data?.error || 'Registration failed';
    }
  },

  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error: any) {
      throw error.response?.data?.error || 'Login failed';
    }
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error: any) {
      throw error.response?.data?.error || 'Failed to fetch user';
    }
  }
};

// Users endpoints
export const userService = {
  getAll: () => api.get('/users'),
  getById: (id: string) => api.get(`/users/${id}`),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

// Teams endpoints
export const teamService = {
  getAll: () => api.get('/teams'),
  getById: (id: string) => api.get(`/teams/${id}`),
  create: (data: any) => api.post('/teams', data),
  update: (id: string, data: any) => api.put(`/teams/${id}`, data),
  addMember: (teamId: string, userId: string) =>
    api.post(`/teams/${teamId}/members`, { userId }),
  removeMember: (teamId: string, userId: string) =>
    api.delete(`/teams/${teamId}/members/${userId}`),
};

// Events endpoints
export const eventService = {
  getAll: () => api.get('/events'),
  getById: (id: string) => api.get(`/events/${id}`),
  create: (data: any) => api.post('/events', data),
  update: (id: string, data: any) => api.put(`/events/${id}`, data),
  delete: (id: string) => api.delete(`/events/${id}`),
};

// Scores endpoints
export const scoreService = {
  getLeaderboard: () => api.get('/scores'),
  getTeamScores: (teamId: string) => api.get(`/scores/team/${teamId}`),
  addScore: (data: any) => api.post('/scores', data),
  updateScore: (id: string, data: any) => api.put(`/scores/${id}`, data),
  deleteScore: (id: string) => api.delete(`/scores/${id}`),
};

export const qrService = {
  scan: (code: string) => api.post('/qrcodes/scan', { code }),
  getAll: () => api.get('/qrcodes'),
  create: (label: string, points: number) => api.post('/qrcodes', { label, points }),
  getImage: (id: string) => api.get(`/qrcodes/${id}/image`),
  delete: (id: string) => api.delete(`/qrcodes/${id}`),
};
export default api;
