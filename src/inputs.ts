import * as core from '@actions/core'

export const fieldsInput = () =>
  core.getInput('fields', {
    required: true,
    trimWhitespace: true
  })

export const githubToken = () =>
  core.getInput('github-token', {
    required: false
  })

export const fields = () =>
  fieldsInput()
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => {
      const [key, value] = line.split(',', 2).map(field => field.trim())
      return { key, value: value ?? '' }
    })
