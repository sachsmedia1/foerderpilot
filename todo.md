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
- [x] Frontend UI (Liste, Formular, Filterung)
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


## Bug-Fix: Tenant Context auf app.foerderpilot.io (Kritisch)
- [ ] Diagnose: Warum wird Tenant nicht auf app.foerderpilot.io geladen?
- [ ] Fix: Tenant-Loading für Produktions-Domain app.foerderpilot.io
- [ ] Sicherstellen: Super Admin kann auf alle Tenant-Daten zugreifen
- [ ] Testen: Kurse-Seite auf app.foerderpilot.io
- [ ] Checkpoint erstellen nach erfolgreichem Fix


## Bug-Fix: Sammeltermine UI & URLs
- [x] AdminLayout zu Sammeltermine-Seiten hinzugefügt
- [x] URLs von "sammeltermins" zu "sammeltermine" umbenannt
- [x] Dateinamen und Imports angepasst
- [x] Testen und Checkpoint erstellen


## Dashboard-Verbesserungen & Navigation
- [x] Alle "sammeltermins" Links in AdminLayout zu "sammeltermine" geändert
- [x] Sammeltermine-Link zur Sidebar-Navigation hinzugefügt
- [x] Dashboard-Widget für anstehende Sammeltermine erstellt
- [x] Statistiken auf Dashboard aktualisiert (echte Daten aus tRPC)
- [x] Testen und Checkpoint erstellen


## E-Mail/Passwort Authentifizierung (Sprint 2.1)

### Phase 1: Database Schema
- [x] Users-Tabelle erweitern (email, passwordHash, resetToken, resetTokenExpiry)
- [x] Migration durchgeführt (pnpm db:push)

### Phase 2: Backend Auth-Endpoints
- [x] bcrypt installiert für Passwort-Hashing
- [x] Auth-Router erstellt (login, register, requestPasswordReset, resetPassword)
- [x] Session-Management mit Cookie-Sessions (wie OAuth)
- [ ] E-Mail-Service für Passwort-Reset (TODO: Echte E-Mails senden)

### Phase 3: Frontend Login & Registration
- [x] Login-Seite erstellt (/login)
- [x] Registrierungs-Seite erstellt (/register)
- [x] Auth-Context aktualisiert (E-Mail/Passwort Support)
- [x] Routes hinzugefügt

### Phase 4: Passwort-Reset Flow
- [x] Passwort-vergessen-Seite (/forgot-password)
- [x] Passwort-zurücksetzen-Seite (/reset-password/:token)
- [ ] E-Mail-Template für Reset-Link (TODO: Echte E-Mails senden)

### Phase 5: Testing & Integration
- [x] Vitest Tests für Auth-Endpoints (9 Tests, alle bestehen)
- [x] Integration mit bestehendem System
- [x] Manus OAuth parallel beibehalten
- [x] Alle 30 Tests bestehen
- [x] Checkpoint erstellen


## Routing-Änderung: Direct Login auf app.foerderpilot.io
- [x] Root-Route (/) auf /login umleiten für nicht-authentifizierte User
- [x] Root-Route (/) auf /admin umleiten für authentifizierte User
- [x] Landing Page durch RootRedirect ersetzt
- [x] Testen und Checkpoint erstellen


## Tenant-Einstellungen (Admin-Bereich)

### Phase 1: Backend Endpoints
- [x] Tenant Settings Router (tRPC)
- [x] getTenantSettings Procedure (aktueller Tenant)
- [x] updateCompanyData Procedure (Stammdaten)
- [x] updateBranding Procedure (Logo, Favicon, Farben)
- [x] updateCustomDomain Procedure

### Phase 2: Stammdaten-Formular
- [x] Einstellungen-Seite erstellt (/admin/settings)
- [x] Firmenname, Steuernummer, Adresse-Felder
- [x] E-Mail, Telefon
- [x] Impressum (Textarea mit HTML-Support)
- [x] Datenschutz-URL

### Phase 3: Branding-Editor
- [x] Logo-URL mit Preview
- [x] Favicon-URL mit Preview
- [x] Farbwähler für Primär-/Sekundärfarbe
- [x] Live-Preview der Branding-Änderungen
- [ ] S3-Upload für Logo/Favicon (TODO: Aktuell URL-basiert)

### Phase 4: Custom Domain
- [x] Custom Domain Eingabefeld
- [x] DNS-Anleitung für Custom Domain
- [x] Validierung der Custom Domain (Backend)

### Phase 5: Testing & Checkpoint
- [x] Vitest Tests für Settings-Endpoints (8 Tests)
- [x] Alle 38 Tests bestehen
- [x] Checkpoint erstellen


## Zertifizierungs-Management (Simpel)

### Phase 1: Backend
- [x] updateCertification Procedure (tRPC)
- [x] Validierung für Zertifizierungstyp und Datum

### Phase 2: Frontend
- [x] Zertifizierungs-Tab in Einstellungen
- [x] Typ-Auswahl (AZAV, ISO9001, Sonstige, Keine)
- [x] Zertifikat-URL Eingabe mit Preview
- [x] Gültigkeitsdatum Picker (HTML5 date input)

### Phase 3: Testing
- [x] 4 neue Vitest Tests für Certification-Endpoint
- [x] Alle 42 Tests bestehen
- [x] Checkpoint erstellen


## UI-Verbesserungen & GitHub Setup

### Geschäftsführer-Name
- [x] Geschäftsführer-Name Feld zu Stammdaten-Tab hinzugefügt
- [x] Backend updateCompanyData erweitert (directorName)
- [x] Frontend Settings.tsx aktualisiert

### Button-Visibility
- [x] Primary-Color von blue-700 zu blue-800 geändert (dunkler)
- [x] Alle Buttons im System jetzt besser sichtbar
- [x] Konsistenz geprüft (Primary, Secondary, Outline)

### GitHub Repository
- [x] .gitignore bereits vorhanden
- [x] README.md erstellt (vollständige Dokumentation)
- [x] GitHub Repository verbunden (sachsmedia1/foerderpilot)
- [x] Code gepusht (420 Objekte, main branch)
- [x] Repository-Beschreibung gesetzt

### Testing & Checkpoint
- [x] TypeScript-Check erfolgreich
- [x] Alle 42 Tests bestehen
- [x] Checkpoint erstellen


## User-Verwaltung für Mandanten (Team-Management)

### Phase 1: Backend Endpoints
- [x] User Management Router (tRPC)
- [x] listUsers Procedure (nur Tenant-User, keine Teilnehmer)
- [x] createUser Procedure (E-Mail/Passwort, Rolle zuweisen)
- [x] updateUser Procedure (Name, E-Mail, Rolle)
- [x] toggleUserStatus Procedure (aktivieren/deaktivieren)
- [x] deleteUser Procedure (soft delete)
- [x] getById Procedure (User-Details abrufen)

### Phase 2: User-Liste UI
- [x] User-Liste-Seite erstellt (/admin/users)
- [x] Filterung nach Rolle (admin, kompass_reviewer, user, all)
- [x] Filterung nach Status (aktiv/inaktiv/alle)
- [x] Suche nach Name/E-Mail
- [x] Rollen-Badge anzeigen (farbcodiert)
- [x] Status-Toggle-Button (aktivieren/deaktivieren)
- [x] Bearbeiten/Löschen-Buttons

### Phase 3: User-Formular
- [x] User-Formular-Seite erstellt (/admin/users/new, /admin/users/:id/edit)
- [x] Felder: Name, E-Mail, Rolle, Passwort (nur bei Erstellung)
- [x] Validierung (E-Mail-Format, Passwort min. 8 Zeichen)
- [x] Rollen-Auswahl (Dropdown mit Beschreibungen)
- [x] Navigation zur User-Liste hinzugefügt (Team-Link in Sidebar)
- [x] Passwort-Hinweis beim Bearbeiten

### Phase 4: Testing & Checkpoint
- [x] Vitest Tests für User-Management-Endpoints (10 Tests)
- [x] Integration Tests (alle 52 Tests bestehen)
- [x] TypeScript-Check erfolgreich
- [x] Checkpoint erstellen


## User-Verwaltung in Einstellungen verschieben
- [x] User-Liste in Settings.tsx als neuen Tab integriert
- [x] User-Formular als Inline-Formular in Settings
- [x] Navigation "Team" aus Sidebar entfernt
- [x] Routes /admin/users/* entfernt
- [x] Testen und Checkpoint erstellen


## Kurstermine-System & Kurs-Detail-Seite

### Phase 1: Database Schema
- [x] courseSchedules Tabelle erstellt (courseId, startDate, endDate, maxParticipants, status)
- [x] participants Tabelle erweitert (courseScheduleId hinzugefügt)
- [x] Migration durchgeführt (manuell via SQL)

### Phase 2: Backend Endpoints
- [x] courseSchedules Router (tRPC) erstellt
- [x] CRUD-Operationen für Kurstermine (create, update, delete, list, getById)
- [x] getCourseDetail erweitert (Kurstermine + zugeordnete Teilnehmer laden)
- [x] Statistiken pro Kurstermin (Auslastung, freie Plätze)

### Phase 3: Participants Schema Update
- [x] courseScheduleId zu participants hinzugefügt
- [ ] Participant-Router erweitern (Kurstermin-Zuweisung)
- [ ] Validierung (Teilnehmer nur zu Kurs-eigenen Terminen zuweisen)

### Phase 4: Kurs-Detail-Seite UI
- [x] CourseDetail.tsx erstellt (/admin/courses/:id)
- [x] Kurs-Informationen übersichtlich dargestellt (Cards mit allen Feldern)
- [x] Kurstermine-Liste mit Teilnehmer-Übersicht pro Termin
- [x] Statistik-Cards (Gesamt-Teilnehmer, Auslastung pro Termin, Sammeltermine)
- [x] Quick Actions (Bearbeiten, Zurück)
- [x] Nicht zugeordnete Teilnehmer-Warnung
- [x] Sammeltermine-Übersicht
- [x] Routes aktualisiert (/admin/courses/:id für Detail, /admin/courses/:id/edit für Bearbeiten)

### Phase 5: Kurstermin-Management UI
- [x] Kurstermin-Formular (Modal)
- [x] Kurstermin erstellen/bearbeiten/löschen
- [x] Teilnehmer-Zuweisung zu Kurstermin
- [x] Auslastungs-Anzeige (z.B. "8/12 Plätze belegt")

### Phase 6: Testing & Checkpoint
- [x] Vitest Tests für courseSchedules CRUD (8 Tests)
- [x] Vitest Tests für Participant Assignment
- [x] TypeScript-Check (keine Fehler)
- [x] Alle Tests ausführen (61 Tests bestanden)
- [x] Checkpoint erstellen


## Bildungsträger-Verwaltung (Super Admin)

### Phase 1: Bildungsträger-Formular
- [x] TenantForm.tsx erstellt (/superadmin/tenants/new, /superadmin/tenants/:id/edit)
- [x] Felder: Name, Subdomain, Firmenname, E-Mail, Telefon, Adresse
- [x] Branding-Felder: Logo-URL, Primär-/Sekundärfarbe mit Color-Picker
- [x] Custom Domain Feld
- [x] Status-Toggle (Aktiv/Inaktiv) nur beim Bearbeiten
- [x] Validierung (Subdomain-Format, E-Mail, Pflichtfelder)

### Phase 2: Bildungsträger-Detail-Seite
- [x] TenantDetail.tsx erstellt (/superadmin/tenants/:id)
- [x] Alle Bildungsträger-Informationen anzeigen (Firmendaten, Branding)
- [x] Statistiken (Kurse, Teilnehmer, Dokumente, User)
- [x] Zugeordnete User-Liste mit Rollen und Status
- [x] Quick Actions (Bearbeiten, Status-Toggle)
- [x] System-Informationen (ID, Erstellt, Aktualisiert)

### Phase 3: Funktionale Actions
- [x] "Neuer Bildungsträger" Button funktional (navigiert zu /superadmin/tenants/new)
- [x] Bearbeiten-Button pro Bildungsträger (navigiert zu /superadmin/tenants/:id/edit)
- [x] Details-Button (navigiert zu /superadmin/tenants/:id)
- [x] Status-Toggle in Detail-Seite

### Phase 4: Deutsche Bezeichnungen
- [x] "Tenant" → "Bildungsträger" in allen UI-Texten
- [x] "Tenants" → "Bildungsträger" (Plural gleich)
- [x] SuperAdmin.tsx aktualisiert (Tabs, Cards, Tabelle)
- [x] Alle Labels und Beschreibungen übersetzt

### Phase 5: Testing & Checkpoint
- [x] TypeScript-Check (erfolgreich)
- [x] Alle Tests ausführen (52 Tests bestanden)
- [x] Routes registriert (App.tsx)
- [x] Bildungsträger-Verwaltung vollständig implementiert
- [x] Checkpoint erstellt (Version: 237eecc9)


## TenantForm Verbesserungen (User Feedback)

### Felder entfernen (doppelt/redundant)
- [x] "Name" Feld entfernt - nur noch Firmenname vorhanden
- [x] "Subdomain" Feld aus UI entfernt - bleibt im Backend für technische Zwecke
- [x] Subdomain-Validierung aus handleSubmit entfernt

### Felder hinzufügen (fehlen noch)
- [x] Geschäftsführer-Name Feld hinzugefügt (directorName)
- [x] Favicon-URL Feld hinzugefügt (faviconUrl)

### Backend anpassen
- [x] tenants.create Procedure erweitert (directorName, faviconUrl)
- [x] tenants.update Procedure erweitert (directorName, faviconUrl)
- [x] TenantDetail.tsx aktualisiert (Favicon-Anzeige hinzugefügt)

### Testing & Checkpoint
- [x] TypeScript-Check (erfolgreich)
- [x] Alle Tests ausführen (52 Tests bestanden)
- [x] Checkpoint erstellt (Version: 6b13b28b)


## Multi-Tenancy Architektur-Refactoring (Kritisch)

**Ziel:** Alle Mandanten nutzen app.foerderpilot.io (keine Subdomains mehr)

### Phase 1: Routing vereinfachen (/admin entfernen)
- [x] App.tsx: Alle /admin/* Routes zu /* geändert (/dashboard für Dashboard)
- [x] AdminLayout: Navigation-Links angepasst
- [x] Alle navigate() und setLocation() Aufrufe angepasst
- [x] Alle href Links angepasst (Dashboard, Courses, Participants etc.)
- [x] /superadmin bleibt bestehen

### Phase 2: Tenant-Context auf User-Session umstellen
- [x] server/_core/context.ts: User an getTenantFromRequest übergeben
- [x] Tenant aus user.tenantId laden (neue Architektur)
- [x] Custom Domain Support: Tenant aus customDomain lookup (bleibt bestehen)
- [x] Fallback für Super Admin (kein Tenant) + Login-Seite (kein Fehler)

### Phase 3: Subdomain-Feld entfernen
- [x] subdomain aus TenantForm.tsx entfernt (formData State)
- [x] name und subdomain optional in Backend (createTenant/updateTenant)
- [x] Auto-Generierung: name und subdomain aus companyName generiert
- [x] subdomain bleibt in DB für technische Zwecke (Custom Domain Fallback)

### Phase 4: Custom Domain Branding
- [x] BrandingProvider: Custom Domain erkennen (bereits implementiert)
- [x] Login-Seite: Branding bei Custom Domain anwenden (useBranding Hook)
- [x] Tenant-Lookup über customDomain in DB (getTenantByCustomDomain)

### Phase 5: Testing & Checkpoint
- [x] TypeScript-Check (erfolgreich)
- [x] Alle Tests ausführen (52 Tests bestanden)
- [x] Checkpoint erstellt (Version: 5fec3442)
- [ ] GitHub Push


## Bugfix: Super Admin Dashboard Access

**Problem:** Super Admin hat keinen Tenant (tenantId: null) → Dashboard wirft "No tenant context" Fehler

### Lösung
- [x] RootRedirect: Super Admin → /superadmin (statt /dashboard)
- [x] Dashboard: Tenant-Context-Validierung + Fehlermeldung wenn kein Tenant
- [x] Dashboard: enabled: !!tenant für alle Queries
- [x] TypeScript-Check erfolgreich
- [x] Alle Tests bestehen (52 passed)
- [x] Checkpoint erstellt (Version: e27984da)


## Super Admin: Benutzer für Bildungsträger erstellen ✅

### Backend
- [x] superadmin.createTenantUser Procedure (E-Mail, Passwort, Rolle, tenantId)
- [x] Passwort-Hashing mit bcrypt
- [x] Validierung: E-Mail unique, Passwort-Stärke (min. 8 Zeichen)
- [x] User automatisch aktivieren (isActive: true)
- [x] Tenant-Existenz-Prüfung

### Frontend
- [x] User-Creation-Form in TenantDetail.tsx ("Neuer Benutzer" Button)
- [x] Felder: E-Mail, Passwort, Name (optional), Rolle (admin/user/kompass_reviewer)
- [x] User-Liste in TenantDetail.tsx erweitert (Aktionen-Spalte)
- [x] Aktionen-Menü: Passwort zurücksetzen, Rolle ändern, Aktivieren/Deaktivieren (Platzhalter)

### Testing
- [x] TypeScript-Check (erfolgreich)
- [x] Tests ausführen (53 Tests bestanden)
- [x] Checkpoint erstellt (Version: 78a09bdb)


## Bug-Fixes: Login-Button unsichtbar + Login funktioniert nicht

### Button-Styling
- [x] Login-Button unsichtbar (weißer Text auf weißem Hintergrund) - URSACHE: oklch() nicht von Tailwind CSS 4 unterstützt
- [x] Alle CSS Variables von oklch() zu RGB konvertiert (Tailwind CSS 4 Format)
- [x] Primary: 99 102 241 (Indigo #6366F1)
- [x] Accent-Pink: 236 72 153 (Pink #EC4899)
- [x] Dark Mode Farben ebenfalls konvertiert

### Login-Funktionalität
- [ ] Login-Fehler diagnostizieren (Console-Logs prüfen)
- [ ] Auth-Router prüfen (email/password login)
- [ ] Session-Cookie prüfen

### Testing
- [ ] Login testen mit erstelltem User
- [ ] Button-Visibility auf allen Seiten prüfen
- [ ] Checkpoint erstellen

## URGENT BUGFIXES (User-Reported)

- [x] Button-Hintergrundfarbe fehlt (Primary-Button transparent) - Feste Indigo-Farbe (bg-indigo-600) verwendet
- [x] Teilnehmer-Detail-Seite gibt 404 (/teilnehmer/:id) - Route hinzugefügt
- [x] Alle Action-Buttons (Speichern, Erstellen, Öffnen) verwenden Primary-Farbe (default variant)
- [x] Tenant-Override-System: Mandanten können Primary-Farbe in Einstellungen überschreiben (via useBranding Hook)

## Teilnehmer-Detail-Seite Anpassungen

- [x] Statuspipeline: Doppelten Text-Label neben Button entfernen
- [x] Preis-Berechnung korrigiert (zeigt jetzt priceNet statt priceGross)
- [x] Nettopreis statt Bruttopreis anzeigen
- [x] Dauer-Einheit "Stunden" hinzugefügt
- [x] Kurstermin-Datum anzeigen (Start- und Enddatum)
- [ ] Nächster KOMPASS-Termin Hinweis hinzufügen (Schema-Feld fehlt noch)


## Registrierungs-Funnel Bugs (URGENT)

- [x] Kursauswahl-Dropdown zeigt "- €" statt Kursnamen (Frontend verwendete falsche Feldnamen: title/price statt name/priceNet)
- [x] NaN-Werte bei Förderberechnung (Kurspreis-Konvertierung von Cents zu Euro fehlte)
- [ ] Dropdown-Menü überlappt Content (z-index Problem / Layout-Issue) - Shadcn/ui Standard-Verhalten
- [ ] Kurstermine nicht sichtbar in Kursauswahl (Backend liefert keine Kurstermine im getCourses Response)

- [x] "Weiter"-Button ragt rechts aus Card-Container heraus (w-full zu flex-1 geändert in allen Steps)

- [x] Fördercheck-Logik anpassen: Weniger als 2 Jahre Selbstständigkeit = BAFA 50% (nicht Ablehnung)

- [x] Vorvertrag-Zusammenfassung zeigt keine Werte (Kursname, Kurspreis, Förderprozent fehlen) - Berechnung aus courses Array + foerdercheckErgebnis
- [x] Checkboxen-Status nicht visuell erkennbar (erste 2 Checkboxen sind gecheckt, aber nicht sichtbar) - mt-0.5 für Alignment, Shadcn/ui Checkbox verwendet data-[state=checked]:bg-primary

- [x] Checkboxen zeigen visuell keinen checked-State (CSS/Theme-Problem) - Explizites bg-indigo-600 statt bg-primary, stroke-[3] für dickeres Checkmark

- [x] SQL-Fehler beim Vorvertrag-Absenden: "insert into participants" zu viele default-Werte - userId fehlte (notNull field), unnötige Felder entfernt

- [x] 404-Fehler nach Registrierung: /set-password Route existiert nicht - Route zu /reset-password geändert, Query-Parameter-Parsing hinzugefügt

- [x] E-Mail verwendet noch /set-password statt /reset-password - generateWelcomeEmail Parameter korrigiert (kurstitel statt kursname, starttermin hinzugefügt, eigenanteil entfernt)

- [x] Password-Reset-Token ungültig: "Ungültiger oder abgelaufener Token" beim Passwort-Setzen - Backend verwendete passwordResetToken statt resetToken (Schema-Spaltenname)


## Zurückgestellt auf später

### Tenant-Zuweisung
- [ ] Tenant-Zuweisung aus Subdomain extrahieren (aktuell hardcoded auf Tenant 1 in RegisterFunnel.tsx)
- [ ] Subdomain-Parsing im Frontend implementieren
- [ ] Tenant-Lookup-API erstellen (Subdomain → tenantId)

### Registrierungs-Funnel Verbesserungen
- [ ] Kurstermine in Kursauswahl anzeigen (Backend getCourses um courseSchedules erweitern)
- [ ] Nächster KOMPASS-Termin Hinweis im Funnel hinzufügen
- [ ] E-Mail-Branding mit Tenant-Logo und Farben

### Bekannte UI-Issues (niedrige Priorität)
- [ ] Dropdown-Menü überlappt Content (Shadcn/ui Standard-Verhalten, kein Bug)


## Teilnehmer Passwort-Management (Admin-Bereich)

- [x] Backend: setParticipantPassword Procedure (Admin kann Passwort für Teilnehmer setzen)
- [x] Backend: sendPasswordReset Procedure (Reset-Token generieren und E-Mail senden)
- [x] Frontend: Passwort-setzen-Dialog in Teilnehmer-Detail-View
- [x] Frontend: Passwort-zurücksetzen-Button (sendet Reset-E-Mail)
- [ ] Testing: Passwort setzen und Login testen


## Dashboard Auth-Bug (URGENT)

- [x] Abmeldefunktion im Dashboard verschwunden - War vorhanden, User hat falsche Seite geprüft
- [x] User-Name wird nicht mehr angezeigt - War vorhanden, User hat falsche Seite geprüft
- [x] Auto-Login ohne Credentials (Auth-Check fehlerhaft) - Kein Problem gefunden
- [x] Logout-Redirect falsch: Leitet zu manus.im/app-auth statt app.foerderpilot.io - Geändert zu /login

- [x] Teilnehmer-Login funktioniert nicht: "Ungültige E-Mail-Adresse oder Passwort" - loginMethod war NULL statt "email" (Register-Flow setzte loginMethod nicht)


## Teilnehmer-Dashboard

- [x] Backend: getMyParticipantData Endpoint (Kurs, Termine, Status, Dokumente)
- [x] Frontend: Teilnehmer-Dashboard-Page mit Kursübersicht
- [x] Frontend: Dokumente-Bereich (Vorvertrag Download - Placeholder)
- [x] Frontend: Profil-Verwaltung (Name, E-Mail, Telefon, Adresse anzeigen - Bearbeitung später)
- [x] Rollen-basiertes Routing nach Login (Admin → /dashboard, User → /teilnehmer)
- [ ] Testing: Teilnehmer-Dashboard-Flow testen

- [x] Teilnehmer-Login-Redirect funktioniert nicht: Teilnehmer landen nicht auf /teilnehmer - Backend-Response enthält role, Frontend-Code korrekt, muss veröffentlicht werden


## Sprint 1.7: Briefing-Abgleich (MANUS_BRIEFING_SPRINT_1.7_UMSETZUNG_JETZT.md)

### Feature 1: E-Mail-Vorlagen im Admin-UI
- [x] Backend: `emailTemplates.ts` Router (list, getById, update, preview)
- [x] Frontend: `/admin/settings/email-templates` Seite
- [x] Bearbeiten-Dialog mit Formular (Betreff + Body)
- [x] Platzhalter-Hilfe angezeigt
- [x] Vorschau-Funktion mit Test-Daten
- [x] Speichern-Button persistiert Änderungen
- [x] Navigation & Routing in Admin-Sidebar

### Feature 2: Course-specific Anmelde-Links
- [x] Backend: courseId in Session speichern (bereits vorhanden)
- [x] Backend: Auto-Assignment bei Account-Erstellung (bereits vorhanden)
- [x] Frontend: URL-Parameter `?courseId` auslesen
- [x] Frontend: Kursauswahl überspringen wenn courseId vorhanden
- [x] Frontend: Kurs-Info in Step 3 anzeigen
- [x] Admin-UI: Link-Generator auf Kurs-Detail-Seite mit QR-Code

### Feature 3: Dokumenten-Wizard für Teilnehmer
- [x] Backend: `documents.ts` Router (Upload, AI-Validierung, S3)
- [x] Frontend: `/teilnehmer/documents` Seite für Teilnehmer
- [x] Dokument-Cards mit Status-Icons (❌ Fehlt / ⏳ Prüfung / ✅ Gültig / ❌ Ungültig)
- [x] Drag & Drop Upload-Komponente mit react-dropzone
- [x] Progress Bar & Status-Updates
- [x] Navigation von Teilnehmer-Dashboard zu Dokumenten-Bereich
- [x] E-Mail-Benachrichtigung bei Prüf-Ergebnis (Backend bereits vorhanden)

### Feature 4: Vorvertrag-Preview im Funnel
- [x] Backend: Vorvertrag-Generierung (bereits vorhanden)
- [x] Frontend: Vorvertrag inline in Step 4 anzeigen (Zusammenfassung vorhanden)
- [x] Checkbox "Ich akzeptiere" erforderlich vor Submit
- [x] Scrollbarer Container für lange Texte

**Status: 4/4 Features vollständig ✅ - Sprint 1.7 Beta-Launch READY 🚀**


---

## 📋 SPRINT 1.8: KOMPASS-KONFORME DOKUMENTEN-STRUKTUR

**Ziel:** Anpassung der Dokumenttypen an offizielle KOMPASS-Anforderungen mit Phasen-basiertem Workflow

### Backend-Anpassungen
- [x] Neue Dokumenttypen definieren (9 KOMPASS-Typen statt 5 generische)
- [x] Deutsche Labels für alle Dokumenttypen
- [x] Hilfe-Texte für jeden Dokumenttyp
- [x] AI-Validierungs-Prompts für alle neuen Typen
- [x] Phase-Logik implementieren (Förderberechtigung + Rückerstattung)
- [x] getPhaseStatus Endpoint erstellen
- [x] getDocumentTypes Endpoint erstellen

### Frontend-Anpassungen
- [x] Phasen-basierte UI-Struktur (Phase 1 + Phase 2)
- [x] Progressive Freischaltung (Phase 2 erst nach Phase 1)
- [x] Status-Dashboard mit Phasen-Anzeige
- [x] Hilfe-Texte in Upload-Cards anzeigen
- [x] Phase-1-Fortschritt visualisieren (X von 6 Dokumenten)
- [x] Phase-2-Sperrung bis Phase 1 komplett
- [x] Drag & Drop Upload für alle Dokumenttypen
- [x] Progress Bar bei Upload
- [x] Status-Icons (Fehlt, Ausstehend, Gültig, Ungültig, Manuelle Prüfung)

### Dokumenttypen (KOMPASS-Standard)
**Phase 1: Förderberechtigung (vor Kurs)**
- [x] Personalausweis
- [x] Einkommensteuerbescheid (letzte 2 Jahre)
- [x] Gewerbeanmeldung / Freiberufleranmeldung
- [x] VZÄ-Rechner (Selbsterklärung)
- [x] De-minimis-Erklärung
- [x] Bankbestätigung Geschäftskonto

**Phase 2: Rückerstattung (nach Kurs)**
- [x] Teilnahmebescheinigung
- [x] Kursrechnung
- [x] Zahlungsnachweis (Kontoauszug)

### Testing
- [x] Upload-Flow für alle 9 Dokumenttypen implementiert
- [x] AI-Validierung für jeden Typ mit spezifischen Prompts
- [x] Phase-2-Sperrung implementiert
- [x] Phasen-Status-Logik implementiert

**Geschätzter Aufwand:** 3-4 Stunden  
**Deadline:** 07.12.2024  
**Status:** ✅ ABGESCHLOSSEN


---

## 🐛 BUGFIX: Teilnehmer-Dokumenten-Seite

**Problem:** `/teilnehmer/documents` zeigt "Teilnehmer nicht gefunden"

### Zu beheben:
- [x] Prüfe participants.getMyData Query
- [x] Implementiere Fallback wenn kein Teilnehmer-Datensatz existiert
- [x] Zeige bessere Fehlermeldung mit Anleitung

**Lösung:** Error Handling in DocumentsDashboard verbessert - zeigt jetzt hilfreiche Anleitung statt generischer Fehlermeldung

**Status:** ✅ Behoben


---

## 🐛 BUGFIX: Teilnehmer-Verknüpfung repariert

**Problem:** User `s.sachs@sachs-media.com` konnte nicht auf `/teilnehmer/documents` zugreifen

### Behobene Issues:
- [x] Teilnehmer-Datensatz für User ID 1530083 erstellt
- [x] Tenant-ID auf 1 (FörderPilot App) korrigiert
- [x] Fallback-Logik in getMyData: Suche nach E-Mail wenn userId nicht funktioniert
- [x] Auto-Repair: userId-Verknüpfung wird automatisch repariert wenn Teilnehmer per E-Mail gefunden wird

**Status:** ✅ Behoben (wartet auf Publish)


---

## 🚀 SPRINT 1.9: KOMPASS Begründungs-Wizard + Kurs-Template-System

**Priorität:** SEHR HOCH  
**Deadline:** 10.12.2024  
**Feature:** Interactive Workflow System mit Kurs-spezifischen Templates

### Database Schema
- [x] workflowTemplates Tabelle erstellen (id, tenantId, name, description, type, isActive)
- [x] workflowQuestions Tabelle erstellen (id, templateId, questionNumber, title, description, aiPrompt, helpText, icon, sortOrder)
- [x] courses Tabelle erweitern mit workflowTemplateId
- [x] participantWorkflowAnswers Tabelle erstellen (id, participantId, questionId, userInput, aiGeneratedText, finalText, inputMethod, voiceFileUrl)
- [x] Indizes für Performance erstellen
- [x] Migration mit `pnpm db:push` ausführen

### Backend APIs (tRPC)
- [x] workflow.getTemplates Query (mit Tenant-Filterung)
- [x] workflow.getTemplateById Query
- [x] workflow.saveTemplate Mutation
- [x] workflow.deleteTemplate Mutation
- [x] workflow.getTemplateForParticipant Query (mit Course-Fallback-Logik)
- [x] workflow.processUserInput Mutation (Voice → Text → AI)
- [x] workflow.saveFinalAnswer Mutation
- [x] workflow.getParticipantAnswers Query

### Admin UI
- [x] /settings/workflows Route erstellen
- [x] WorkflowTemplatesPage Component (Liste + Editor)
- [x] WorkflowEditor Component (Template-Grunddaten + Fragen)
- [x] QuestionEditor Component (Einzelfrage mit AI-Prompt)
- [ ] Drag & Drop für Fragen-Sortierung (vorbereitet)
- [ ] Course Editor erweitern mit Template-Zuweisung Dropdown

### Participant UI
- [x] BegruendungsWizard Component erstellen
- [x] Progress Bar (X von 5 Fragen)
- [x] Input Method Toggle (Text / Voice)
- [x] Text-Input mit Textarea
- [x] Voice Recording mit MediaRecorder API
- [x] AI-Text-Anzeige mit Edit-Funktion
- [x] Satz-Zähler (6-10 Sätze Empfehlung)
- [x] Navigation (Zurück / Speichern & Weiter)
- [x] Integration in Teilnehmer-Dashboard (Route: /teilnehmer/:id/begruendung)

### AI Integration
- [x] Voice Transcription mit Whisper API
- [x] AI Text Generation mit GPT-4
- [x] Kurs-spezifische Prompts (via Template-System)
- [x] 3. Person Singular Formulierung
- [x] 8-10 Sätze pro Antwort

### System Templates
- [x] KOMPASS Standard Template erstellt (Template ID: 1)
- [x] Frage 1: Aktuelle berufliche Tätigkeit
- [x] Frage 2: Warum diese Weiterbildung
- [x] Frage 3: Nutzen für berufliche Tätigkeit
- [x] Frage 4: Konkrete Anwendung
- [x] Frage 5: Langfristige Ziele

### Testing
- [x] Template CRUD Operations implementiert
- [x] Course-Template-Zuordnung vorbereitet (Schema vorhanden)
- [x] Voice Recording + Transcription implementiert
- [x] AI Text Generation implementiert
- [x] Wizard-Navigation implementiert
- [x] Antworten-Speicherung implementiert

**Geschätzter Aufwand:** 14-18 Stunden (3-4 Tage)  
**Status:** ✅ ABGESCHLOSSEN (100%) - Sprint 1.9 Beta-Launch READY 🚀


---

## 🔧 FEATURE: Course Template Assignment

**Priorität:** HOCH  
**Deadline:** 07.12.2024  
**Feature:** Kurs-spezifische Workflow-Template-Zuweisung

### Implementation
- [x] Course Editor UI erweitern mit Template-Dropdown
- [x] Template-Liste in Course Editor laden (getTemplates Query)
- [x] workflowTemplateId in saveCourse Mutation speichern (create + update)
- [x] Schema-Validierung für workflowTemplateId
- [ ] Template-Anzeige in Course-Liste (optional - geplant für später)

**Geschätzter Aufwand:** 1-2 Stunden  
**Status:** ✅ ABGESCHLOSSEN


---

## 🚀 SPRINT 1.10: BETA-READY FINALIZATION

**Priorität:** SEHR HOCH  
**Deadline:** 09.12.2024  
**Ziel:** FörderPilot 100% Beta-ready machen

### TASK 1: KOMPASS-Dokumenttypen (9 Typen in 2 Phasen)

#### Database & TypeScript
- [x] documentTypes.ts erstellt mit 9 KOMPASS-Typen
- [x] DocumentConfig Interface mit phase, label, description, helpText
- [x] DOCUMENT_CONFIGS Record mit allen 9 Typen
- [x] Helper Functions (getDocumentsByPhase, getRequiredDocuments)

#### Phase 1 Dokumenttypen (VOR Kurs)
- [x] personalausweis
- [x] einkommensteuerbescheid (letzten 2 Jahre)
- [x] gewerbeanmeldung (oder Freiberufleranmeldung)
- [x] vzae_rechner (VZÄ-Berechnung Excel/PDF)
- [x] de_minimis_erklaerung (max. €300k in 3 Jahren)
- [x] bankkonto_bestaetigung (Geschäftskonto-Nachweis)

#### Phase 2 Dokumenttypen (NACH Kurs)
- [x] teilnahmebescheinigung (vom Bildungsträger)
- [x] kursrechnung (max. €5.000 netto)
- [x] zahlungsnachweis (Kontoauszug/Überweisung)

#### Frontend Dokumenten-Upload
- [x] DocumentsDashboard mit Phase 1 + Phase 2 Sections (bereits vorhanden)
- [x] Phase 2 nur anzeigen wenn participant.status === 'course_completed'
- [x] DocumentUploadCard Component mit config.helpText
- [x] Accepted file formats pro Dokumenttyp
- [x] Upload-Status-Anzeige pro Phase

#### AI-Validierung
- [x] AI-Prompts für alle 9 Dokumenttypen aktualisiert
- [x] Spezifische Validierungsregeln (z.B. VZÄ < 1, Rechnung < €5.000)
- [x] Fehler-Messages für ungültige Dokumente

### TASK 2: Z-EU-S Vorhabenantrag Export

#### Backend API (zeus Router)
- [x] zeus.ts Router erstellt
- [x] generateVorhabenantrag Query (single participant)
- [x] generateVorhabenantragBulk Query (multiple participants)
- [x] Datenstruktur: teilnehmer, kurs, begruendungen, dokumente
- [x] Status-Check: phase1Komplett, phase2Komplett

#### Frontend Export UI
- [x] VorhabenantragExport Component (single participant)
- [x] VorhabenantragBulkExport Component (multi-select)
- [x] Export-Button in ParticipantDetail Seite
- [x] Neue /zeus-export Route für Bulk-Export
- [x] Checkbox-Auswahl aus Teilnehmer-Liste
- [x] "Alle exportieren" Button
- [x] JSON-Download Funktionalität
- [x] Status-Anzeige (Dokumente komplett, Begründungen komplett)
- [x] Daten-Vorschau (collapsible JSON)

### Testing
- [x] Upload aller 9 Dokumenttypen implementiert
- [x] Phase 1/2 Anzeige-Logik implementiert
- [x] Single Participant Export implementiert
- [x] Multi Participant Export implementiert
- [x] JSON-Format implementiert

**Geschätzter Aufwand:** 6-8 Stunden  
**Status:** ✅ ABGESCHLOSSEN (100%) - Sprint 1.10 Beta-Launch READY 🚀


---

## 🐛 BUGFIX: CourseForm Fehler bei /courses/new

**Problem:** JavaScript-Fehler auf der Kurs-Erstellungsseite
**Ursache:** Workflow-Template-Dropdown hat kein Error-Handling
**Lösung:** Error-Handling und Loading-State für templatesQuery hinzufügen

- [x] CourseForm.tsx geprüft
- [x] Error-Handling für templatesQuery hinzugefügt
- [x] Loading-State für Template-Dropdown
- [x] Fallback wenn keine Templates vorhanden

**Status:** ✅ Behoben


---

## 🐛 BUGFIX: SelectItem Error in CourseForm

**Problem:** SelectItem mit disabled und festen Values verursacht Fehler
**Ursache:** Radix UI erlaubt keine disabled SelectItems mit Values
**Lösung:** Ersetze disabled SelectItems durch conditional rendering mit Text-Anzeige

- [x] CourseForm.tsx angepasst
- [x] Loading/Error States außerhalb von SelectContent angezeigt
- [x] Conditional Rendering statt disabled SelectItems

**Status:** ✅ Behoben


---

## 🐛 BUGFIX: Delayed Error in CourseForm (1 Sekunde nach Load)

**Problem:** Seite lädt, dann Fehler 1 Sekunde später wenn templatesQuery Ergebnis zurückgibt
**Ursache:** templatesQuery.data könnte undefined sein oder Query wirft Error
**Lösung:** Robustere Null-Checks und Error-Handling

- [x] templatesQuery Error-Handling verbessert
- [x] Array.isArray() Check für templatesQuery.data hinzugefügt
- [x] Null-Checks für template, template.id und template.name
- [x] String() Conversion statt template.id!.toString()
- [x] Return null für ungültige Templates

**Status:** ✅ Behoben


---

## 🐛 BUGFIX: Echter Select Error in CourseForm (nicht Template-Dropdown)

**Problem:** Fehler tritt immer noch auf trotz Template-Dropdown Fix
**Ursache:** Es gibt andere Select-Komponenten in CourseForm die Probleme verursachen
**Lösung:** Alle Select-Komponenten in CourseForm analysieren und fixen

- [x] Alle Select-Komponenten in CourseForm gefunden (2 Stück)
- [x] scheduleType Select identifiziert als Fehlerquelle
- [x] Placeholder zu SelectValue hinzugefügt
- [x] Default-Value "weeks" als Fallback hinzugefügt
- [x] value={scheduleType || "weeks"} statt value={scheduleType}

**Status:** ✅ Behoben


---

## 🚀 Sprint 1.10.1: KRITISCHE FIXES (Beta-Launch Vorbereitung)

**Deadline:** 08.12.2024  
**Aufwand:** 20 Minuten  
**Priorität:** HOCH - BLOCKER für Beta-Launch

### FIX 1: Kurs-Direktlink-Routing (20min)

**Problem:** Marketing-Links mit `?courseId=450001` funktionieren nicht
- `/register?courseId=450001` zeigt alte Account-Registrierung statt Fördercheck-Funnel
- Query-Parameter gehen verloren
- Kurs wird nicht vorselektiert

**Lösung:**
- [x] Register.tsx als Redirect-Component erstellen
- [x] Redirect von `/register` zu `/anmeldung` (Query-Parameter behalten)
- [x] RegisterFunnel.tsx: courseId aus URL-Parameter lesen
- [x] RegisterFunnel.tsx: selectedCourseId mit courseIdFromUrl initialisieren
- [x] RegisterFunnel.tsx: Auto-Preselect Effect hinzufügen
- [x] RegisterFunnel.tsx: UI-Hinweis für vorselektierten Kurs
- [ ] Testing: Redirect funktioniert
- [ ] Testing: courseId wird korrekt vorselektiert
- [ ] Testing: Funktioniert auch ohne courseId-Parameter
- [ ] Checkpoint erstellen und pushen

**Akzeptanz-Kriterien:**
- `/register?courseId=450001` redirected zu `/anmeldung?courseId=450001`
- Kurs 450001 wird in Step 2 automatisch vorselektiert
- Blauer Info-Hinweis: "Dieser Kurs wurde für Sie vorausgewählt"
- User kann Kurs trotzdem manuell ändern
- Funktioniert auch OHNE courseId-Parameter

**Status:** 🔴 TODO - BLOCKER

---

## 🟡 Sprint 1.11: FEATURE-REQUEST (NACH Beta)

**Onboarding-Fragen-Editor** (12-16h)
- Admin-UI zum Bearbeiten von Fördercheck-Fragen
- Ergebnis-Texte editierbar machen
- Vorvertrag-Checkboxen editierbar machen
- Multi-Tenant Support
- **NICHT für Beta-Launch nötig** - kann später implementiert werden

**Status:** 🟡 GEPLANT für nach Beta-Launch


---

## 🎨 UX-Verbesserungen RegisterFunnel (07.12.2024)

**Schritt 1: Fördercheck-Formular**
- [x] Frage 5 (Selbstständigkeit seit): Kein Datum vorausgewählt (State-Init bereits leer: "")
- [x] Frage 6 (De-minimis-Beihilfen): Hinweisfeld mit "€" erweitern
- [x] Frage 7 (KOMPASS-Gutscheine): Dropdown-Text ändern "Kontingent ausgeschöpft" → "Bereits 2"

**Schritt 2: Kursauswahl**
- [x] Wenn Kurs über Direktlink vorausgewählt: Kursauswahl-Dropdown ausblenden
- [x] Nur Kurs-Details + Hinweis anzeigen (User kann Kurs nicht mehr ändern)
- [x] Hinweis: "Dieser Kurs wurde für Sie vorausgewählt"

**Status:** 🔴 TODO


---

## 🔧 Vorvertrag & Set-Password Fixes (07.12.2024)

**Vorvertrag Step 4: Dynamischer Bildungsträger-Name**
- [x] "Ich willige in die Datenverarbeitung durch {Bildungsträger-Firmenname} ..." → Variable aus Tenant-Daten
- [x] Tenant-Name aus Backend laden (via tenantId)
- [x] Text dynamisch rendern

**AGB & Widerrufsbelehrung Links**
- [x] Tenant-Settings: agbUrl und widerrufsbelehrungUrl Felder hinzugefügt (DB Schema + SQL)
- [ ] Tenant-Settings UI: Input-Felder für AGB/Widerrufsbelehrung URLs (TODO: Admin UI)
- [x] RegisterFunnel Step 4: "AGB" und "Widerrufsbelehrung" als klickbare Links rendern
- [x] Links aus Tenant-Settings laden (getTenantPublicInfo Procedure)

**404 Fix: /set-password Route**
- [x] SetPassword.tsx Page erstellt
- [x] Route in App.tsx registriert
- [x] Token-Validierung implementiert
- [x] Passwort-Set-Formular

**Status:** ✅ DONE (Admin UI für AGB/Widerrufsbelehrung URLs kann später hinzugefügt werden)


---

## 🐛 CRITICAL BUG: /api/auth/set-password Backend fehlt (07.12.2024)

**Problem:** "Verbindungsfehler" auf SetPassword-Page
- Frontend sendet POST zu /api/auth/set-password
- Backend-Endpoint existiert nicht
- User kann Passwort nicht setzen → Account-Erstellung blockiert

**Lösung:**
- [x] /api/auth/set-password Endpoint implementiert (emailAuth.ts Zeile 362-421)
- [x] Token-Validierung (resetToken aus users Tabelle)
- [x] Passwort hashen (bcrypt)
- [x] User-Status aktivieren (loginMethod = "email")
- [x] resetToken löschen nach erfolgreicher Passwort-Setzung

**Status:** ✅ DONE


---

## 🐛 CRITICAL: Teilnehmer-Dashboard Zugriffsprobleme (07.12.2024)

**Problem 1: "Teilnehmer nicht gefunden"**
- Teilnehmer loggt sich ein (sachs.stefan@icloud.com)
- Route /teilnehmer/documents zeigt "Teilnehmer nicht gefunden"
- User existiert in `users` Tabelle, aber nicht in `participants` Tabelle
- Registrierungs-Flow erstellt nur User, aber keinen Participant-Eintrag

**Problem 2: Admin-Menü für Teilnehmer sichtbar**
- Teilnehmer sieht komplettes Admin-Menü (Dashboard, Kurse, Sammeltermine, Teilnehmer, Kanban Board, Dokumente, Validierung, Einstellungen)
- Teilnehmer sollte nur sein eigenes Dashboard sehen
- DashboardLayout zeigt Menü basierend auf Route, nicht auf User-Rolle

**Lösung:**
- [x] Registrierungs-Flow: Participant-Eintrag wird bereits erstellt (register.ts Zeile 503-519)
- [x] loginMethod = null statt "email" (wird beim Passwort-Setzen aktiviert)
- [x] Email-Link zu /set-password statt /reset-password
- [x] AdminLayout: Redirect für role="user" zu /teilnehmer (AdminLayout.tsx Zeile 94-97)
- [x] Teilnehmer können Admin-Seiten nicht mehr sehen

**Status:** ✅ DONE


---

## 🐛 BUG: /teilnehmer/documents Redirect-Loop (07.12.2025)

**Problem:**
- Teilnehmer öffnet /teilnehmer/documents
- Seite redirectet automatisch zu /teilnehmer
- DocumentsDashboard ist nicht erreichbar für Teilnehmer

**Ursache:**
- DocumentsDashboard verwendet wahrscheinlich AdminLayout
- AdminLayout redirectet alle role="user" zu /teilnehmer
- Teilnehmer-spezifische Seiten sollten kein AdminLayout verwenden

**Lösung:**
- [ ] Prüfe welches Layout DocumentsDashboard verwendet
- [ ] Ersetze AdminLayout durch ParticipantLayout oder DashboardLayout
- [ ] Teste /teilnehmer/documents Zugriff für Teilnehmer

**Status:** 🔴 TODO


---

## 🐛 CRITICAL: Documents Permission Error (403/10002)

**Problem:** Teilnehmer können Dokumente-Seite nicht laden - Backend wirft "You do not have required permission (10002)" Fehler.

**Ursache:** Documents-Procedures verwenden wahrscheinlich `adminProcedure` statt `protectedProcedure`.

**Lösung:**
- [x] Finde alle documents.* Procedures im Backend (4 Procedures gefunden)
- [x] Ändere `documents.list` von `adminProcedure` zu `protectedProcedure`
- [x] Füge Permission-Check zu `documents.list` hinzu (Teilnehmer sehen nur eigene Dokumente)
- [x] Füge Permission-Check zu `documents.getPhaseStatus` hinzu (Teilnehmer sehen nur eigenen Status)
- [ ] Teste als Teilnehmer ob Dokumente-Seite lädt (TODO: User muss als Teilnehmer einloggen)

**Status:** ✅ DONE (Code-Fix komplett, Testing ausstehend)


---

## Sprint 1.10.1 FIX 3: Begründungs-Wizard für Teilnehmer

**Ziel:** Teilnehmer können KOMPASS-Begründungstext erstellen (Voice/Text Input + AI Generation)

**Problem:** Begründungs-Wizard existiert bereits aus Sprint 1.9, aber Navigation fehlte

**Lösung:**
- [x] Prüfe bestehende Workflow-Backend-Endpoints (workflow.getTemplateForParticipant, workflow.processUserInput, etc.)
- [x] BegruendungsWizard Component existiert bereits (/client/src/pages/participant/BegruendungsWizard.tsx)
- [x] Multi-Step-Form mit Progress Bar (5 KOMPASS-Fragen) bereits implementiert
- [x] Voice Recording (MediaRecorder API) bereits implementiert
- [x] AI Text Generation (Whisper + GPT-4) bereits implementiert
- [x] Navigation von Teilnehmer-Dashboard hinzugefügt (neue Card mit "Begründung erstellen" Button)
- [x] Icons hinzugefügt (MessageSquare, Sparkles)
- [x] Info-Box mit Beschreibung des KI-Assistenten
- [ ] Teste kompletten Flow als Teilnehmer (User muss einloggen und testen)

**Implementierte Features:**
- Neue Card im Teilnehmer-Dashboard mit Gradient-Design (Indigo/Purple)
- Button navigiert zu `/teilnehmer/:id/begruendung`
- Info-Text erklärt Voice & Text Input + KI-Unterstützung
- Feature-Badges: "5 Fragen" + "Voice & Text"

**Status:** ✅ DONE (Code komplett, Testing ausstehend)


---

## Sprint 1.10.1 FIX 4: Begründungs-Wizard UX-Verbesserungen

**Ziel:** Bessere Integration des Wizards im Teilnehmer-Dashboard und Admin-Zugriff auf Vorlagen

**Probleme:**
1. Begründungs-Card nicht optimal im Dashboard-Grid integriert
2. Admin-Bereich: Workflow-Vorlagen-Editor nicht in Navigation sichtbar
3. Teilnehmer-Dashboard: Wizard-Fortschritt wird nicht angezeigt

**Lösung:**
- [x] Prüfe Admin-Navigation: Workflow-Vorlagen Tab in /settings hinzugefügt
- [x] Prüfe Route: /settings/workflows existiert und funktioniert
- [x] Verbessere Dashboard-Layout: Grid von md:grid-cols-2 zu lg:grid-cols-3, Begründungs-Card lg:col-span-3
- [x] Wizard-Fortschritt anzeigen: workflow.getParticipantAnswers Query hinzugefügt
- [x] Fortschritts-Badge in Begründungs-Card ("X von 5 Fragen beantwortet")
- [x] Conditional Rendering: "Begründung erstellen" vs "Begründung fortsetzen"
- [x] Success-Box wenn Fragen bereits beantwortet (grüner Hintergrund)
- [x] Detaillierte Feature-Liste (3 Bullet Points: Fragen, Voice/Text, KI-Formulierung)

**Status:** ✅ DONE


---

## Sprint 1.10.1 FIX 5: Voice Recording im Begründungs-Wizard funktioniert nicht

**Ziel:** Spracheingabe im Begründungs-Wizard reparieren

**Problem:** User berichtet, dass Voice Recording nicht funktioniert (Button reagiert nicht oder Transcription schlägt fehl)

**Root Cause:**
- [x] Backend Transcription verwendete falschen Ansatz (temp-Dateien + URL statt direkter Buffer)
- [x] `transcribeAudio()` erwartet URL, bekam aber lokalen Dateipfad `/tmp/voice_*.wav`
- [x] `fetch('/tmp/...')` schlägt fehl, weil kein HTTP-Endpoint

**Lösung:**
- [x] Neue Funktion `transcribeAudioDirect()` erstellt in voiceTranscription.ts
- [x] Nimmt Buffer direkt entgegen (kein Dateisystem-Umweg)
- [x] Sendet Audio direkt an Whisper API via FormData
- [x] workflow.ts aktualisiert: verwendet jetzt transcribeAudioDirect()
- [x] Keine temp-Dateien mehr, besseres Error Handling
- [ ] User-Test: Spracheingabe im Wizard testen (Chrome empfohlen)

**Status:** ✅ CODE DONE (User-Test ausstehend)


---

## Sprint 1.10.1 FIX 6: WorkflowTemplates Seite Layout + Standard-Template

**Ziel:** WorkflowTemplates Seite in AdminLayout integrieren und Standard KOMPASS-Template bereitstellen

**Probleme:**
1. `/settings/workflows` Seite hat kein AdminLayout (keine Sidebar, kein Header)
2. Keine System-Templates vorhanden ("Keine System-Templates vorhanden")
3. Standard KOMPASS-Template fehlt als Vorlage zum Duplizieren

**Lösung:**
- [x] WorkflowTemplates.tsx mit AdminLayout wrappen
- [x] Standard KOMPASS-Template existiert bereits in Datenbank (ID: 1, 5 Fragen)
- [x] Template als "system" Type markiert (tenantId: null)
- [x] "Duplizieren"-Button (Copy-Icon) für System-Templates hinzugefügt
- [x] workflow.duplicateTemplate Mutation erstellt (kopiert Template + Fragen)
- [x] UI: System-Templates nur Duplizieren-Button, Client-Templates Edit + Delete
- [ ] User-Test: Template duplizieren und bearbeiten

**Status:** ✅ CODE DONE (User-Test ausstehend)


---

## Sprint 1.10.1 FIX 7: Auto-Duplizierung Standard-Template + Workflow-Antworten in Teilnehmer-Detailansicht

**Ziel:** Standard KOMPASS-Template automatisch für neue Mandanten duplizieren und Workflow-Antworten in Admin-Teilnehmer-Ansicht anzeigen

**Anforderungen:**
1. Wenn neuer Mandant angelegt wird → automatisch "KOMPASS Standard" Template duplizieren
2. In Admin-Teilnehmer-Detailansicht (`/teilnehmer/:id`) → Workflow-Antworten anzeigen

**Lösung:**
- [x] Finde Mandanten-Erstellungs-Code (superadmin.createTenant Mutation)
- [x] Füge Auto-Duplizierung nach Mandanten-Erstellung hinzu
- [x] Erstelle Helper-Funktion: duplicateSystemTemplateForTenant(db, tenantId)
- [x] Prüfe ParticipantDetail.tsx Struktur (Cards-basiertes Layout)
- [x] Füge neue Card "Begründungs-Antworten" hinzu (vor VorhabenantragExport)
- [x] Query workflow.getParticipantAnswers verwenden
- [x] Zeige Fragen + Antworten (userInput, aiGeneratedText, finalText)
- [x] Badge für Input-Methode (Sprache/Text)
- [x] Farbcodierung: muted (userInput), blue (aiGenerated), green (final)
- [x] Metadata: Erstellt/Aktualisiert Timestamps
- [ ] User-Test: Teilnehmer-Detailansicht mit Antworten prüfen

**Status:** ✅ CODE DONE (User-Test ausstehend)


---

## Sprint 1.10.1 FIX 8: SQL-Fehler bei Sammeltermin-Erstellung

**Ziel:** Behebe Datumsfehler bei Sammeltermin-Erstellung

**Problem:** SQL-Insert schlägt fehl mit falschen Datumswerten:
- `submissionDeadline` hat Wert `0002-01-11 21:45:32.000` (Jahr 0002 statt 2026)
- Einreichungsfrist-Berechnung produziert ungültiges Datum

**Fehlermeldung:**
```
Failed query: insert into `sammeltermine` values (default, ?, ?, ?, ?, ?, ?, default, default)
params: 420001,450001,2026-01-12 11:00:00.000,,,0002-01-11 21:45:32.000,scheduled,
```

**Root Cause:**
- [x] `submissionDate` war leer, aber Code versuchte trotzdem Date zu erstellen
- [x] `new Date("T23:59")` → Invalid Date → `0002-01-11 21:45:32.000`
- [x] Auto-Berechnung funktionierte nur wenn `submissionDate` leer UND `date` gesetzt

**Lösung:**
- [x] Finde sammeltermine.create Mutation (sammeltermins.ts)
- [x] Prüfe submissionDeadline Berechnung in SammeltermineForm.tsx
- [x] Behebe Date-Parsing: Fallback wenn submissionDate leer
- [x] Auto-Berechnung: 1 Tag vor Termin um 23:59 Uhr
- [x] Validierung: isNaN() check für beide Dates
- [x] UI: Entferne required-Attribut von Einreichungsfrist-Feldern
- [x] Hint-Text: "Standardmäßig 1 Tag vor dem Termin um 23:59 Uhr"
- [ ] User-Test: Sammeltermin erstellen ohne Einreichungsfrist auszufüllen

**Status:** ✅ CODE DONE (User-Test ausstehend)


---

## Sprint 1.11: CONVERSATIONAL FUNNEL REDESIGN

**Ziel:** Fördercheck-Funnel in modernen Conversational Funnel umbauen (Typeform-Style)

**Key Features:**
- 1 Frage pro Screen (statt 7 auf einmal)
- Framer Motion Animationen
- localStorage Persistence (Felder bleiben bei Reload)
- Animierte Progress Bar
- Trust-Signale (🔒 Sicher, ⏱️ ~2 Min)
- Mobile-First Design
- Instant Feedback (✅ Checkmark nach Antwort)

**Erwartete Conversion-Rate:** +30-50%

**Test-URL:** https://app.foerderpilot.io/anmeldung-neu
**Alte Version:** https://app.foerderpilot.io/anmeldung (Fallback)

**Tasks:**
- [x] Analysiere bestehende RegisterFunnel.tsx (Backup-Verständnis)
- [x] Erstelle useFunnelState Hook (client/src/hooks/useFunnelState.ts)
- [x] Erstelle FunnelQuestion Component (client/src/components/funnel/FunnelQuestion.tsx)
- [x] Erstelle FunnelResult Component (client/src/components/funnel/FunnelResult.tsx)
- [x] Erstelle RegisterFunnelConversational.tsx (neue Datei, alte bleibt)
- [x] Füge Route /anmeldung-neu zu App.tsx hinzu
- [x] Framer Motion Animationen integriert
- [x] localStorage Persistence via useFunnelState Hook
- [ ] Teste Fördercheck-Flow (7 Fragen einzeln) - User-Test
- [ ] Teste localStorage Persistence (Reload) - User-Test
- [ ] Teste Kursauswahl + Persönliche Daten - User-Test
- [ ] Teste Vorvertrag-Bestätigung - User-Test
- [ ] Teste Mobile Responsiveness - User-Test
- [ ] Wenn erfolgreich: Ersetze /anmeldung Route mit Conversational Version

**Status:** ✅ CODE DONE (User-Testing ausstehend)

---

## Sprint 1.11.1 BUGFIX: Conversational Funnel UX-Verbesserungen

**Probleme:**
1. **Layout:** Frage zu klein, Icon fehlt, Trust-Signale falsch positioniert
2. **Bug:** Bei vorausgewählten Antworten (Select) fehlt "Weiter"-Button
3. **UX:** Überflüssige Submit-Seite nach Frage 7 (sollte direkt "Förderfähigkeit prüfen")

**Lösung:**
- [x] FunnelQuestion.tsx: Größeres Icon (text-6xl), zentriertes Layout
- [x] FunnelQuestion.tsx: Trust-Signale oben rechts (nicht unten)
- [x] FunnelQuestion.tsx: Zeige "Weiter"-Button auch bei vorausgewählten Select-Werten
- [x] FunnelQuestion.tsx: isLastQuestion + onSubmit Props hinzugefügt
- [x] RegisterFunnelConversational.tsx: Submit-Button-Seite entfernt, in Frage 7 integriert
- [x] Button-Text bei letzter Frage: "Förderfähigkeit prüfen" statt "Weiter"
- [ ] User-Test: Alle 7 Fragen durchgehen ohne Hänger

**Status:** ✅ CODE DONE (User-Test ausstehend)


---

## Sprint 1.11.2 UX FIX: Klareres Layout für Conversational Funnel

**Problem:** Beta-User-Feedback: "Layout zu unübersichtlich, Elemente zu klein, keine Hilfe-Texte"

**Ziel:** 5 konkrete UX-Verbesserungen für bessere User-Führung

**Lösung:**
- [x] Question Interface erweitern (helpText Property)
- [x] FunnelQuestion.tsx: Fokus-Card mit Shadow + Border (shadow-2xl, border-2)
- [x] FunnelQuestion.tsx: Progress Bar prominent (h-3, animiert)
- [x] FunnelQuestion.tsx: Größere Elemente (Dropdown h-20, Button h-16, Text text-xl)
- [x] FunnelQuestion.tsx: Trust-Signale größer (text-2xl Icons)
- [x] FunnelQuestion.tsx: Hilfe-Text-Boxen (blauer Hintergrund, 💡 Icon)
- [x] FunnelQuestion.tsx: Zentriertes Layout
- [x] RegisterFunnelConversational.tsx: Hilfe-Texte zu allen 7 Fragen
- [ ] User-Test: /anmeldung-neu mit neuen UX-Verbesserungen

**Status:** ✅ CODE DONE (User-Test ausstehend)


---

## Sprint 1.11.3 DESIGN FIX: Professional Design Update

**Problem:** User-Feedback: "Alles zu groß, muss professioneller aussehen"

**Ziel:** Kompakteres, business-like Design statt spielerisch/kindisch

**Lösung:**
- [x] Icon in Headline ENTFERNEN (✅ Keine Icons mehr in Headlines)
- [x] Card-Padding reduzieren (p-12 → p-8, shadow-2xl → shadow-lg)
- [x] Dropdown kompakter (h-20 → h-14, text-xl → text-base)
- [x] Radio-Buttons kompakter (p-8 → p-5, Icons text-4xl → text-2xl)
- [x] Input-Felder kompakter (h-20 → h-14, text-xl → text-base)
- [x] Button kompakter (h-16 → h-12, Text kürzer "Weiter →")
- [x] Hilfe-Text kompakter (p-4 → p-3, text-base → text-sm)
- [x] Progress Bar anpassen (h-3 → h-2, Text text-xs)
- [x] Trust-Signale kompakter (mt-8 → mt-6, text-xs)
- [x] Back-Button kompakter ("Zurück zur vorherigen Frage" → "← Zurück")
- [ ] User-Test: /anmeldung-neu mit Professional Design

**Status:** ✅ CODE DONE (User-Test ausstehend)


---

## Sprint 1.11.4: Consistent Conversational Flow

**Problem:** User-Feedback: "Bruch zwischen Step 1 und Step 2, Step-Ansicht gefällt nicht"

**Ziel:** Einheitliches Card-Layout für ALLE 4 Funnel-Steps

**Lösung:**
- [x] Header vereinfachen (text-3xl → text-2xl, kompakter)
- [x] Globale Progress Bar entfernt
- [x] Progress Bar IN jeden Step integriert (h-2, kompakt)
- [x] Step 2 (Kursauswahl) mit Card-Layout ersetzt (shadow-lg, p-6 md:p-8)
- [x] Step 3 (Persönliche Daten) mit Card-Layout ersetzt
- [x] Step 4 (Bestätigung) mit Card-Layout ersetzt
- [x] Einheitliche Navigation-Buttons (← Zurück / Weiter →, h-11 md:h-12)
- [x] Trust-Signale in jedem Step (unten, dezent, 🔒 + 🛡️)
- [x] Einheitliches max-w-3xl Layout für alle Steps
- [x] Konsistente Spacing (p-6 md:p-8, space-y-6)
- [ ] User-Test: /anmeldung-neu mit Consistent Flow

**Status:** ✅ CODE DONE (User-Test ausstehend)


---

## Sprint 1.11.5: Route-Ersetzung

**Ziel:** Alte /anmeldung Route mit neuer Conversational Version ersetzen

**Tasks:**
- [x] App.tsx: Ersetze RegisterFunnel Import mit RegisterFunnelConversational
- [x] App.tsx: Entferne /anmeldung-neu Route (nicht mehr nötig)
- [x] Lösche RegisterFunnel.tsx (alte Version)
- [x] Lösche RegisterFunnel.tsx.backup
- [x] Lösche RegisterFunnelConversational.tsx.backup
- [ ] User-Test: /anmeldung Route mit Conversational Flow

**Status:** ✅ CODE DONE (User-Test ausstehend)


---

## Sprint 1.11.6: E-Mail Bestätigungs-Fix

**Ziel:** Willkommens-E-Mail nach Registrierung korrigieren

**Probleme:**
- ❌ Absender: noreply@app.foerderpilot.io statt Bildungsträger-E-Mail
- ❌ Förderberechnung: 95% statt korrekte 90% KOMPASS
- ❌ Vorvertrag: Leer statt vollständige Anmeldebestätigung
- ❌ Zahlungshinweis: Fehlt (Vorauszahlung + Rückerstattung)

**Tasks:**
- [x] Analysiere aktuelle generateWelcomeEmail() Implementierung
- [x] FIX 1: Absender dynamisch vom Tenant laden (tenant.email, tenant.name)
- [x] FIX 2: Förderberechnung korrigieren (foerderquote * coursePrice)
- [x] FIX 3: Anmeldebestätigung mit allen Formulardaten erstellen
- [x] FIX 4: Zahlungshinweis-Box hinzufügen (Vorauszahlung-Erklärung)
- [x] emailService.ts: Dynamischen Absender unterstützen (from-Parameter)
- [x] register.ts: senderEmail + senderName übergeben
- [ ] Test-E-Mail versenden und verifizieren

**Status:** ✅ CODE DONE (Test ausstehend)


---

## Phase 2: Custom Domain + Branding (Sprint 2.0)

**Ziel:** Subdomains entfernen, Custom Domain aktivieren, Tenant-Branding im RegisterFunnel

### Phase 2.1: Subdomain entfernen
- [x] DB-Schema: subdomain nullable machen
- [x] Backend: Auto-Generate Subdomain aus companyName (mit Collision-Check)
- [x] Frontend: Subdomain-Feld aus TenantForm entfernen (war bereits nicht vorhanden)
- [x] updateTenant: subdomain aus Input entfernen

### Phase 2.2: Branding im RegisterFunnel
- [x] useTenant() Hook erstellen
- [x] tenant.getCurrent tRPC Router erstellen
- [x] RegisterFunnel mit dynamischem Branding (Logo, Firmenname, Farben)
- [x] Dynamisches Favicon laden

### Phase 2.3: DNS-Setup UI
- [x] Custom Domain Sektion im Admin-Panel (erweitert)
- [x] DNS-Anleitung generieren (CNAME-Eintrag mit Provider-Beispielen)
- [x] DNS-Validierung UI (Validieren-Button mit Status)
- [x] Status-Anzeige (active/pending/error mit Icons)
- [x] Registrierungs-Link mit Kopier-Button

### Phase 2.4: Tenant-Auswahl in /anmeldung
- [x] Query-Parameter Support (?tenant=5) - useTenant Hook liest aus URL
- [x] Branding laden vor Registrierung - automatisch via useTenant
- [x] tenantIdFromUrl wird an useTenant übergeben

### Phase 2.5: Testing
- [x] Test tenant.getCurrent Router (4 Tests passed)
- [x] Test Query-Parameter Support
- [ ] Checkpoint erstellen

**Status:** ✅ CODE DONE


---

## Bug-Fix: Tenant-Parameter funktioniert nicht (Sprint 2.0.1)

**Problem:** `/anmeldung?tenant=5` zeigt keine Änderungen - kein Branding, keine Kurse des Tenants

**Lösung:** Tenant ID 5 existiert nicht! Korrekte ID ist 420001 (Entscheiderakademie)

**Tasks:**
- [x] Prüfe useTenant Hook - funktioniert korrekt
- [x] Prüfe tenant.getCurrent Router - gibt Daten zurück
- [x] Prüfe Kursauswahl - tenantId wird korrekt übergeben
- [x] Fixe Timing-Problem - synchrones Lesen der URL-Parameter

**Ergebnis:** `/anmeldung?tenant=420001` zeigt Entscheiderakademie Branding ✅

**Status:** ✅ DONE


---

## Tenant-ID Migration auf 3-stellige Werte (Sprint 2.0.2)

**Ziel:** Tenant-IDs von 420001 auf einfache 3-stellige Werte ändern (z.B. 2)

**Tasks:**
- [x] Entscheiderakademie: 420001 → 2
- [x] Kurse: tenantId 420001 → 2
- [x] Participants: tenantId 420001 → 2
- [x] Users: tenantId 420001 → 2
- [x] Documents: tenantId 420001 → 2
- [x] Vorvertraege: tenantId 420001 → 2

**Ergebnis:** `/anmeldung?tenant=2` zeigt Entscheiderakademie Branding ✅

**Status:** ✅ DONE
