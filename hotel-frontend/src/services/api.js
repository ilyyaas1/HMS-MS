import axios from 'axios';
import keycloak from '../keycloak';

const api = axios.create({
    baseURL: 'http://localhost:8080', // API Gateway URL
});

api.interceptors.request.use(async (config) => {
    if (keycloak.authenticated) {
        try {
            await keycloak.updateToken(30);
            config.headers.Authorization = `Bearer ${keycloak.token}`;
        } catch (error) {
            console.error('Failed to update token', error);
            keycloak.login();
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Rooms
export const getRooms = async () => {
    const response = await api.get('/room-service/rooms');
    return response.data;
};

export const getRoomById = async (id) => {
    const response = await api.get(`/room-service/rooms/${id}`);
    return response.data;
};

export const createRoom = async (roomData) => {
    const response = await api.post('/room-service/rooms', roomData);
    return response.data;
};

export const updateRoom = async (id, roomData) => {
    const response = await api.put(`/room-service/rooms/${id}`, roomData);
    return response.data;
};

export const deleteRoom = async (id) => {
    await api.delete(`/room-service/rooms/${id}`);
};

// Bookings
export const getAllBookings = async () => {
    const response = await api.get('/booking-service/bookings');
    return response.data;
};

export const getUserBookings = async (userId) => {
    const response = await api.get(`/booking-service/bookings/user/${userId}`);
    return response.data;
};

export const createBooking = async (bookingData) => {
    const response = await api.post('/booking-service/bookings', bookingData);
    return response.data;
};

export const updateBookingStatus = async (id, status) => {
    // Ensure id is a number
    const bookingId = typeof id === 'string' ? parseInt(id) : id;
    // URL encode the status parameter
    const encodedStatus = encodeURIComponent(status);
    const response = await api.put(`/booking-service/bookings/${bookingId}/status?status=${encodedStatus}`);
    return response.data;
};

export const deleteBooking = async (id) => {
    await api.delete(`/booking-service/bookings/${id}`);
};

// Users
export const createUser = async (userData) => {
    const response = await api.post('/user-service/users', userData);
    return response.data;
};

export const getAllUsers = async () => {
    const response = await api.get('/user-service/users');
    return response.data;
};

export const updateUser = async (keycloakId, userData) => {
    const response = await api.put(`/user-service/users/${keycloakId}`, userData);
    return response.data;
};

export default api;
