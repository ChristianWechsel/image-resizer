resource "google_cloud_run_v2_service" "resizer_service" {
  name     = var.name_prefix
  location = var.location

  template {
    service_account = google_service_account.resizer_runner_sa.email
    containers {
        image = "${var.location}-docker.pkg.dev/${var.project_id}/${var.repository}/${var.name_prefix}:latest"
    }
  }

  lifecycle {
    ignore_changes = [
      template[0].containers[0].image,
      client,
      client_version
    ]
  }
}