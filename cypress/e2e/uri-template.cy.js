import UriTemplate from '../../src/uri-template.js';

describe('UriTemplate', () => {
  it('fills templates from objects and callbacks', () => {
    const template = new UriTemplate(
      'https://example.com{/segments*}{?query,empty,missing}'
    );

    expect(template.toString()).to.equal(
      'https://example.com{/segments*}{?query,empty,missing}'
    );
    expect(template.varNames).to.deep.equal([
      'segments', 'query', 'empty', 'missing'
    ]);
    expect(template.fillFromObject({
      segments: /** @type {{[key: string]: string}} */ (/** @type {unknown} */ (
        ['one', 'two']
      )),
      query: 'hello world',
      empty: ''
    })).to.equal('https://example.com/one/two?query=hello%20world&empty=');
    expect(template.fill((name) => (name === 'query' ? 'a/b' : undefined))).
      to.equal('https://example.com?query=a%2Fb');
  });

  it('supports URI template operators and value shapes', () => {
    expect(new UriTemplate('{var}').fillFromObject({var: 'a b!'})).
      to.equal('a%20b%21');
    expect(new UriTemplate('{+var}').fillFromObject({var: 'a/b?c'})).
      to.equal('a/b?c');
    expect(new UriTemplate('{#var}').fillFromObject({var: 'a/b'})).
      to.equal('#a/b');
    expect(new UriTemplate('{.var}').fillFromObject({var: 'a', other: 'b'})).
      to.equal('.a');
    expect(new UriTemplate('{/var,other}').fillFromObject({
      var: 'a', other: 'b'
    })).to.equal('/a/b');
    expect(new UriTemplate('{;var,empty}').fillFromObject({
      var: 'a', empty: ''
    })).to.equal(';var=a;empty');
    expect(new UriTemplate('{?list*}').fillFromObject({
      list: /** @type {{[key: string]: string}} */ (/** @type {unknown} */ (
        ['a', 'b']
      ))
    })).to.equal('?list=a&list=b');
    expect(new UriTemplate('{?keys*}').fillFromObject({
      keys: {a: '1', b: '2'}
    })).to.equal('?a=1&b=2');
    expect(new UriTemplate('{?keys}').fillFromObject({
      keys: {a: '1', b: '2'}
    })).to.equal('?keys=a,1,b,2');
    expect(new UriTemplate('{var:3}').fillFromObject({var: 'abcdef'})).
      to.equal('abc');
  });

  it('parses scalar, list, object, and prefixed values', () => {
    expect(new UriTemplate('/users/{id}').fromUri('/users/42')).
      to.deep.equal({id: '42'});
    expect(new UriTemplate('{/segments*}').fromUri('/one/two')).
      to.deep.equal({segments: ['one', 'two']});
    expect(new UriTemplate('{?one,two}').fromUri('?one=1&two=2')).
      to.deep.equal({one: '1', two: '2'});
    expect(new UriTemplate('{?pairs*}').fromUri('?a=1&b=2')).
      to.deep.equal({pairs: {a: '1', b: '2'}});
    expect(new UriTemplate('{?list*}').fromUri('?list=a&list=b')).
      to.deep.equal({list: ['a', 'b']});
    expect(new UriTemplate('{+value}').fromUri('a/b')).
      to.deep.equal({value: 'a/b'});
    expect(new UriTemplate('{value}').fromUri('a%20b')).
      to.deep.equal({value: 'a b'});
  });

  it('returns undefined for malformed or non-matching values', () => {
    expect(new UriTemplate('/users/{id}').fromUri('/teams/42')).
      to.be.undefined;
    expect(new UriTemplate('/users/{id}/profile').fromUri('/users/42/extra')).
      to.be.undefined;
    expect(new UriTemplate('{?one,two}').fromUri('?one=1&two=')).
      to.deep.equal({one: '1', two: ''});
    expect(new UriTemplate('{/first}{/second}').fromUri('/one')).
      to.deep.equal({second: 'one'});
  });

  it('covers repeated, empty, and multi-variable parsing edges', () => {
    expect(new UriTemplate('{?list*}').fromUri('?list=a&list=b')).
      to.deep.equal({list: ['a', 'b']});
    expect(new UriTemplate('{?key,other*}').fromUri('?key=1&other=2&other=3')).
      to.deep.equal({key: '1', other: ['2', '3']});
    expect(new UriTemplate('{?empty,filled}').fromUri('?empty=&filled=1')).
      to.deep.equal({filled: '1'});
    expect(new UriTemplate('{first,second}').fromUri('one,two')).
      to.deep.equal({first: 'one', second: 'two'});
    expect(new UriTemplate('{first,second}').fromUri('one')).
      to.deep.equal({first: 'one'});
    expect(new UriTemplate('/users/{id}/profile').fromUri('/users/42')).
      to.be.undefined;
    expect(new UriTemplate('?a=&b=1').fromUri('?b=1')).to.deep.equal({b: '1'});
  });
});
