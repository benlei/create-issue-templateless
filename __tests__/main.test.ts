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
import * as update from '../src/update'

const fieldsInput = 'key1, value1\nkey2, value2'
const renderIssueBody = `
### key1

value1

### key2

value2
`.trim()

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(inputs, 'titleInput').mockReturnValue('My Title')
    jest.spyOn(inputs, 'fieldsInput').mockReturnValue(fieldsInput)
    jest.spyOn(inputs, 'updateByTitleInput').mockReturnValue(false)
    jest.spyOn(inputs, 'issueNumberInput').mockReturnValue('')
  })
  it('should create issue with expected params', async () => {
    const createIssue = jest
      .spyOn(issue, 'createIssue')
      .mockResolvedValue({ data: { number: 123 } })
    const setOutputMock = jest.spyOn(core, 'setOutput').mockReturnValue()

    await main.run()

    expect(createIssue).toHaveBeenCalledWith('My Title', renderIssueBody)
    expect(setOutputMock).toHaveBeenCalledWith('issue-number', '123')
  })

  it('should fail the workflow if an error occurs', async () => {
    jest.spyOn(issue, 'createIssue').mockRejectedValue(new Error('Test error'))
    const setFailedMock = jest
      .spyOn(core, 'setFailed')
      .mockImplementation(() => {})

    await main.run()

    expect(setFailedMock).toHaveBeenCalledWith('Test error')
  })

  it('should update issue by issue number when specified to', async () => {
    jest.spyOn(inputs, 'issueNumberInput').mockReturnValue('89')
    jest
      .spyOn(update, 'updateIssueByNumber')
      .mockResolvedValue({ data: { number: 89 } })

    const setOutputMock = jest.spyOn(core, 'setOutput').mockReturnValue()

    await main.run()

    expect(setOutputMock).toHaveBeenCalledWith('issue-number', '89')
  })

  it('should update issue by title when specified to', async () => {
    jest.spyOn(inputs, 'updateByTitleInput').mockReturnValue(true)
    jest
      .spyOn(update, 'updateIssueByTitle')
      .mockResolvedValue({ data: { number: 723 } })

    const setOutputMock = jest.spyOn(core, 'setOutput').mockReturnValue()

    await main.run()

    expect(setOutputMock).toHaveBeenCalledWith('issue-number', '723')
  })
})
