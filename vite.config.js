import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        projects: resolve(__dirname, 'projects.html'),
        contact: resolve(__dirname, 'contact.html'),
        privacy: resolve(__dirname, 'privacy.html'),
        projectBurnFund: resolve(__dirname, 'project-burn-fund.html'),
        projectScoreboard: resolve(__dirname, 'project-scoreboard.html'),
        projectSantasAnonymous: resolve(__dirname, 'project-santas-anonymous.html'),
        projectNicu: resolve(__dirname, 'project-nicu.html'),
        projectBursaries: resolve(__dirname, 'project-bursaries.html')
      }
    }
  }
});
