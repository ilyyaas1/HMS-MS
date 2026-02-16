import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { RefreshCw, Calendar, BedDouble, DollarSign, AlertCircle } from 'lucide-react';
import { getAllBookings, getRooms } from '../../services/api';
import { Badge } from '../../components/ui/Badge';

const AdminDashboard = () => {
    // Independent states
    const [bookings, setBookings] = useState({ data: [], loading: true, error: null });
    const [rooms, setRooms] = useState({ data: [], loading: true, error: null });

    const fetchBookings = useCallback(async () => {
        setBookings(prev => ({ ...prev, loading: true, error: null }));
        try {
            const data = await getAllBookings();
            setBookings({ data: Array.isArray(data) ? data : [], loading: false, error: null });
        } catch (err) {
            console.error('Fetch bookings failed', err);
            const msg = err.response?.status === 403 ? 'Access Denied (403)' :
                err.response?.status === 401 ? 'Unauthorized (401)' :
                    err.message || 'Failed to load bookings';
            setBookings(prev => ({ ...prev, data: [], loading: false, error: msg }));
        }
    }, []);

    const fetchRooms = useCallback(async () => {
        setRooms(prev => ({ ...prev, loading: true, error: null }));
        try {
            const data = await getRooms();
            setRooms({ data: Array.isArray(data) ? data : [], loading: false, error: null });
        } catch (err) {
            console.error('Fetch rooms failed', err);
            const msg = err.response?.status === 403 ? 'Access Denied (403)' :
                err.response?.status === 401 ? 'Unauthorized (401)' :
                    err.message || 'Failed to load rooms';
            setRooms(prev => ({ ...prev, data: [], loading: false, error: msg }));
        }
    }, []);

    const refreshAll = () => {
        fetchBookings();
        fetchRooms();
    };

    useEffect(() => {
        refreshAll();
    }, [fetchBookings, fetchRooms]);

    // Statistics
    const totalRevenue = bookings.data.reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);
    const activeBookings = bookings.data.filter(b => b.status === 'CONFIRMED' || b.status === 'CHECKED_IN').length;
    const availableRooms = rooms.data.filter(r => r.available).length;

    // Helper for status badge
    const getStatusVariant = (status) => {
        switch (status) {
            case 'CONFIRMED': return 'success';
            case 'PENDING': return 'warning';
            case 'CANCELLED': return 'danger';
            default: return 'secondary';
        }
    };

    return (
        <div className="space-y-8 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-gray-500">Overview of hotel operations</p>
                </div>
                <Button onClick={refreshAll} variant="outline" className="gap-2">
                    <RefreshCw className="w-4 h-4" /> Refresh
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-gray-500">All time earnings</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
                        <Calendar className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeBookings}</div>
                        <p className="text-xs text-gray-500">Confirmed & Checked In</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Available Rooms</CardTitle>
                        <BedDouble className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{availableRooms} / {rooms.data.length}</div>
                        <p className="text-xs text-gray-500">Currently bookable</p>
                    </CardContent>
                </Card>
            </div>

            {/* Content Grid */}
            <div className="grid gap-8 grid-cols-1">

                {/* Recent Bookings */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Recent Bookings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {bookings.loading ? (
                            <div className="text-center py-4 text-gray-500">Loading bookings...</div>
                        ) : bookings.error ? (
                            <div className="flex items-center gap-2 text-red-500 py-4">
                                <AlertCircle className="w-4 h-4" /> {bookings.error}
                            </div>
                        ) : bookings.data.length === 0 ? (
                            <div className="text-center py-4 text-gray-500">No bookings found</div>
                        ) : (
                            <div className="space-y-4">
                                {bookings.data.slice(-5).reverse().map(booking => (
                                    <div key={booking.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                        <div>
                                            <div className="font-medium">Room {booking.roomId}</div>
                                            <div className="text-sm text-gray-500">{booking.checkInDate} - {booking.checkOutDate}</div>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant={getStatusVariant(booking.status)}>{booking.status}</Badge>
                                            <div className="text-sm font-bold mt-1">${booking.totalPrice}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;
