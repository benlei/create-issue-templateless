import { IssueListResponse } from '../src/types'
import * as fieldUtils from './../src/field-utils'
import * as github from './../src/github'
import * as inputs from './../src/inputs'
import * as issue from './../src/issue'
import { findIssueNumberByTitle } from './../src/issue'

describe('findIssueNumberByTitle', () => {
  beforeEach(() => {
    jest.clearAllMocks()
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
    expect(await findIssueNumberByTitle('My Title')).toEqual(123)

    jest.spyOn(github, 'openIssuesIterator').mockReturnValue(iterator())
    expect(await findIssueNumberByTitle('More titles')).toEqual(42)

    jest.spyOn(github, 'openIssuesIterator').mockReturnValue(iterator())
    expect(await findIssueNumberByTitle('unknown')).toEqual(null)
  })
})

describe('updateIssueByTitle', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(inputs, 'titleInput').mockReturnValue('My Title')
    jest.spyOn(inputs, 'fields').mockReturnValue([]) // ignore
    jest.spyOn(fieldUtils, 'renderIssueBody').mockReturnValue('My Body')
    jest.spyOn(issue, 'findIssueNumberByTitle').mockResolvedValue(123)
  })

  it('should not create issue if not found', async () => {
    jest.spyOn(issue, 'findIssueNumberByTitle').mockResolvedValue(null)

    expect(await issue.updateIssueByTitle()).toBeNull()
  })

  it('should update issue with expected params', async () => {
    const updateIssue = jest
      .spyOn(github, 'updateIssue')
      .mockResolvedValue({ data: { number: 123 } })

    await issue.updateIssueByTitle()

    expect(updateIssue).toHaveBeenCalledWith(123, 'My Title', 'My Body')
  })
})

describe('updateIssueByNumber', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(inputs, 'titleInput').mockReturnValue('My Title')
    jest.spyOn(fieldUtils, 'renderIssueBody').mockReturnValue('My Body')
    jest.spyOn(inputs, 'issueNumberInput').mockReturnValue('83')
  })

  it('should update issue with expected params', async () => {
    const updateIssue = jest
      .spyOn(github, 'updateIssue')
      .mockResolvedValue({ data: { number: 83 } })

    await issue.updateIssueByNumber()

    expect(updateIssue).toHaveBeenCalledWith(83, 'My Title', 'My Body')
  })
})

describe('createNewIssue', () => {
  beforeEach(() => {
    jest.clearAllMocks()
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
  it('should return all fields if not partial update', async () => {
    jest.spyOn(inputs, 'partialUpdateInput').mockReturnValue(false)
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
    jest.spyOn(inputs, 'partialUpdateInput').mockReturnValue(true)
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
