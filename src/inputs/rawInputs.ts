import * as core from '@actions/core'

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
