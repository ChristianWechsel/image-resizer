resource "google_service_account" "resizer_runner_sa" {
  account_id   = "${var.name_prefix}-runner-sa"
  display_name = "Cloud Run Runtime Identity für ${var.name_prefix}"
}