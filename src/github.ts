import { Octokit } from '@octokit/rest'
import { paginateRest } from '@octokit/plugin-paginate-rest'
import { retry } from '@octokit/plugin-retry'
import { githubTokenInput, repository } from './inputs'
import { IssueListResponse, IssueResponse } from './types'

const RetryAttempts = 3
const ExemptStatusCodes = [400, 401, 403, 404, 422]

const MyOctokit = Octokit.plugin(paginateRest, retry)

const octokit = (): InstanceType<typeof MyOctokit> =>
  new MyOctokit({
    auth: githubTokenInput(),
    retry: {
      doNotRetry: ExemptStatusCodes
    },
    request: {
      retries: RetryAttempts
    }
  })

export const openIssuesIterator = (): AsyncIterable<IssueListResponse> =>
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
