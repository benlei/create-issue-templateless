import { mergeFields, parseBodyFields } from '../field-utils'
import { getIssue, openIssuesIterator } from '../github'
import { fields, issueNumber, updateOption } from '../inputs'
import { Field } from '../types'

export const findIssueNumberByTitle = async (
  title: string
): Promise<number | null> => {
  for await (const response of openIssuesIterator()) {
    // Handle both old and new Octokit response formats
    const issues = Array.isArray(response) ? response : response.data
    const issue = issues.find(
      (issue: { title: string }) => issue.title === title
    )

    if (issue) return issue.number
  }

  return null
}

/* eslint-disable  @typescript-eslint/no-explicit-any */
const hasStatusField = (error: any): error is { status: number } => {
  return error && typeof error.status === 'number'
}

export const issueExists = async (): Promise<boolean> => {
  try {
    await getIssue(issueNumber())
    return true
  } catch (error) {
    if (hasStatusField(error) && error.status === 404) {
      return false
    }

    throw error
  }
}

export const determineFieldsForUpdate = async (
  issueNumber: number
): Promise<Field[]> => {
  if (updateOption() !== 'patch') {
    return fields()
  }

  const response = await getIssue(issueNumber)
  if (!response.data.body) {
    throw new Error('Issue body is empty')
  }

  return mergeFields(parseBodyFields(response.data.body), fields())
}
