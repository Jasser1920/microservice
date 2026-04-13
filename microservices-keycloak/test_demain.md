# Guide de Test Complet - Postman

## Prérequis
1. Démarrer dans l'ordre:
   - Docker Compose (Keycloak + MySQL)
   - ms-discovery (Eureka)
   - Tous les microservices
   - ms-gateway

2. Vérifier Eureka: http://localhost:8761

## Étape 1: Obtenir le Token Keycloak

### Dans Postman:
**Method:** POST  
**URL:** `http://localhost:8080/realms/ecommerce-rta/protocol/openid-connect/token`

**Headers:**
```
Content-Type: application/x-www-form-urlencoded
```

**Body (x-www-form-urlencoded):**
```
grant_type: password
client_id: backend-client
client_secret: backend-secret
username: admin
password: admin123
```

**Réponse attendue:**
```json
{
  "access_token": "eyJhbGci...",
  "expires_in": 300,
  "refresh_token": "eyJhbGci...",
  "token_type": "Bearer"
}
```

**Action:** Copier le `access_token` pour les prochaines requêtes.

---

## Configuration Postman
Pour toutes les requêtes suivantes:
1. **Authorization Tab:** Bearer Token
2. **Token:** coller votre access_token
3. **Headers:** `Content-Type: application/json` (pour POST/PUT)

**Base URL Gateway:** `http://localhost:9090`

---

## Étape 2: Tester ms-user

### 2.1 Créer un utilisateur
**POST** `http://localhost:9090/api/users`

**Body:**
```json
{
  "email": "client1@hotel.com",
  "firstName": "Client",
  "lastName": "One",
  "phone": "0600000001",
  "role": "CLIENT",
  "preferences": "{\"language\": \"fr\", \"smoking\": false}",
  "active": true
}
```

**Réponse attendue:** Status 201
```json
{
  "id": 1,
  "email": "client1@hotel.com",
  "firstName": "Client",
  "lastName": "One",
  "phone": "0600000001",
  "role": "CLIENT",
  "preferences": "{\"language\": \"fr\", \"smoking\": false}",
  "active": true,
  "createdAt": "2026-02-26T...",
  "updatedAt": "2026-02-26T..."
}
```

### 2.2 Lister tous les utilisateurs
**GET** `http://localhost:9090/api/users`

### 2.3 Obtenir un utilisateur par ID
**GET** `http://localhost:9090/api/users/1`

### 2.4 Obtenir un utilisateur par email
**GET** `http://localhost:9090/api/users/email/client1@hotel.com`

### 2.5 Obtenir les utilisateurs par rôle
**GET** `http://localhost:9090/api/users/role/CLIENT`

### 2.6 Mettre à jour un utilisateur
**PUT** `http://localhost:9090/api/users/1`

**Body:**
```json
{
  "email": "client1@hotel.com",
  "firstName": "Client",
  "lastName": "Updated",
  "phone": "0600000002",
  "role": "CLIENT",
  "active": true
}
```

---

## Étape 3: Tester ms-room

### 3.1 Créer une chambre
**POST** `http://localhost:9090/api/rooms`

**Body:**
```json
{
  "roomNumber": "101",
  "type": "SINGLE",
  "floor": 1,
  "pricePerNight": 80.00,
  "status": "AVAILABLE",
  "capacity": 1,
  "amenities": "WiFi,TV,Minibar,Air Conditioning",
  "description": "Chambre simple avec vue sur jardin"
}
```

### 3.2 Créer une deuxième chambre
**POST** `http://localhost:9090/api/rooms`

**Body:**
```json
{
  "roomNumber": "201",
  "type": "DOUBLE",
  "floor": 2,
  "pricePerNight": 120.00,
  "status": "AVAILABLE",
  "capacity": 2,
  "amenities": "WiFi,TV,Minibar,Air Conditioning,Balcony",
  "description": "Chambre double avec balcon"
}
```

### 3.3 Créer une suite
**POST** `http://localhost:9090/api/rooms`

**Body:**
```json
{
  "roomNumber": "301",
  "type": "SUITE",
  "floor": 3,
  "pricePerNight": 250.00,
  "status": "AVAILABLE",
  "capacity": 4,
  "amenities": "WiFi,TV,Minibar,Air Conditioning,Balcony,Kitchen,Jacuzzi",
  "description": "Suite luxueuse avec jacuzzi"
}
```

### 3.4 Lister toutes les chambres
**GET** `http://localhost:9090/api/rooms`

### 3.5 Obtenir chambres disponibles
**GET** `http://localhost:9090/api/rooms/available`

### 3.6 Obtenir chambres par type
**GET** `http://localhost:9090/api/rooms/type/DOUBLE`

### 3.7 Obtenir chambres par statut
**GET** `http://localhost:9090/api/rooms/status/AVAILABLE`

### 3.8 Obtenir une chambre par numéro
**GET** `http://localhost:9090/api/rooms/number/101`

### 3.9 Mettre à jour le statut d'une chambre
**PATCH** `http://localhost:9090/api/rooms/1/status?status=OCCUPIED`

---

## Étape 4: Tester ms-booking

### 4.1 Créer une réservation
**POST** `http://localhost:9090/api/bookings`

**Body:**
```json
{
  "userId": 1,
  "roomId": 1,
  "checkInDate": "2026-03-10",
  "checkOutDate": "2026-03-13",
  "status": "PENDING",
  "totalPrice": 240.00,
  "numberOfGuests": 1,
  "specialRequests": "Arrivée tardive - 22h"
}
```

### 4.2 Créer une deuxième réservation
**POST** `http://localhost:9090/api/bookings`

**Body:**
```json
{
  "userId": 1,
  "roomId": 2,
  "checkInDate": "2026-04-15",
  "checkOutDate": "2026-04-20",
  "status": "PENDING",
  "totalPrice": 600.00,
  "numberOfGuests": 2,
  "specialRequests": "Lit bébé nécessaire"
}
```

### 4.3 Lister toutes les réservations
**GET** `http://localhost:9090/api/bookings`

### 4.4 Obtenir réservations par utilisateur
**GET** `http://localhost:9090/api/bookings/user/1`

### 4.5 Obtenir réservations par chambre
**GET** `http://localhost:9090/api/bookings/room/1`

### 4.6 Confirmer une réservation
**PATCH** `http://localhost:9090/api/bookings/1/confirm`

### 4.7 Annuler une réservation
**PATCH** `http://localhost:9090/api/bookings/2/cancel`

### 4.8 Mettre à jour une réservation
**PUT** `http://localhost:9090/api/bookings/1`

**Body:**
```json
{
  "userId": 1,
  "roomId": 1,
  "checkInDate": "2026-03-10",
  "checkOutDate": "2026-03-14",
  "status": "CONFIRMED",
  "totalPrice": 320.00,
  "numberOfGuests": 1,
  "specialRequests": "Arrivée tardive - 23h"
}
```

---

## Étape 5: Tester ms-review

### 5.1 Créer un avis
**POST** `http://localhost:9090/api/reviews`

**Body:**
```json
{
  "userId": 1,
  "roomId": 1,
  "bookingId": 1,
  "rating": 5,
  "comment": "Excellent séjour, chambre très propre et personnel accueillant",
  "verified": true
}
```

### 5.2 Créer un deuxième avis
**POST** `http://localhost:9090/api/reviews`

**Body:**
```json
{
  "userId": 1,
  "roomId": 2,
  "bookingId": 2,
  "rating": 4,
  "comment": "Très bon rapport qualité/prix",
  "verified": false
}
```

### 5.3 Lister tous les avis
**GET** `http://localhost:9090/api/reviews`

### 5.4 Obtenir avis par chambre
**GET** `http://localhost:9090/api/reviews/room/1`

### 5.5 Obtenir avis par utilisateur
**GET** `http://localhost:9090/api/reviews/user/1`

### 5.6 Obtenir statistiques d'une chambre
**GET** `http://localhost:9090/api/reviews/room/1/statistics`

### 5.7 Mettre à jour un avis
**PUT** `http://localhost:9090/api/reviews/1`

**Body:**
```json
{
  "userId": 1,
  "roomId": 1,
  "bookingId": 1,
  "rating": 5,
  "comment": "Excellent séjour, chambre très propre et personnel accueillant. Je recommande vivement!",
  "verified": true
}
```

---

## Étape 6: Tester ms-stock

### 6.1 Créer un article de stock
**POST** `http://localhost:9090/api/stock`

**Body:**
```json
{
  "itemCode": "LINEN-001",
  "name": "Draps blancs double",
  "category": "LINEN",
  "quantity": 200,
  "minQuantity": 50,
  "unit": "pièce",
  "unitPrice": 12.50,
  "supplier": "Hotel Supplies France"
}
```

### 6.2 Créer d'autres articles
**POST** `http://localhost:9090/api/stock`

**Body:**
```json
{
  "itemCode": "CLEAN-001",
  "name": "Produit nettoyant multi-surfaces",
  "category": "CLEANING",
  "quantity": 30,
  "minQuantity": 10,
  "unit": "litre",
  "unitPrice": 8.90,
  "supplier": "ProClean SARL"
}
```

**POST** `http://localhost:9090/api/stock`

**Body:**
```json
{
  "itemCode": "MINIBAR-001",
  "name": "Eau minérale 50cl",
  "category": "MINIBAR",
  "quantity": 500,
  "minQuantity": 100,
  "unit": "bouteille",
  "unitPrice": 0.80,
  "supplier": "Boissons Distribution"
}
```

### 6.3 Lister tous les articles
**GET** `http://localhost:9090/api/stock`

### 6.4 Obtenir article par code
**GET** `http://localhost:9090/api/stock/code/LINEN-001`

### 6.5 Obtenir articles par catégorie
**GET** `http://localhost:9090/api/stock/category/LINEN`

### 6.6 Obtenir articles en stock faible
**GET** `http://localhost:9090/api/stock/low-stock`

### 6.7 Mettre à jour un article
**PUT** `http://localhost:9090/api/stock/1`

**Body:**
```json
{
  "itemCode": "LINEN-001",
  "name": "Draps blancs double",
  "category": "LINEN",
  "quantity": 250,
  "minQuantity": 50,
  "unit": "pièce",
  "unitPrice": 12.50,
  "supplier": "Hotel Supplies France"
}
```

---

## Étape 7: Tester ms-event

### 7.1 Créer un événement
**POST** `http://localhost:9090/api/events`

**Body:**
```json
{
  "name": "Séminaire Entreprise TechCorp",
  "type": "SEMINAR",
  "startDateTime": "2026-03-20T09:00:00",
  "endDateTime": "2026-03-20T17:00:00",
  "venue": "Salle de conférence A",
  "expectedAttendees": 120,
  "organizerId": 1,
  "status": "PLANNED",
  "totalCost": 1500.00,
  "description": "Séminaire annuel de l'entreprise TechCorp avec déjeuner",
  "services": "Catering,AV Equipment,Projector,Microphones"
}
```

### 7.2 Créer un mariage
**POST** `http://localhost:9090/api/events`

**Body:**
```json
{
  "name": "Mariage Dupont-Martin",
  "type": "WEDDING",
  "startDateTime": "2026-06-15T14:00:00",
  "endDateTime": "2026-06-16T02:00:00",
  "venue": "Grande Salle de Réception",
  "expectedAttendees": 200,
  "organizerId": 1,
  "status": "CONFIRMED",
  "totalCost": 8500.00,
  "description": "Réception de mariage avec dîner et soirée dansante",
  "services": "Catering,Decoration,Music,Photography,AV Equipment"
}
```

### 7.3 Créer une soirée
**POST** `http://localhost:9090/api/events`

**Body:**
```json
{
  "name": "Soirée Gala de Charité",
  "type": "PARTY",
  "startDateTime": "2026-05-10T19:00:00",
  "endDateTime": "2026-05-11T01:00:00",
  "venue": "Salon Principal",
  "expectedAttendees": 150,
  "organizerId": 1,
  "status": "PLANNED",
  "totalCost": 3500.00,
  "description": "Soirée gala au profit d'une association caritative",
  "services": "Catering,Music,Decoration,Bar Service"
}
```

### 7.4 Lister tous les événements
**GET** `http://localhost:9090/api/events`

### 7.5 Obtenir événements par organisateur
**GET** `http://localhost:9090/api/events/organizer/1`

### 7.6 Obtenir événements par type
**GET** `http://localhost:9090/api/events/type/WEDDING`

### 7.7 Obtenir événements par statut
**GET** `http://localhost:9090/api/events/status/CONFIRMED`

### 7.8 Vérifier disponibilité d'un lieu
**GET** `http://localhost:9090/api/events/venue-availability?venue=Salle de conférence A&start=2026-03-20T09:00:00&end=2026-03-20T17:00:00`

### 7.9 Confirmer un événement
**PATCH** `http://localhost:9090/api/events/1/confirm`

### 7.10 Annuler un événement
**PATCH** `http://localhost:9090/api/events/3/cancel`

---

## Étape 8: Tester OpenFeign (ms-booking → ms-room)

L'implémentation Feign est en place dans ms-booking (client + DTO + service + endpoints).
Les appels Feign propagent automatiquement le token Bearer.

### Test Feign

#### 8.1 Obtenir chambres disponibles via Feign
**GET** `http://localhost:9090/api/bookings/rooms/available`

**Réponse attendue:** Liste des chambres disponibles (venant de ms-room)

#### 8.2 Obtenir chambre par ID via Feign
**GET** `http://localhost:9090/api/bookings/rooms/1`

**Réponse attendue:** Détails de la chambre 1 (venant de ms-room)

### Test logique de réservation avec Feign
- Lors de la creation de booking, ms-booking vérifie le statut de la chambre via ms-room.
- Si la chambre n'est pas `AVAILABLE`, l'API retourne une erreur.

Exemple: mettre la chambre 1 en OCCUPIED puis tenter une réservation.

---

## Résumé des Tests

### Checklist de validation
- [ ] Token Keycloak obtenu avec succès
- [ ] ms-user: CRUD complet testé
- [ ] ms-room: CRUD + filtres testés
- [ ] ms-booking: CRUD + statuts testés
- [ ] ms-review: CRUD + statistiques testées
- [ ] ms-stock: CRUD + catégories testées
- [ ] ms-event: CRUD + disponibilité testée
- [ ] OpenFeign: ms-booking → ms-room fonctionne
- [ ] Tous les appels passent par Gateway (port 9090)
- [ ] Eureka affiche tous les services enregistrés

### Notes importantes
1. **Roles requis:** Certains endpoints nécessitent ADMIN/MANAGER. Utiliser le token admin.
2. **IDs:** Remplacer les IDs par ceux créés dans votre base.
3. **Dates:** Adapter les dates aux tests.
4. **Keycloak Port:** Vérifier que Keycloak est sur le port 8080 (ou ajuster l'URL token).

### Variables d'environnement Keycloak
Si les secrets ne fonctionnent pas, vérifier:
```
BACKEND_CLIENT_ID=backend-client
BACKEND_CLIENT_SECRET=backend-secret
GATEWAY_CLIENT_ID=gateway-client
GATEWAY_CLIENT_SECRET=gateway-secret
```
