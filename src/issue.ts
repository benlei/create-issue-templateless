import { mergeFields, parseBodyFields, renderIssueBody } from './field-utils'
import {
  createIssue,
  getIssue,
  openIssuesIterator,
  updateIssue
} from './github'
import { fields, issueNumber, titleInput, updateOption } from './inputs'
import { Field, IssueResponse, UpdateResponse } from './types'

export const findIssueNumberByTitle = async (
  title: string
): Promise<number | null> => {
  for await (const response of openIssuesIterator()) {
    const issue = response.data.find(
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

export const updateIssueByTitle = async (): Promise<UpdateResponse> => {
  const existingIssueNumber = await findIssueNumberByTitle(titleInput())
  if (existingIssueNumber) {
    return {
      issue: await updateIssue(
        existingIssueNumber,
        titleInput(),
        renderIssueBody(await determineFieldsForUpdate(existingIssueNumber))
      ),
      status: 'updated'
    }
  }

  if (updateOption() === 'upsert') {
    return { issue: await createNewIssue(), status: 'created' }
  }

  throw new Error('Issue not found by title')
}

export const updateIssueByNumber = async (): Promise<UpdateResponse> => {
  if (await issueExists()) {
    return {
      issue: await updateIssue(
        issueNumber(),
        titleInput(),
        renderIssueBody(await determineFieldsForUpdate(issueNumber()))
      ),
      status: 'updated'
    }
  }

  if (updateOption() === 'upsert') {
    return { issue: await createNewIssue(), status: 'created' }
  }

  throw new Error('Issue not found by issue number')
}

export const createNewIssue = async (): Promise<IssueResponse> =>
  await createIssue(titleInput(), renderIssueBody(fields()))
