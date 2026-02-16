import React, { useState, useEffect } from 'react';
import { Search, Mail, Phone, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../../components/ui/Table';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { getAllUsers, getAllBookings } from '../../services/api';
import { format } from 'date-fns';

const Guests = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log('Fetching users and bookings...');
                const [usersData, bookingsData] = await Promise.all([
                    getAllUsers(),
                    getAllBookings()
                ]);
                console.log('Users fetched:', usersData);
                console.log('Bookings fetched:', bookingsData);
                setUsers(usersData || []);
                setBookings(bookingsData || []);
            } catch (error) {
                console.error('Failed to fetch data:', error);
                console.error('Error details:', error.response?.data || error.message);
                console.error('Error status:', error.response?.status);
                console.error('Error URL:', error.config?.url);
                console.error('Full error:', error);
                
                // Set user-friendly error message
                if (error.response?.status === 401) {
                    setError('Authentication error - Please log in again');
                } else if (error.response?.status === 403) {
                    setError('Access denied - Admin role required');
                } else if (error.response?.status >= 500) {
                    setError('Server error - Please try again later');
                } else if (error.message?.includes('Network Error') || error.code === 'ECONNREFUSED') {
                    setError('Cannot connect to server - Check if services are running');
                } else {
                    setError(`Failed to load data: ${error.message || 'Unknown error'}`);
                }
                setUsers([]);
                setBookings([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Enrich users with booking statistics
    const enrichedUsers = users.map(user => {
        const userBookings = bookings.filter(b => b.userId === user.keycloakId);
        const totalSpent = userBookings.reduce((sum, b) => {
            const price = typeof b.totalPrice === 'number' ? b.totalPrice : parseFloat(b.totalPrice) || 0;
            return sum + price;
        }, 0);
        const lastBooking = userBookings.sort((a, b) => {
            const dateA = a.checkInDate ? new Date(a.checkInDate + 'T00:00:00').getTime() : 0;
            const dateB = b.checkInDate ? new Date(b.checkInDate + 'T00:00:00').getTime() : 0;
            return dateB - dateA;
        })[0];

        return {
            ...user,
            bookingCount: userBookings.length,
            totalSpent,
            lastVisit: lastBooking?.checkInDate,
            status: lastBooking?.status || 'N/A'
        };
    });

    const filteredUsers = enrichedUsers.filter(user =>
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    console.log('Rendering Guests page with:', { users: users.length, bookings: bookings.length, enrichedUsers: enrichedUsers.length });

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Guests</h2>
                <p className="text-gray-500 mt-1">Directory of all registered guests ({users.length} total)</p>
            </div>

            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4">
                        <p className="text-red-600 text-sm">{error}</p>
                        <button 
                            onClick={() => {
                                setError(null);
                                window.location.reload();
                            }}
                            className="mt-2 text-red-700 text-sm underline"
                        >
                            Retry
                        </button>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>All Guests</CardTitle>
                        <div className="w-72">
                            <Input
                                icon={Search}
                                placeholder="Search guests..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredUsers.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Bookings</TableHead>
                                    <TableHead>Total Spent</TableHead>
                                    <TableHead>Last Visit</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                    {user.firstName?.[0] || 'U'}
                                                </div>
                                                {user.firstName} {user.lastName}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Mail className="w-3 h-3" /> {user.email || 'N/A'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Phone className="w-3 h-3" /> {user.phoneNumber || 'N/A'}
                                            </div>
                                        </TableCell>
                                        <TableCell>{user.bookingCount} booking{user.bookingCount !== 1 ? 's' : ''}</TableCell>
                                        <TableCell className="font-semibold">${user.totalSpent.toLocaleString()}</TableCell>
                                        <TableCell>
                                            {user.lastVisit ? (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    {format(new Date(user.lastVisit + 'T00:00:00'), 'MMM d, yyyy')}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">No bookings</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {user.status !== 'N/A' ? (
                                                <Badge variant={user.status === 'CONFIRMED' ? 'success' : 'warning'}>
                                                    {user.status}
                                                </Badge>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-12">
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : (
                                <>
                                    <p className="text-gray-500 mb-2">
                                        {searchTerm ? 'No guests found matching your search' : 'No registered guests yet'}
                                    </p>
                                    {!searchTerm && users.length === 0 && (
                                        <>
                                            <p className="text-sm text-gray-400 mb-4">
                                                Guests will appear here after they create accounts and make bookings
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                Make sure users have logged in at least once (UserSync component creates user records)
                                            </p>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Guests;
