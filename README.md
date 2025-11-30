# FörderPilot

**KOMPASS Förderantrag Management System**

Ein Multi-Tenant SaaS-System für Bildungsträger zur Verwaltung von KOMPASS-Förderanträgen, Kursen, Teilnehmern und Dokumenten.

## Features

### Multi-Tenancy
- Subdomain-basiertes Routing (z.B. `app.foerderpilot.io`)
- Custom Domain Support
- Tenant-spezifisches Branding (Logo, Farben, Favicon)
- Isolierte Datenbanken pro Tenant

### Rollen-System
- **Super Admin**: Tenant-Verwaltung, System-Konfiguration
- **Admin**: Tenant-Verwaltung, Kurs- und Teilnehmer-Management
- **KOMPASS Reviewer**: Dokumenten-Validierung
- **User/Teilnehmer**: Dokumenten-Upload, Status-Tracking

### Kurs-Management
- CRUD-Operationen für Kurse
- Kurs-Aktivierung/Deaktivierung
- Zeitplan-Verwaltung (Wochen/Tage)
- Preisberechnung (Netto/Brutto)

### Teilnehmer-Management
- Teilnehmer-Registrierung und -Verwaltung
- Status-Pipeline (registered → documents_pending → documents_submitted → etc.)
- Dokumenten-Upload pro Teilnehmer
- Fortschritts-Tracking

### Sammeltermine
- KOMPASS-Einreichungstermine verwalten
- Kurs-Zuordnung
- Zoom-Link Integration
- Status-Tracking (scheduled/completed/cancelled)

### Dokumenten-Validierung
- AI-gestützte Dokumenten-Validierung (GPT-4o-mini Vision)
- Dokumenttyp-spezifische Regeln
- S3-Upload Integration
- Validierungs-Status-Dashboard

### Tenant-Einstellungen
- Stammdaten (Firmenname, Adresse, Kontakt)
- Branding (Logo, Favicon, Farben)
- Zertifizierungen (AZAV, ISO9001)
- Geschäftsführer-Daten
- Custom Domain Konfiguration

### Authentifizierung
- E-Mail/Passwort Login
- Passwort-Reset Flow
- Manus OAuth (für Super Admins)
- Cookie-basierte Sessions

## Tech Stack

### Frontend
- **React 19** mit TypeScript
- **Tailwind CSS 4** (OKLCH-Farben)
- **shadcn/ui** Komponenten
- **tRPC** für Type-Safe API-Calls
- **Wouter** für Routing

### Backend
- **Express 4** Server
- **tRPC 11** API-Layer
- **Drizzle ORM** für Datenbankzugriff
- **MySQL/TiDB** Datenbank
- **bcrypt** für Passwort-Hashing

### Infrastructure
- **S3** für File-Storage
- **Manus Platform** Deployment
- **Vitest** für Testing

## Getting Started

### Prerequisites
- Node.js 22+
- pnpm 9+
- MySQL/TiDB Datenbank

### Installation

```bash
# Install dependencies
pnpm install

# Set up database
pnpm db:push

# Start development server
pnpm dev
```

### Environment Variables

Required environment variables (automatically injected by Manus Platform):
- `DATABASE_URL` - MySQL connection string
- `JWT_SECRET` - Session cookie signing secret
- `VITE_APP_ID` - Manus OAuth application ID
- `OAUTH_SERVER_URL` - Manus OAuth backend URL
- `VITE_OAUTH_PORTAL_URL` - Manus login portal URL
- `OWNER_OPEN_ID`, `OWNER_NAME` - Owner information
- `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY` - Manus built-in APIs

### Development

```bash
# Run tests
pnpm test

# Type check
pnpm tsc --noEmit

# Database migrations
pnpm db:push
```

## Project Structure

```
client/
  src/
    pages/          # Page components
    components/     # Reusable UI components
    lib/trpc.ts     # tRPC client
    App.tsx         # Routes & layout
drizzle/
  schema.ts         # Database schema
server/
  routers/          # tRPC routers
  _core/            # Framework code (auth, context, etc.)
  db.ts             # Database helpers
```

## Testing

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test participants

# Watch mode
pnpm test --watch
```

Current test coverage:
- 42 tests across 6 test suites
- Auth system (9 tests)
- Tenant management (7 tests)
- Courses (6 tests)
- Participants (7 tests)
- Documents (6 tests)
- Tenant settings (12 tests)

## Deployment

The application is deployed on the Manus Platform:
- **Production**: `app.foerderpilot.io`
- **Development**: `foerderpilot.manus.space`

Deployment is managed through the Manus UI:
1. Create checkpoint
2. Click "Publish" button in Management UI

## License

Proprietary - All rights reserved

## Contact

For support and inquiries, visit [help.manus.im](https://help.manus.im)
