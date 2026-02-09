# DropiGO

DropiGO is a mobile marketplace that connects fishermen directly with buyers and restaurants.

## Features
- Two roles: fisher and buyer/restaurant
- Daily catch listings with photo, price per kg, stock, pickup window
- Reservations with confirmation workflow
- Local notifications
- Offline queue with sync history
- Favorites + filters (distance, price, recent)
- PDF pickup receipt with QR code

## Quick Start

```bash
npm install
npm run start
```

## Dev Client (recommended)

```bash
npx expo start --dev-client
```

## Environment

Copy `.env.example` to `.env` and fill values as needed.

## Build Dev Client (Android)

```bash
eas build -p android --profile development
```

## Notes
- Maps require the dev client (not Expo Go).
- Payment is modeled as "pay on pickup" for the MVP.
