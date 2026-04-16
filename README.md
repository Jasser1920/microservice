# Hotel Management Microservices Project

## Overview
This project is a modern, full-stack hotel management system built with a microservices architecture. It features a professional SaaS dashboard frontend and a robust backend composed of multiple Spring Boot microservices, Keycloak for authentication, and both SQL and NoSQL databases. The entire stack is containerized using Docker and orchestrated with Docker Compose for easy local development and deployment.

---

## Technologies Used

### Frontend
- **Framework:** React (Vite, TypeScript)
- **Styling:** Tailwind CSS, custom dashboard styles
- **State Management:** React Context
- **Routing:** React Router
- **API Calls:** Axios
- **Authentication:** Keycloak (OIDC)

### Backend
- **Microservices:** Spring Boot (Java)
- **Service Discovery:** Eureka
- **API Gateway:** Spring Cloud Gateway
- **Authentication:** Keycloak
- **Databases:**
  - MySQL (main relational data)
  - MongoDB (NoSQL, for reviews/events)
  - H2 (in-memory, for development/testing)

### DevOps & Infrastructure
- **Containerization:** Docker
- **Orchestration:** Docker Compose
- **Reverse Proxy:** Nginx (serving frontend)

---

## Microservices Architecture

Each microservice is independently developed, containerized, and communicates via REST APIs. Service discovery and routing are handled by Eureka and the API Gateway.

| Service Name      | Description                | Developed By | Database | Tech Stack         |
|-------------------|---------------------------|--------------|----------|--------------------|
| ms-user           | User management           | Jasser       | MySQL    | Spring Boot, JPA   |
| ms-room           | Room inventory            | Ali          | MySQL    | Spring Boot, JPA   |
| ms-booking        | Booking/reservations      | Ghassen      | MySQL    | Spring Boot, JPA   |
| ms-event          | Events/meetings           | Mayara       | MongoDB  | Spring Boot, Mongo |
| ms-review         | Reviews/ratings           | souhail      | MongoDB  | Spring Boot, Mongo |
| ms-stock          | Stock/inventory           | Hanin        | MySQL    | Spring Boot, JPA   |
| ms-transport      | Transport bookings        | Team         | MySQL    | NestJS (Node.js)   |
| ms-gateway        | API Gateway               | Team         | -        | Spring Cloud       |
| ms-discovery      | Eureka Discovery Server   | Team         | -        | Spring Cloud       |
| ConfigServer      | Centralized Config        | Team         | -        | Spring Cloud       |
| ereuka            | Eureka Discovery Server   | Team         | -        | Spring Cloud       |
| keycloak-initializer | Keycloak setup         | Team         | -        | Java               |

---

## Project Structure

- `hotel_frontend/` — React frontend (Vite, TypeScript)
- `ms-user/`, `ms-room/`, ... — Spring Boot microservices
- `ms-transport/` — Node.js (NestJS) microservice
- `ereuka/`, `ms-discovery/` — Eureka service discovery
- `ms-gateway/` — API Gateway
- `ConfigServer/` — Centralized configuration
- `microservices-keycloak/` — Keycloak & initializer

---

## How to Start the Project

### Prerequisites
- Docker & Docker Compose installed
- Node.js (for local frontend dev)
- Java 17+ (for backend dev)

### Quick Start (Docker Compose)
1. Clone the repository:
   ```sh
   git clone <repo-url>
   cd hotem_managment
   ```
2. Build and start all services:
   ```sh
   docker-compose up --build
   ```
3. Access the app:
   - Frontend: http://localhost:80
   - Keycloak: http://localhost:8080
   - Eureka: http://localhost:8761

### Local Development
- Frontend:
  ```sh
  cd hotel_frontend
  npm install
  npm run dev
  ```
- Backend (example for ms-user):
  ```sh
  cd ms-user
  ./mvnw spring-boot:run
  ```

---

## Docker Architecture

- Each service has its own `Dockerfile`.
- `docker-compose.yml` orchestrates all containers, networks, and volumes.
- Nginx serves the frontend build and proxies API requests.
- Databases (MySQL, MongoDB, H2) run as containers.
- Keycloak is initialized with a custom script and runs as a container.
- All services are connected via Docker networks for secure internal communication.

---



## License
This project is licensed under the DevCore.
