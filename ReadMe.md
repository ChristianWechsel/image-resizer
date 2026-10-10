# ReadMe

- [-] eigene Domain anlegen
- [x] Resourcen festelegen Min und Max Instanzen
- [] Rate Limit implementieren. Dabei verstehen, dass kein lokaler Speicher vorliegt und ein Anfragen auf mehrere Instanzen
        geleitet werden kann
- [] Ersatz für NGINX 
    - Was ist Aufgabe von NGINX verstehen
- [x] Server sauber herunterfahren
- [] Logging auf Cloud Storage ablegen
- [] create-gcp-ts aktualisieren
- [] [Health](https://docs.cloud.google.com/run/docs/configuring/instances/healthchecks?hl=de#http-startup-probes)
  - Wenn Logger onError fehler wirft, bereitschaft nicht vorhanden signalisieren
  - wenn Server herunterfährt, bereitschaft nicht vorhanden signalisieren
  - wenn bei Start z.B. env handler Fehler wirft, bereitschaft nicht vorhanden signalisieren

## Anleitung zum Einrichten

```Shell
# Ausgabe der URL
terraform output
gcloud run services list

# Daten zu Einstellungen
# <SERVICE> und <REGION> aus gcloud run services list ablesen
gcloud run services describe <SERVICE> --region <REGION>

```
