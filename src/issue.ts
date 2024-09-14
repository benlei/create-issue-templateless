import { context, getOctokit } from '@actions/github'
import { defaults as defaultGitHubOptions } from '@actions/github/lib/utils'
import { retry } from '@octokit/plugin-retry'
import { githubTokenInput } from './inputs'
import { getRetryOptions } from './retry-options'
import { Field, IssueListResponse, IssueResponse } from './types'

const RetryAttempts = 3
const ExemptStatusCodes = [400, 401, 403, 404, 422]

const octokit = () => {
  const [retryOpts, requestOpts] = getRetryOptions(
    RetryAttempts,
    ExemptStatusCodes,
    defaultGitHubOptions
  )

  return getOctokit(
    githubTokenInput(),
    {
      retry: retryOpts,
      request: requestOpts
    },
    retry
  )
}

export const openIssuesIterator =
  (): AsyncIterableIterator<IssueListResponse> =>
    octokit().paginate.iterator('GET /repos/{owner}/{repo}/issues', {
      ...context.repo,
      state: 'open'
    })

export const findIssueNumber = async (
  title: string
): Promise<number | null> => {
  for await (const response of openIssuesIterator()) {
    const issue = response.data.find(
      (issue: { title: string }) => issue.title === title
    )

    if (issue) return issue.number
  }

  return null
}

export const createIssue = async (
  title: string,
  body: string
): Promise<IssueResponse> =>
  await octokit().rest.issues.create({
    ...context.repo,
    title,
    body
  })

export const renderIssueBody = (fields: Field[]): string =>
  fields.map(field => `### ${field.key}\n\n${field.value}`).join('\n\n')
