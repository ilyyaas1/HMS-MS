import api from './api';

const getAllRooms = async () => {
    try {
        const response = await api.get('/rooms');
        return response.data;
    } catch (error) {
        console.error("Error fetching rooms", error);
        throw error;
    }
};

const createRoom = async (roomData) => {
    try {
        const response = await api.post('/rooms', roomData);
        return response.data;
    } catch (error) {
        console.error("Error creating room", error);
        throw error;
    }
};

const deleteRoom = async (id) => {
    try {
        await api.delete(`/rooms/${id}`);
    } catch (error) {
        console.error("Error deleting room", error);
        throw error;
    }
};

export default {
    getAllRooms,
    createRoom,
    deleteRoom
};
