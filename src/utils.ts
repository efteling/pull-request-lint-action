import * as github from '@actions/github'

export type PullRequestContext = {
  number: number
  title: string | null
  body: string | null
  branch: string | null
  last_commit: string
}

export type ClientType = ReturnType<typeof github.getOctokit>

export function getPullRequestContext(): PullRequestContext | null {
  const context = github.context
  const pullRequest = context.payload.pull_request
  if (!pullRequest) {
    return null
  }

  return {
    number: pullRequest.number,
    title: pullRequest.title ?? null,
    body: pullRequest.body ?? null,
    branch: pullRequest.head?.ref ?? null,
    last_commit: context.sha
  }
}

export async function fetchContent(
  client: ClientType,
  repoPath: string
): Promise<string> {
  const response: any = await client.rest.repos.getContent({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    path: repoPath,
    ref: github.context.sha
  })

  return Buffer.from(response.data.content, response.data.encoding).toString()
}
