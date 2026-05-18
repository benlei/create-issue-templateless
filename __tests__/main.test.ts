/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as core from '@actions/core'
import * as inputs from '../src/inputs'
import * as issue from '../src/issue'
import * as main from '../src/main'

vi.mock('@actions/core', () => ({
  setOutput: vi.fn(),
  setFailed: vi.fn(),
  warning: vi.fn(),
  getInput: vi.fn(),
  info: vi.fn()
}))

let setOutputMock: ReturnType<typeof vi.spyOn>
let setFailedMock: ReturnType<typeof vi.spyOn>

describe('action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()

    vi.spyOn(inputs, 'titleInput').mockReturnValue('My Title')
    vi.spyOn(inputs, 'updateOption').mockReturnValue('default')
    vi.spyOn(inputs, 'issueNumberInput').mockReturnValue('')

    setOutputMock = vi.mocked(core.setOutput)
    setFailedMock = vi.mocked(core.setFailed)
  })
  it('should create issue with expected params', async () => {
    vi.spyOn(issue, 'createNewIssue').mockResolvedValue({
      data: { number: 123 }
    })

    await main.run()

    expect(setOutputMock).toHaveBeenCalledWith('issue-number', '123')
    expect(setOutputMock).toHaveBeenCalledWith('status', 'created')
  })

  it('should fail the workflow if an error occurs', async () => {
    vi.spyOn(issue, 'createNewIssue').mockRejectedValue(new Error('Test error'))

    await main.run()

    expect(setFailedMock).toHaveBeenCalledWith('Test error')
    expect(setOutputMock).toHaveBeenCalledWith('status', 'error')
  })

  it('should update issue by issue number when specified to', async () => {
    vi.spyOn(inputs, 'issueNumberInput').mockReturnValue('89')
    vi.spyOn(issue, 'updateIssueByNumber').mockResolvedValue({
      issue: { data: { number: 89 } },
      status: 'updated'
    })

    await main.run()

    expect(setOutputMock).toHaveBeenCalledWith('issue-number', '89')
    expect(setOutputMock).toHaveBeenCalledWith('status', 'updated')
  })

  it('should update issue by title when specified to', async () => {
    vi.spyOn(inputs, 'updateOption').mockReturnValue('replace')
    vi.spyOn(issue, 'updateIssueByTitle').mockResolvedValue({
      issue: { data: { number: 723 } },
      status: 'updated'
    })

    const setOutputMock = vi.spyOn(core, 'setOutput').mockReturnValue()

    await main.run()

    expect(setOutputMock).toHaveBeenCalledWith('issue-number', '723')
    expect(setOutputMock).toHaveBeenCalledWith('status', 'updated')
  })

  it('should not fail on error if failing on error is disabled', async () => {
    vi.spyOn(inputs, 'failOnErrorInput').mockReturnValue(false)
    vi.spyOn(issue, 'createNewIssue').mockRejectedValue(new Error('Test error'))

    await main.run()

    expect(setFailedMock).not.toHaveBeenCalled()
    expect(setOutputMock).toHaveBeenCalledWith('status', 'error')
  })
})
