import * as core from '@actions/core'
import {PullRequestContext} from './utils'

export interface LintRule {
  pattern: RegExp
  pattern_flags: string
  target: 'title' | 'body' | 'branch'
  message: string
}

export default function lint(
  rules: LintRule[],
  pullrequest: PullRequestContext
): string[] {
  const errors: (string | null)[] = []

  core.debug(`Linting data:`)
  core.debug(`title: ${pullrequest.title}`)
  core.debug(`body: ${pullrequest.body}`)
  core.debug(`branch: ${pullrequest.branch}`)

  for (const rule of rules) {
    errors.push(checkRule(rule, pullrequest))
  }

  return errors.filter(error => typeof error === 'string') as string[]
}

function checkRule(
  rule: LintRule,
  pullrequest: PullRequestContext
): string | null {
  const flags = rule.pattern_flags || 'g'

  switch (rule.target) {
    case 'title':
      return !pullrequest.title ||
        !new RegExp(rule.pattern, flags).test(pullrequest.title)
        ? rule.message
        : null
    case 'body':
      return !pullrequest.body ||
        !new RegExp(rule.pattern, flags).test(pullrequest.body)
        ? rule.message
        : null
    case 'branch':
      return !pullrequest.branch ||
        !new RegExp(rule.pattern, flags).test(pullrequest.branch)
        ? rule.message
        : null
  }
}
