# Hotel Management System - Microservices Architecture

Enterprise hotel management system built with microservices architecture, Spring Boot, and Keycloak authentication.

## Table of contents

- [Hotel Management System - Microservices Architecture](#hotel-management-system---microservices-architecture)
  - [Table of contents](#table-of-contents)
  - [System Overview](#system-overview)
  - [Microservices](#microservices)
  - [Technical documentation](#technical-documentation)
  - [Instructions for use](#instructions-for-use)
    - [Prerequisites](#prerequisites)
    - [Docker Compose configuration](#docker-compose-configuration)
    - [Keycloak](#keycloak)
    - [Start Microservices](#start-microservices)
    - [Access the Application](#access-the-application)

## System Overview

This hotel management system consists of 6 microservices covering all aspects of hotel operations:

1. **User Service** - Guest and staff management
2. **Room Service** - Room inventory and availability
3. **Booking Service** - Reservation management
4. **Review Service** - Customer feedback and ratings
5. **Stock Service** - Inventory management (minibar, supplies, etc.)
6. **Event Service** - Events and conferences management

## Microservices

This documentation details the components and microservices of this repository.

- [Keycloak Initializer](keycloak-initializer/README.md)
- [Microservice Discovery](ms-discovery/README.md)
- [Microservice Gateway](ms-gateway/README.md)
- **Business Microservices:**
  - [User Service](ms-user/) - MySQL
  - [Room Service](ms-room/) - H2
  - [Booking Service](ms-booking/) - H2
  - [Review Service](ms-review/) - MySQL
  - [Stock Service](ms-stock/) - MySQL
  - [Event Service](ms-event/) - MySQL

## Technical documentation

**Infrastructure:**
- keycloak: 8080
- keycloak-initializer: dynamic (one-time setup)
- ms-discovery (Eureka): 8761
- ms-gateway: 9090
- mysql: 3306

**Microservices (dynamic ports via Eureka):**
- ms-user (MySQL)
- ms-room (H2)
- ms-booking (H2)
- ms-review (MySQL)
- ms-stock (MySQL)
- ms-event (MySQL)

**Security Roles:**
- `ADMIN` - Full system access
- `MANAGER` - Hotel management operations
- `STAFF` - Hotel staff operations
- `CLIENT` - Hotel guest/customer

**Default Users:**
- admin / admin123
- manager / manager123
- staff / staff123
- client1, client2 / client123

## Instructions for use

### Prerequisites

- Java 17+
- Maven 3.6+
- Docker & Docker Compose
- Git

### Docker Compose configuration

This project uses Docker Compose to manage Keycloak and MySQL infrastructure.

1. **Install Docker and Docker Compose:** Make sure you have Docker and Docker Compose installed on your system.

2. **Start Containers:** Located in the root folder where the docker-compose.yml file is located, execute the following command:

```bash
docker-compose up -d
```

This will start:
- Keycloak on port 8080
- MySQL on port 3306

**_Stop and Delete Containers_**

- To **stop containers without deleting them**:
  ```bash
  docker-compose stop
  ```

- To **stop and delete containers**:
  ```bash
  docker-compose down
  ```

### Keycloak

1. **Access Keycloak Console:** Open [http://localhost:8080](http://localhost:8080) in your browser.

2. **Initialize Keycloak Realm:** Run the [keycloak-initializer](keycloak-initializer/) to create the realm, clients, users and roles:
   
   ```bash
   cd keycloak-initializer
  mvn spring-boot:run -DKEYCLOAK_PORT=8080 -DKEYCLOAK_ADMIN=admin -DKEYCLOAK_ADMIN_PASSWORD=admin -DBACKEND_CLIENT_ID=backend-client -DBACKEND_CLIENT_SECRET=backend-secret -DGATEWAY_CLIENT_ID=gateway-client -DGATEWAY_CLIENT_SECRET=gateway-secret
   ```
   
   **This must be executed only once**.

### Start Microservices

Start services in the following order:

1. **Start Discovery Service:**
   ```bash
   cd ms-discovery
   mvn spring-boot:run
   ```

2. **Start Gateway:**
   ```bash
   cd ms-gateway
   mvn spring-boot:run
   ```

3. **Start Business Microservices** (in any order):
   ```bash
   cd ms-user
   mvn spring-boot:run
   
   cd ms-room
   mvn spring-boot:run
   
   cd ms-booking
   mvn spring-boot:run
   
   cd ms-review
   mvn spring-boot:run
   
   cd ms-stock
   mvn spring-boot:run
   
   cd ms-event
   mvn spring-boot:run
   ```

### Access the Application

All requests should go through the API Gateway at `http://localhost:9090`:

**API Endpoints:**
- Users: `http://localhost:9090/api/users`
- Rooms: `http://localhost:9090/api/rooms`
- Bookings: `http://localhost:9090/api/bookings`
- Reviews: `http://localhost:9090/api/reviews`
- Stock: `http://localhost:9090/api/stock`
- Events: `http://localhost:9090/api/events`

**Monitoring:**
- Eureka Dashboard: `http://localhost:9090/eureka/web`
- Gateway Info: `http://localhost:9090/gateway/info`
- Gateway Routes: `http://localhost:9090/actuator/gateway/routes`

**Authentication:**
The gateway handles authentication. You can use:
- Browser: Navigate to any protected endpoint and you'll be redirected to Keycloak login
- API: Include JWT token in Authorization header: `Bearer <token>`

**Example API Call:**
```bash
# Get access token
curl -X POST http://localhost:8080/realms/ecommerce-rta/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=backend-client" \
  -d "client_secret=backend-secret" \
  -d "username=admin" \
  -d "password=admin123" \
  -d "grant_type=password"

# Use token to access API
curl -X GET http://localhost:9090/api/rooms \
  -H "Authorization: Bearer <your-token>"
```

## Architecture Diagram

```
┌─────────┐         ┌──────────┐         ┌─────────────┐
│ Client  │────────▶│ Gateway  │────────▶│  Discovery  │
└─────────┘         │  :9090   │         │   :8761     │
                    └────┬─────┘         └─────────────┘
                         │
        ┌────────────────┼────────────────┬──────────────┐
        │                │                │              │
    ┌───▼───┐        ┌───▼───┐      ┌────▼────┐   ┌────▼────┐
    │ User  │        │ Room  │      │ Booking │   │ Review  │
    │MySQL  │        │  H2   │      │   H2    │   │  MySQL  │
    └───────┘        └───────┘      └─────────┘   └─────────┘
        │                                │              │
    ┌───▼───┐                        ┌───▼───┐   ┌─────▼─────┐
    │ Stock │                        │ Event │   │ Keycloak  │
    │MySQL  │                        │MySQL  │   │   :8080   │
    └───────┘                        └───────┘   └───────────┘
```

## License

This project is open source and available under the MIT License.
