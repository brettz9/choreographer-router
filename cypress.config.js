import {defineConfig} from 'cypress';
import codeCoverageTask from '@cypress/code-coverage/task';
import useBabelrc from '@cypress/code-coverage/use-babelrc';

export default defineConfig({
  video: false,
  e2e: {
    setupNodeEvents (on, config) {
      // implement node event listeners here

      // https://docs.cypress.io/guides/tooling/code-coverage.html#Install-the-plugin
      codeCoverageTask(on, config);
      on('file:preprocessor', useBabelrc);
      return config;
    }
  }
});
