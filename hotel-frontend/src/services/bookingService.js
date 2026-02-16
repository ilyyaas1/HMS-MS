import api from './api';

const createBooking = async (bookingData) => {
    try {
        const response = await api.post('/bookings', bookingData);
        return response.data;
    } catch (error) {
        console.error("Error creating booking", error);
        throw error;
    }
};

const getMyBookings = async (userId) => {
    try {
        const response = await api.get(`/bookings/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching user bookings", error);
        throw error;
    }
};

const getAllBookings = async () => {
    try {
        const response = await api.get('/bookings');
        return response.data;
    } catch (error) {
        console.error("Error fetching all bookings", error);
        throw error;
    }
};

export default {
    createBooking,
    getMyBookings,
    getAllBookings,
    cancelBooking: async (id) => {
        try {
            const response = await api.put(`/bookings/${id}/status?status=CANCELLED`);
            return response.data;
        } catch (error) {
            console.error("Error cancelling booking", error);
            throw error;
        }
    }
};
