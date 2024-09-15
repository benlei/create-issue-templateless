export interface Field {
  key: string
  value: string
}

export interface IssueResponse {
  data: {
    number: number
    body?: string | null
  }
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
