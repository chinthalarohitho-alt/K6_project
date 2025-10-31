# K6 API Functional Testing Framework

This project provides a comprehensive, dockerized framework for API testing using [k6](https://k6.io/). It demonstrates various testing scenarios against public APIs, including the Petstore API and the Reqres API.

## 🚀 Project Purpose

The goal of this framework is to provide a real-world example of how to structure a k6 testing project for maintainability and scalability. It covers multiple testing strategies:

-   **Functional Testing**: Verifying the correctness of API endpoints (CRUD operations).
-   **Smoke Testing**: Quick checks to ensure the system is online and responsive.
-   **Error Handling**: Validating that the API handles bad requests gracefully.
-   **Load Testing**: Simulating user traffic to understand performance under stress.
-   **Workflow (End-to-End) Testing**: Simulating a full user journey across multiple API endpoints.
-   **Data-Driven Testing**: Running the same test with multiple input data sets to ensure robustness.
-   **File Upload Testing**: Verifying endpoints that handle multipart/form-data.
-   **Docker Integration**: Running tests in a consistent, containerized environment.

## ✨ Features

-   **Enhanced Terminal UI**: A custom log formatter provides a clean, detailed, and professional step-by-step view of functional test execution. It features a hierarchical layout, color-coded results, and "verbose on failure" diagnostics, which display full request/response bodies and detailed assertion errors only when a test fails.
-   **Environment-Driven API Configuration**: A core feature of this framework. Test scripts are completely generic. The API being tested (`petstore`, `reqres`) and the environment (`production`, `staging`) are controlled entirely by environment variables (`API_TARGET`, `ENV`) set at the command line.
-   **Transparent API Client**: Test scripts import a single, pre-configured `api` object. The framework intelligently provides the correct client based on the environment variables, completely abstracting away URLs, headers, and HTTP logic.
-   **Automatic Payload Discovery**: A "zero-configuration" workflow. Simply add a `.json` file to the `/payloads` directory, and it's immediately available to tests via `getPayload('your_file_name')`.
-   **Dynamic Payload Modification**: A powerful, unified `getPayload(name, modifications)` function allows for clean, declarative, and immutable modifications of base payloads on the fly.
-   **Declarative Test Runner (`runTestGroup`)**: A high-level helper that encapsulates the `group`, API call, and `check` pattern. It uses a flexible options object and returns the response, enabling its use in both simple and complex, stateful workflow tests.
-   **Direct Helper Access with Inline Documentation**: All utility functions (`randomString`, etc.) are exported directly from the central toolkit. Each is documented with JDoc, providing a rich, flat list of tools with inline descriptions in your code editor for a superior developer experience.
-   **Declarative Assertion Helpers**: A suite of assertion functions makes tests readable and maintainable, including specific helpers for values (`assertValue`), types (`assertTypeInt`, `assertTypeString`), and combined properties (`assertProperty`).
-   **Architectural Integrity Check**: An automated script, integrated into the CI pipeline, enforces that all tests import only from the central `/utils/index.js` module, ensuring long-term code quality.
-   **CI/CD Ready**: Includes a GitHub Actions workflow for automated testing with email alerts.

## 📂 Project Structure

The framework follows a clean, segregated architecture where each directory has a single, clear responsibility.

```
/
├── .github/workflows/ci.yml   # CI/CD workflow for automated testing.
├── config/
│   ├── environments.json      # Single source of truth for all API environments (URLs, IDs).
│   └── config.js              # Reads ENV variables and provides the correct configuration.
├── docker/
│   ├── Dockerfile             # Blueprint for the self-contained k6 test runner image.
│   └── docker-compose.yaml    # Orchestrates running tests within the Docker container.
├── payloads/
│   ├── pet.json               # Example JSON payloads used as test data.
│   └── ...
├── reports/                   # (Auto-generated) Output from test runs (e.g., JSON summaries).
├── scripts/
│   ├── petstore/              # Test scripts targeting the Petstore API.
│   │   ├── crud.js
│   │   └── ...
│   └── reqres/                # Test scripts targeting the Reqres API.
│       └── ...
├── tools/
│   ├── checkImports.js        # Node.js script to enforce architectural rules.
│   ├── format-results.js      # Node.js script that renders the enhanced terminal UI.
│   └── generatePayloads.js    # Node.js script for automatic payload discovery.
├── utils/
│   ├── core/                  # Contains the core implementation logic of the framework.
│   │   ├── apiClient.js
│   │   └── ...
│   ├── _generated_payloads.js # (Auto-generated) The dynamic map of all JSON payloads.
│   └── index.js               # The main entry point and "toolbox" for the framework.
├── .env.example               # Template for environment variables.
├── .gitignore                 # Specifies files to be ignored by Git.
├── package.json               # Defines npm scripts and project dependencies.
└── README.md                  # This file.
```

## 🛠️ Setup Instructions

### Prerequisites

-   [Git](https://git-scm.com/)
-   [Node.js](https://nodejs.org/en/) & [npm](https://www.npmjs.com/)
-   [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)
-   **For local runs only:** [k6](https://k6.io/docs/getting-started/installation/) installed on your local machine.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd k6-api-testing-framework
    ```

2.  **Install dependencies (for helper scripts):**
    ```bash
    npm install
    ```

3.  **Setup environment file:**
    *Create a `.env` file from the example. You do not need to modify it for the public APIs.*
    ```bash
    cp .env.example .env
    ```

## 🧪 How to Run Tests

This framework provides two ways to run tests: via Docker for consistency, or locally for speed.

### Running Tests with Docker (Recommended)

This is the primary method and is used by the CI pipeline. It guarantees a consistent testing environment.

**Step 1: Build the Docker Image**
Before running tests for the first time, or after changing any scripts, build the test runner image.

```bash
npm run docker:build
```

**Step 2: Run a Specific Test**
Execute any test script using its dedicated command.

-   `npm run test:petstore:crud`
-   `npm run test:reqres:auth`

*Check the `scripts` section in `package.json` for a full list of available test commands.*

### Running Tests Locally (Without Docker)

This method is great for faster feedback during development. It requires k6 to be installed on your machine.

**Examples:**

-   **Run Petstore CRUD test locally:**
    ```bash
    npm run local:test:petstore:crud
    ```

-   **Run Reqres Auth test locally:**
    ```bash
    npm run local:test:reqres:auth
    ```
    
*The `local:test:*` scripts mirror the standard `test:*` scripts for every test file.*

### Switching Environments

You can switch the API environment by setting the `ENV` variable. It defaults to `production`. To add a new environment (e.g., `staging`), simply add it to `config/environments.json`.

-   **Run Reqres CRUD test against the `staging` environment (with Docker):**
    ```bash
    ENV=staging npm run test:reqres:crud
    ```
-   **Run Reqres CRUD test against the `staging` environment (locally):**
    ```bash
    ENV=staging npm run local:test:reqres:crud
    ```

## 🤖 Continuous Integration with GitHub Actions

This project includes a pre-configured GitHub Actions workflow (`.github/workflows/ci.yml`) that automates the testing process. It runs the core smoke and CRUD tests for both `petstore` and `reqres` targets on every push and pull request to the `main` branch.