import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar, User, LogOut } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useKeycloak } from '@react-keycloak/web';
import { getUserBookings, updateUser, updateBookingStatus } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const UserDashboard = () => {
    const { keycloak } = useKeycloak();
    const [bookings, setBookings] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [cancellingBookingId, setCancellingBookingId] = useState(null);
    const toast = useToast();

    const fetchBookings = async () => {
        if (keycloak.tokenParsed?.sub) {
            try {
                console.log('Fetching bookings for user:', keycloak.tokenParsed.sub);
                const data = await getUserBookings(keycloak.tokenParsed.sub);
                console.log('Bookings fetched:', data);
                // Ensure data is an array
                setBookings(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Failed to fetch bookings:', err);
                toast?.error("Failed to load your bookings");
            }
        }
    };

    useEffect(() => {
        fetchBookings();

        // Initialize edit form with current user data
        if (keycloak.tokenParsed) {
            setEditForm({
                firstName: keycloak.tokenParsed.given_name || '',
                lastName: keycloak.tokenParsed.family_name || '',
                email: keycloak.tokenParsed.email || '',
                phoneNumber: keycloak.tokenParsed.phone_number || ''
            });
        }
    }, [keycloak.tokenParsed]);

    const handleLogout = () => {
        keycloak.logout();
    };

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) {
            return;
        }

        setCancellingBookingId(bookingId);

        try {
            console.log('Attempting to cancel booking:', bookingId);

            // Call API to cancel
            await updateBookingStatus(bookingId, 'CANCELLED');

            console.log('Booking cancelled successfully');

            // Show success message
            if (toast?.success) {
                toast.success('Booking cancelled successfully');
            } else {
                alert('Booking cancelled successfully');
            }

            // Refresh the list immediately
            await fetchBookings();

        } catch (error) {
            console.error('Failed to cancel booking:', error);

            let errorMessage = 'Failed to cancel booking. Please try again.';

            if (error.response?.status === 404) {
                errorMessage = 'Booking not found. It may have already been cancelled.';
            } else if (error.response?.status === 403) {
                errorMessage = 'Permission denied. You cannot cancel this booking.';
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            if (toast?.error) {
                toast.error(errorMessage);
            } else {
                alert(errorMessage);
            }
        } finally {
            setCancellingBookingId(null);
        }
    };

    const handleEditProfile = () => {
        setIsEditModalOpen(true);
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            const keycloakId = keycloak.tokenParsed?.sub;
            if (!keycloakId) {
                throw new Error('User ID not found');
            }

            await updateUser(keycloakId, editForm);

            if (toast?.success) {
                toast.success('Profile updated successfully! Please re-login to see changes.');
            } else {
                alert('Profile updated successfully! Please re-login to see changes.');
            }
            setIsEditModalOpen(false);
        } catch (error) {
            console.error('Failed to update profile:', error);
            if (toast?.error) {
                toast.error('Failed to update profile. Please try again.');
            } else {
                alert('Failed to update profile. Please try again.');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const getStatusVariant = (status) => {
        if (!status) return 'secondary';
        const s = status.toUpperCase();
        if (s === 'CONFIRMED') return 'success';
        if (s === 'CANCELLED') return 'danger';
        if (s === 'PENDING') return 'warning';
        return 'secondary';
    };

    return (
        <div className="container mx-auto px-6 py-12">
            <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" /> Profile
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
                                {keycloak.tokenParsed?.given_name?.[0] || keycloak.tokenParsed?.name?.[0] || 'U'}
                            </div>
                            <div>
                                <h3 className="font-bold">{keycloak.tokenParsed?.name || 'User'}</h3>
                                <p className="text-sm text-gray-500">{keycloak.tokenParsed?.email || 'No email'}</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Button variant="outline" className="w-full" onClick={handleEditProfile}>
                                Edit Profile
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={handleLogout}
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Bookings List */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Calendar className="w-5 h-5" /> Recent Bookings
                    </h2>

                    {bookings.length > 0 ? bookings.map((booking) => (
                        <Card key={booking.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-bold text-lg">Room {booking.roomId}</h3>
                                            <Badge variant={getStatusVariant(booking.status)}>
                                                {booking.status || 'N/A'}
                                            </Badge>
                                        </div>
                                        <p className="text-gray-500 text-sm flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            {booking.checkInDate && booking.checkOutDate ? (
                                                <>
                                                    {format(new Date(booking.checkInDate + 'T00:00:00'), 'MMM d, yyyy')} - {format(new Date(booking.checkOutDate + 'T00:00:00'), 'MMM d, yyyy')}
                                                </>
                                            ) : 'Dates not available'}
                                        </p>
                                        <p className="text-gray-700 font-semibold mt-2">
                                            ${typeof booking.totalPrice === 'number' ? booking.totalPrice.toLocaleString() : (parseFloat(booking.totalPrice) || 0).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg text-blue-600">#{booking.id}</p>
                                        {booking.status !== 'CANCELLED' && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="mt-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleCancelBooking(booking.id)}
                                                disabled={cancellingBookingId === booking.id}
                                                isLoading={cancellingBookingId === booking.id}
                                            >
                                                {cancellingBookingId === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )) : (
                        <Card>
                            <CardContent className="p-12 text-center text-gray-500">
                                <p>You have no upcoming bookings.</p>
                                <Button className="mt-4" variant="outline" onClick={() => window.location.href = '/'}>
                                    Book a Room
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Edit Profile Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Profile"
            >
                <div className="space-y-4">
                    <Input
                        label="First Name"
                        value={editForm.firstName}
                        onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    />
                    <Input
                        label="Last Name"
                        value={editForm.lastName}
                        onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    />
                    <Input
                        label="Email"
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    />
                    <Input
                        label="Phone Number"
                        type="tel"
                        value={editForm.phoneNumber}
                        onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                        placeholder="+1 234 567 8900"
                    />
                    <div className="flex justify-end gap-2 mt-6">
                        <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveProfile} isLoading={isSaving}>
                            Save Changes
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default UserDashboard;
