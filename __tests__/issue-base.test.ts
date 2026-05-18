import { beforeEach, describe, expect, it, vi } from 'vitest'
import { IssueListResponse } from '../src/types'
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

describe('findIssueNumberByTitle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  it('should find the issue number', async () => {
    vi.spyOn(inputs, 'titleInput').mockReturnValue('My Title')

    async function* iterator(): AsyncIterable<IssueListResponse> {
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

    vi.spyOn(github, 'openIssuesIterator').mockReturnValue(iterator())
    expect(await issue.findIssueNumberByTitle('My Title')).toEqual(123)

    vi.spyOn(github, 'openIssuesIterator').mockReturnValue(iterator())
    expect(await issue.findIssueNumberByTitle('More titles')).toEqual(42)

    vi.spyOn(github, 'openIssuesIterator').mockReturnValue(iterator())
    expect(await issue.findIssueNumberByTitle('unknown')).toEqual(null)
  })

  it('should find the issue number with octokit v7 response format', async () => {
    async function* iterator(): AsyncIterable<
      { title: string; number: number }[]
    > {
      yield [
        { title: 'Some title', number: 643 },
        { title: 'My Title', number: 456 }
      ]

      yield [
        { title: 'Next title', number: 7542 },
        { title: 'More titles', number: 789 }
      ]
    }

    /* eslint-disable @typescript-eslint/no-explicit-any */
    vi.spyOn(github, 'openIssuesIterator').mockReturnValue(iterator() as any)
    expect(await issue.findIssueNumberByTitle('My Title')).toEqual(456)

    vi.spyOn(github, 'openIssuesIterator').mockReturnValue(iterator() as any)
    expect(await issue.findIssueNumberByTitle('More titles')).toEqual(789)
    /* eslint-enable @typescript-eslint/no-explicit-any */
  })
})

describe('determineFieldsForUpdate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  it('should return all fields if not partial update', async () => {
    vi.spyOn(inputs, 'updateOption').mockReturnValue('default')
    vi.spyOn(inputs, 'fields').mockReturnValue([
      { key: 'field', value: 'value' },
      { key: 'foo', value: 'bar' }
    ])

    expect(await issue.determineFieldsForUpdate(123)).toEqual([
      { key: 'field', value: 'value' },
      { key: 'foo', value: 'bar' }
    ])
  })

  it('should merge fields if is partial update', async () => {
    vi.spyOn(inputs, 'updateOption').mockReturnValue('patch')
    vi.spyOn(github, 'getIssue').mockResolvedValue({
      data: {
        number: 123,
        body: '### field\n\norig value\n\n### hello\n\nworld'
      }
    })
    vi.spyOn(inputs, 'fields').mockReturnValue([
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
    vi.clearAllMocks()
    vi.restoreAllMocks()
    vi.spyOn(github, 'getIssue').mockResolvedValue({ data: { number: 123 } })
  })

  it('should return true if issue exists', async () => {
    expect(await issue.issueExists()).toBe(true)
  })

  it('should return false if issue does not exist', async () => {
    vi.spyOn(github, 'getIssue').mockRejectedValue({ status: 404 })
    expect(await issue.issueExists()).toBe(false)
  })

  it('should throw error if not 404', async () => {
    class FooError extends Error {
      status = 500
    }
    vi.spyOn(github, 'getIssue').mockRejectedValue(new FooError())
    await expect(async () => await issue.issueExists()).rejects.toThrow()
  })
})
