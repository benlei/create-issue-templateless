import * as dotenvExpand from 'dotenv-expand'

import { Field } from './types'

export const renderIssueBody = (fields: Field[]): string =>
  fields.map(field => `### ${field.key}\n\n${field.value}`).join('\n\n')

export const renderFieldLine = (line: string): Field => {
  const [key, value] = line.split(',', 2).map(field => field.trim())

  if (value && value.startsWith('"') && value.endsWith('"')) {
    return {
      key,
      value:
        dotenvExpand.expand({ parsed: { value: value.slice(1, -1) } }).parsed
          ?.value ?? ''
    }
  }

  return { key, value: value ?? '' }
}
