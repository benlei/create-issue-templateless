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
the string.

It does have options around updating either by issue number or by the exact same
issue title. Read more about the other inputs below.

## Inputs

<!-- markdownlint-disable MD013 -->

| Input Name      | Required | Default                    | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| --------------- | -------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `repository`    | no       | `${{ github.repository }}` | The repository to create/update issue                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `github-token`  | no       | `${{ github.token }}`      | The GitHub token to use for creating/updating issue                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `title`         | yes      | n/a                        | The title of the issue                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `fields`        | yes      | n/a                        | The fields of the issue, in the format of `Field Name, Field Text`. If formatted as `Field Name, "Field Text"`, environment variables will be expanded within the text, which can be useful for long/multiline fields.                                                                                                                                                                                                                                                           |
| `issue-number`  | no       | n/a                        | For updating only - the issue number to update                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `update-option` | no       | `default`                  | Valid options are `default`, `replace`, `patch`, or `upsert`. `default` means that if `issue-number` is provided, it will only do a replace. `replace` will get/find the issue and then replace the entire body. `patch` will get/find the issue and then only update the fields provided. `upsert` will try to find/get the issue to replace its body, but if it is not found it will instead create a new issue instead. Any other option will be ignored/assumed as `default` |
| `fail-on-error` | no       | `true`                     | Whether any error encountered should fail this action or not                                                                                                                                                                                                                                                                                                                                                                                                                     |

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
