resource "google_service_account" "resizer_runner_sa" {
  account_id   = "${var.name_prefix}-runner-sa"
  display_name = "Cloud Run Runtime Identity für ${var.name_prefix}"
}


resource "google_storage_bucket_iam_member" "resizer_runner_log_access" {
  for_each = toset(["roles/storage.objectCreator", "roles/storage.legacyBucketReader"])
  bucket   = var.storage_bucket_name
  role     = each.value
  member   = "serviceAccount:${google_service_account.resizer_runner_sa.email}"
}

resource "google_secret_manager_secret_iam_member" "resizer_runner_secret_access" {
  project   = var.project_id
  secret_id = var.secret_name
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.resizer_runner_sa.email}"
}

resource "google_cloud_run_v2_service_iam_member" "public_access" {
  project  = var.project_id
  location = var.location
  name     = google_cloud_run_v2_service.resizer_service.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}