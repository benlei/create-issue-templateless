import {
  parseBodyFields,
  renderFieldLine,
  renderIssueBody
} from '../src/render'
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

const renderedBodyWithEmbeddedFields = `
### Field 1

thefield1value with **bold** and *italic* text

### Another Field Name

Some value 1234

> Some Quoted Value

* list
* of
* items

Blah

### Final Heading

Final value
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
          'Some value 1234\n\n> Some Quoted Value\n\n* list\n* of\n* items\n\nBlah'
      },
      { key: 'Final Heading', value: 'Final value' }
    ])
  })
})

// describe('updateBodyFields', () => {
//   it('should update the body with the new fields', async () => {
//     const updatedBody = await updateBodyFields(renderedBodyWithEmbeddedFields, [
//       { key: 'Field 1', value: 'new value' }
//     ])
//     expect(updatedBody).toEqual('')
//   })
// })
