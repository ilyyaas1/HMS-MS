import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Search, MapPin, Calendar, Users, Star } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { getRooms } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import RoleBasedRedirect from '../../components/RoleBasedRedirect';
import { Badge } from '../../components/ui/Badge';

const Home = () => {
    const [rooms, setRooms] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        getRooms().then(setRooms).catch(console.error);
    }, []);

    return (
        <div>
            <RoleBasedRedirect />
            {/* Hero Section */}
            <section className="relative h-[600px] flex items-center justify-center text-white">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                        alt="Hotel Hero"
                        className="w-full h-full object-cover brightness-50"
                    />
                </div>

                <div className="relative z-10 text-center space-y-6 max-w-4xl px-4">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight animate-in slide-in-from-bottom-10 fade-in duration-700">
                        Find Your <span className="text-blue-400">Perfect</span> Stay
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-200">
                        Experience world-class luxury and comfort at unbeatable prices.
                    </p>
                </div>

                {/* Search Bar - Floating */}
                <div className="absolute -bottom-12 z-20 w-full max-w-5xl px-4">
                    <div className="bg-white rounded-xl shadow-2xl p-4 md:p-6 grid md:grid-cols-4 gap-4 items-end">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-blue-500" /> Location
                            </label>
                            <input type="text" value="New York, USA" readOnly className="w-full p-2 bg-gray-50 rounded-md border-transparent focus:border-blue-500 font-medium" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-blue-500" /> Check-in - Check-out
                            </label>
                            <input type="text" placeholder="Select Dates" className="w-full p-2 bg-gray-50 rounded-md border-transparent focus:border-blue-500" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                                <Users className="w-4 h-4 text-blue-500" /> Guests
                            </label>
                            <select className="w-full p-2 bg-gray-50 rounded-md border-transparent focus:border-blue-500">
                                <option>2 Adults, 0 Children</option>
                                <option>1 Adult</option>
                            </select>
                        </div>
                        <Button size="lg" className="w-full text-lg h-[46px]" onClick={() => document.getElementById('rooms').scrollIntoView({ behavior: 'smooth' })}>
                            Search Rooms
                        </Button>
                    </div>
                </div>
            </section>

            {/* Featured Rooms */}
            <section id="rooms" className="py-24 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900">Featured Rooms</h2>
                        <p className="text-gray-600 mt-2">Choose from our selection of premium suites and rooms.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {rooms.length > 0 ? rooms.map((room) => (
                            <Card key={room.id} className="overflow-hidden group cursor-pointer" onClick={() => navigate(`/book/${room.id}`)}>
                                <div className="relative h-64 overflow-hidden">
                                    <img
                                        src={`https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80`}
                                        alt={room.type}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                                        ${room.price}/night
                                    </div>
                                </div>
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="text-xl font-bold">{room.type} Room</h3>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm text-gray-500">Room {room.roomNumber}</p>
                                                {!room.available && (
                                                    <Badge variant="danger" className="text-[10px] py-0">Occupied</Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 text-yellow-500">
                                            <Star className="w-4 h-4 fill-current" />
                                            <span className="text-sm font-bold text-gray-900">4.8</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 text-sm text-gray-600 mb-4">
                                        <span>2 Guests</span>
                                        <span>•</span>
                                        <span>35m²</span>
                                        <span>•</span>
                                        <span>King Bed</span>
                                    </div>
                                    <Button
                                        className="w-full"
                                        variant={room.available ? "default" : "outline"}
                                        disabled={!room.available}
                                        onClick={(e) => {
                                            if (!room.available) {
                                                e.stopPropagation();
                                                return;
                                            }
                                        }}
                                    >
                                        {room.available ? 'Book Now' : 'Currently Occupied'}
                                    </Button>
                                </CardContent>
                            </Card>
                        )) : (
                            <p className="text-center col-span-3 text-gray-500">Loading rooms available...</p>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
