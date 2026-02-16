import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { useKeycloak } from '@react-keycloak/web';

const GuestLayout = () => {
    const { keycloak } = useKeycloak();
    const location = useLocation();
    const isHome = location.pathname === '/';

    return (
        <div className="min-h-screen flex flex-col font-sans">
            <nav className={cn(
                "fixed w-full z-50 transition-all duration-300",
                isHome ? "bg-transparent text-white pt-6" : "bg-white text-gray-900 shadow-sm py-4"
            )}>
                <div className="container mx-auto px-6 flex justify-between items-center">
                    <Link to="/" className="text-2xl font-bold tracking-tighter flex items-center gap-2">
                        <span className={cn("text-3xl", isHome ? "text-white" : "text-blue-600")}>LUXE</span>
                        <span className="font-light">STAY</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8 font-medium">
                        <Link to="/" className="hover:opacity-80 transition-opacity">Home</Link>
                        <Link to="/rooms" className="hover:opacity-80 transition-opacity">Rooms</Link>
                        <Link to="/about" className="hover:opacity-80 transition-opacity">About</Link>
                        <Link to="/contact" className="hover:opacity-80 transition-opacity">Contact</Link>
                    </div>

                    <div className="flex items-center gap-4">
                        {keycloak.authenticated ? (
                            <Link to="/dashboard">
                                <Button variant={isHome ? "secondary" : "default"}>My Dashboard</Button>
                            </Link>
                        ) : (
                            <Button
                                variant={isHome ? "outline" : "default"}
                                className={isHome ? "border-white text-white hover:bg-white hover:text-black" : ""}
                                onClick={() => keycloak.login()}
                            >
                                Sign In
                            </Button>
                        )}
                    </div>
                </div>
            </nav>

            <main className="flex-1">
                <Outlet />
            </main>

            <footer className="bg-slate-900 text-slate-400 py-12">
                <div className="container mx-auto px-6 grid md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-white text-lg font-bold mb-4">LuxeStay</h3>
                        <p>Experience luxury and comfort in the heart of the city.</p>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li><Link to="/" className="hover:text-white">Home</Link></li>
                            <li><Link to="/rooms" className="hover:text-white">Rooms</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-4">Contact</h4>
                        <p>123 Luxury Ave, NY</p>
                        <p>+1 (555) 123-4567</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default GuestLayout;
