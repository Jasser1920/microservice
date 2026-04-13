# Microservice Gateway

API Gateway for the microservices architecture using Spring Cloud Gateway.

## Description

This microservice acts as the single entry point for all client requests. It provides:

- **Routing**: Routes requests to appropriate microservices based on path patterns
- **Load Balancing**: Distributes requests across multiple instances via Eureka
- **Authentication**: Handles OAuth2/OIDC authentication with Keycloak
- **Token Relay**: Forwards authentication tokens to downstream services
- **Service Discovery**: Integrates with Eureka for dynamic service discovery

## Technical Details

- **Port**: 9090
- **Framework**: Spring Cloud Gateway (WebFlux-based)
- **Authentication**: OAuth2 Client + Resource Server
- **Service Discovery**: Netflix Eureka Client
- **Keycloak Client**: gateway-client

## Routes Configuration

| Path | Target Service | Description |
|------|---------------|-------------|
| `/api/bills/**` | ms-bills | Bills microservice endpoints |
| `/eureka/**` | ms-discovery | Eureka dashboard (optional) |

## Environment Variables

- `GATEWAY_CLIENT_ID`: Keycloak client ID (default: gateway-client)
- `GATEWAY_CLIENT_SECRET`: Keycloak client secret (default: gateway-secret)

## Running the Gateway

1. Ensure Keycloak is running (port 8080)
2. Ensure Eureka Discovery is running (port 8761)
3. Run the gateway:

```bash
mvn spring-boot:run
```

## Usage Examples

### Access Bills Service Through Gateway

Instead of calling `http://localhost:<dynamic-port>/bills/all` directly:

```bash
# Call through gateway
curl -H "Authorization: Bearer <token>" http://localhost:9090/api/bills/all
```

### OAuth2 Login Flow

1. Navigate to: `http://localhost:9090/api/bills/all`
2. You'll be redirected to Keycloak login page
3. Login with credentials (e.g., user1/password123)
4. You'll be redirected back with a valid session

## Features

- **Token Relay**: Automatically forwards JWT tokens to downstream services
- **Circuit Breaker**: Can be configured for resilience
- **Rate Limiting**: Can be configured per route
- **Request/Response Modification**: Custom filters can transform requests/responses
- **CORS**: Can be configured for cross-origin requests
- **Actuator Endpoints**: `/actuator/gateway/routes` shows all configured routes

## Security

- All routes require authentication (except Eureka and Actuator)
- Supports both OAuth2 login (browser) and JWT tokens (API)
- Token validation against Keycloak
- Automatic token relay to downstream services
