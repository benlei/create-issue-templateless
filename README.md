# benlei/create-issue-templateless

[![GitHub Super-Linter](https://github.com/benlei/create-issue-templateless/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/benlei/create-issue-templateless/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/benlei/create-issue-templateless/actions/workflows/check-dist.yml/badge.svg)](https://github.com/benlei/create-issue-templateless/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/benlei/create-issue-templateless/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/benlei/create-issue-templateless/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

This action can be used to help create issues that are formatted similarly to
how issues are formatted when filling out an issue template.

In particular this action expects a `fields` input where you can specify new
line separated entries formatted as `Field Title, Field Value`. If the field
value is quoted, it will be treated as a JSON string and will be parsed as
such... which enables you to put multiline text for a field value.

## Examples

### Basic Usage

````
- name: Create Templateless Issue
  id: create-issue
  uses: benlei/create-issue-templateless@v1
  with:
    title: My Issue Title
    fields: |
      Release Name, hello-world
      Release Version, v1.0.0
      YAML, "```yaml\nhello: world\nfoo: bar\n```"
````

### Passing in a file's contents to a field

````
- name: Read package.json
  id: package
  uses: juliangruber/read-file-action@v1
  with:
    path: ./package.json

- name: Create Templateless Issue
  id: create-issue
  uses: benlei/create-issue-templateless@v1
  id:
  with:
    title: My Issue Title
    fields: |
      Release Name, hello-world
      Release Version, v1.0.0
      package.json, ${{ toJSON(format('```json\n{0}\n```', steps.package.outputs.content)) }}

- name: Close Issue
  uses: peter-evans/close-issue@v3
  with:
    issue-number: ${{ steps.create-issue.outputs.issue-number }}
````
