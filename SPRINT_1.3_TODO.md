# SPRINT 1.3 v5 FINAL - BETA-READINESS

**Ziel:** Beta-Launch am 2025-12-06 (4 Tage)  
**Version:** v5 (FINALE VERSION - Hybrid-Architektur + Branding-Logik)

---

## PRIORITÄT 1: CRITICAL FIXES (HEUTE - 4h)

### Vorbereitung
- [x] Testuser aus Datenbank gelöscht (nur Super Admin bleibt)

### TASK 1: Database-Indexes (1h)
- [x] Indexes in drizzle/schema.ts hinzugefügt (27 Indexes)
- [x] Indexes per SQL erstellt (9.4s)
- [x] Performance-Boost aktiv

### TASK 2: Row-Level-Security (2h) - IN PROGRESS
- [x] server/_core/security.ts erstellt
- [x] validateTenantAccess implementiert
- [x] validateResourceOwnership implementiert
- [x] RLS in courses Router angewendet (6/6 Procedures)
- [ ] RLS in participants Router anwenden (2/6 Procedures done)
- [ ] RLS in documents Router anwenden
- [ ] RLS in sammeltermins Router anwenden
- [ ] RLS in courseSchedules Router anwenden

### TASK 3: Participant-Status-Pipeline (1h)
- [ ] 13-Step-Status in drizzle/schema.ts definieren
- [ ] Migration-Script erstellen (alte Stati → neue Stati)
- [ ] Migration ausführen
- [ ] pnpm db:push

---

## PRIORITÄT 2: VORVERTRAG-FEATURE (MORGEN - 5h)

### TASK 4: Vorvertrag-Schema (1h)
- [ ] vorvertraege Tabelle in drizzle/schema.ts
- [ ] pnpm db:push

### TASK 5: Vorvertrag-Router (2h)
- [ ] server/routers/vorvertrag.ts erstellen
- [ ] getByParticipantId Procedure
- [ ] sign Procedure (mit Status-Update)
- [ ] In routers/index.ts registrieren

### TASK 6: Vorvertrag-UI (2h)
- [ ] client/src/pages/VorvertragModal.tsx erstellen
- [ ] Checkboxen + Unterschrift-Feld
- [ ] Integration in Participant-Detail-Seite

---

## PRIORITÄT 3: AI + BRANDING + TESTS (ÜBERMORGEN - 6h)

### TASK 7: OpenAI API-Key (15min)
- [ ] Key in Manus Platform Environment Variables setzen
- [ ] Key: OPENAI_API_KEY
- [ ] Value: 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

### TASK 8: Branding-Logik (3h)
- [ ] server/_core/tenantMiddleware.ts erweitern (showTenantBrandingOnLogin)
- [ ] server/_core/trpc.ts erweitern (TrpcContext)
- [ ] server/routers/public.ts erstellen (getTenantBrandingForLogin)
- [ ] client/src/pages/Login.tsx anpassen (Branding-Query)
- [ ] client/src/App.tsx anpassen (Branding nach Login)

### TASK 9: Validation-Dashboard (2h)
- [ ] Admin-Dashboard: Validierungs-Status-Übersicht
- [ ] Dokumente mit niedrigem Confidence-Score hervorheben

### TASK 10: Tests (1h)
- [ ] Vorvertrag-Tests hinzufügen
- [ ] RLS-Tests aktualisieren
- [ ] pnpm test ausführen (Ziel: 55+ Tests)

---

## DEPLOYMENT-CHECKLIST

### Feature-Checks (Branding)
- [ ] ZENTRAL: Login über app.foerderpilot.io → Standard FörderPilot Branding VOR Login
- [ ] ZENTRAL: Nach Login → Tenant-Branding (Logo, Farben)
- [ ] CUSTOM DOMAIN: Tenant-Branding SCHON VOR Login
- [ ] CUSTOM DOMAIN: Nach Login → Tenant-Branding

### Feature-Checks (Allgemein)
- [ ] Super Admin kann Tenant erstellen
- [ ] Tenant Admin kann Kurse/Teilnehmer verwalten
- [ ] Teilnehmer können Dokumente hochladen
- [ ] Teilnehmer können Vorvertrag unterzeichnen
- [ ] AI-Validation läuft
- [ ] Admin sieht Validierungs-Dashboard

### Performance & Security
- [ ] DB-Queries < 500ms
- [ ] RLS in ALLEN Routern
- [ ] Kein Cross-Tenant-Zugriff möglich

### Tests
- [ ] 55+ Tests erfolgreich
- [ ] TypeScript-Check erfolgreich

---

## TIMELINE

| Tag | Aufgaben | Zeit |
|-----|----------|------|
| Mo 02.12. | DB-Indexes + RLS + Status-Pipeline | 4h |
| Di 03.12. | Vorvertrag (Schema + Router + UI) | 5h |
| Mi 04.12. | OpenAI Key + Branding + Validation-Dashboard | 6h |
| Do 05.12. | Tests + Deployment | 1.5h |
| Fr 06.12. | Beta-Launch | 2h |
| **Total** | | **18.5h** 🚀 |

---

**Version:** v5 FINAL  
**Start:** 2025-12-02  
**Beta-Launch:** 2025-12-06
