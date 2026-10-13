# ReadMe

- [-] eigene Domain anlegen
- [x] Resourcen festelegen Min und Max Instanzen
- [] Rate Limit implementieren. Dabei verstehen, dass kein lokaler Speicher vorliegt und ein Anfragen auf mehrere Instanzen
        geleitet werden kann
- [] Ersatz für NGINX 
    - Was ist Aufgabe von NGINX verstehen
- [x] Server sauber herunterfahren
- [x] Logging auf Cloud Storage ablegen
- [] create-gcp-ts aktualisieren
- [x] [Health](https://docs.cloud.google.com/run/docs/configuring/instances/healthchecks?hl=de#http-startup-probes)
  - Wenn Logger onError fehler wirft, bereitschaft nicht vorhanden signalisieren
  - wenn Server herunterfährt, bereitschaft nicht vorhanden signalisieren
  - wenn bei Start z.B. env handler Fehler wirft, bereitschaft nicht vorhanden signalisieren
- API Key
  - CLI Client erstellen, welcher via Secret Store API Key holt und somit mit CLoud Run kommunizieren kann

## NGINX-Sicherheitsfunktionen und Cloud Run

Legende: **Cloud Run** = von Google (Google Front End) bereits abgedeckt, **Nachbauen** = selbst umsetzen.

- `server_tokens off` (Versionsnummer verbergen)
  - Status: Nachbauen (nur App-Header; `Server: Google Frontend` setzt Google)
  - Verhindert: Information Disclosure / gezielte Angriffe auf bekannte Schwachstellen. Im Node-Server `X-Powered-By` deaktivieren (bei Express `app.disable('x-powered-by')`). Geringes Risiko.
- HTTP -> HTTPS Redirect (Port 80 -> 443)
  - Status: Cloud Run
  - Verhindert: Mitlesen/Manipulieren von Traffic (Man-in-the-Middle), Klartext-API-Keys. `*.run.app` und Custom Domains sind nur per HTTPS erreichbar.
- TLS-Terminierung, `ssl_protocols`, `ssl_ciphers`, Zertifikate (Let's Encrypt)
  - Status: Cloud Run (Zertifikate automatisch verwaltet)
  - Verhindert: Downgrade-Angriffe auf alte TLS-Versionen/schwache Cipher. Eigene TLS-Policy nur nötig bei externem Load Balancer.
- `client_max_body_size 10M` (Schutz vor großen Uploads)
  - Status: Nachbauen (Cloud Run erlaubt bei HTTP/1 max. 32 MiB, bei Streaming/HTTP2 unbegrenzt)
  - Verhindert: Speicher-/CPU-Erschöpfung und Kostenexplosion durch riesige Bilder (Resource Exhaustion, Denial of Wallet). Limit im Server setzen (z. B. Content-Length prüfen und Stream abbrechen), zusätzlich Bildmaße/Pixelanzahl begrenzen (Decompression Bomb).
- `client_body_timeout`, `client_header_timeout`, `send_timeout`, `keepalive_timeout` (Slowloris)
  - Status: Teilweise Cloud Run (GFE puffert langsame Clients, Slowloris gegen die Instanz damit weitgehend entschärft)
  - Verhindert: Blockieren von Verbindungen/Instanzen durch langsame Requests. Zusätzlich Request-Timeout im Cloud-Run-Service passend zur Resize-Dauer setzen (Standard 300 s) und in Node `headersTimeout`, `requestTimeout` konfigurieren.
- `limit_req_zone` / `limit_req` (Rate Limit pro IP, HTTP 429)
  - Status: Nachbauen (Cloud Run hat kein Rate Limiting)
  - Verhindert: Brute Force auf API Key, Scraping, DoS und damit Autoscaling bis `max_instances` (Kosten). Pro Instanz gezählte In-Memory-Limits sind wirkungslos, da Anfragen auf mehrere Instanzen verteilt werden. Optionen: Cloud Armor (Rate Limiting) über externen Application Load Balancer oder gemeinsamer Zähler (Redis/Memorystore). `max_instances` als harte Kostenobergrenze beibehalten.
- `proxy_set_header X-Forwarded-For $remote_addr` (Spoofing-Schutz)
  - Status: Nachbauen
  - Verhindert: Umgehung des Rate Limits und gefälschte IPs in Logs. Cloud Run hängt die echte Client-IP an einen vom Client mitgeschickten `X-Forwarded-For` an. Nur den rechten (von Google gesetzten) Eintrag verwenden, nicht den ersten. Hinter einem Load Balancer sind es die letzten zwei Einträge.
- `X-Forwarded-Proto` / `X-Forwarded-Host` überschreiben
  - Status: Teilweise Cloud Run (Proto setzt GFE); Host-Header im Server nicht blind vertrauen
  - Verhindert: Host-Header-Injection, falsche Links/Redirects, Cache Poisoning.
- `server_name` (nur eigene Domain bedienen)
  - Status: Nachbauen, falls Custom Domain genutzt wird
  - Verhindert: Zugriff am Rate Limit/Cloud Armor vorbei über die direkte `*.run.app`-URL. Ingress auf "internal and cloud load balancing" einschränken oder `run.app`-URL deaktivieren (`default_uri_disabled`).
- Authentifizierung / Zugriffsschutz (nicht in NGINX-Config, aber Aufgabe des Proxys)
  - Status: Nachbauen (API Key, siehe oben) oder IAM-Invoker
  - Verhindert: Missbrauch des öffentlichen Endpunkts (kostenlose Bildverarbeitung auf eigene Rechnung). API Key im Secret Manager, Vergleich zeitkonstant.
- Security-Header (nicht im Beispiel, aber üblich: `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`)
  - Status: Nachbauen (HSTS setzt Cloud Run nicht automatisch)
  - Verhindert: MIME-Sniffing bei ausgelieferten Bildern, SSL-Stripping beim ersten Aufruf.

## Einschätzung: Aufwand und Empfehlung

Ziel: kein Fort Knox, nur Schutz vor Missbrauch der eigenen Ressourcen und Kosten. Fast alles ist mit kleinen Änderungen im Express-Server machbar, nur ein echtes Rate Limit ist aufwendig.

| Funktion | Aufwand | Vorgehen |
|---|---|---|
| Body-Limit | gering | `Content-Length` prüfen, gelesene Bytes zählen und Stream abbrechen |
| Pixel-/Maß-Limit | gering | `sharp({ limitInputPixels })`, `width`/`height` auf z. B. 4096 begrenzen |
| Request-Timeout | gering | Cloud-Run-Timeout in Terraform, `server.requestTimeout`/`headersTimeout` in Node |
| `x-powered-by`, Security-Header | gering | `app.disable('x-powered-by')` oder `helmet` |
| API Key | mittel | Middleware, Secret aus Secret Manager (Env über Terraform), Vergleich mit `timingSafeEqual` |
| Client-IP korrekt lesen | gering | `trust proxy` passend setzen, damit Express den rechten Eintrag nutzt |
| Direkte `run.app`-URL absichern | gering | Entfällt ohne Custom Domain mit Load Balancer |
| Rate Limit | hoch | siehe unten |

### Rate Limit

- IP-basiertes Rate Limit ist für das Ziel nicht zwingend nötig.
- API Key hält Fremde von der Bildverarbeitung fern (wichtigster Schutz).
- `max_instances` und niedrige `concurrency` begrenzen die Kosten hart.
- Pro-Instanz-Limit im Speicher (`express-rate-limit`) ist ungenau, reicht aber als grobe Bremse.
- Cloud Armor oder Redis erst bei Bedarf an IP-genauer Begrenzung (Load Balancer, feste Kosten, mehr Infrastruktur).

### Zusätzlich sinnvoll

1. Budget-Alert in GCP mit E-Mail (z. B. bei 5/10 €). Fängt alles ab, was im Code übersehen wird.
2. Authentifizierung vor der Verarbeitung: API Key prüfen, bevor der Body gelesen oder `sharp` gestartet wird.
3. Eingabevalidierung:
   - `parseInt` kann `NaN` oder negative Werte liefern: validieren, Maximalwerte setzen.
   - Content-Type auf erlaubte Bildformate beschränken.
   - `sharp`-Fehler (kaputtes Bild) abfangen und als 400 zurückgeben.
4. Zentrale Error-Middleware ohne Stacktraces nach außen. Die `pipeline` in `/resize` hat aktuell kein try/catch, und Express 4 fängt async Fehler nicht ab.
5. `/health` liefert `health.getLog()` öffentlich: nur Status ausgeben oder Log weglassen, um keine internen Fehlertexte zu leaken.
6. Cloud-Run-Einstellungen:
   - eigener Service Account mit minimalen Rechten
   - niedriger Request-Timeout
   - bei Nutzung nur durch den Eigentümer: IAM-Invoker (`--no-allow-unauthenticated`), dann ist der API Key überflüssig (Clients brauchen ein ID-Token)

### Empfohlene Reihenfolge

- [x] Budget-Alert
- [x] API Key (oder IAM)
- [x] Größen- und Pixel-Limits
- [] Fehlerbehandlung
- [x] `/health` ohne `health.getLog()` ausliefern (nur Status), da der Log interne Fehlertexte öffentlich preisgibt
- [] `express-rate-limit` als grobe Bremse
- [] Timeouts und Header

Cloud Armor und Redis weglassen.

## API Key als Zugriffsschutz

Header: `Authorization: Bearer <key>` (RFC 6750, bereits in `src/middleware/api-key.ts`).

Bedrohungsmodell: Wer sich als mein Google-Konto anmelden kann, kann das Secret lesen und hat ohnehin vollen GCP-Zugriff. Dagegen hilft nur Kontoschutz (2FA). Der API Key schützt vor Dritten ohne Konto-Zugriff und vor unbeabsichtigter Weitergabe des Clients.

Entscheidung offen: IAM-Invoker + ID-Token statt API Key. Gleicher Schutz ohne eigenen Server-Code, Token kurzlebig, Identität im Request-Log. Nicht kombinierbar mit `Authorization: Bearer <key>`, da Cloud Run den Header dann selbst prüft (bei Kombination anderen Header wie `X-Api-Key` wählen).

### Server

- [] Middleware vor `/resize` einbinden (vor Body und `sharp`), `/health` ausnehmen
- [] `API_KEY` über `src/core/env.ts` einlesen statt `process.env`; fehlt der Key, Bereitschaft nicht melden (fail closed)
- [] `Authorization`-Header im Request-Logger maskieren (häufigster Leak)
- [] Immer dieselbe 401-Antwort, egal ob Header fehlt oder Key falsch ist
- [] Rotation: während des Wechsels alten und neuen Key akzeptieren
- [] Unit-Tests für die Middleware (fehlender Header, falsches Schema, falscher Key, richtiger Key, Schema in anderer Schreibweise)
- [] Optional: `timingSafeEqual` ohne Hash, dafür mit Längenprüfung (`a.length === b.length`)

### Secret Manager und Terraform

- [] Key erzeugen: `openssl rand -base64 32` bzw. `randomBytes(32).toString('base64url')`
- [] Secret in Secret Manager anlegen (Terraform), Wert nicht in Git und nicht im Terraform-State ablegen
- [] Cloud-Run-Service-Account: `roles/secretmanager.secretAccessor` nur auf dieses Secret
- [] Nutzer/Client-Identität: `roles/secretmanager.secretAccessor` nur auf dieses Secret, nicht projektweit
- [] Secret in Cloud Run einbinden: Env-Variable (wird beim Instanzstart aufgelöst, Rotation braucht neue Revision) oder Volume (aktuelle Version beim Lesen)
- [] Data-Access-Audit-Logs für Secret Manager aktivieren (standardmäßig aus)
- [] 2FA auf dem Google-Konto prüfen

### CLI Client

- [] Secret zur Laufzeit per Application Default Credentials aus Secret Manager holen
- [] Key nur im Speicher halten: nicht in Datei, Shell-History, Kommandozeilenargument oder Cache
- [] Key nie in der URL/Query übergeben
- [] Fehlerausgabe ohne Key und ohne Header-Dump

## Anleitung zum Einrichten

```Shell
# Ausgabe der URL
terraform output
gcloud run services list

# Daten zu Einstellungen
# <SERVICE> und <REGION> aus gcloud run services list ablesen
gcloud run services describe <SERVICE> --region <REGION>

# Deployment
terraform output

# Deployment Befehl ablesen und ausführen

# API Key erzeugen
openssl rand -base64 32

# Secret anlegen
gcloud secrets create ${var.secret_name} --project=${var.project_id}

# Wert zu Secret hinzufügen
openssl rand -base64 32 | gcloud secrets versions add ${var.secret_name} --data-file=- --project=${var.project_id}


gcloud secrets list
gcloud secrets versions list ${var.secret_name}
```
