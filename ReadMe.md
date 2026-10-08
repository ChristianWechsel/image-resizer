# ReadMe

- [-] eigene Domain anlegen
- [x] Resourcen festelegen Min und Max Instanzen
- [] Rate Limit implementieren. Dabei verstehen, dass kein lokaler Speicher vorliegt und ein Anfragen auf mehrere Instanzen
        geleitet werden kann
- [] Ersatz für NGINX 
    - Was ist Aufgabe von NGINX verstehen
- [] Server sauber herunterfahren
- [] Logging auf Cloud Storage ablegen

## Anleitung zum Einrichten

```Shell
# Ausgabe der URL
terraform output
gcloud run services list

# Daten zu Einstellungen
# <SERVICE> und <REGION> aus gcloud run services list ablesen
gcloud run services describe <SERVICE> --region <REGION>

```
