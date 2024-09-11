const core = require('@actions/core');
const axios = require('axios');
const https = require('https');
const sslRootCAs = require('ssl-root-cas');


async function triggerAWX() {
  try {

    // Add SSL root CAs to the global HTTPS agent
    https.globalAgent.options.ca = sslRootCAs.create();


    const awxUrl = core.getInput('AWX_URL');
    const token = core.getInput('AWX_TOKEN');
    const workflowTemplateId = core.getInput('AWX_TEMPLATE_ID');
    const pullRequestBranch = "349-make-nodeengine-systemd-compatible" //core.getInput('PR_BRANCH');
    const pullRequestCommit = "53a60f07d85ecbbff87e483cfde40f6cce7a386e" //core.getInput('PR_COMMIT');
    const pullRequestUser = core.getInput('PR_USER');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    const extraVars = {
      oak_repo_branch: pullRequestBranch,
      oak_repo_commit: pullRequestCommit,
      username: pullRequestUser
    };

    // Print the URL, template ID, branch, and commit
    console.log(`Branch: ${pullRequestBranch}`);
    console.log(`Commit: ${pullRequestCommit}`);
    console.log(`Username: ${pullRequestUser}`);

    // Step 1: Trigger the workflow job template
    const jobLaunchUrl = `${awxUrl}/api/v2/workflow_job_templates/${workflowTemplateId}/launch/`;
    const response = await axios.post(jobLaunchUrl, { extra_vars: extraVars }, { headers });

    const jobId = response.data.workflow_job;  // ID of the launched job

    console.log(`Execution ID: ${jobId}`);

    // Step 2: Poll the job status
    const jobStatusUrl = `${awxUrl}/api/v2/workflow_jobs/${jobId}/`;
    let status = '';

    while (true) {
      const jobResponse = await axios.get(jobStatusUrl, { headers });
      status = jobResponse.data.status;

      console.log(`⚙️ Current job status: ${status} ⏳`);

      if (status === 'successful') {
        console.log('🎉 ✅ 🎉  Test deployment successful! 🎉 ✅ 🎉');
        return;
      } else if (['failed', 'error', 'canceled'].includes(status)) {
        throw new Error(` 🔴 Deployment failed with status: ${status} 🔴 `);
      }

      // Wait for 2 minutes before checking the status again
      await new Promise(resolve => setTimeout(resolve, 120000));
    }

  } catch (error) {
    core.setFailed(`Action failed: ${error.message}`);
  }
}

triggerAWX();
