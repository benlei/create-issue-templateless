import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as fieldUtils from '../src/field-utils'
import * as github from '../src/github'
import * as inputs from '../src/inputs'
import * as issue from '../src/issue'

vi.mock('@actions/core', () => ({
  setOutput: vi.fn(),
  setFailed: vi.fn(),
  warning: vi.fn(),
  getInput: vi.fn(),
  info: vi.fn()
}))

describe('createNewIssue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
    vi.spyOn(inputs, 'titleInput').mockReturnValue('My Title')
    vi.spyOn(inputs, 'fields').mockReturnValue([]) // ignore
    vi.spyOn(fieldUtils, 'renderIssueBody').mockReturnValue('My Body')
  })

  it('should create issue with expected params', async () => {
    const createIssue = vi
      .spyOn(github, 'createIssue')
      .mockResolvedValue({ data: { number: 123 } })

    await issue.createNewIssue()

    expect(createIssue).toHaveBeenCalledWith('My Title', 'My Body')
  })
})
