import lint, {LintRule} from '../src/linter'
import {PullRequestContext} from '../src/utils'
import * as core from '@actions/core'

jest.mock('@actions/core')

beforeAll(() => {
  jest.spyOn(core, 'getInput').mockImplementation((name, options) => {
    return jest.requireActual('@actions/core').getInput(name, options)
  })
})

function createRule(rule: Partial<LintRule>): LintRule {
  return {
    pattern: /((GD|APP|VBLF)-[0-9]{1,5}: )/,
    pattern_flags: 'gm',
    target: 'title',
    message: 'Invalid title',
    ...rule
  }
}

function createContext(context: Partial<PullRequestContext>): PullRequestContext {
  return {
    number: 1,
    title: 'APP-1234 Change feature',
    body: null,
    branch: 'feature/app-1234-change-feature',
    last_commit: 'a1aa618',
    ...context
  }
}

describe('Linter', () => {
  it('returns error when lint rules are not met', () => {
    const context = createContext({title: 'My pull request title'})
    const rules: LintRule[] = [createRule({pattern: /((GD|APP|VBLF)-[0-9]{1,5}: )/})]

    const results = lint(rules, context)
    expect(results).toEqual(['Invalid title'])
  })
  it('returns NO error when lint rules are not met', () => {
    const context = createContext({title: 'APP-1234: My feature change'})
    const rules: LintRule[] = [createRule({pattern: /((GD|APP|VBLF)-[0-9]{1,5}: )/})]

    const results = lint(rules, context)
    expect(results).toEqual([])
  })
})
