import * as inputs from '../src/inputs'
import { repository } from '../src/inputs'

describe('fields', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should parse fields properly', () => {
    jest
      .spyOn(inputs, 'fieldsInput')
      .mockReturnValue('key1, value1\nkey2, value2')

    const result = inputs.fields()
    expect(result).toEqual([
      { key: 'key1', value: 'value1' },
      { key: 'key2', value: 'value2' }
    ])
  })

  it('should ignore empty lines with whitespaces', () => {
    jest
      .spyOn(inputs, 'fieldsInput')
      .mockReturnValue('key1, value1\n\n   \n\t\nkey2,   value2')

    const result = inputs.fields()
    expect(result).toEqual([
      { key: 'key1', value: 'value1' },
      { key: 'key2', value: 'value2' }
    ])
  })

  it('should technically key only line to have no value', () => {
    jest.spyOn(inputs, 'fieldsInput').mockReturnValue('key1, value1\nkey2,')

    const result = inputs.fields()
    expect(result).toEqual([
      { key: 'key1', value: 'value1' },
      { key: 'key2', value: '' }
    ])
  })

  it('should parse quoted value as a JSON', () => {
    const key2Value = '```yaml\nfoo: 123\nbar: baz\n```'
    process.env.MY_ENV_VAR = key2Value
    jest
      .spyOn(inputs, 'fieldsInput')
      .mockReturnValue(`key1, value1\nkey2, "\${MY_ENV_VAR}"\nkey3, 123`)

    const result = inputs.fields()
    expect(result).toEqual([
      { key: 'key1', value: 'value1' },
      { key: 'key2', value: key2Value },
      { key: 'key3', value: '123' }
    ])
  })
})

describe('repository', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should parse default repository properly', () => {
    process.env.GITHUB_REPOSITORY = 'owner/repo'
    jest.spyOn(inputs, 'repositoryInput').mockReturnValue('')

    expect(repository()).toEqual({ owner: 'owner', repo: 'repo' })
  })

  it('should parse input repository properly', () => {
    process.env.GITHUB_REPOSITORY = 'owner/repo'
    jest.spyOn(inputs, 'repositoryInput').mockReturnValue('foo/bar')

    expect(repository()).toEqual({ owner: 'foo', repo: 'bar' })
  })

  it('should throw an error if owner or repo is empty', () => {
    jest.spyOn(inputs, 'repositoryInput').mockReturnValue('foo')
    expect(() => repository()).toThrow()

    jest.spyOn(inputs, 'repositoryInput').mockReturnValue('/bar')
    expect(() => repository()).toThrow()
  })
})
