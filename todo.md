# FörderPilot - TODO

## Sprint 1.1: FOUNDATION (Woche 1-2)

### Phase 1: Core Database Schema
- [x] Tenants-Tabelle erstellen (Multi-Tenancy Basis)
- [x] Users-Tabelle erweitern (Rollen: super_admin, admin, kompass_reviewer, user)
- [x] Courses-Tabelle erstellen (Kursverwaltung)
- [x] Participants-Tabelle erstellen (Teilnehmerverwaltung)
- [x] Documents-Tabelle erstellen (Dokumenten-Upload)
- [x] Sammeltermine-Tabelle erstellen (KOMPASS-Termine)
- [x] Seed-Daten erstellen (Test-Tenant + Super Admin)

### Phase 2: Multi-Tenancy Middleware
- [x] Tenant-Middleware erstellen (Subdomain-Erkennung)
- [x] Custom Domain Support implementieren
- [x] tRPC Context erweitern (Tenant-Context)
- [x] 404-Fehler bei ungültigem Tenant

### Phase 3: Auth-System & Super Admin Dashboard
- [x] Auth-Router erweitern (Registration mit Tenant-Zuordnung)
- [x] Protected Procedures für Rollen (super_admin, admin, user)
- [x] Super Admin Dashboard erstellen (Tenant-Verwaltung)
- [x] Tenant CRUD-Operationen (Create, Read, Update, Delete)

### Phase 4: Dynamic Branding
- [x] Branding-System implementieren (Logo, Farben, Favicon)
- [x] CSS-Variablen dynamisch setzen
- [x] White-Label-Lösung für Tenants
- [ ] Branding-Preview im Super Admin Dashboard (Optional für später)

### Phase 5: Testing & Checkpoint
- [x] Vitest Tests für Auth-System
- [x] Vitest Tests für Tenant-Management
- [x] Vitest Tests für Multi-Tenancy Middleware
- [x] Checkpoint erstellen (Version: edeef683)
- [x] Dokumentation aktualisieren (README.md)

---

## Spätere Phasen (NICHT im MVP)

### Sprint 1.2: Course Management (Woche 3-4)
- [ ] Course CRUD
- [ ] Sammeltermin-Management
- [ ] Participant Registration Flow

### Sprint 1.3: Document Validation (Woche 5-6)
- [ ] File Upload (Cloudflare R2)
- [ ] AI Document Validator (GPT-4o-mini Vision)
- [ ] Status Dashboard

### Zukünftige Features
- [ ] AI-Formulare (Woche 7-8)
- [ ] Zeus-Integration (Woche 9-10)
- [ ] KOMPASS-Workflow (Woche 11-16)
- [ ] Billing & Certificates (Woche 19-20)

## Sprint 1.1.1: Routing-Anpassung (Hotfix)

### Routing-Logik
- [x] Wartungsseite für foerderpilot.io erstellen
- [x] Routing-Middleware anpassen (app.foerderpilot.io = App, foerderpilot.io = Wartung)
- [x] Tenant-Middleware aktualisieren (app als Subdomain erkennen)
- [x] Seed-Daten aktualisieren (app statt demo)
- [x] Testing (8 Tests bestanden)
- [x] Checkpoint erstellen (Version: db0407e9)

## Sprint 1.2: Course Management (Woche 3-4)

### Phase 1: Admin Dashboard Layout
- [x] Admin Dashboard Layout mit Sidebar erstellen
- [x] Navigation-Items (Dashboard, Kurse, Sammeltermine, Teilnehmer)
- [x] Responsive Design (Mobile + Desktop)
- [x] Tenant-Branding im Dashboard
- [x] Admin Dashboard Home Page mit Statistiken
- [x] Links auf Home Page

### Phase 2: Course CRUD
- [x] Course Router (tRPC) mit CRUD-Operationen
- [x] Kurs-Liste mit Filterung und Suche
- [x] Kurs aktivieren/deaktivieren
- [x] Kurs-Erstellen-Formular
- [x] Kurs-Bearbeiten-Formular (gleiches Formular)
- [x] Kurs-Details-Ansicht (in Liste integriert)
### Phase 3: Sammeltermin-Management
- [x] Sammeltermin Router (tRPC)
- [x] Backend CRUD-Operationen vollständig
- [ ] Frontend UI (verschoben auf spätere Phase)
- [x] Namenskorrektur: "Sammeltermins" → "Sammeltermine"

### Phase 4: Öffentliche Kurs-Übersicht
- [ ] Öffentliche Kurs-Liste (verschoben auf spätere Phase)
- [ ] Kurs-Details-Seite (verschoben auf spätere Phase)
- [ ] Registrierungs-Formular (verschoben auf spätere Phase)

### Phase 5: Testing & Checkpoint
- [x] Vitest Tests (8 Tests bestanden)
- [x] TypeScript-Checks (alle erfolgreich)
- [x] Namenskorrektur durchgeführt
- [x] Checkpoint erstellen (Version: 507b70b6)

## Sprint 1.2.1: Course-Formular Anpassungen & Bug-Fixes

### Anpassungen Course-Formular
- [x] Zeitplan-Typ: "Monate" entfernen, "Tage" ergänzen
- [x] Zeitplan-Felder für "Tage": "Anzahl Tage" + "Stunden/Tag"
- [x] Automatische Brutto-Berechnung aus Netto (19% MwSt)
- [x] "Trainer-Namen" → "Dozent" umbenennen
- [x] Alle Platzhalter aus Formular-Feldern entfernen

### Bug-Fixes
- [x] Kurs-Anzeige in Übersicht reparieren (WHERE-Bedingungen mit and() kombiniert)
- [x] Seed-Daten geprüft (1 Kurs vorhanden)
- [x] Testing (8 Tests bestanden)
- [x] Checkpoint erstellen (Version: aabeda2d)


## Bug-Fixes

### Abmelden-Buttons
- [x] Abmelden-Button in Home.tsx reparieren
- [x] Abmelden-Button in AdminLayout.tsx reparieren
- [x] Logout-Mutation mit Redirect zur Login-Seite implementiert


## Sprint 1.3: Document Validation (Woche 5-6)

### Phase 1: Document Router & Database
- [x] Document Router (tRPC) mit CRUD-Operationen
- [x] Database Queries für Dokumente
- [x] Validierungs-Status-Enum erweitern
- [x] SQL-Migration für documents Tabelle durchgeführt

### Phase 2: File Upload System
- [x] S3-Upload-Integration
- [x] Upload-Endpoint (tRPC)
- [x] File-Type-Validierung (PDF, JPG, PNG, HEIC)
- [x] Progress-Tracking

### Phase 3: AI Document Validator
- [x] GPT-4o-mini Vision Integration
- [x] Dokumenttyp-spezifische Validierung
- [x] Validierungs-Regeln definieren
- [x] Error-Feedback-System

### Phase 4: Document Management UI
- [x] Document-Upload-Component (mit Drag & Drop)
- [x] Document-Liste (Admin)
- [x] Status Dashboard mit Statistiken
- [x] Validierungs-Actions (Validieren, Löschen, Ansehen)

### Phase 5: Testing & Checkpoint
- [x] Vitest Tests für Document CRUD (6 Tests)
- [x] Vitest Tests für AI Validator
- [x] Integration Tests (14 Tests bestanden)
- [x] Checkpoint erstellen (Version: bcfed73d)


## Phase 2: Participant Management (Woche 7-10)

### Phase 2.1: Participant Router & Database
- [x] Participant Router (tRPC) mit CRUD-Operationen
- [x] Database Queries für Teilnehmer
- [x] Status-Pipeline-Logik im Backend (updateStatus)
- [x] Validierungs-Regeln für Teilnehmer-Daten (Zod-Schemas)

### Phase 2.2: Status-Pipeline-System
- [ ] Status-Enum erweitern (registered, documents_pending, documents_submitted, etc.)
- [ ] Automatische Status-Übergänge implementieren
- [ ] Status-Historie-Tracking
- [ ] Benachrichtigungs-Trigger definieren

### Phase 2.3: Participant Management UI
- [x] Participant-Liste mit Filterung und Suche
- [x] Participant-Formular (Erstellen/Bearbeiten)
- [x] Status-Pipeline-Visualisierung
- [x] Status-ändern-Funktion (in Detail-View)

### Phase 2.4: Document-Integration
- [x] Document-Upload für Teilnehmer (in Detail-View)
- [x] Participant-Detail-View mit Dokumenten-Liste
- [x] Dokumenten-Status-Übersicht pro Teilnehmer
- [x] Status-Pipeline-Visualisierung mit Fortschrittsanzeige

### Phase 2.5: Testing & Checkpoint
- [x] Vitest Tests für Participant CRUD (7 Tests)
- [x] Vitest Tests für Status-Pipeline
- [x] Integration Tests (21 Tests bestanden)
- [ ] Checkpoint erstellen


## Tenant-Middleware Fix (Phase 2.7)
- [x] Tenant-Middleware für Manus Cloud Development URL anpassen (foerderpilot.manus.space)
- [x] Fallback auf "app" Tenant für Development-URLs (localhost, manus.space, manusvm.computer)
- [x] Tenant Subdomain von "demo" zu "app" geändert
- [ ] Testen auf foerderpilot.manus.space
- [ ] Testen auf app.foerderpilot.io
- [ ] Checkpoint erstellen
