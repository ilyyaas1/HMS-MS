-- Create databases for each microservice
CREATE DATABASE user_db;
CREATE DATABASE room_db;
CREATE DATABASE booking_db;
CREATE DATABASE notification_db;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE user_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE room_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE booking_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE notification_db TO postgres;
