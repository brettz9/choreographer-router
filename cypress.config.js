import {defineConfig} from 'cypress';
import codeCoverageTask from '@cypress/code-coverage/task';

export default defineConfig({
  e2e: {
    setupNodeEvents (on, config) {
      // implement node event listeners here

      // https://docs.cypress.io/guides/tooling/code-coverage.html#Install-the-plugin
      codeCoverageTask(on, config);
    }
  }
});
