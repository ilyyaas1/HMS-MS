import React from 'react';
import { Navigate } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';

const PrivateRoute = ({ children, roles }) => {
    const { keycloak, initialized } = useKeycloak();

    if (!initialized) {
        return <div>Loading...</div>;
    }

    if (!keycloak.authenticated) {
        keycloak.login();
        return <div>Redirecting to login...</div>;
    }

    // Role check
    if (roles) {
        const userRoles = keycloak.tokenParsed?.realm_access?.roles || [];
        console.log('Required roles:', roles);
        console.log('User roles:', userRoles);

        const hasRequiredRole = roles.some(role => keycloak.hasRealmRole(role));

        // Special case: if 'guest' is a required role, allow any authenticated user
        // This handles new registrations that might not have a default role yet
        const isGuestRoute = roles.includes('guest');

        if (!hasRequiredRole && (!isGuestRoute || !keycloak.authenticated)) {
            console.warn('Access denied. User does not have required roles.');
            return <Navigate to="/" replace />;
        }

        if (!hasRequiredRole && isGuestRoute && keycloak.authenticated) {
            console.log('Allowing access to guest route for authenticated user without explicit guest role.');
        }
    }

    return children;
};

export default PrivateRoute;
