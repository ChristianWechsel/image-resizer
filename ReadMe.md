# ReadMe

- [] create-gcp-ts aktualisieren

## Anleitung zum Einrichten

```Shell
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

# Image resizer aufrufen
gcloud secrets list                     // <KEY> aus NAME ablesen
gcloud secrets versions list <KEY>      // <VERSION> aus NAME ablesen
gcloud secrets versions access <VERSION> --secret=<KEY>
export API_KEY="$(gcloud secrets versions access <VERSION> --secret=<KEY>)"
echo $API_KEY
export BASE_URL="$(terraform output --raw cloud_run_url)"
echo $BASE_URL
export OUTPUT=output.png
export INPUT=input.png
curl --show-error -X POST -H "Content-Type: image/png" -H "Authorization: Bearer ${API_KEY}" --data-binary @${INPUT} --output "${OUTPUT}" ${BASE_URL%/}/resize

```
