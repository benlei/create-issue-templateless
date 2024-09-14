import { Field, IssueListResponse } from '../src/types'
import * as inputs from './../src/inputs'
import * as issue from './../src/issue'
import { findIssueNumber, renderIssueBody } from './../src/issue'

const fields: Field[] = [
  { key: 'Field 1', value: 'thefield1value' },
  { key: 'Another Field Name', value: 'Some value 1234' }
]

const renderedBody = `
### Field 1

thefield1value

### Another Field Name

Some value 1234
`.trim()

describe('renderIssueBody', () => {
  it('should render the fields input like an issue template would', () => {
    expect(renderIssueBody(fields)).toEqual(renderedBody)
  })
})

describe('findIssueNumber', () => {
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

    jest.spyOn(issue, 'openIssuesIterator').mockReturnValue(iterator())
    expect(await findIssueNumber('My Title')).toEqual(123)

    jest.spyOn(issue, 'openIssuesIterator').mockReturnValue(iterator())
    expect(await findIssueNumber('More titles')).toEqual(42)

    jest.spyOn(issue, 'openIssuesIterator').mockReturnValue(iterator())
    expect(await findIssueNumber('unknown')).toEqual(null)
  })
})
