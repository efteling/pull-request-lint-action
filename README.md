# Pull Request Linter

[![build-test](https://github.com/efteling/pull-request-lint-action/actions/workflows/test.yml/badge.svg)](https://github.com/efteling/pull-request-lint-action/actions/workflows/test.yml) [![CodeQL](https://github.com/efteling/pull-request-lint-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/efteling/pull-request-lint-action/actions/workflows/codeql-analysis.yml)

Automatically lint pull requests and get feedback on what to change.

## Usage

### Example `.github/prlint.yml`

```yaml
rules:
  - target: title
    pattern: '^((GD|APP|VBLF)-[0-9]{1,5}: )'
    message: >
      The title of this PR does not start with the Jira ticket (APP-1234: Name of feature).
  - target: branch
    pattern: ^((feature\/(GD|APP|VBLF)-[0-9]{1,5}-)|(umbrella\/)|(release\/))([a-z0-9-._]+)$
    message: >
      This branch <strong>{{branch}}</strong> does not match the following structure: <code>feature/APP-1234-short-title</code>

```

### Rules

Each rule is required to have a `target`, `pattern` and `message` key. 

#### target

`target` can contain one of the following values: 
- title
- branch
- body

`pattern` should be a valid regular expression body without the // and flags. 

`message` will be shown when the target could not be successfully matched against the regular expression.


### Create Workflow

Create a workflow (eg: `.github/workflows/prlint.yml` see [Creating a Workflow file](https://help.github.com/en/articles/configuring-a-workflow#creating-a-workflow-file)) to utilize the pull request linter action with content:

```yml
name: "Pull Request Linter"
on:
  pull_request:
    types: [opened, edited]

jobs:
  comment:
    permissions:
      contents: read
      pull-requests: write
    runs-on: ubuntu-latest
    steps:
    - uses: efteling/pull-request-lint-action@main
      with:
        repo-token: "${{ secrets.GITHUB_TOKEN }}"
```

_Note: This grants access to the `GITHUB_TOKEN` so the action can make calls to GitHub's rest API_

#### Inputs

Various inputs are defined in [`action.yml`](action.yml) to let you configure the labeler:

| Name | Description | Default |
| - | - | - |
| `repo-token` | Token to use to authorize label changes. Typically the GITHUB_TOKEN secret, with `contents:read` and `pull-requests:write` access | N/A |
| `configuration-path` | The path for the pull request lint rules configuration | `.github/prlint.yml` |
| `comment-table-header` | The title of the report table when found one or more issues. | `Fails`
| `comment-intro` | The intro of the report, rendered above the table when found one or more issues. | `:wave: Hi There!`
| `comment-body` | The message of the report, rendered below the table when found one or more issues. | [See action.yml](action.yml)

# Contributions

Contributions are welcome! See the [Contributor's Guide](CONTRIBUTING.md).
