import { renderIssueBody } from '../field-utils'
import { updateIssue } from '../github'
import { issueNumber, titleInput, updateOption } from '../inputs'
import { UpdateResponse } from '../types'
import {
  determineFieldsForUpdate,
  findIssueNumberByTitle,
  issueExists
} from './base'
import { createNewIssue } from './create'

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
