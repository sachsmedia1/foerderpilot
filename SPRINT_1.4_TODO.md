# SPRINT 1.4 - VORVERTRAG + VALIDATION DASHBOARD + DESIGN SYSTEM

**Projekt**: FörderPilot  
**Sprint**: 1.4  
**Ziel**: Vorvertrag-Feature, Validation-Dashboard, Design System Integration

---

## PRIORITÄT 1: VORVERTRAG-FEATURE (5h)

### TASK 1: Vorvertrag-Schema (1h) ✅
- [x] vorvertraege Tabelle erstellt (per SQL)
- [x] Felder: id, tenantId, participantId, status, signedAt, signatureData, ipAddress, userAgent, contractVersion, contractText
- [x] Indexes hinzugefügt (tenant, participant, status)
- [x] Tabelle in Datenbank (215ms)

### TASK 2: Vorvertrag-Router (2h) ✅
- [x] server/routers/vorvertrag.ts erstellt
- [x] getByParticipantId Procedure (für Modal)
- [x] sign Procedure (Unterschrift + IP/UserAgent Tracking)
- [x] decline Procedure (Ablehnung)
- [x] In routers.ts registriert
- [x] RLS implementiert (validateTenantAccess)

### TASK 3: Vorvertrag-UI (2h) ✅
- [x] client/src/components/VorvertragModal.tsx erstellt
- [x] Checkboxen für Bedingungen (3x)
- [x] Unterschrift-Feld (Text-basiert)
- [x] Sign/Decline Buttons
- [x] Status-Anzeige (signed/declined/pending)

---

## PRIORITÄT 2: VALIDATION-DASHBOARD (2h)

### TASK 4: Validation-Dashboard (2h) ✅
- [x] Admin-Dashboard: Dokument-Validierungs-Übersicht
- [x] Statistik-Cards (6x: Gesamt, Pending, Validating, Valid, Invalid, Manual Review)
- [x] Tabelle: Dokumente mit Validierungsstatus
- [x] Filter: Status + Suchfunktion
- [x] Confidence-Score mit Color-Coding (>90% grün, 80-90% gelb, <80% rot)
- [x] Quick-Actions: Re-validate, Reject/Delete
- [x] Route registriert (/validation)

---

## PRIORITÄT 3: DESIGN SYSTEM INTEGRATION (3h)

### TASK 5: Tailwind Config & Fonts (1h)
- [ ] tailwind.config.js: Indigo/Pink Farben hinzufügen
- [ ] index.html: Inter Font via Google Fonts
- [ ] index.css: CSS Variables für Branding
- [ ] Logo-Dateien in /public kopieren

### TASK 6: Component Styling (2h)
- [ ] Button-Komponente: Primary (Indigo), Secondary (Pink)
- [ ] Input-Komponente: Focus-Ring Indigo
- [ ] Badge-Komponente: Status-Farben
- [ ] Navigation: Logo integrieren
- [ ] Cards: Neue Schatten & Radius

---

## TESTING & CHECKPOINT

### TASK 7: Tests & Checkpoint (1h)
- [ ] Vorvertrag-Tests schreiben
- [ ] TypeScript-Check
- [ ] pnpm test ausführen (Ziel: 60+ Tests)
- [ ] Checkpoint erstellen

---

**Geschätzte Dauer**: 11h  
**Status**: ⏳ IN PROGRESS
