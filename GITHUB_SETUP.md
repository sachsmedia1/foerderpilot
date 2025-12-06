# GitHub Setup für FörderPilot

## Konfiguration

Das Projekt ist bereits mit GitHub verbunden:

- **Repository:** https://github.com/sachsmedia1/foerderpilot
- **Remote Name:** `github`
- **Branch:** `main`

## Automatisches Pushen

Die GitHub-Credentials sind dauerhaft gespeichert. Alle zukünftigen Pushes funktionieren automatisch:

```bash
git push github main
```

## Konfigurationsdateien

- `.git-credentials` (global, in /home/ubuntu/)
- `.github-config` (lokal, wird NICHT committed - enthält Token)
- Git Remote `github` ist konfiguriert mit Token-Authentifizierung

## Token-Informationen

- **Token:** Gespeichert in `.github-config` (nicht in Git)
- **Typ:** Personal Access Token
- **Scope:** repo (full control)
- **Gültigkeit:** 90 Tage

## Sicherheit

⚠️ **Wichtig:** 
- `.github-config` ist in `.gitignore` und wird NICHT zu GitHub gepusht
- Token ist nur lokal in der Sandbox gespeichert
- Bei Token-Ablauf muss ein neuer Token generiert werden

## Erneuerung des Tokens

Falls der Token abläuft:

1. Neuen Token generieren: https://github.com/settings/tokens/new
2. Scope: `repo` auswählen
3. Token in `.github-config` und `.git-credentials` aktualisieren
4. Git Remote aktualisieren:
   ```bash
   git remote remove github
   git remote add github https://NEW_TOKEN@github.com/sachsmedia1/foerderpilot.git
   ```

## Status prüfen

```bash
# Remote-Konfiguration anzeigen
git remote -v

# Letzten Commit anzeigen
git log -1

# Push-Status prüfen
git status
```

## Für Manus AI

Die GitHub-Konfiguration ist persistent gespeichert:
- Token in `/home/ubuntu/.git-credentials` (global)
- Repository-Info in `.github-config` (lokal, ignoriert von Git)
- Remote `github` ist konfiguriert

**Automatischer Push-Befehl:**
```bash
cd /home/ubuntu/foerderpilot && git push github main
```
