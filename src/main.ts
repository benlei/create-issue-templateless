import * as core from '@actions/core'
import { issueNumberInput, updateByTitleInput } from './inputs'
import {
  createNewIssue,
  updateIssueByNumber,
  updateIssueByTitle
} from './issue'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    if (issueNumberInput()) {
      const existingIssue = await updateIssueByNumber()
      core.setOutput('issue-number', existingIssue.data.number.toString())
      core.setOutput('status', 'updated')
    } else if (updateByTitleInput()) {
      const existingIssue = await updateIssueByTitle()
      if (existingIssue) {
        core.setOutput('issue-number', existingIssue.data.number.toString())
        core.setOutput('status', 'updated')
      }

      const result = await createNewIssue()
      core.setOutput('issue-number', result.data.number.toString())
      core.setOutput('status', 'created')
    } else {
      const result = await createNewIssue()
      core.setOutput('issue-number', result.data.number.toString())
      core.setOutput('status', 'created')
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
    core.setOutput('status', 'error')
  }
}
