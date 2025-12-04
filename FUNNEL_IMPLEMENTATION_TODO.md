# Funnel-Implementation TODO

**Deadline:** 10.12.2024  
**Geschätzte Zeit:** 50 Stunden (~5 Tage)

---

## Task 1: Datenbank-Schema erweitern (2h)

- [ ] Erweitere `participants` Tabelle (foerdercheck, foerdercheckErgebnis, deminimisBeihilfen, mitarbeiterVzae, kompassSchecksAnzahl, letzterKompassScheckDatum, funnelStep, dateOfBirth, address, company, zipCode, city, street)
- [ ] Erweitere `vorvertraege` Tabelle (checkboxZuarbeit, checkboxTeilnahme, checkboxDatenschutz, checkboxAgb, ipAddress, userAgent, contractVersion, contractText)
- [ ] Erstelle `registrationSessions` Tabelle (sessionId, tenantId, foerdercheck, foerdercheckErgebnis, courseId, firstName, lastName, email, phone, street, zipCode, city, company, dateOfBirth, createdAt, expiresAt)
- [ ] Erstelle `vorvertragTemplates` Tabelle (tenantId, version, isActive, templateText, checkboxZuarbeitText, checkboxTeilnahmeText, checkboxDatenschutzText, checkboxAgbText)
- [ ] Füge Default-Vorvertrag-Template für alle Tenants ein
- [ ] Erstelle Cleanup-Cron-Job für abgelaufene registrationSessions

---

## Task 2: Backend-API – Step 1 (Fördercheck) (6h)

- [ ] Erstelle `server/routers/register.ts` Router
- [ ] Implementiere `foerdercheck` Mutation mit Decision-Tree-Logik
- [ ] K.O.-Kriterien: Wohnsitz, Hauptberuflich, 51% Einkünfte, Selbstständigkeit ≥2 Jahre, >1 VZÄ, De-minimis >€300k
- [ ] KOMPASS-Logik: 0 VZÄ + <2 Schecks + ≥12 Monate seit letztem Scheck
- [ ] BAFA-Fallback: 1 VZÄ ODER <12 Monate ODER 2 Schecks
- [ ] Session-Daten in `registrationSessions` speichern

---

## Task 3: Backend-API – Step 2 (Kursauswahl) (2h)

- [ ] Implementiere `kursauswahl` Mutation
- [ ] Kurse aus `courses` Tabelle abrufen (gefiltert nach Tenant)
- [ ] Förderhöhe berechnen (90% oder 50% basierend auf Fördercheck-Ergebnis)
- [ ] Session-Update mit courseId

---

## Task 4: Backend-API – Step 3 (Persönliche Daten) (2h)

- [ ] Implementiere `persoenlicheDaten` Mutation
- [ ] Validierung: E-Mail, Telefon, Adresse
- [ ] Session-Update mit persönlichen Daten

---

## Task 5: Backend-API – Step 4 (Vorvertrag + Account) (6h)

- [ ] Implementiere `vorvertragBestaetigen` Mutation
- [ ] Validierung: Alle 4 Checkboxen müssen true sein
- [ ] Account-Erstellung (User + Participant + Vorvertrag)
- [ ] Vorvertrag-Template abrufen und Platzhalter ersetzen
- [ ] IP-Adresse und User-Agent speichern
- [ ] Password-Reset-Token generieren
- [ ] Session löschen nach erfolgreicher Erstellung

---

## Task 6: Frontend – Step 1 (Fördercheck) (8h)

- [ ] Erstelle `/register` Route (öffentlich, ohne Login)
- [ ] Multi-Step-Form-Component mit Progress-Bar
- [ ] Step 1: 7 Fragen mit Radio-Buttons + Number-Input
- [ ] Conditional Logic: K.O.-Kriterien → Abbruch-Seite
- [ ] Ergebnis-Seiten: 90% KOMPASS / 50% BAFA / Nicht förderfähig
- [ ] Session-ID generieren (UUID) und in localStorage speichern

---

## Task 7: Frontend – Step 2 (Kursauswahl) (4h)

- [ ] Kurs-Dropdown mit Kursen aus Backend
- [ ] Kurs-Details anzeigen (Titel, Starttermin, Preis, Förderhöhe, Eigenanteil)
- [ ] Weiter-Button aktiviert nur wenn Kurs ausgewählt

---

## Task 8: Frontend – Step 3 (Persönliche Daten) (4h)

- [ ] Formular: Vorname, Nachname, E-Mail, Telefon, Straße, PLZ, Stadt, Firma (optional), Geburtsdatum
- [ ] Validierung: E-Mail-Format, Telefon-Format, PLZ-Format
- [ ] Auto-Fill aus Session (falls vorhanden)

---

## Task 9: Frontend – Step 4 (Vorvertrag) (6h)

- [ ] Vorvertrag-Text aus Backend abrufen (mit ersetzten Platzhaltern)
- [ ] 4 Checkboxen mit Checkbox-Texten aus Template
- [ ] "Verbindlich anmelden"-Button (disabled bis alle Checkboxen true)
- [ ] Success-Seite mit Login-Link

---

## Task 10: E-Mail-Workflows (4h)

- [ ] Welcome-E-Mail an Teilnehmer (mit Vorvertrag-Text im Body, Password-Reset-Link)
- [ ] Admin-Benachrichtigung an alle Admins des Tenants
- [ ] E-Mail-Templates in `server/utils/emailWorkflows.ts`

---

## Task 11: Testing & Bugfixes (6h)

- [ ] E2E-Test: Kompletter Funnel-Durchlauf (Fördercheck → Kursauswahl → Persönliche Daten → Vorvertrag → Account-Erstellung)
- [ ] Unit-Tests: Fördercheck-Logik (alle Szenarien)
- [ ] Responsive Design: Mobile-Test
- [ ] Browser-Test: Chrome, Firefox, Safari

---

## Status

- [x] Task 1: Datenbank-Schema (COMPLETED)
- [x] Task 2: Backend Fördercheck (COMPLETED)
- [x] Task 3: Backend Kursauswahl (COMPLETED)
- [x] Task 4: Backend Persönliche Daten (COMPLETED)
- [x] Task 5: Backend Vorvertrag + Account (COMPLETED)
- [x] Task 6: Frontend Step 1 (COMPLETED)
- [x] Task 7: Frontend Step 2 (COMPLETED)
- [x] Task 8: Frontend Step 3 (COMPLETED)
- [x] Task 9: Frontend Step 4 (COMPLETED)
- [x] Task 10: E-Mail-Workflows (COMPLETED)
- [ ] Task 11: Testing (IN PROGRESS)

