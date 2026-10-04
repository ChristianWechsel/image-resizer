# Node.js TypeScript Application for Google Cloud

A production-ready TypeScript Node.js backend application configured with strict TypeScript compilation, Jest test suites, and automated CI/CD using Google Cloud Build and Terraform.

---

## Features

- **TypeScript with ESM**: Modern ES modules setup with strict compiler checks (`tsconfig.json`, `tsconfig.prod.json`, `tsconfig.test.json`).
- **Jest Test Framework**: Separated unit testing (`*.test.unit.ts`) and integration testing (`*.test.int.ts`).
- **Automated CI/CD**: Pre-configured `cloudbuild.yaml` pipeline with automated security audits (`npm audit`), test runs, and Artifact Registry / npm deployment.
- **Infrastructure as Code (Terraform)**: Pre-configured Cloud Build push and tag triggers linked to GitHub 2nd gen repository connections.

---

## Project Structure

```text
├── bin/
│   └── clean.sh                 # Cleans dist/ build outputs
├── src/
│   ├── index.ts                 # Application entry point
│   ├── math/                    # Example application logic
│   │   ├── add.ts
│   │   ├── add.testdata.ts
│   │   └── add.test.unit.ts     # Unit test suite
│   └── integration/             # Integration tests
│       └── add.test.int.ts      # Integration test suite
├── cloudbuild.yaml              # Cloud Build pipeline definition
├── jest.config.mjs              # Jest project configuration
├── main.tf                      # Terraform Cloud Build triggers
├── package.json                 # Project dependencies, scripts, and configuration
├── provider.tf                  # Terraform Google provider config
├── terraform.tfvars.example     # Template for Terraform variables
├── tsconfig.json                # Base TypeScript compiler options
├── tsconfig.prod.json           # Production build options
├── tsconfig.test.json           # Test build options
└── variables.tf                 # Terraform variable definitions
```

---

## Getting Started

### 1. Install Dependencies

```shell
npm install
```

### 2. Configure Package Information

Adjust the metadata in `package.json`:

- `"name"`: Application name (e.g., `@your-scope/my-service` or `my-service`).
- `"description"`: Short description of the service.
- `"author"`: Your name and email address.

Also update the [LICENSE](LICENSE) file with the current year and your name or organization.

### 3. Setup GCP Cloud Build Triggers (Terraform)

The included Terraform configuration manages the Cloud Build triggers that run your CI/CD pipeline on push and release events.

1. **Copy the example variables file:**

   ```shell
   cp terraform.tfvars.example terraform.tfvars
   ```

2. **Configure your values in `terraform.tfvars`:**

3. **Deploy the triggers:**

   ```shell
   terraform init
   terraform apply
   ```

> **Security Note:** `terraform.tfvars` contains local infrastructure secrets and configuration and is excluded by `.gitignore`. Do not commit this file to Git.

---

## Development Scripts

| Command | Description |
| :--- | :--- |
| `npm run build` | Compiles TypeScript into `dist/`. |
| `npm run build-prod` | Performs a clean compilation using `tsconfig.prod.json`. |
| `npm start` | Runs the compiled application (`node dist/index.js`). |
| `npm run debug` | Starts Node.js with the debugging inspector enabled (`--inspect-brk`). |
| `npm test` | Runs the full Jest test suite (unit + integration). |
| `npm run test:unit` | Runs only unit tests (`*.test.unit.ts`). |
| `npm run test:int` | Runs only integration tests (`*.test.int.ts`). |
| `npm run clean` | Deletes build outputs in `dist/`. |

---

## CI/CD Pipeline

Pushes to your repository trigger automated builds via [cloudbuild.yaml](cloudbuild.yaml):

- **Push to target branch (`main`)**:
  - `npm audit --audit-level=high`
  - `npm ci`
  - `npm test`
  - Publishes internal artifact to GCP Artifact Registry.
- **Tag push (`v*.*.*`)**:
  - Full audit and test cycle.
  - Fetches release credentials from GCP Secret Manager.
  - Publishes release package to npmjs.

---

## License

[MIT](LICENSE)

> **Note:** Update the [LICENSE](LICENSE) file manually with the current year and your name or organization (replace `<YEAR>` and `<AUTHOR_OR_ORGANIZATION>`).
