import * as core from '@actions/core'
import { Field } from './types'

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
  core.getInput('github-token', {
    required: false
  })

export const fields = (): Field[] =>
  fieldsInput()
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => {
      const [key, value] = line.split(',', 2).map(field => field.trim())

      if (value && value.startsWith('"') && value.endsWith('"')) {
        return { key, value: JSON.parse(value) }
      }

      return { key, value: value ?? '' }
    })
