import 'dotenv/config';
import GithubProject from 'github-project';

const PROJECT_GITHUB_OWNER = process.env.PROJECT_GITHUB_OWNER;
const PROJECT_GITHUB_NUMBER = process.env.PROJECT_GITHUB_NUMBER;
const GITHUB_PAT = process.env.GITHUB_PAT;
const REQUIRED_LABELS = process.env.REQUIRED_LABELS?.split(',');
const DEVPOOL_ISSUES_JSON_URL = 'https://raw.githubusercontent.com/ubiquity/devpool-directory/refs/heads/__STORAGE__/devpool-issues.json';

type ProjectBoardIssue = {
  id: string,
  content: {
    id: string,
    url: string,
  }
};

async function main() {
  try {
    // env validation
    if (!PROJECT_GITHUB_OWNER) throw Error('env: empty PROJECT_GITHUB_OWNER');
    if (!PROJECT_GITHUB_NUMBER) throw Error('env: empty PROJECT_GITHUB_NUMBER');
    if (!GITHUB_PAT) throw Error('env: empty GITHUB_PAT');
    if (!REQUIRED_LABELS) throw Error('env: empty REQUIRED_LABELS');

    // fetch github project board
    const project = await GithubProject.getInstance({
      owner: PROJECT_GITHUB_OWNER,
      number: +PROJECT_GITHUB_NUMBER,
      token: GITHUB_PAT,
    });

    // fetch all devpool issues
    let devpoolIssues = await fetch(DEVPOOL_ISSUES_JSON_URL).then(response => response.json());
    // filter only those that match required labels
    devpoolIssues = devpoolIssues.filter((devpoolIssue: { labels: { name: string; }[]; }) => devpoolIssue.labels.some((labelObject: { name: string; }) => REQUIRED_LABELS.includes(labelObject.name)));

    // fetch project issues
    const projectIssues = await project.items.list() as ProjectBoardIssue[];

    console.log('### Adding new issues to the project board ###');
    // for all devpool issues
    for (let devpoolIssue of devpoolIssues) {
      // if project board issue does not exist then create a new one
      const projectIssue = projectIssues.find(projectIssue => projectIssue.content.id === devpoolIssue.node_id);
      if (!projectIssue) {
        console.log('Adding new item to the project board:', devpoolIssue.html_url);
        await project.items.add(devpoolIssue.node_id); 
      } else {
        console.log('Item already exists in the project board:', devpoolIssue.html_url);
      }
    }

    console.log('### Removing irrelevant issue from the project board ###');
    // remove irrelevant issues from project board (i.e. the ones that no longer match priority label)
    for (let projectIssue of projectIssues) {
      // if project board issue does not exist in relevant devpool issues then remove it
      const devpoolIssue = devpoolIssues.find((devpoolIssue: { node_id: string; }) => devpoolIssue.node_id === projectIssue.content.id);
      if (!devpoolIssue) {
        console.log('Removing item from the project board:', projectIssue.content.url);
        await project.items.remove(projectIssue.id);
      } else {
        console.log('Keeping relevant item:', projectIssue.content.url);
      }
    }
  } catch (err) {
    console.log('Error:', err);
  }
}

main();
