data "google_service_account" "cloudbuild_custom_sa" {
  account_id = var.service_account_build_id
  project    = var.project_id
}

resource "google_cloudbuild_trigger" "main_branch_trigger" {
  name            = "${var.github_repo_name}-push-trigger"
  location        = var.location
  description     = "Starts Cloud Build on every push to ${var.trigger_branch_name}"
  service_account = data.google_service_account.cloudbuild_custom_sa.id

  repository_event_config {
    repository = "projects/${var.project_id}/locations/${var.location}/connections/${var.connection_name_gcp_github}/repositories/${var.github_username}-${var.github_repo_name}"
    
    push {
      branch = "^${var.trigger_branch_name}$"
    }
  }

  filename = "cloudbuild.yaml"
  substitutions = {
    _GAR_REPOSITORY = var.repository
    _GAR_IMAGE_NAME = var.name_prefix
  }
}