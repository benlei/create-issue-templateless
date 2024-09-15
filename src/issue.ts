import { mergeFields, parseBodyFields, renderIssueBody } from './field-utils'
import {
  createIssue,
  getIssue,
  openIssuesIterator,
  updateIssue
} from './github'
import { fields, issueNumber, partialUpdateInput, titleInput } from './inputs'
import { Field, IssueResponse } from './types'

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

export const determineFieldsForUpdate = async (
  issueNumber: number
): Promise<Field[]> => {
  if (!partialUpdateInput()) {
    return fields()
  }

  const response = await getIssue(issueNumber)
  if (!response.data.body) {
    throw new Error('Issue body is empty')
  }

  return mergeFields(parseBodyFields(response.data.body), fields())
}

export const updateIssueByTitle = async (): Promise<IssueResponse | null> => {
  const existingIssueNumber = await findIssueNumberByTitle(titleInput())
  if (!existingIssueNumber) {
    return null
  }

  return await updateIssue(
    existingIssueNumber,
    titleInput(),
    renderIssueBody(await determineFieldsForUpdate(existingIssueNumber))
  )
}

export const updateIssueByNumber = async (): Promise<IssueResponse> => {
  return await updateIssue(
    issueNumber(),
    titleInput(),
    renderIssueBody(await determineFieldsForUpdate(issueNumber()))
  )
}

export const createNewIssue = async (): Promise<IssueResponse> =>
  await createIssue(titleInput(), renderIssueBody(fields()))
