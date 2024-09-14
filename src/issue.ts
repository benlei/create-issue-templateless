import { context, getOctokit } from '@actions/github'
import { githubTokenInput } from './inputs'
import { Field, IssueResponse } from './types'

export const createIssue = async (
  title: string,
  body: string
): Promise<IssueResponse> =>
  await getOctokit(githubTokenInput()).rest.issues.create({
    ...context.repo,
    title,
    body
  })

export const renderIssueBody = (fields: Field[]): string =>
  fields.map(field => `### ${field.key}\n\n${field.value}`).join('\n\n')
