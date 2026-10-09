variable "project_id" {
  type        = string
  description = "GCP Projekt-ID"
}

variable "location" {
  type        = string
  description = "GCP Region"
}

variable "name_prefix" {
  type        = string
  description = "Prefix used for infrastructure resource names."
}

variable "repository" {
  type        = string
  description = "Name des google cloud Repositories."
}

variable "service_account_build_id" {
  type        = string
  description = "Service Account ID of Cloud Build"
}

variable "trigger_branch_name" {
  type        = string
  description = "Name of git branch that a push triggers build"
}

variable "github_username" {
  type        = string
  description = "Username of github"
}

variable "github_repo_name" {
  type        = string
  description = "Name of repository on github"
}

variable "connection_name_gcp_github" {
  type        = string
  description = "Name of the connection from github to gcp (manually created beforhand)"
}

variable "storage_bucket_name" {
  type       = string
  description = "GCP Storage Bucket name"
}