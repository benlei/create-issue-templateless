import { getOctokit } from '@actions/github'
import {
  defaults as defaultGitHubOptions,
  GitHub
} from '@actions/github/lib/utils'
import { retry } from '@octokit/plugin-retry'
import { githubTokenInput, repository } from './inputs'
import { getRetryOptions } from './retry-options'
import { IssueListResponse, IssueResponse } from './types'

const RetryAttempts = 3
const ExemptStatusCodes = [400, 401, 403, 404, 422]

const octokit = (): InstanceType<typeof GitHub> => {
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
      ...repository(),
      state: 'open'
    })

export const createIssue = async (
  title: string,
  body: string
): Promise<IssueResponse> =>
  await octokit().rest.issues.create({
    ...repository(),
    title,
    body
  })

export const updateIssue = async (
  issueNumber: number,
  title: string,
  body: string
): Promise<IssueResponse> =>
  await octokit().rest.issues.update({
    ...repository(),
    issue_number: issueNumber,
    title,
    body
  })

export const getIssue = async (issueNumber: number): Promise<IssueResponse> =>
  await octokit().rest.issues.get({
    ...repository(),
    issue_number: issueNumber
  })
