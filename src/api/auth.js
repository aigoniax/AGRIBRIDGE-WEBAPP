import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

export const loginUser = async (email, password) => {
  const response = await axios.post(`${API_BASE}/login`, { email, password });
  return response.data;
};

export const registerUser = async (fullName, email, password, confirmPassword, phone, location, role) => {
  const response = await axios.post(`${API_BASE}/register`, {
    fullName,
    email,
    password,
    confirmPassword,
    phone,
    location,
    role,
  });
  return response.data;
};