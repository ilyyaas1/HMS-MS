import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Edit, Trash, Search, Filter } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';
import { getRooms, createRoom, updateRoom, deleteRoom, getAllBookings } from '../../services/api';

const Rooms = () => {
    const [rooms, setRooms] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const { register, handleSubmit, reset, setValue } = useForm();
    const toast = useToast();

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchRooms(), fetchBookings()]);
            setLoading(false);
        };
        loadData();
    }, []);

    const fetchRooms = async () => {
        try {
            const data = await getRooms();
            console.log('Rooms fetched:', data);
            setRooms(data || []);
        } catch (error) {
            console.error("Failed to fetch rooms:", error);
            toast.error("Failed to fetch rooms");
            setRooms([]);
        }
    };

    const fetchBookings = async () => {
        try {
            const data = await getAllBookings();
            console.log('Bookings fetched:', data);
            setBookings(data || []);
        } catch (error) {
            console.error("Failed to fetch bookings:", error);
            setBookings([]);
        }
    };

    // Get room status dynamically based on bookings
    const getRoomStatus = (roomId) => {
        // Handle both number and string roomId
        const roomIdNum = typeof roomId === 'string' ? parseInt(roomId) : roomId;
        
        if (!bookings || bookings.length === 0) {
            return { status: 'available', label: 'Available' };
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Find active confirmed bookings for this room
        const activeBookings = bookings.filter(booking => {
            // Handle both number and string roomId from booking
            const bookingRoomId = typeof booking.roomId === 'string' ? parseInt(booking.roomId) : booking.roomId;
            
            if (bookingRoomId !== roomIdNum || booking.status !== 'CONFIRMED') {
                return false;
            }
            
            const checkIn = booking.checkInDate ? new Date(booking.checkInDate + 'T00:00:00') : null;
            const checkOut = booking.checkOutDate ? new Date(booking.checkOutDate + 'T00:00:00') : null;
            
            if (!checkIn || !checkOut || isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
                return false;
            }
            
            // Check if room is currently occupied (check-in <= today <= check-out)
            return checkIn <= today && checkOut >= today;
        });
        
        // Check for future bookings
        const futureBookings = bookings.filter(booking => {
            // Handle both number and string roomId from booking
            const bookingRoomId = typeof booking.roomId === 'string' ? parseInt(booking.roomId) : booking.roomId;
            
            if (bookingRoomId !== roomIdNum || booking.status !== 'CONFIRMED') {
                return false;
            }
            
            const checkIn = booking.checkInDate ? new Date(booking.checkInDate + 'T00:00:00') : null;
            
            if (!checkIn || isNaN(checkIn.getTime())) return false;
            
            return checkIn > today;
        });
        
        if (activeBookings.length > 0) {
            return { status: 'occupied', label: 'Occupied' };
        } else if (futureBookings.length > 0) {
            return { status: 'booked', label: 'Booked' };
        } else {
            return { status: 'available', label: 'Available' };
        }
    };

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            // Ensure available is set to true by default for new rooms
            const roomData = {
                ...data,
                available: data.available !== undefined ? data.available : true
            };

            if (editingRoom) {
                await updateRoom(editingRoom.id, roomData);
                toast.success("Room updated successfully");
            } else {
                await createRoom(roomData);
                toast.success("Room created successfully");
            }
            setIsModalOpen(false);
            reset();
            setEditingRoom(null);
            fetchRooms();
            fetchBookings();
        } catch (error) {
            toast.error("Operation failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (room) => {
        setEditingRoom(room);
        setValue('roomNumber', room.roomNumber);
        setValue('type', room.type);
        setValue('price', room.price);
        setValue('available', room.available);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure?")) {
            try {
                await deleteRoom(id);
                toast.success("Room deleted");
                fetchRooms();
            } catch (error) {
                toast.error("Delete failed");
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Rooms</h2>
                    <p className="text-muted-foreground mt-1">Manage hotel rooms and availability.</p>
                </div>
                <Button onClick={() => { setIsModalOpen(true); setEditingRoom(null); reset(); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Room
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search rooms..." className="pl-9" />
                </div>
                <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                </Button>
            </div>

            <Card>
                {loading ? (
                    <CardContent className="py-12">
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    </CardContent>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Room Number</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rooms && rooms.length > 0 ? rooms.map((room) => {
                                const roomStatus = getRoomStatus(room.id);
                                const isOccupiedOrBooked = roomStatus.status === 'occupied' || roomStatus.status === 'booked';
                                return (
                                <TableRow key={room.id}>
                                    <TableCell className="font-medium">{room.roomNumber || 'N/A'}</TableCell>
                                    <TableCell>{room.type || 'N/A'}</TableCell>
                                    <TableCell>${room.price || 0}</TableCell>
                                    <TableCell>
                                        <Badge variant={isOccupiedOrBooked ? 'danger' : 'success'}>
                                            {roomStatus.label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(room)}>
                                            <Edit className="w-4 h-4 text-blue-500" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(room.id)}>
                                            <Trash className="w-4 h-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                                );
                            }) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                        No rooms found. Click "Add Room" to create one.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingRoom ? "Edit Room" : "Add New Room"}
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        label="Room Number"
                        {...register('roomNumber', { required: true })}
                        placeholder="e.g. 101"
                    />
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Room Type</label>
                        <select
                            {...register('type', { required: true })}
                            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <option value="Single">Single</option>
                            <option value="Double">Double</option>
                            <option value="Suite">Suite</option>
                            <option value="Deluxe">Deluxe</option>
                        </select>
                    </div>
                    <Input
                        label="Price per Night"
                        type="number"
                        {...register('price', { required: true })}
                        placeholder="e.g. 150"
                    />
                    <div className="flex justify-end gap-2 mt-6">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isLoading}>
                            {editingRoom ? 'Update' : 'Create'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Rooms;
