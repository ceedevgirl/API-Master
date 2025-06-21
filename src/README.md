# Angular Blog Post Application

This project is an Angular 19 application built to showcase advanced concepts including API handling, authentication, error handling, caching, pagination, and environment setup, following Angular best practices.

## 1. Setup Instructions

To run this project locally, follow these steps:

1.  **Clone the repository:**
    "bash
    git clone [Your-Repo-URL]
    cd AngularAdvancedApp
    "
2.  **Install Node.js and Angular CLI:**
    If you don't have them installed, you can get Node.js from [nodejs.org](https://nodejs.org/en/) and Angular CLI using npm:
    "bash
    npm install -g @angular/cli
    "
3.  **Install dependencies:**
    Navigate to the project root and install all required Node.js packages:
    "bash
    npm install
    "
4.  **Run the application:**
    To run the application in development mode:
    "bash
    ng serve
    "
    Open your browser to "http://localhost:4200/".

    To run with staging environment:
    "bash
    ng serve --configuration=staging
    "
    To build for production:
    "bash
    ng build --configuration=production
    "

## 2. Scripts Description

* "ng serve": Compiles and serves the application, reloading upon file changes. Uses "environment.ts" by default.
* "ng serve --configuration=staging": Serves the application using "environment.staging.ts".
* "ng build": Compiles the application into an output directory (defaults to "dist/") for deployment. Uses "environment.ts" by default.
* "ng build --configuration=production": Compiles the application for production, using "environment.prod.ts" and enabling production optimizations.
* "ng test": Runs the unit tests via Karma.


## 3. Project Structure

The project follows a modular and scalable folder structure:

src/
├── app/
│   ├── core/                  // Contains core services, authentication, interceptors, error handling, caching.
│   │   ├── auth/              // AuthService, AuthGuard
│   │   ├── cache/             // CacheService
│   │   ├── error-handling/    // ErrorService
│   │   ├── interceptors/      // AuthInterceptor
│   │   └── services/          // ApiService (generic HTTP client)
│   ├── shared/                // Contains reusable components, pipes, directives, and utility functions/validators.
│   │   ├── components/        // PaginationComponent
│   │   └── validators/        // profanity-validator.ts (custom validator function)
│   ├── features/              // Contains feature-specific modules/components.
│   │   ├── auth/              // LoginComponent
│   │   └── posts/             // All components and services related to posts.
│   │       ├── models/        // Interfaces (Post, Comment)
│   │       ├── pages/         // PostListComponent, PostDetailsComponent, PostCreateComponent, PostEditComponent
│   │       └── services/      // PostService (feature-specific API calls)
│   ├── app.config.ts          // Application-level configuration for standalone components.
│   ├── app.routes.ts          // Defines application routes.
│   └── app.component.ts       // Root component.
├── assets/                    // Static assets like images.
├── environments/              // Environment-specific configuration files.
│   ├── environment.ts
│   ├── environment.staging.ts
│   └── environment.prod.ts
├── styles.scss                // Global SCSS styles, variables, and mixins.
└── main.ts                    // Entry point for the application.


## 4. Key Features

* **Project Setup**: Configured with Angular CLI, SCSS, and multiple environment files ("environment.ts", "environment.staging.ts", "environment.prod.ts").

* **API Service ("ApiService")**: A generic "ApiService" in "core/services" for "GET", "POST", "PUT", "DELETE" operations. It uses "HttpClient" and returns "Observables".

* **Error Handling ("ErrorService")**: Centralized error handling using "ErrorService" with "retry" and "catchError" operators.

* **Authentication**:
    * **"AuthService"**: Simulates login/logout and stores a mock token in "localStorage". Uses Angular Signals for "isAuthenticated" status.

    * **"AuthInterceptor"**: Automatically attaches the mock token to outgoing requests and logs requests/responses. 

    * **"AuthGuard"**: Protects routes ("/posts/create", "/posts/:id/edit") ensuring only authenticated users can access them.
* **Components**:

    * **"PostListComponent"**: Displays a paginated list of posts.
    * **"PostDetailsComponent"**: Shows a single post and its associated comments.
    * **"PostCreateComponent"**: Form to create a new post with reactive forms and validation.
    * **"PostEditComponent"**: Form to update an existing post with reactive forms and pre-filled data.
    * All components are **standalone**, styled with **SCSS**, and designed to be **responsive**.

* **Pagination ("PaginationComponent")**: A reusable "PaginationComponent" implementing pagination using URL query parameters.

* **Caching ("CacheService")**: Implements an in-memory cache for "GET" requests with a limited time-to-live (1 minute). Provides methods to clear the entire cache or specific entries.

* **Validation & Sanitization**:
    * Uses Angular's built-in reactive form validators (e.g., "required", "minLength").
    * Includes a **custom validator ("profanityValidator")** to block specific "profane" words.
    * Demonstrates basic input sanitization using "DomSanitizer" in "PostCreateComponent" and "PostEditComponent".

* **Unit Testing**: Comprehensive unit tests for "ApiService", "AuthInterceptor", and "PostListComponent" using Jasmine and Karma.

