import {
  mergeFields,
  parseBodyFields,
  renderFieldLine,
  renderIssueBody
} from '../src/field-utils'
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

const renderedBodyWithEmbeddedFields =
  `
### Field 1

thefield1value with **bold** and *italic* text

### Another Field Name

Some value 1234

> Some Quoted Value

* list
* of
* items

Blah
`.trim() +
  '\n\n```yaml\nheres a code block\n### not a real heading\n\nfoobar\n```\n\n' +
  `
### Final Heading

Final value`.trim()

describe('renderIssueBody', () => {
  it('should render the fields input like an issue template would', () => {
    expect(renderIssueBody(fields)).toEqual(renderedBody)
  })
})

describe('renderFieldLine', () => {
  it('should handle empty strings', () => {
    expect(renderFieldLine(' ')).toEqual({
      key: '',
      value: ''
    })
  })

  it('should parse a line of fields input into a Field object', () => {
    expect(renderFieldLine('Field 1, thefield1value, the fieldvalue2')).toEqual(
      {
        key: 'Field 1',
        value: 'thefield1value, the fieldvalue2'
      }
    )
  })

  it('should handle line with no commas', () => {
    expect(renderFieldLine('Field 1')).toEqual({
      key: 'Field 1',
      value: ''
    })
  })

  it('should handle line with commas but no value', () => {
    expect(renderFieldLine('Field 1,')).toEqual({
      key: 'Field 1',
      value: ''
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

describe('parseBodyFields', () => {
  it('should parse the body into fields', () => {
    const parsedFields = parseBodyFields(renderedBodyWithEmbeddedFields)
    expect(parsedFields).toEqual([
      {
        key: 'Field 1',
        value: 'thefield1value with **bold** and *italic* text'
      },
      {
        key: 'Another Field Name',
        value:
          'Some value 1234\n\n> Some Quoted Value\n\n* list\n* of\n* items\n\nBlah\n\n```yaml\nheres a code block\n### not a real heading\n\nfoobar\n```'
      },
      {
        key: 'Final Heading',
        value: 'Final value'
      }
    ])
  })
})

describe('mergeFields', () => {
  it('should append fields if there are no dups', () => {
    expect(
      mergeFields(
        [
          { key: 'Field 1', value: 'thefield1value' },
          { key: 'Field 2', value: 'thefield2value' }
        ],
        [{ key: 'Field 3', value: 'thefield3value' }]
      )
    ).toEqual([
      { key: 'Field 1', value: 'thefield1value' },
      { key: 'Field 2', value: 'thefield2value' },
      { key: 'Field 3', value: 'thefield3value' }
    ])
  })

  it('should merge fields if there are dups', () => {
    expect(
      mergeFields(
        [
          { key: 'Field 1', value: 'thefield1value' },
          { key: 'Field 2', value: 'thefield2value' }
        ],
        [{ key: 'Field 1', value: 'thefield3value' }]
      )
    ).toEqual([
      { key: 'Field 1', value: 'thefield3value' },
      { key: 'Field 2', value: 'thefield2value' }
    ])
  })

  it('should merge + append as appropriate', () => {
    expect(
      mergeFields(
        [
          { key: 'Field 1', value: 'thefield1value' },
          { key: 'Field 2', value: 'thefield2value' }
        ],
        [
          { key: 'Field 3', value: 'thefield3value' },
          { key: 'Field 2', value: 'thefield4value' }
        ]
      )
    ).toEqual([
      { key: 'Field 1', value: 'thefield1value' },
      { key: 'Field 2', value: 'thefield4value' },
      { key: 'Field 3', value: 'thefield3value' }
    ])
  })
})
