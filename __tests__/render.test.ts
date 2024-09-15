import { renderFieldLine, renderIssueBody } from '../src/render'
import { Field } from '../src/types'

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

describe('renderFieldLine', () => {
  it('should parse a line of fields input into a Field object', () => {
    expect(renderFieldLine('Field 1, thefield1value')).toEqual({
      key: 'Field 1',
      value: 'thefield1value'
    })
  })

  it('should handle quoted values', () => {
    expect(renderFieldLine('Another Field Name, "Quoted Value"')).toEqual({
      key: 'Another Field Name',
      value: 'Quoted Value'
    })
  })

  it('should handle expanding env variables', () => {
    process.env.envVar57258 = 'some\nmultiline\nvalue'
    expect(renderFieldLine('Random Name, "${envVar57258}"')).toEqual({
      key: 'Random Name',
      value: 'some\nmultiline\nvalue'
    })
  })
})
