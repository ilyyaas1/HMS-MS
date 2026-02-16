# Project Services Overview

## 核心 Microservices (Core Business Logic)

| Service Name | Port | Description |
| :--- | :--- | :--- |
| **API Gateway** | `8080` | Entry point for all client requests. Handles routing, authentication, and load balancing. |
| **User Service** | `8081` | Manages user registration, profiles, and authentication details. |
| **Room Service** | `8082` | Handles room inventory, types, pricing, and availability. |
| **Booking Service** | `8083` | Manages reservation logic, booking lifecycles, and payments. |
| **Notification Service** | `8084` | Asynchronous service for sending emails and alerts via RabbitMQ. |

## 🏗️ Infrastructure & Support Services

| Service Name | Port | Description |
| :--- | :--- | :--- |
| **Discovery Service** | `8761` | Netflix Eureka Server. Service registry for dynamic discovery. |
| **Keycloak** | `8180` | Identity and Access Management (IAM). Handles OAuth2/OIDC login. |
| **PostgreSQL** | `5432` | Primary relational database. Stores data for Room, Booking, and User services. |
| **RabbitMQ** | `5672` | Message Broker. Decouples services (e.g., Booking -> Notification). |
| **Zipkin** | `9411` | Distributed Tracing. Tracks requests across microservices for debugging. |

## 💻 Frontend

| Service Name | Port | Description |
| :--- | :--- | :--- |
| **Hotel Frontend** | `5173` | React-based user interface (Admin Dashboard & Guest Portal). |
