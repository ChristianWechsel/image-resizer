# ReadMe

- [] create-gcp-ts aktualisieren

## Aufruf mit gcloud und curl

Das Beispiel setzt Bash, `gcloud` und `curl` voraus. `gcloud` muss mit einem Google-Konto angemeldet sein, das `roles/secretmanager.secretAccessor` auf genau diesem Secret hat. Die aktive Identität anzeigen:

```Shell
PROJECT_ID="your-gcp-project"
SECRET_NAME="your-api-key-secret"
gcloud auth list --filter=status:ACTIVE --format='value(account)'
```

Den Zugriff auf Version `1` testen, ohne den Key auszugeben:

```Shell
gcloud secrets versions access 1 --secret="$SECRET_NAME" --project="$PROJECT_ID" >/dev/null \
&& echo "Secret-Zugriff OK"
```

Der Check testet den tatsächlichen Secret-Zugriff. Die Rolle kann auf Secret-Ebene vergeben werden; siehe [Secret Manager IAM](https://cloud.google.com/secret-manager/docs/access-control).

```Shell
SERVICE_URL="$(terraform output -raw cloud_run_url)"
INPUT="./input.png"
OUTPUT="./resized.png"

API_KEY="$(gcloud secrets versions access 1 --secret="$SECRET_NAME" --project="$PROJECT_ID")"
curl --fail --show-error \
--header "Authorization: Bearer ${API_KEY}" --header "Content-Type: application/octet-stream" --data-binary "@${INPUT}" --output "$OUTPUT" "${SERVICE_URL%/}/resize?width=640"
unset API_KEY
```

Die Cloud-Run-URL ist derzeit öffentlich aufrufbar (`allUsers` als Invoker); die Anwendung schützt `/resize` mit dem Bearer API Key. Das persönliche Google-Konto wird hier zum Lesen des Secrets benötigt, nicht für eine separate Cloud-Run-IAM-Berechtigung. Shell-Variablen und Prozessargumente sind kein Schutz vor anderen Prozessen desselben lokalen Benutzers.

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

# 
```
