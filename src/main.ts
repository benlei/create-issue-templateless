import * as core from '@actions/core'
import { fields, titleInput } from './inputs'
import { createIssue, renderIssueBody } from './issue'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const result = await createIssue(titleInput(), renderIssueBody(fields()))
    core.setOutput('issue-id', result.data.id.toString())
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
