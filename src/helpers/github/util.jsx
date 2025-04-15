import { Octokit } from "@octokit/rest";

export default async function GithubHelper(data) {
  const { accessToken, content, message, filename, json } = data;
  const repo = "siddoinghisjob/blog-code";
  const contentPath = `data/content/${filename}.md`;
  const jsonPath = `data/content/${filename}.json`;
  
  if (!accessToken || !content || !message || !json)
    return { error: "Missing required fields" };

  const [owner, repoName] = repo.split("/");
  const octokit = new Octokit({ auth: accessToken });

  try {
    // Get the latest commit to build upon
    const refData = await octokit.git.getRef({
      owner,
      repo: repoName,
      ref: "heads/main"
    });
    const commitSha = refData.data.object.sha;
    
    // Get the commit to retrieve the tree
    const commitData = await octokit.git.getCommit({
      owner,
      repo: repoName,
      commit_sha: commitSha
    });
    
    // Create blobs for both files
    const contentBlob = await octokit.git.createBlob({
      owner,
      repo: repoName,
      content: Buffer.from(content, "utf-8").toString("base64"),
      encoding: "base64"
    });
    
    const jsonBlob = await octokit.git.createBlob({
      owner,
      repo: repoName,
      content: Buffer.from(json, "utf-8").toString("base64"),
      encoding: "base64"
    });
    
    // Create a new tree with both files
    const newTree = await octokit.git.createTree({
      owner,
      repo: repoName,
      base_tree: commitData.data.tree.sha,
      tree: [
        {
          path: contentPath,
          mode: "100644", // regular file
          type: "blob",
          sha: contentBlob.data.sha
        },
        {
          path: jsonPath,
          mode: "100644", // regular file
          type: "blob",
          sha: jsonBlob.data.sha
        }
      ]
    });
    
    // Create a new commit
    const newCommit = await octokit.git.createCommit({
      owner,
      repo: repoName,
      message,
      tree: newTree.data.sha,
      parents: [commitSha]
    });
    
    // Update the reference to point to the new commit
    await octokit.git.updateRef({
      owner,
      repo: repoName,
      ref: "heads/main",
      sha: newCommit.data.sha
    });
    
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}