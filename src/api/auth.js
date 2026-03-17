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

export const getProfile = async (token) => {
  const response = await axios.get(`${API_BASE}/user/profile`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const editProfile = async (token, fullName, phone, location) => {
  const response = await axios.put(`${API_BASE}/user/profile`,
    { fullName, phone, location },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const editPassword = async (token, currentPassword, newPassword) => {
  const response = await axios.put(`${API_BASE}/user/password`,
    { currentPassword, newPassword },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const uploadPhoto = async (token, file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post(`${API_BASE}/user/photo`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};