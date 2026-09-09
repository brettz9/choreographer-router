/* eslint-disable mocha/no-async-in-sync-tests, no-shadow,
  unicorn/no-return-array-push, unicorn/prefer-global-this -- Cypress command
  callbacks are asynchronous despite synchronous Mocha test functions. */
import {Orchestrator, Router} from '../../src/index.js';

describe('Router', () => {
  it('matches URLPattern routes, exposes named groups, and falls back', () => {
    /** @type {unknown[]} */
    const calls = [];
    cy.window().then(() => {
      const router = new Router(
        new Map([
          [new URLPattern({pathname: '/users/:id', search: '?ref=:ref'}),
            (params) => calls.push(['user', params])]
        ]),
        (path) => calls.push(['fallback', path])
      );
      router.trigger('/users/42?ref=nav#top').trigger('/users/42?ref=nav#top');
      router.trigger('/missing');
      expect(calls).to.deep.equal([
        ['user', {id: '42', ref: 'nav'}],
        ['fallback', '/missing']
      ]);
      expect(router.route('/books/:isbn', () => undefined)).to.equal(router);
      router.close();
    });
  });

  it('supports URLPattern instances and URI templates', () => {
    /** @type {unknown[]} */
    const calls = [];
    cy.window().then(() => {
      const router = new Router(new Map(), (path) => calls.push(path), {
        patterns: 'uritemplate'
      });
      router.route(
        new URLPattern({pathname: '/items/:id'}),
        (params) => calls.push(params)
      );
      router.route('/search{?q}', (params) => calls.push(params));
      router.trigger('/items/a%20b');
      router.trigger('/search?q=hello');
      expect(calls).to.deep.equal([{id: 'a%20b'}, {q: 'hello'}]);
      router.close();
    });
  });

  it('navigates to a registered route and can be closed', () => {
    /** @type {unknown[]} */
    const calls = [];
    cy.window().then(() => {
      const router = new Router(new Map([
        ['/next', () => calls.push('next')]
      ]));
      router.trigger('/next');
      expect(calls).to.deep.equal(['next']);
      router.close();
    });
  });
});

describe('Orchestrator', () => {
  /**
   * @param {import('../../src/orchestrator.js').Scene[]} scenes
   * @param {import('../../src/router.js').PatternSyntax} [patterns]
   */
  const setup = (scenes, patterns) => cy.window().then((window) => {
    const stage = window.document.createElement('main');
    window.document.body.append(stage);
    const orchestrator = new Orchestrator({stage, scenes, patterns});
    return {stage, orchestrator};
  });

  afterEach(() => {
    cy.window().then((window) => {
      window.document.querySelector('main')?.remove();
    });
  });

  it('renders, updates, replaces, and removes tag-name scenes', () => {
    setup([
      ['/users/:id', 'user-card'],
      ['/settings', 'settings-panel']
    ]).then(({stage, orchestrator}) => {
      orchestrator.trigger('/users/1');
      const firstScene = /** @type {HTMLElement} */ (stage.firstElementChild);
      expect(firstScene.localName).to.equal('user-card');
      expect(firstScene.dataset.id).to.equal('1');
      const scene = firstScene;
      orchestrator.trigger('/users/2');
      expect(stage.firstElementChild).to.equal(scene);
      expect(scene.dataset.id).to.equal('2');
      orchestrator.trigger('/settings');
      expect(stage.firstElementChild?.localName).to.equal('settings-panel');
      orchestrator.trigger('/missing');
      expect(stage.firstElementChild).to.be.null;
      orchestrator.close();
    });
  });

  it('runs callbacks and redirects', () => {
    /** @type {unknown[]} */
    const callbackCalls = [];
    setup([
      [
        '/callback/:id',
        /** @type {import('../../src/orchestrator.js').SceneCallback} */
        ((pattern, params) => {
          callbackCalls.push([pattern, params]);
        })
      ],
      ['/old', /** @type {Location} */ (/** @type {unknown} */ (
        new URL('/new', window.location.href)
      ))]
    ]).then(({stage, orchestrator}) => {
      orchestrator.trigger('/callback/7');
      expect(callbackCalls).to.deep.equal([
        ['/callback/:id', {id: '7'}]
      ]);
      orchestrator.trigger('/old');
      expect(window.location.pathname).to.equal('/new');
      expect(stage.children).to.have.length(0);
      orchestrator.close();
    });
  });

  it('uses URI-template scene patterns', () => {
    setup([
      ['/search{?q}', 'search-results']
    ], 'uritemplate').then(({stage, orchestrator}) => {
      orchestrator.trigger('/search?q=term');
      const scene = /** @type {HTMLElement} */ (stage.firstElementChild);
      expect(scene.dataset.q).to.equal('term');
      orchestrator.close();
    });
  });
});
