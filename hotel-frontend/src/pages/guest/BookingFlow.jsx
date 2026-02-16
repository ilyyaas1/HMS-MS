import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, addDays, differenceInDays } from 'date-fns';
import { useForm } from 'react-hook-form';
import { Check, ChevronRight, Calendar, User, CreditCard } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../context/ToastContext';
import { getRoomById, createBooking } from '../../services/api';
import { useKeycloak } from '@react-keycloak/web';

const steps = [
    { id: 1, name: 'Dates', icon: Calendar },
    { id: 2, name: 'Details', icon: User },
    { id: 3, name: 'Confirm', icon: Check },
];

const BookingFlow = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { keycloak } = useKeycloak();
    const toast = useToast();

    const [currentStep, setCurrentStep] = useState(1);
    const [room, setRoom] = useState(null);
    const [bookingData, setBookingData] = useState({
        checkIn: '',
        checkOut: '',
        guests: 1,
        specialRequests: ''
    });

    const { register, handleSubmit, formState: { errors } } = useForm();

    useEffect(() => {
        const fetchRoom = async () => {
            try {
                const data = await getRoomById(roomId);
                setRoom(data);
            } catch (error) {
                toast.error("Failed to load room details");
                navigate('/');
            }
        };
        fetchRoom();
    }, [roomId, navigate, toast]);

    const handleDateSubmit = (e) => {
        e.preventDefault();
        if (!bookingData.checkIn || !bookingData.checkOut) {
            toast.error("Please select dates");
            return;
        }
        setCurrentStep(2);
    };

    const onFinalSubmit = async (data) => {
        try {
            const payload = {
                roomId: parseInt(roomId),
                userId: keycloak.tokenParsed.sub, // User ID from Keycloak
                checkInDate: bookingData.checkIn,
                checkOutDate: bookingData.checkOut,
                status: 'PENDING'
            };
            await createBooking(payload);
            toast.success("Booking confirmed!");
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || "Booking failed");
        }
    };

    if (!room) return <div className="p-10 text-center">Loading...</div>;

    const nights = bookingData.checkIn && bookingData.checkOut
        ? differenceInDays(new Date(bookingData.checkOut), new Date(bookingData.checkIn))
        : 0;
    const total = nights * room.price;

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            {/* Steps */}
            <div className="mb-8">
                <div className="flex items-center justify-center">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex items-center">
                            <div className={cn(
                                "flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold transition-colors",
                                currentStep >= step.id ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300 text-gray-400"
                            )}>
                                <step.icon className="w-5 h-5" />
                            </div>
                            <div className={cn(
                                "ml-3 text-sm font-medium",
                                currentStep >= step.id ? "text-blue-600" : "text-gray-400"
                            )}>
                                {step.name}
                            </div>
                            {index < steps.length - 1 && (
                                <div className={cn(
                                    "w-12 h-0.5 mx-4",
                                    currentStep > step.id ? "bg-blue-600" : "bg-gray-300"
                                )} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="md:col-span-2">
                    <Card>
                        <CardContent className="p-6">
                            {currentStep === 1 && (
                                <form onSubmit={handleDateSubmit} className="space-y-6">
                                    <h2 className="text-2xl font-bold">Select Dates</h2>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="Check-in Date"
                                            type="date"
                                            value={bookingData.checkIn}
                                            onChange={(e) => setBookingData({ ...bookingData, checkIn: e.target.value })}
                                            min={format(new Date(), 'yyyy-MM-dd')}
                                            required
                                        />
                                        <Input
                                            label="Check-out Date"
                                            type="date"
                                            value={bookingData.checkOut}
                                            onChange={(e) => setBookingData({ ...bookingData, checkOut: e.target.value })}
                                            min={bookingData.checkIn || format(new Date(), 'yyyy-MM-dd')}
                                            required
                                        />
                                    </div>
                                    <Button type="submit" className="w-full">Continue <ChevronRight className="ml-2 w-4 h-4" /></Button>
                                </form>
                            )}

                            {currentStep === 2 && (
                                <form onSubmit={handleSubmit((data) => { setBookingData({ ...bookingData, ...data }); setCurrentStep(3); })} className="space-y-6">
                                    <h2 className="text-2xl font-bold">Guest Details</h2>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input label="First Name" {...register('firstName', { required: true })} />
                                        <Input label="Last Name" {...register('lastName', { required: true })} />
                                    </div>
                                    <Input label="Email" type="email" {...register('email', { required: true })} />
                                    <Input label="Phone" type="tel" {...register('phone', { required: true })} />
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium">Special Requests</label>
                                        <textarea
                                            {...register('specialRequests')}
                                            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
                                        />
                                    </div>
                                    <div className="flex gap-4">
                                        <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>Back</Button>
                                        <Button type="submit" className="flex-1">Review Booking</Button>
                                    </div>
                                </form>
                            )}

                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-bold">Confirm Booking</h2>
                                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Dates</span>
                                            <span className="font-medium">{bookingData.checkIn} to {bookingData.checkOut}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Guests</span>
                                            <span className="font-medium">{bookingData.guests || 1} Person(s)</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Total Price</span>
                                            <span className="font-bold text-blue-600 text-lg">${total}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <Button variant="outline" onClick={() => setCurrentStep(2)}>Back</Button>
                                        <Button onClick={onFinalSubmit} className="flex-1 w-full bg-green-600 hover:bg-green-700">
                                            Confirm & Pay
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Order Summary */}
                <div>
                    <Card className="sticky top-24">
                        <CardHeader>
                            <CardTitle>Booking Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <img
                                src={`https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80`}
                                alt="Room"
                                className="w-full h-40 object-cover rounded-md"
                            />
                            <div>
                                <h3 className="font-bold">{room.type} Room</h3>
                                <p className="text-sm text-gray-500">Room {room.roomNumber}</p>
                            </div>
                            <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Price per night</span>
                                    <span>${room.price}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Nights</span>
                                    <span>{nights}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg border-t pt-2">
                                    <span>Total</span>
                                    <span>${total > 0 ? total : 0}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default BookingFlow;
