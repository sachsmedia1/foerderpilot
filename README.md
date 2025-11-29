# FörderPilot - KOMPASS Förderantrag Management System

**Multi-Tenant SaaS-Plattform zur Automatisierung von Förderanträgen für Bildungsträger im KOMPASS-Programm**

---

## 📋 Projekt-Übersicht

FörderPilot ist eine moderne Multi-Tenant SaaS-Plattform, die Bildungsträgern hilft, Förderanträge für das KOMPASS-Programm zu automatisieren. Das System steigert die Completion-Rate von 40% auf >95% und reduziert den Zeitaufwand um 90%.

### Ziele
- **>95% Completion-Rate** (statt aktuell ~40%)
- **-90% Zeitaufwand** für Bildungsträger
- **Idiotensichere Teilnehmerführung** durch AI-gestützte Prozesse

### Business Impact (pro Bildungsträger)
- **Vorher:** 10 Interessenten → 4 abgeschlossene Kurse (40%) = €20.000/Monat
- **Nachher:** 10 Interessenten → 9,5 abgeschlossene Kurse (95%+) = €47.500/Monat
- **ROI:** +€27.500/Monat = +€165.000/Jahr

---

## 🏗️ Tech Stack

### Backend
- **Framework:** tRPC (Type-Safe API)
- **Database:** MySQL/TiDB (Manus Cloud)
- **ORM:** Drizzle ORM
- **Auth:** Manus OAuth + JWT
- **File Storage:** S3-compatible (Manus Cloud)

### Frontend
- **Framework:** React 19 + TypeScript
- **Styling:** Tailwind CSS 4
- **State Management:** tRPC + React Query
- **Forms:** React Hook Form + Zod
- **UI Components:** shadcn/ui

### AI & Automation (geplant für spätere Phasen)
- **LLM:** OpenAI GPT-4o-mini
- **Document Validation:** GPT-4o-mini Vision
- **Email:** Resend oder SendGrid
- **WhatsApp:** WhatsApp Business API

---

## 🚀 Phase 1 MVP - Sprint 1.1 Foundation (✅ Abgeschlossen)

### Implementierte Features

#### 1. Core Database Schema
- ✅ **Tenants-Tabelle** - Multi-Tenancy Basis mit Branding
- ✅ **Users-Tabelle** - Multi-Role System (super_admin, admin, kompass_reviewer, user)
- ✅ **Courses-Tabelle** - Kursverwaltung mit Förderdetails
- ✅ **Participants-Tabelle** - Teilnehmerverwaltung mit Status-Pipeline
- ✅ **Documents-Tabelle** - Dokumenten-Upload mit AI-Validierung (Vorbereitung)
- ✅ **Sammeltermine-Tabelle** - KOMPASS-Termine
- ✅ **Seed-Daten** - Test-Tenant + Super Admin

#### 2. Multi-Tenancy Middleware
- ✅ **Subdomain-Erkennung** - z.B. demo.foerderpilot.io
- ✅ **Custom Domain Support** - z.B. www.bildungstraeger.de
- ✅ **tRPC Context** - Tenant-Informationen in jedem Request
- ✅ **Tenant-Validierung** - Aktiv/Inaktiv-Status

#### 3. Auth-System & Super Admin Dashboard
- ✅ **Protected Procedures** - Rollen-basierte Zugriffskontrolle
- ✅ **Super Admin Router** - Tenant-Management (CRUD)
- ✅ **System-Statistiken** - Übersicht über Tenants und Users
- ✅ **Super Admin Dashboard** - `/superadmin` Route

#### 4. Dynamic Branding System
- ✅ **Branding Hook** - Automatische Anwendung von Tenant-Branding
- ✅ **CSS-Variablen** - Dynamisches Setzen von Primary/Secondary Colors
- ✅ **White-Label** - Logo, Favicon, Page Title pro Tenant
- ✅ **Branding Provider** - Globaler Provider in App.tsx

#### 5. Testing
- ✅ **Vitest Tests** - Auth-System und Super Admin Router
- ✅ **8 Tests** - Alle Tests bestanden

---

## 📁 Projekt-Struktur

```
foerderpilot/
├── client/                    # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── _core/            # Core Funktionen (Auth, Hooks)
│   │   ├── components/       # UI-Komponenten (shadcn/ui)
│   │   ├── hooks/            # Custom Hooks (useBranding)
│   │   ├── pages/            # Seiten (Home, SuperAdmin)
│   │   ├── lib/              # Libraries (tRPC Client)
│   │   └── App.tsx           # Main App Component
│   └── public/               # Statische Assets
├── server/                   # Backend (tRPC + Express)
│   ├── _core/                # Core Funktionen (Auth, Context, Middleware)
│   │   ├── context.ts        # tRPC Context (User, Tenant)
│   │   ├── tenantMiddleware.ts  # Multi-Tenancy Middleware
│   │   └── trpc.ts           # tRPC Setup + Procedures
│   ├── routers/              # tRPC Router
│   │   └── superadmin.ts     # Super Admin Router
│   ├── db.ts                 # Database Queries
│   └── routers.ts            # Main Router
├── drizzle/                  # Database Schema & Migrations
│   └── schema.ts             # Core Tables
├── scripts/                  # Utility Scripts
│   └── seed.mjs              # Seed-Daten Script
└── todo.md                   # Task-Liste
```

---

## 🗄️ Database Schema

### Core Tables

#### tenants (Bildungsträger)
- Multi-Tenancy Basis
- Branding (Logo, Farben, Favicon)
- Stammdaten (Firma, Adresse, Kontakt)
- Zertifizierungen (AZAV, ISO9001)

#### users (Multi-Role)
- Rollen: super_admin, admin, kompass_reviewer, user
- Tenant-Zuordnung (NULL = Super Admin)
- Manus OAuth Integration

#### courses (Kurse)
- Basis-Informationen (Name, Beschreibung, Themen)
- Termine & Dauer (Start, Ende, Stundenplan)
- Kosten & Förderung (Preis, Förderquote)

#### participants (Teilnehmer)
- Status-Pipeline (13 Schritte: registered → course_completed)
- Persönliche Daten (Name, Adresse, Kontakt)
- Zuordnung (Tenant, User, Course, Sammeltermin)

#### documents (Dokumente)
- Dokument-Informationen (Typ, Dateiname, URL)
- AI-Validierung (Status, Ergebnis) - Vorbereitung für Phase 1.3
- Zuordnung (Participant)

#### sammeltermine (KOMPASS-Termine)
- Termin-Informationen (Datum, Zoom-Link)
- KOMPASS-Reviewer-Zuordnung
- Submission-Deadline (1 Tag vorher)

---

## 🔐 Rollen-System

| Rolle | Zugriff | Rechte |
|-------|---------|--------|
| **super_admin** | Alle Tenants | Tenant erstellen/bearbeiten, System-Settings, User-Management |
| **admin** | Ein Tenant | Kurse verwalten, Teilnehmer verwalten, Einstellungen, Berichte |
| **kompass_reviewer** | Multi-Tenant (Read-Only) | Teilnehmer-Details ansehen, Beratungsprotokoll hochladen |
| **user** | Ein Tenant (Teilnehmer) | Eigene Daten, Dokumente hochladen, Checklisten bearbeiten |

---

## 🚀 Setup & Installation

### Voraussetzungen
- Node.js 22+
- pnpm 10+
- MySQL/TiDB Datenbank

### Installation

```bash
# 1. Repository klonen
git clone <repository-url>
cd foerderpilot

# 2. Dependencies installieren
pnpm install

# 3. Environment-Variablen setzen
# (werden automatisch von Manus Cloud injiziert)

# 4. Database Schema pushen
pnpm db:push

# 5. Seed-Daten erstellen
npx tsx scripts/seed.mjs

# 6. Development Server starten
pnpm dev
```

### Test-Daten

Nach dem Seed-Script sind folgende Test-Daten verfügbar:

- **Tenant:** demo.foerderpilot.io
- **Super Admin:** admin@foerderpilot.io
- **Tenant Admin:** admin@demo-bildungstraeger.de
- **Test-Kurs:** "Digitales Marketing & Social Media"
- **Test-Sammeltermin:** 7 Tage in der Zukunft

---

## 🧪 Testing

```bash
# Alle Tests ausführen
pnpm test

# Tests im Watch-Modus
pnpm test --watch
```

**Test-Coverage:**
- ✅ Auth-System (Logout)
- ✅ Super Admin Router (7 Tests)
  - System-Statistiken
  - Tenant-Liste
  - Tenant abrufen
  - Tenant-Status togglen
  - Zugriffskontrolle

---

## 🎨 Dynamic Branding

Jeder Tenant kann sein eigenes Branding definieren:

- **Primary Color** - Hauptfarbe (Hex)
- **Secondary Color** - Sekundärfarbe (Hex)
- **Logo URL** - Logo-Bild
- **Favicon URL** - Favicon
- **Page Title** - Tenant-Name

Das Branding wird automatisch angewendet:
1. User meldet sich an → Tenant wird erkannt
2. `useBranding` Hook extrahiert Branding-Config
3. CSS-Variablen werden gesetzt
4. Favicon und Title werden aktualisiert

---

## 📝 API-Dokumentation

### tRPC Router

#### `auth.me`
Gibt den aktuellen User, Tenant und Super Admin Status zurück.

```typescript
const { user, tenant, isSuperAdminRoute } = trpc.auth.me.useQuery();
```

#### `auth.logout`
Meldet den User ab und löscht die Session.

```typescript
const logout = trpc.auth.logout.useMutation();
```

#### `superadmin.getSystemStats`
Gibt System-Statistiken zurück (nur für Super Admins).

```typescript
const stats = trpc.superadmin.getSystemStats.useQuery();
```

#### `superadmin.listTenants`
Gibt eine Liste aller Tenants zurück (nur für Super Admins).

```typescript
const tenants = trpc.superadmin.listTenants.useQuery();
```

#### `superadmin.getTenant`
Gibt einen einzelnen Tenant zurück (nur für Super Admins).

```typescript
const tenant = trpc.superadmin.getTenant.useQuery({ id: 1 });
```

#### `superadmin.createTenant`
Erstellt einen neuen Tenant (nur für Super Admins).

```typescript
const create = trpc.superadmin.createTenant.useMutation();
```

#### `superadmin.updateTenant`
Aktualisiert einen Tenant (nur für Super Admins).

```typescript
const update = trpc.superadmin.updateTenant.useMutation();
```

#### `superadmin.toggleTenantStatus`
Aktiviert/Deaktiviert einen Tenant (nur für Super Admins).

```typescript
const toggle = trpc.superadmin.toggleTenantStatus.useMutation();
```

---

## 🗺️ Roadmap

### ✅ Phase 1: MVP - Sofortstart (Woche 1-6)

#### Sprint 1.1: Foundation (Woche 1-2) ✅ ABGESCHLOSSEN
- ✅ Core Database Schema
- ✅ Multi-Tenancy Middleware
- ✅ Auth-System & Super Admin Dashboard
- ✅ Dynamic Branding

#### Sprint 1.2: Course Management (Woche 3-4) 🔜 NÄCHSTER SPRINT
- [ ] Course CRUD
- [ ] Sammeltermin-Management
- [ ] Participant Registration Flow

#### Sprint 1.3: Document Validation (Woche 5-6)
- [ ] File Upload (S3)
- [ ] AI Document Validator (GPT-4o-mini Vision)
- [ ] Status Dashboard

### 🔮 Zukünftige Phasen (NICHT im MVP)
- AI-Formulare (Woche 7-8)
- Zeus-Integration (Woche 9-10)
- KOMPASS-Workflow (Woche 11-16)
- Billing & Certificates (Woche 19-20)

---

## 🤝 Contributing

Dieses Projekt befindet sich in aktiver Entwicklung. Contributions sind willkommen!

---

## 📄 Lizenz

MIT License

---

## 📧 Kontakt

Bei Fragen oder Feedback wenden Sie sich bitte an: info@foerderpilot.io

---

**FörderPilot** - Automatisierung von Förderanträgen für Bildungsträger im KOMPASS-Programm
