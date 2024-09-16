import * as core from '@actions/core'
import { failOnErrorInput, issueNumberInput, updateOption } from './inputs'
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
      core.info(
        `Using ${updateOption()} strategy and fetching issue by issue number`
      )
      const response = await updateIssueByNumber()
      core.setOutput('issue-number', response.issue.data.number.toString())
      core.setOutput('status', response.status)
    } else if (updateOption() !== 'default') {
      core.info(
        `Using ${updateOption()} strategy and searching for issue by title`
      )
      const response = await updateIssueByTitle()
      core.setOutput('issue-number', response.issue.data.number.toString())
      core.setOutput('status', response.status)
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
