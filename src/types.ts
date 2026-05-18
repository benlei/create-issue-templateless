export interface Field {
  key: string
  value: string
}

export interface IssueResponse {
  data: {
    number: number
    body?: string | null
  }
  status?: number
  headers?: Record<string, string | number | undefined>
}

export interface IssueListResponse {
  data: {
    number: number
    title: string
  }[]
}

export interface Repository {
  owner: string
  repo: string
}

export interface UpdateResponse {
  issue: IssueResponse
  status: 'created' | 'updated'
}
