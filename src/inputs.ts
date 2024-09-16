import * as core from '@actions/core'
import { context } from '@actions/github'
import { renderFieldLine } from './field-utils'
import { Field, Repository } from './types'

export const repositoryInput = (): string =>
  core.getInput('repository', {
    required: true,
    trimWhitespace: true
  })

export const issueNumberInput = (): string =>
  core.getInput('issue-number', {
    required: false,
    trimWhitespace: true
  })

export const titleInput = (): string =>
  core.getInput('title', {
    required: true,
    trimWhitespace: true
  })

export const fieldsInput = (): string =>
  core.getInput('fields', {
    required: true,
    trimWhitespace: true
  })

export const githubTokenInput = (): string =>
  core.getInput('token', {
    required: false
  })

export const failOnErrorInput = (): boolean =>
  core.getInput('fail-on-error', {
    required: false,
    trimWhitespace: true
  }) !== 'false'

export const updateOptionInput = (): string =>
  core.getInput('update-option', {
    required: false,
    trimWhitespace: true
  })

export const updateOption = (): string => {
  if (['default', 'replace', 'patch', 'upsert'].includes(updateOptionInput())) {
    return updateOptionInput()
  }

  return 'default'
}

export const fields = (): Field[] =>
  fieldsInput()
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(renderFieldLine)

export const repository = (): Repository => {
  const input =
    repositoryInput() || `${context.repo.owner}/${context.repo.repo}`
  const [owner, repo] = input.split('/', 2)
  if (!owner || !repo) {
    throw new Error(`Invalid repository input: ${input}`)
  }

  return { owner, repo }
}

export const issueNumber = (): number => parseInt(issueNumberInput(), 10)
