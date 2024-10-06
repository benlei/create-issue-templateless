# benlei/create-issue-templateless

[![GitHub Super-Linter](https://github.com/benlei/create-issue-templateless/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/benlei/create-issue-templateless/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/benlei/create-issue-templateless/actions/workflows/check-dist.yml/badge.svg)](https://github.com/benlei/create-issue-templateless/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/benlei/create-issue-templateless/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/benlei/create-issue-templateless/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

This action can be used to help create (and update) issues that are formatted
similarly to how issues are formatted when filling out an issue template.

In particular this action expects a `fields` input where you can specify new
line separated entries formatted as `Field Title, Field Value`. If the field
value is quoted, the action will try to expand any environment variables within
the string. Version 1.4.x utilized
[dotenv-expand](https://www.npmjs.com/package/dotenv-expand) to expand
environment variables, but starting version 1.5
[explode-env](https://www.npmjs.com/package/explode-env) is utilized instead to
preserve environment variables that did not exist.

It does have options around updating either by issue number or by the exact same
issue title. Read more about the other inputs below.

## Inputs

<!-- markdownlint-disable MD013 -->

| Input Name      | Required | Default                    | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| --------------- | -------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `repository`    | no       | `${{ github.repository }}` | The repository to create/update issue                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `token`         | no       | `${{ github.token }}`      | The GitHub token to use for creating/updating issue                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `title`         | yes      | n/a                        | The title of the issue, and by default will try to create a new issue. If `update-option` is anything but `default`, it'll try to find the first Issue with an exact matching title. If `update-option` is `replace` it'll replace the found issue's fields with new fields. If it's `patch` it'll instead replace existing fields while appending new fields. Finally if it's `upsert` it'll try to replace the fields of the issue if it's found, otherwise will create a new issue. |
| `fields`        | yes      | n/a                        | The fields of the issue, in the format of `Field Name, Field Text`. Environment variables are expanded.                                                                                                                                                                                                                                                                                                                                                                                |
| `issue-number`  | no       | n/a                        | The issue number to attempt to update. If `update-option` is `default` or `replace`, this action will try to replace the entire fields of the issue with new fields. If it's `patch` it'll instead try to replace existing fields while appending new fields. Finally if it's `upsert` it'll try to replace the fields of the issue if it's found, otherwise will create a new issue.                                                                                                  |
| `update-option` | no       | `default`                  | Valid options are `default`, `replace`, `patch`, or `upsert`.                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `fail-on-error` | no       | `true`                     | Whether any error encountered should fail this action or not                                                                                                                                                                                                                                                                                                                                                                                                                           |

<!-- markdownlint-enable MD013 -->

## Outputs

<!-- markdownlint-disable MD013 -->

| Output Name    | Description                                                                                                                          |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `issue-number` | The repository's issue number that was created/updated                                                                               |
| `status`       | Whether or not an issue was created or updated, or if an error was encountered. Possible values are `created`, `updated`, or `error` |

<!-- markdownlint-enable MD013 -->

## Examples

### Basic Usage

```yaml
- name: Create Templateless Issue
  id: create-issue
  uses: benlei/create-issue-templateless@v1
  with:
    title: My Issue Title
    fields: |
      Release Name, hello-world
      Release Version, v1.0.0
```

### Passing in a file's contents to a field

````yaml
- name: Read package.json
  id: package
  uses: juliangruber/read-file-action@v1
  with:
    path: ./package.json

- name: Create Templateless Issue
  id: create-issue
  uses: benlei/create-issue-templateless@v1
  env:
    PACKAGE_JSON_BLOCK: |
      ```json
      ${{ steps.package.outputs.content }}
      ```
  with:
    title: 'Test Issue from CI'
    fields: |
      Release Name, hello-world
      Release Version, v1.0.0
      package.json, "${PACKAGE_JSON_BLOCK}"

- name: Close Issue
  uses: peter-evans/close-issue@v3
  with:
    issue-number: ${{ steps.create-issue.outputs.issue-number }}
````
