import { context, getOctokit } from '@actions/github'
import { githubToken } from './inputs'
import { Field } from './types'

export const createIssue = async (title: string, body: string) =>
  await getOctokit(githubToken()).rest.issues.create({
    ...context.repo,
    title,
    body
  })

export const renderIssueBody = (fields: Field[]): string =>
  fields.map(field => `### ${field.key}\n\n${field.value}`).join('\n\n')
