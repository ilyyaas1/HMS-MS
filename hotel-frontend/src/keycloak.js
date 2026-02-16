import Keycloak from 'keycloak-js';

const keycloakConfig = {
    url: 'http://localhost:8180/',
    realm: 'hotel-realm',
    clientId: 'hotel-frontend',
};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;
