import React, { useEffect, useRef } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { createUser } from '../services/api';

/**
 * This component automatically creates a user in the database
 * when they first login through Keycloak
 */
const UserSync = ({ children }) => {
    const { keycloak, initialized } = useKeycloak();
    const hasSynced = useRef(false);

    useEffect(() => {
        const syncUser = async () => {
            // Only sync once per session and only when authenticated
            if (initialized && keycloak.authenticated && keycloak.tokenParsed && !hasSynced.current) {
                try {
                    const userData = {
                        keycloakId: keycloak.tokenParsed.sub,
                        firstName: keycloak.tokenParsed.given_name || keycloak.tokenParsed.name || 'User',
                        lastName: keycloak.tokenParsed.family_name || '',
                        email: keycloak.tokenParsed.email || '',
                        phoneNumber: keycloak.tokenParsed.phone_number || '',
                        preferences: ""
                    };

                    console.log('Syncing user to database:', userData);

                    // Try to create user (will fail silently if already exists)
                    await createUser(userData);
                    console.log('User synced successfully');
                    hasSynced.current = true;
                } catch (error) {
                    // User might already exist, which is fine
                    if (error.response?.status === 409 || error.response?.status === 500 || error.response?.status === 400) {
                        console.log('User already exists in database or validation error (this is OK)');
                        hasSynced.current = true;
                    } else if (error.response?.status === 401 || error.response?.status === 403) {
                        console.warn('Authentication/Authorization error during user sync:', error.response?.status);
                        // Don't mark as synced, might retry later
                    } else {
                        console.error('Failed to sync user:', error);
                        console.error('Error details:', error.response?.data || error.message);
                    }
                }
            }
        };

        syncUser();
    }, [initialized, keycloak.authenticated]);

    return <>{children}</>;
};

export default UserSync;
