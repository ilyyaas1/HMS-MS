import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';

const RoleBasedRedirect = () => {
    const { keycloak } = useKeycloak();
    const navigate = useNavigate();

    useEffect(() => {
        if (keycloak.authenticated) {
            // Check if user has admin role
            if (keycloak.hasRealmRole('admin')) {
                console.log('Admin user detected, redirecting to /admin');
                navigate('/admin');
            }
        }
    }, [keycloak.authenticated, navigate]);

    return null;
};

export default RoleBasedRedirect;
