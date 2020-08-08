const core = require("@actions/core");
const { execSync } = require("child_process");
const { getOctokit, context } = require("@actions/github");

const main = async () => {
  console.log(context);
  const repoName = context.repo.repo;
  const repoOwner = context.repo.owner;
  const githubToken = core.getInput("github-token");
  const testCommand = core.getInput("test-command") || "npx jest";

  const githubClient = getOctokit(githubToken);
  console.log(
    `Connected to the repositoty : https://github.com/${repoOwner}/${repoName}`
  );
  console.log(`Listing PRs with associated commits : ${context.sha}`);
  // const commitPRs = await githubClient.repos.listPullRequestsAssociatedWithCommit(
  //   {
  //     repo: repoName,
  //     owner: repoOwner,
  //     commit_sha: context.sha,
  //   }
  // );
  // console.log(commitPRs);
  // const prNumber = commitPRs.data[0].number;

  const codeCoverage = execSync(testCommand).toString();
  let coveragePercentage = execSync(
    "npx coverage-percentage ./coverage/lcov.info --lcov"
  ).toString();
  coveragePercentage = parseFloat(coveragePercentage).toFixed(2);

  const commentBody = `<p>Total Coverage: <code>${coveragePercentage}</code></p>
<details><summary>Coverage report</summary>
<p>
<pre>${codeCoverage}</pre>
</p>
</details>`;

  await githubClient.repos.createCommitComment({
    repo: repoName,
    owner: repoOwner,
    commit_sha: context.sha,
    body: commentBody,
  });
  // await githubClient.issues.createComment({
  //   repo: repoName,
  //   owner: repoOwner,
  //   body: commentBody,
  //   issue_number: prNumber,
  // });
};

main().catch((err) => core.setFailed(err.message));
