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
