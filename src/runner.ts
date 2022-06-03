import * as core from '@actions/core'
import * as github from '@actions/github'
import * as yaml from 'js-yaml'

import lint, {LintRule} from './linter'
import generateReport from './report'
import {fetchContent, getPullRequestContext, ClientType} from './utils'

type Config = {
  rules: LintRule[]
}

const FEEDBACK_INDICATOR = `<!-- ci_comment_type: pull-request-lint-feedback -->\n`

export async function run(): Promise<void> {
  try {
    const token = core.getInput('repo-token', {required: true})
    const configPath = core.getInput('configuration-path', {required: true})
    const commentTableHeader = core.getInput('comment-table-header', {
      required: true
    })
    const commentIntro = core.getInput('comment-intro', {required: true})
    const commentBody = core.getInput('comment-body', {required: true})
    const pr = getPullRequestContext()

    if (pr === null || typeof pr.number !== 'number') {
      core.debug('Could not get pull request number from context, exiting')
      return
    }

    const client: ClientType = github.getOctokit(token)
    const configContent: string = await fetchContent(client, configPath)

    // loads (hopefully) a `{[label:string]: string | StringOrMatchConfig[]}`, but is `any`:
    const config = yaml.load(configContent) as Config

    // Start the linting of the pull request.
    const results = lint(config.rules, pr).map(error =>
      error.replace(/^\s+|\s+$/g, '')
    )

    // Generate the report based on the comment templates.
    const report = generateReport(results, {
      header: commentTableHeader,
      intro: commentIntro,
      body: commentBody,
      pullrequest: pr
    })

    core.debug(`Generated report: ${report}`)

    // Check if we need to update or create an new comment.
    // We do this is some steps;
    //   1. get all comments and filter the comment based
    //      containing the indicator.
    //   2. if it does not exist; create the comment
    //   3. if it exist; update the comment.
    const {repo, owner} = github.context.repo

    const {data: comments} = await client.rest.issues.listComments({
      owner,
      repo,
      issue_number: pr.number
    })

    // will hold the comment id if there is a comment with
    // the given indicator
    let comment_id: number | null = null

    core.debug(`Already existing comment id: ${comment_id}`)

    for (const comment of comments) {
      // filter the comment based containing the indicator.
      if (commentBody.includes(FEEDBACK_INDICATOR)) {
        comment_id = comment.id
        break
      }
    }

    if (!report) {
      if (comment_id !== null) {
        core.debug(`Deleting comment with id: ${comment_id}...`)

        client.rest.issues.deleteComment({
          comment_id,
          owner,
          repo
        })

        return
      }
    } else {
      if (comment_id === null) {
        const result = await client.rest.issues.createComment({
          issue_number: pr.number,
          owner,
          repo,
          body: `${FEEDBACK_INDICATOR}\n\n${report}`
        })

        return core.setFailed(
          `This PR does not met the required rules. See ${result.data.url} for more info. (1)`
        )
      } else {
        const result = await client.rest.issues.updateComment({
          comment_id,
          owner,
          repo,
          body: `${FEEDBACK_INDICATOR}\n\n${report}`
        })

        return core.setFailed(
          `This PR does not met the required rules. See ${result.data.url} for more info. (2)`
        )
      }
    }
  } catch (error: any) {
    core.error(error)
    core.setFailed(error.message)
  }
}
