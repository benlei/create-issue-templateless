import * as inputs from '../src/inputs'

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
