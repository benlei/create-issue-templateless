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
  })
  it('should create issue with expected params', async () => {
    jest.spyOn(inputs, 'titleInput').mockReturnValue('My Title')
    jest.spyOn(inputs, 'fieldsInput').mockReturnValue(fieldsInput)
    const createIssue = jest
      .spyOn(issue, 'createIssue')
      .mockResolvedValue({ data: { id: 123 } })
    const setOutputMock = jest
      .spyOn(core, 'setOutput')
      .mockImplementation((key, value) => {
        return jest.requireActual('@actions/core').setOutput(key, value)
      })

    await main.run()

    expect(createIssue).toHaveBeenCalledWith('My Title', renderIssueBody)
    expect(setOutputMock).toHaveBeenCalledWith('issue-id', '123')
  })

  it('should fail the workflow if an error occurs', async () => {
    jest.spyOn(inputs, 'titleInput').mockReturnValue('My Title')
    jest
      .spyOn(inputs, 'fieldsInput')
      .mockReturnValue('key1, value1\nkey2, value2')
    const createIssue = jest
      .spyOn(issue, 'createIssue')
      .mockRejectedValue(new Error('Test error'))
    const setFailedMock = jest
      .spyOn(core, 'setFailed')
      .mockImplementation(message => {
        return
      })

    await main.run()

    expect(setFailedMock).toHaveBeenCalledWith('Test error')
  })
})
