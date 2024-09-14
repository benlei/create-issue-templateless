import * as inputs from '../src/inputs'
import * as issue from '../src/issue'
import * as update from '../src/update'

describe('updateIssueByTitle', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(inputs, 'titleInput').mockReturnValue('My Title')
    jest.spyOn(inputs, 'fields').mockReturnValue([]) // ignore
    jest.spyOn(issue, 'renderIssueBody').mockReturnValue('My Body')
    jest.spyOn(issue, 'findIssueNumber').mockResolvedValue(123)
  })

  it('should throw an error if no issue is found with the given title', async () => {
    jest.spyOn(issue, 'findIssueNumber').mockResolvedValue(null)

    await expect(update.updateIssueByTitle()).rejects.toThrow(
      'No issue found with the given title'
    )
  })

  it('should update issue with expected params', async () => {
    const updateIssue = jest
      .spyOn(issue, 'updateIssue')
      .mockResolvedValue({ data: { number: 123 } })

    await update.updateIssueByTitle()

    expect(updateIssue).toHaveBeenCalledWith(123, 'My Title', 'My Body')
  })
})

describe('updateIssueByNumber', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(inputs, 'titleInput').mockReturnValue('My Title')
    jest.spyOn(issue, 'renderIssueBody').mockReturnValue('My Body')
    jest.spyOn(inputs, 'issueNumberInput').mockReturnValue('83')
  })

  it('should update issue with expected params', async () => {
    const updateIssue = jest
      .spyOn(issue, 'updateIssue')
      .mockResolvedValue({ data: { number: 83 } })

    await update.updateIssueByNumber()

    expect(updateIssue).toHaveBeenCalledWith(83, 'My Title', 'My Body')
  })
})
