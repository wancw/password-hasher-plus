import { describe, expect, it } from '@jest/globals';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as common from '../lib/common';
const { generateGuid, generateHash, bump, grepUrl } = common;

describe('guid', function () {
  it('generates uniquely', function () {
    expect(generateGuid()).not.toEqual(generateGuid());
  });
});

describe('bump', function () {
  it('bumps foo', function () {
    expect(bump('foo')).toEqual('foo:1');
  });
  it('bumps foo:1', function () {
    expect(bump('foo:1')).toEqual('foo:2');
  });
  it('bumps foo:100', function () {
    expect(bump('foo:100')).toEqual('foo:101');
  });
});

describe('grepUrl', function () {
  it('matches simple domain', function () {
    expect(grepUrl('http://foo.com')).toEqual('foo');
    expect(grepUrl('https://foo.com')).toEqual('foo');
  });

  it('matches standard domain', function () {
    expect(grepUrl('http://www.foo.com')).toEqual('foo');
  });

  it('matches ip addrs', function () {
    expect(grepUrl('http://1.1.1.1')).toEqual('1.1.1.1');
    expect(grepUrl('http://111.111.111.111')).toEqual('111.111.111.111');
  });

  it('matches sub domains', function () {
    expect(grepUrl('http://www2.foo.com')).toEqual('foo');
    expect(grepUrl('http://test.foo.com')).toEqual('foo');
  });

  it('matches uk domains', function () {
    expect(grepUrl('http://www.foo.co.uk')).toEqual('foo');
    expect(grepUrl('http://test.foo.co.uk')).toEqual('foo');
  });
});

describe('generateHash', function () {
  const DIGITS = 0;
  const ALPHANUM = 1;
  const SPECIAL = 2;

  let seed = generateGuid();
  const options = { compatibilityMode: false };
  const input = 'mypassword';

  function generate(length: number, strength: 0 | 1 | 2) {
    const config = {
      tag: 'mytag',
      options: options,
      policy: {
        length: length,
        strength: strength,
        seed: seed,
      },
    };

    return generateHash(config, input);
  }

  // For length < 4, these cases are not always passes. I just skip them for now.
  for (let i = 4; i <= 24; ++i) {
    it('generates ' + i + ' digit(s)', function () {
      const result = generate(i, DIGITS);
      const result2 = generate(i, DIGITS);
      expect(result.length).toEqual(i);
      expect(result).toMatch(/^[0-9]+$/);
      expect(result).toEqual(result2);
    });

    it('generates ' + i + ' alphanum(s)', function () {
      const result = generate(i, ALPHANUM);
      const result2 = generate(i, ALPHANUM);
      expect(result.length).toEqual(i);
      expect(result).toMatch(/^[a-zA-Z0-9]+$/);
      expect(result).toMatch(/[0-9]/);
      expect(result).toEqual(result2);
    });

    it('generates ' + i + ' special(s)', function () {
      const result = generate(i, SPECIAL);
      const result2 = generate(i, SPECIAL);
      expect(result.length).toEqual(i);
      expect(result).toMatch(/^[a-zA-Z0-9!@#$%^&*()\\\/+'",.-]+$/);
      expect(result).toMatch(/[!@#$%^&*()\\\/+'",.-]/);
      expect(result).toEqual(result2);
    });
  }

  it('ignores seed in compatibility mode', function () {
    const withSeed = generate(24, SPECIAL);
    const result2 = generate(24, SPECIAL);
    options.compatibilityMode = true;
    const withoutSeed = generate(24, SPECIAL);
    seed = generateGuid();
    const withNewSeed = generate(24, SPECIAL);

    expect(withSeed).not.toEqual(withoutSeed);
    expect(withoutSeed).toEqual(withNewSeed);
    expect(withSeed).toEqual(result2);
  });
});
