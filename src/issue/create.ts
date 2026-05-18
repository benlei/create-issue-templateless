import { renderIssueBody } from '../field-utils'
import { createIssue } from '../github'
import { fields, titleInput } from '../inputs'
import { IssueResponse } from '../types'

export const createNewIssue = async (): Promise<IssueResponse> =>
  await createIssue(titleInput(), renderIssueBody(fields()))
