import { context } from '@actions/github'
import { renderFieldLine } from '../field-utils'
import { Field, Repository } from '../types'
import {
  repositoryInput,
  issueNumberInput,
  fieldsInput,
  updateOptionInput
} from './rawInputs'

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
