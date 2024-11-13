# `ubiquity/task-board`

Agile-style project board for high priority tasks from all Ubiquity related organizations. Uses [github projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/quickstart-for-projects) API under the hood.

## How it works
1. On cron schedule the script fetches all available Ubiquity tasks from [devpool-directory#STORAGE](https://github.com/ubiquity/devpool-directory/blob/ec2612388d1cae27382372aad98a4f1d51ce12f4/devpool-issues.json)
2. The script filters only high priority tasks, i.e. with labels: `Priority: 3 (High)`, `Priority: 4 (Urgent)`, `Priority: 5 (Emergency)`
3. The script adds high priority tasks to the project board
4. The script removes irrelevant github issues from the project board (i.e. the ones that do not match the priority anymore)

## How to setup
Setup the following `env` variables for the repository:
```
# project board owner username
PROJECT_GITHUB_OWNER="ubiquity"

# project board number (may be fetched from github project board URL)
PROJECT_GITHUB_NUMBER="1"

# personal github PAT
ACCESS_TOKEN_GITHUB="MY_SECRET"

# required labels that must be present on the task for it to be added to the project board
REQUIRED_LABELS="Priority: 3 (High),Priority: 4 (Urgent),Priority: 5 (Emergency)"

```
