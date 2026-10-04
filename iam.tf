resource "google_service_account" "resizer_runner_sa" {
  account_id   = "${var.name_prefix}-runner-sa"
  display_name = "Cloud Run Runtime Identity für ${var.name_prefix}"
}

resource "google_cloud_run_v2_service_iam_member" "public_access" {
  project  = var.project_id
  location = var.location
  name     = google_cloud_run_v2_service.resizer_service.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}