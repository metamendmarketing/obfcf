# Oak Bay Firefighters Charitable Foundation Website

Welcome to the codebase for the Oak Bay Firefighters Charitable Foundation website!

## Getting Started

### 1. Frontend Development Server
The frontend is built with vanilla HTML, CSS, and JS using Vite for fast development and building.

To start the local development server:
```bash
npm install
npm run dev
```
It will open at `http://localhost:5173`.

### 2. Payload Headless CMS Setup

We are using **Payload CMS** for the backend. Payload runs completely locally on your machine.

To set up Payload:
1. Open a new terminal in the `Oak Bay` folder.
2. Run the initialization command:
```bash
npx create-payload-app@latest
```
3. Follow the prompts:
   - **Project Name**: `payload-cms`
   - **Template**: `blank`
   - **Database**: Choose `MongoDB` or `SQLite` based on your preference (SQLite requires zero extra setup!).
4. Once installed, navigate into the new directory. The folder name will be whatever you typed in the Project Name prompt (with spaces turned into dashes). For example:
```bash
cd oak-bay-firefighters-charitable-foundation-website
```

### 3. Configure Payload Collections

In your new folder, open `src/payload.config.ts`. You need to add:
1. A **Global** named `site-settings` with an `aboutUsText` text field.
2. A **Collection** named `projects` with `title` (text), `excerpt` (text), and `mainImage` (upload).
3. Ensure CORS is enabled for the frontend by adding `cors: ['http://localhost:5173']` to the config.

### 4. Start the Backend

Run the following command inside your `payload-cms` folder:
```bash
npm run dev
```
The Payload Admin Panel will be available at `http://localhost:3000/admin`. You can log in, add your first project, and it will instantly show up on the frontend!
