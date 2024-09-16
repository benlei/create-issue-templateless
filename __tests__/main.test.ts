/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

import * as core from '@actions/core'
import * as inputs from '../src/inputs'
import * as issue from '../src/issue'
import * as main from '../src/main'

let setOutputMock: jest.SpiedFunction<typeof core.setOutput>
let setFailedMock: jest.SpiedFunction<typeof core.setFailed>

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()

    jest.spyOn(inputs, 'titleInput').mockReturnValue('My Title')
    jest.spyOn(inputs, 'updateOption').mockReturnValue('default')
    jest.spyOn(inputs, 'issueNumberInput').mockReturnValue('')

    setOutputMock = jest.spyOn(core, 'setOutput').mockReturnValue()
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
  })
  it('should create issue with expected params', async () => {
    jest
      .spyOn(issue, 'createNewIssue')
      .mockResolvedValue({ data: { number: 123 } })

    await main.run()

    expect(setOutputMock).toHaveBeenCalledWith('issue-number', '123')
    expect(setOutputMock).toHaveBeenCalledWith('status', 'created')
  })

  it('should fail the workflow if an error occurs', async () => {
    jest
      .spyOn(issue, 'createNewIssue')
      .mockRejectedValue(new Error('Test error'))

    await main.run()

    expect(setFailedMock).toHaveBeenCalledWith('Test error')
    expect(setOutputMock).toHaveBeenCalledWith('status', 'error')
  })

  it('should update issue by issue number when specified to', async () => {
    jest.spyOn(inputs, 'issueNumberInput').mockReturnValue('89')
    jest
      .spyOn(issue, 'updateIssueByNumber')
      .mockResolvedValue({ issue: { data: { number: 89 } }, status: 'updated' })

    await main.run()

    expect(setOutputMock).toHaveBeenCalledWith('issue-number', '89')
    expect(setOutputMock).toHaveBeenCalledWith('status', 'updated')
  })

  it('should update issue by title when specified to', async () => {
    jest.spyOn(inputs, 'updateOption').mockReturnValue('replace')
    jest.spyOn(issue, 'updateIssueByTitle').mockResolvedValue({
      issue: { data: { number: 723 } },
      status: 'updated'
    })

    const setOutputMock = jest.spyOn(core, 'setOutput').mockReturnValue()

    await main.run()

    expect(setOutputMock).toHaveBeenCalledWith('issue-number', '723')
    expect(setOutputMock).toHaveBeenCalledWith('status', 'updated')
  })

  it('should not fail on error if failing on error is disabled', async () => {
    jest.spyOn(inputs, 'failOnErrorInput').mockReturnValue(false)
    jest
      .spyOn(issue, 'createNewIssue')
      .mockRejectedValue(new Error('Test error'))

    await main.run()

    expect(setFailedMock).not.toHaveBeenCalled()
    expect(setOutputMock).toHaveBeenCalledWith('status', 'error')
  })
})
