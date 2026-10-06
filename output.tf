output "cloud_run_url" {
  description = "Die offizielle Standard-URL des Cloud Run Service"
  value       = google_cloud_run_v2_service.resizer_service.uri
}