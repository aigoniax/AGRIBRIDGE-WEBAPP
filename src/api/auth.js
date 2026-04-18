import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

export const loginUser = async (email, password) => {
  const response = await axios.post(`${API_BASE}/login`, { email, password });
  return response.data;
};

export const registerUser = async (fullName, email, password, confirmPassword, phone, location, role) => {
  const response = await axios.post(`${API_BASE}/register`, {
    fullName, email, password, confirmPassword, phone, location, role,
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

// Admin API calls
export const getPendingFarmers = async () => {
  const response = await axios.get(`${API_BASE}/admin/pending-farmers`);
  return response.data;
};

export const approveFarmer = async (id) => {
  const response = await axios.put(`${API_BASE}/admin/approve/${id}`);
  return response.data;
};

export const rejectFarmer = async (id) => {
  const response = await axios.put(`${API_BASE}/admin/reject/${id}`);
  return response.data;
};

// Listing API calls
export const getAllListings = async (search = '', category = '') => {
  const response = await axios.get(`${API_BASE}/listings`, {
    params: { search, category }
  });
  return response.data;
};

export const getMyListings = async (token) => {
  const response = await axios.get(`${API_BASE}/listings/my-listings`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const createListing = async (token, listingData, photoFile) => {
  const formData = new FormData();
  formData.append('produceName', listingData.produceName);
  formData.append('category', listingData.category);
  formData.append('quantity', listingData.quantity);
  formData.append('unit', listingData.unit);
  formData.append('price', listingData.price);
  formData.append('freshness', listingData.freshness);
  formData.append('pickupLocation', listingData.pickupLocation);
  if (listingData.additionalNotes) {
    formData.append('additionalNotes', listingData.additionalNotes);
  }
  if (photoFile) {
    formData.append('photo', photoFile);
  }
  const response = await axios.post(`${API_BASE}/listings`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const updateListing = async (token, id, listingData, photoFile) => {
  const formData = new FormData();
  formData.append('produceName', listingData.produceName);
  formData.append('category', listingData.category);
  formData.append('quantity', listingData.quantity);
  formData.append('unit', listingData.unit);
  formData.append('price', listingData.price);
  formData.append('freshness', listingData.freshness);
  formData.append('pickupLocation', listingData.pickupLocation);
  if (listingData.additionalNotes) {
    formData.append('additionalNotes', listingData.additionalNotes);
  }
  if (photoFile) {
    formData.append('photo', photoFile);
  }
  const response = await axios.put(`${API_BASE}/listings/${id}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const deleteListing = async (token, id) => {
  const response = await axios.delete(`${API_BASE}/listings/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Order API calls
export const getListingById = async (id) => {
  const response = await axios.get(`${API_BASE}/listings/${id}`);
  return response.data;
};

export const placeOrder = async (token, orderData) => {
  const response = await axios.post(`${API_BASE}/orders`, orderData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getMyOrders = async (token) => {
  const response = await axios.get(`${API_BASE}/orders/my-orders`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateOrderStatus = async (token, orderId, status) => {
  const response = await axios.put(
    `${API_BASE}/orders/${orderId}/status`,
    { status },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};