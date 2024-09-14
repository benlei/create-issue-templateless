export interface Field {
  key: string
  value: string
}

export interface IssueResponse {
  data: {
    number: number
  }
}

export interface IssueListResponse {
  data: {
    number: number
    title: string
  }[]
}
