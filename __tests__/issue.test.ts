import { IssueListResponse } from '../src/types'
import * as fieldUtils from './../src/field-utils'
import * as github from './../src/github'
import * as inputs from './../src/inputs'
import * as issue from './../src/issue'

describe('findIssueNumberByTitle', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  it('should find the issue number', async () => {
    jest.spyOn(inputs, 'titleInput').mockReturnValue('My Title')

    async function* iterator(): AsyncIterableIterator<IssueListResponse> {
      yield {
        data: [
          { title: 'Some title', number: 643 },
          { title: 'My Title', number: 123 }
        ]
      }

      yield {
        data: [
          { title: 'Next title', number: 7542 },
          { title: 'More titles', number: 42 }
        ]
      }
    }

    jest.spyOn(github, 'openIssuesIterator').mockReturnValue(iterator())
    expect(await issue.findIssueNumberByTitle('My Title')).toEqual(123)

    jest.spyOn(github, 'openIssuesIterator').mockReturnValue(iterator())
    expect(await issue.findIssueNumberByTitle('More titles')).toEqual(42)

    jest.spyOn(github, 'openIssuesIterator').mockReturnValue(iterator())
    expect(await issue.findIssueNumberByTitle('unknown')).toEqual(null)
  })
})

describe('updateIssueByTitle', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()

    jest.spyOn(inputs, 'titleInput').mockReturnValue('My Title')
    jest.spyOn(inputs, 'fields').mockReturnValue([]) // ignore
    jest.spyOn(fieldUtils, 'renderIssueBody').mockReturnValue('My Body')
    jest.spyOn(issue, 'findIssueNumberByTitle').mockResolvedValue(123)
    jest.spyOn(inputs, 'updateOption').mockReturnValue('default')
  })

  it('should not create issue if not found by default', async () => {
    jest.spyOn(issue, 'findIssueNumberByTitle').mockResolvedValue(null)

    await expect(async () => await issue.updateIssueByTitle()).rejects.toThrow()
  })

  it('should update issue with expected params', async () => {
    const updateIssue = jest
      .spyOn(github, 'updateIssue')
      .mockResolvedValue({ data: { number: 123 } })

    expect(await issue.updateIssueByTitle()).toEqual({
      issue: { data: { number: 123 } },
      status: 'updated'
    })

    expect(updateIssue).toHaveBeenCalledWith(123, 'My Title', 'My Body')
  })

  it('should create issue if is upsert option and issue not found', async () => {
    jest.spyOn(inputs, 'updateOption').mockReturnValue('upsert')
    jest.spyOn(issue, 'findIssueNumberByTitle').mockResolvedValue(null)

    const createIssue = jest
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
    jest.clearAllMocks()
    jest.restoreAllMocks()
    jest.spyOn(inputs, 'titleInput').mockReturnValue('My Title')
    jest.spyOn(fieldUtils, 'renderIssueBody').mockReturnValue('My Body')
    jest.spyOn(inputs, 'issueNumberInput').mockReturnValue('83')
    jest.spyOn(inputs, 'updateOption').mockReturnValue('default')
    jest.spyOn(issue, 'issueExists').mockResolvedValue(true)
    jest.spyOn(inputs, 'fields').mockReturnValue([]) // ignore
  })

  it('should update issue with expected params', async () => {
    const updateIssue = jest
      .spyOn(github, 'updateIssue')
      .mockResolvedValue({ data: { number: 83 } })

    expect(await issue.updateIssueByNumber()).toEqual({
      issue: { data: { number: 83 } },
      status: 'updated'
    })

    expect(updateIssue).toHaveBeenCalledWith(83, 'My Title', 'My Body')
  })

  it('should create issue if is upsert', async () => {
    jest.spyOn(issue, 'issueExists').mockResolvedValue(false)
    jest.spyOn(inputs, 'updateOption').mockReturnValue('upsert')

    const createIssue = jest
      .spyOn(github, 'createIssue')
      .mockResolvedValue({ data: { number: 83 } })

    expect(await issue.updateIssueByNumber()).toEqual({
      issue: { data: { number: 83 } },
      status: 'created'
    })

    expect(createIssue).toHaveBeenCalledWith('My Title', 'My Body')
  })

  it('should throw error if issue not found', async () => {
    jest.spyOn(issue, 'issueExists').mockResolvedValue(false)

    await expect(
      async () => await issue.updateIssueByNumber()
    ).rejects.toThrow()
  })
})

describe('createNewIssue', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
    jest.spyOn(inputs, 'titleInput').mockReturnValue('My Title')
    jest.spyOn(inputs, 'fields').mockReturnValue([]) // ignore
    jest.spyOn(fieldUtils, 'renderIssueBody').mockReturnValue('My Body')
  })

  it('should create issue with expected params', async () => {
    const createIssue = jest
      .spyOn(github, 'createIssue')
      .mockResolvedValue({ data: { number: 123 } })

    await issue.createNewIssue()

    expect(createIssue).toHaveBeenCalledWith('My Title', 'My Body')
  })
})

describe('determineFieldsForUpdate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  it('should return all fields if not partial update', async () => {
    jest.spyOn(inputs, 'updateOption').mockReturnValue('default')
    jest.spyOn(inputs, 'fields').mockReturnValue([
      { key: 'field', value: 'value' },
      { key: 'foo', value: 'bar' }
    ])

    expect(await issue.determineFieldsForUpdate(123)).toEqual([
      { key: 'field', value: 'value' },
      { key: 'foo', value: 'bar' }
    ])
  })

  it('should merge fields if is partial update', async () => {
    jest.spyOn(inputs, 'updateOption').mockReturnValue('patch')
    jest.spyOn(github, 'getIssue').mockResolvedValue({
      data: {
        number: 123,
        body: '### field\n\norig value\n\n### hello\n\nworld'
      }
    })
    jest.spyOn(inputs, 'fields').mockReturnValue([
      { key: 'field', value: 'value' },
      { key: 'foo', value: 'bar' }
    ])

    expect(await issue.determineFieldsForUpdate(123)).toEqual([
      { key: 'field', value: 'value' },
      { key: 'hello', value: 'world' },
      { key: 'foo', value: 'bar' }
    ])
  })
})

describe('issueExists', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
    jest.spyOn(github, 'getIssue').mockResolvedValue({ data: { number: 123 } })
  })

  it('should return true if issue exists', async () => {
    expect(await issue.issueExists()).toBe(true)
  })

  it('should return false if issue does not exist', async () => {
    jest.spyOn(github, 'getIssue').mockRejectedValue({ status: 404 })
    expect(await issue.issueExists()).toBe(false)
  })

  it('should throw error if not 404', async () => {
    class FooError extends Error {
      status = 500
    }
    jest.spyOn(github, 'getIssue').mockRejectedValue(new FooError())
    await expect(async () => await issue.issueExists()).rejects.toThrow()
  })
})
