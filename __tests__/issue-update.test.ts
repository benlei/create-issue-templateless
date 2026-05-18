import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as fieldUtils from '../src/field-utils'
import * as github from '../src/github'
import * as rawInputs from '../src/inputs/rawInputs'
import * as parsedInputs from '../src/inputs/parsedInputs'
import * as baseIssue from '../src/issue/base'
import * as createIssue from '../src/issue/create'
import * as issue from '../src/issue/update'

vi.mock('@actions/core', () => ({
  setOutput: vi.fn(),
  setFailed: vi.fn(),
  warning: vi.fn(),
  getInput: vi.fn(),
  info: vi.fn()
}))

describe('updateIssueByTitle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()

    vi.spyOn(rawInputs, 'titleInput').mockReturnValue('My Title')
    vi.spyOn(parsedInputs, 'fields').mockReturnValue([]) // ignore
    vi.spyOn(fieldUtils, 'renderIssueBody').mockReturnValue('My Body')
    vi.spyOn(baseIssue, 'findIssueNumberByTitle').mockResolvedValue(123)
    vi.spyOn(parsedInputs, 'updateOption').mockReturnValue('default')
  })

  it('should not create issue if not found by default', async () => {
    vi.spyOn(baseIssue, 'findIssueNumberByTitle').mockResolvedValue(null)

    await expect(async () => await issue.updateIssueByTitle()).rejects.toThrow()
  })

  it('should update issue with expected params', async () => {
    const updateIssue = vi
      .spyOn(github, 'updateIssue')
      .mockResolvedValue({ data: { number: 123 } })

    expect(await issue.updateIssueByTitle()).toEqual({
      issue: { data: { number: 123 } },
      status: 'updated'
    })

    expect(updateIssue).toHaveBeenCalledWith(123, 'My Title', 'My Body')
  })

  it('should create issue if is upsert option and issue not found', async () => {
    vi.spyOn(parsedInputs, 'updateOption').mockReturnValue('upsert')
    vi.spyOn(baseIssue, 'findIssueNumberByTitle').mockResolvedValue(null)

    const createIssue = vi
      .spyOn(github, 'createIssue')
      .mockResolvedValue({ data: { number: 123 } })

    expect(await issue.updateIssueByTitle()).toEqual({
      issue: { data: { number: 123 } },
      status: 'created'
    })
    expect(createIssue).toHaveBeenCalledWith('My Title', 'My Body')
  })
})

describe('updateIssueByNumber', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
    vi.spyOn(rawInputs, 'titleInput').mockReturnValue('My Title')
    vi.spyOn(fieldUtils, 'renderIssueBody').mockReturnValue('My Body')
    vi.spyOn(rawInputs, 'issueNumberInput').mockReturnValue('83')
    vi.spyOn(parsedInputs, 'updateOption').mockReturnValue('default')
    vi.spyOn(baseIssue, 'issueExists').mockResolvedValue(true)
    vi.spyOn(parsedInputs, 'fields').mockReturnValue([]) // ignore
  })

  it('should update issue with expected params', async () => {
    const updateIssue = vi
      .spyOn(github, 'updateIssue')
      .mockResolvedValue({ data: { number: 83 } })

    expect(await issue.updateIssueByNumber()).toEqual({
      issue: { data: { number: 83 } },
      status: 'updated'
    })

    expect(updateIssue).toHaveBeenCalledWith(83, 'My Title', 'My Body')
  })

  it('should create issue if is upsert', async () => {
    vi.spyOn(baseIssue, 'issueExists').mockResolvedValue(false)
    vi.spyOn(parsedInputs, 'updateOption').mockReturnValue('upsert')

    vi.spyOn(createIssue, 'createNewIssue').mockResolvedValue({
      data: { number: 83 }
    })

    expect(await issue.updateIssueByNumber()).toEqual({
      issue: { data: { number: 83 } },
      status: 'created'
    })
  })

  it('should throw error if issue not found', async () => {
    vi.spyOn(baseIssue, 'issueExists').mockResolvedValue(false)

    await expect(
      async () => await issue.updateIssueByNumber()
    ).rejects.toThrow()
  })
})
