import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' }
});

export function readableError(error) {
  return error?.response?.data?.message || error?.message || 'Something went wrong';
}
export default api;
