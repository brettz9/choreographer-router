import ashNazg from 'eslint-config-ash-nazg';

export default [
  {
    ignores: ['coverage/**', '.nyc_output/**']
  },
  ...ashNazg(['sauron', 'node']),
  {
    files: ['**/*.md/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        document: 'readonly',
        location: 'readonly',
        Orchestrator: 'readonly',
        Router: 'readonly',
        router: 'readonly',
        routes: 'readonly',
        fallback: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': ['error', {
        varsIgnorePattern: 'Router|UriTemplate|orchestrator',
        argsIgnorePattern: 'id|post|isbn'
      }],
      // The globals above let free-standing examples reference these names;
      //   other examples legitimately declare them, so don't flag the overlap.
      'no-shadow': 'off'
    }
  }
];
