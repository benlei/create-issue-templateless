import { explodeEnv } from 'explode-env'
import { Remarkable } from 'remarkable'
import split, { State } from 'split-string'
import { Field } from './types'

const excludeNonEscapedQuotesFromResult = (
  value: string,
  state: State
): boolean => {
  return value !== '\\' && (value !== '"' || state.prev() === '\\')
}

const splitFields = (str: string, delimiter: string): string[] => {
  const parts = split(str, {
    separator: delimiter,
    quotes: ['"'],
    keep: excludeNonEscapedQuotesFromResult
  })

  if (parts.length <= 2) {
    return parts
  }

  return [parts.shift() ?? '', parts.join(delimiter)]
}

export const renderIssueBody = (fields: Field[]): string =>
  fields.map(field => `### ${field.key}\n\n${field.value}`).join('\n\n')

const expandString = (value?: string): string =>
  explodeEnv(value ? value : '', {
    ignoreUnsetVars: true
  }).trim() ?? ''

export const renderFieldLine = (line: string): Field => {
  const [key, value] = splitFields(line, ',')
  return {
    key: expandString(key ?? '')
      .replace(/(\r\n|\n)/g, ' ')
      .trim(),
    value: expandString(value ?? '').trim()
  }
}

export const parseBodyFields = (body: string): Field[] => {
  const isHeading = (node: Remarkable.Token): boolean =>
    node.type === 'heading_open' && node.level === 0

  // content is always the node after the current
  const determineHeadingName = (
    nodes: Remarkable.Token[],
    headingOpenIndex: number
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  ): string => (nodes[headingOpenIndex + 1] as Remarkable.TextToken).content!

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const getHeadingStartLine = (node: Remarkable.Token): number => node.lines![0]
  const getHeadingEndingLine = (node: Remarkable.Token): number =>
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    node.lines![1]

  const bodySplit = body.split('\n')
  const result: Field[] = []
  const md = new Remarkable()
  const nodes = md.parse(body, {})

  for (let i = 0; i < nodes.length; i++) {
    if (!isHeading(nodes[i])) {
      continue
    }

    const startLine = getHeadingEndingLine(nodes[i])
    let endLine = bodySplit.length
    for (let j = i + 1; j < nodes.length; j++) {
      if (isHeading(nodes[j])) {
        endLine = getHeadingStartLine(nodes[j])
        break
      }
    }

    result.push({
      key: determineHeadingName(nodes, i),
      value: bodySplit.slice(startLine, endLine).join('\n').trim()
    })
  }

  return result
}

export const mergeFields = (
  baseFields: Field[],
  newFields: Field[]
): Field[] => {
  const result: Field[] = [...baseFields]
  for (const newField of newFields) {
    const existingField = result.find(field => field.key === newField.key)

    if (existingField) {
      existingField.value = newField.value
    } else {
      result.push(newField)
    }
  }

  return result
}
