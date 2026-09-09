import {defineConfig} from 'cypress';
import codeCoverageTask from '@cypress/code-coverage/task';
import useBabelrc from '@cypress/code-coverage/use-babelrc';
import {makeBadge} from 'mocha-badge-generator/src/makeBadge.js';

export default defineConfig({
  video: false,
  screenshotOnRunFailure: false,
  e2e: {
    setupNodeEvents (on, config) {
      // implement node event listeners here

      // https://docs.cypress.io/guides/tooling/code-coverage.html#Install-the-plugin
      codeCoverageTask(on, config);
      on('file:preprocessor', useBabelrc);
      on('after:run', async (results) => {
        if (!results) {
          return;
        }
        await makeBadge({
          passes: results.totalPassed,
          failures: results.totalFailed,
          duration: results.totalDuration,
          speeds: {fast: 0, medium: 0, slow: 0},
          options: {
            // eslint-disable-next-line camelcase -- package API
            badge_output: 'doc-includes/tests-badge.svg'
          }
        });
      });
      return config;
    }
  }
});
