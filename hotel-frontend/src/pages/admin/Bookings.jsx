import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Search, Filter, Check, X, Trash } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../context/ToastContext';
import { getAllBookings, updateBookingStatus, deleteBooking, getAllUsers } from '../../services/api';

const Bookings = () => {
    const [bookings, setBookings] = useState([]);
    const [users, setUsers] = useState({});
    const [filter, setFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const toast = useToast();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [bookingsData, usersData] = await Promise.all([
                getAllBookings(),
                getAllUsers()
            ]);

            // Create a map for quick lookups
            const userMap = {};
            usersData.forEach(u => {
                userMap[u.keycloakId] = `${u.firstName} ${u.lastName}`;
            });

            setBookings(bookingsData);
            setUsers(userMap);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('Failed to load dashboard data');
        }
    };

    const fetchBookings = async () => {
        try {
            const data = await getAllBookings();
            setBookings(data);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await updateBookingStatus(id, status);
            toast.success(`Booking ${status.toLowerCase()} successfully`);
            fetchBookings();
        } catch (error) {
            toast.error('Failed to update booking status');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this booking?')) {
            try {
                await deleteBooking(id);
                toast.success('Booking deleted successfully');
                fetchBookings();
            } catch (error) {
                toast.error('Failed to delete booking');
            }
        }
    };

    const getStatusVariant = (status) => {
        switch (status) {
            case 'CONFIRMED': return 'success';
            case 'PENDING': return 'warning';
            case 'CANCELLED': return 'danger';
            case 'CHECKED_IN': return 'default';
            default: return 'secondary';
        }
    };

    // Get unique statuses from actual bookings data
    const uniqueStatuses = Array.from(new Set(bookings.map(b => b.status)));

    const filteredBookings = bookings
        .filter(b => filter === 'ALL' || b.status === filter)
        .filter(b => {
            const userName = users[b.userId] || '';
            return b.id.toString().includes(searchTerm) ||
                b.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                userName.toLowerCase().includes(searchTerm.toLowerCase());
        });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Bookings</h2>
                    <p className="text-gray-500 mt-1">View and manage all reservations ({bookings.length} total)</p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search by guest or ID..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={filter === 'ALL' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('ALL')}
                    >
                        ALL ({bookings.length})
                    </Button>
                    {uniqueStatuses.map(status => (
                        <Button
                            key={status}
                            variant={filter === status ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilter(status)}
                        >
                            {status} ({bookings.filter(b => b.status === status).length})
                        </Button>
                    ))}
                </div>
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Booking ID</TableHead>
                            <TableHead>Guest</TableHead>
                            <TableHead>Room</TableHead>
                            <TableHead>Dates</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredBookings.length > 0 ? filteredBookings.map((booking) => (
                            <TableRow key={booking.id}>
                                <TableCell className="font-medium">#{booking.id}</TableCell>
                                <TableCell>{users[booking.userId] || `Guest (${booking.userId.substring(0, 5)})`}</TableCell>
                                <TableCell>Room {booking.roomId}</TableCell>
                                <TableCell>
                                    <div className="text-sm">
                                        {booking.checkInDate && booking.checkOutDate ? (
                                            <>
                                                {format(new Date(booking.checkInDate + 'T00:00:00'), 'MMM d')} - {format(new Date(booking.checkOutDate + 'T00:00:00'), 'MMM d, yyyy')}
                                            </>
                                        ) : 'N/A'}
                                    </div>
                                </TableCell>
                                <TableCell className="font-semibold">
                                    {booking.totalPrice ? `$${(typeof booking.totalPrice === 'number' ? booking.totalPrice : parseFloat(booking.totalPrice) || 0).toLocaleString()}` : 'N/A'}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(booking.status)}>
                                        {booking.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        {booking.status === 'PENDING' && (
                                            <>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleStatusUpdate(booking.id, 'CONFIRMED')}
                                                    title="Confirm booking"
                                                >
                                                    <Check className="w-4 h-4 text-green-500" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleStatusUpdate(booking.id, 'CANCELLED')}
                                                    title="Cancel booking"
                                                >
                                                    <X className="w-4 h-4 text-red-500" />
                                                </Button>
                                            </>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(booking.id)}
                                            title="Delete booking"
                                        >
                                            <Trash className="w-4 h-4 text-gray-500" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                    {searchTerm || filter !== 'ALL' ? 'No bookings match your filters' : 'No bookings yet'}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
};

export default Bookings;
