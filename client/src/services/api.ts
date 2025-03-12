import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const registerEmail = (email: string) => 
  api.post('/auth/register/email', { email });

export const verifyOtp = (email: string, otp: string) =>
  api.post('/auth/verify-otp', { email, otp });

export const login = (email: string) =>
  api.post('/auth/login', { email });

export const updateProfile = (formData: FormData) =>
  api.post('/user/profile', formData);

export const getProfile = () =>
  api.get('/user/profile');

export const getYoutubeUrl = () =>
  api.get('/user/youtube-url');

export default api;
