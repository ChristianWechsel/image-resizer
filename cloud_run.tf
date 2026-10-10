resource "google_cloud_run_v2_service" "resizer_service" {
  name     = var.name_prefix
  location = var.location

  template {
    service_account = google_service_account.resizer_runner_sa.email
    containers {
      image = "${var.location}-docker.pkg.dev/${var.project_id}/${var.repository}/${var.name_prefix}:latest"
      resources {
        limits = {
          cpu = "1"
        }
      }
      startup_probe {
        initial_delay_seconds = 1
        http_get = {
          path = "/health"
        }
      }
      liveness_probe {
        http_get = {
          path = "/health"
        }
      }
      readiness_probe {
        http_get = {
          path = "/health"
        }
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }
      env {
        name  = "PROJECT_ID"
        value = var.project_id
      }
      env {
        name  = "STORAGE_BUCKET_NAME"
        value = var.storage_bucket_name
      }
    }

    scaling {
      max_instance_count  = 3
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