output "cloud_run_url" {
  description = "Die offizielle Standard-URL des Cloud Run Service"
  value       = google_cloud_run_v2_service.resizer_service.uri
}

output "cloud_run_deploy_command" {
  description = "gcloud-Befehl zum lokalen Deployment des neuesten Images"
  value       = "gcloud run deploy ${var.name_prefix} --project=${var.project_id} --region=${var.location} --image=${var.location}-docker.pkg.dev/${var.project_id}/${var.repository}/${var.name_prefix}:latest --service-account=${google_service_account.resizer_runner_sa.email} --allow-unauthenticated"
}

output "create_secret_command" {
  description = "gcloud-Befehl zum Erzeugen eines Secrets"
  value       = "gcloud secrets create ${var.secret_name} --project=${var.project_id}"
}

output "add_new_value_to_secret_command" {
  description = "gcloud-Befehl zum Erzeugen eines Secrets"
  value       = "openssl rand -base64 32 | gcloud secrets versions add ${var.secret_name} --data-file=- --project=${var.project_id}"
}
