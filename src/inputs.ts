import * as core from '@actions/core'
import * as dotenvExpand from 'dotenv-expand'
import { Field } from './types'

export const issueNumberInput = (): string =>
  core.getInput('issue-number', {
    required: false,
    trimWhitespace: true
  })

export const updateByTitleInput = (): boolean =>
  core.getInput('update-by-title', {
    required: false,
    trimWhitespace: true
  }) === 'true'

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
        return {
          key,
          value:
            dotenvExpand.expand({ parsed: { value: value.slice(1, -1) } })
              .parsed?.value ?? ''
        }
      }

      return { key, value: value ?? '' }
    })
