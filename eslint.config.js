import ashNazg from 'eslint-config-ash-nazg';

export default [
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
      }]
    }
  }
];
