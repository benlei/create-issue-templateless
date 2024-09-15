import { createIssue, openIssuesIterator, updateIssue } from './github'
import { fields, issueNumberInput, titleInput } from './inputs'
import { Field, IssueResponse } from './types'

export const findIssueNumber = async (
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

export const renderIssueBody = (fields: Field[]): string =>
  fields.map(field => `### ${field.key}\n\n${field.value}`).join('\n\n')

export const updateIssueByTitle = async (): Promise<IssueResponse | null> => {
  const existingIssueNumber = await findIssueNumber(titleInput())
  if (!existingIssueNumber) {
    return null
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

export const createNewIssue = async (): Promise<IssueResponse> =>
  await createIssue(titleInput(), renderIssueBody(fields()))
