# Project Technology Stack

## 🎨 Frontend (User Interface)
The frontend is built with a modern, component-based architecture focusing on performance and user experience.

*   **Framework**: React.js (v19) - Library for building user interfaces.
*   **Build Tool**: Vite - Next-generation frontend tooling for fast builds.
*   **Styling**: Tailwind CSS (v4) - Utility-first CSS framework for rapid UI development.
*   **Routing**: React Router (v7) - Declarative routing for single-page applications.
*   **State Management & Data Fetching**: 
    *   Axios - Promise-based HTTP client.
    *   Context API - For global state (Toast notifications).
*   **Authentication**: Keycloak-js & `@react-keycloak/web` - Identity and Access Management integration.
*   **UI Components & Icons**:
    *   Lucide React - Beautiful & consistent icons.
    *   Recharts - Composable charting library for the Admin Dashboard.
    *   React Hook Form - Performant, flexible, and extensible forms.

## ⚙️ Backend (Microservices)
The backend follows a microservices architecture, decoupled by business domain.

*   **Language**: Java (JDK 17)
*   **Framework**: Spring Boot (v3.2.3)
*   **Microservices Ecosystem (Spring Cloud)**:
    *   **Service Discovery**: Netflix Eureka - For dynamic service registration and discovery.
    *   **API Gateway**: Spring Cloud Gateway - Single entry point for routing and cross-cutting concerns (auth, rate limiting).
    *   **Inter-service Communication**: Spring Cloud OpenFeign - Declarative REST client.
*   **Database**: PostgreSQL - Primary relational database for microservices.
*   **Event Driven**: RabbitMQ - Message broker for asynchronous communication (Notifications).

## 🛠️ DevOps & Infrastructure
*   **Containerization**: Docker - Packaging applications and dependencies.
*   **Build Automation**: Maven - Dependency management and build tool.
*   **Identity Provider**: Keycloak - Open Source Identity and Access Management (running in Docker).

## 📐 Architecture Highlights
*   **Separation of Concerns**: Distinct Admin and Guest portals.
*   **Security**: Centralized authentication via Keycloak and API Gateway.
*   **Scalability**: Independent scaling of microservices (Booking, Room, User, Notification).
*   **Resilience**: Circuit-breaking and fault tolerance patterns (Resilience4j).
