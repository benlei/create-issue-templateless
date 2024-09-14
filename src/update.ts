import { fields, issueNumberInput, titleInput } from './inputs'
import { findIssueNumber, renderIssueBody, updateIssue } from './issue'
import { IssueResponse } from './types'

export const updateIssueByTitle = async (): Promise<IssueResponse> => {
  const existingIssueNumber = await findIssueNumber(titleInput())
  if (!existingIssueNumber) {
    throw new Error('No issue found with the given title')
  }

  return await updateIssue(
    existingIssueNumber,
    titleInput(),
    renderIssueBody(fields())
  )
}

export const updateIssueByNumber = async (): Promise<IssueResponse> => {
  return await updateIssue(
    parseInt(issueNumberInput(), 10),
    titleInput(),
    renderIssueBody(fields())
  )
}
