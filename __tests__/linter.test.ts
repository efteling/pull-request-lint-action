import lint, {LintRule} from '../src/linter'
import * as core from '@actions/core'

jest.mock('@actions/core')

beforeAll(() => {
  jest.spyOn(core, 'getInput').mockImplementation((name, options) => {
    return jest.requireActual('@actions/core').getInput(name, options)
  })
})

describe('Linter', () => {
  it('returns error when lint rules are not met', () => {
    const rules: LintRule[] = [
      {
        pattern: /A-Z/,
        pattern_flags: 'g',
        target: 'title',
        message: 'Invalid title'
      }
    ]

    const context = {
      number: 1,
      title: 'APP-1234: Change feature',
      body: null,
      branch: 'feature/app-1234-change-feature',
      last_commit: 'a1aa618'
    }

    const results = lint(rules, context)

    expect(results).toEqual(['Invalid title'])
  })
})
