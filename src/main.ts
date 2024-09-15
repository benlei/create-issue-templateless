import * as core from '@actions/core'
import {
  failOnErrorInput,
  issueNumberInput,
  partialUpdateInput,
  updateByTitleInput
} from './inputs'
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
      core.info('Updating issue by number')
      const existingIssue = await updateIssueByNumber()
      core.setOutput('issue-number', existingIssue.data.number.toString())
      core.setOutput('status', 'updated')
    } else if (updateByTitleInput()) {
      core.info('Updating issue by title')
      const existingIssue = await updateIssueByTitle()
      if (existingIssue) {
        core.setOutput('issue-number', existingIssue.data.number.toString())
        core.setOutput('status', 'updated')
        return
      }

      if (partialUpdateInput()) {
        throw new Error('Issue not found')
      }

      core.info('Issue not found, creating new issue instead')
      const result = await createNewIssue()
      core.setOutput('issue-number', result.data.number.toString())
      core.setOutput('status', 'created')
    } else {
      core.info('Creating new issue')
      const result = await createNewIssue()
      core.setOutput('issue-number', result.data.number.toString())
      core.setOutput('status', 'created')
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (failOnErrorInput() && error instanceof Error)
      core.setFailed(error.message)
    core.setOutput('status', 'error')
  }
}
