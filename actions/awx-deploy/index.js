const core = require('@actions/core');
const axios = require('axios');

async function triggerAWX() {
  try {
    const awxUrl = core.getInput('AWX_URL');
    const token = core.getInput('AWX_TOKEN');
    const workflowTemplateId = core.getInput('AWX_TEMPLATE_ID'); // ID of the workflow job template

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    // Step 1: Trigger the workflow job template
    const jobLaunchUrl = `${awxUrl}/api/v2/workflow_job_templates/${workflowTemplateId}/launch/`;
    const response = await axios.post(jobLaunchUrl, {}, { headers });
    const jobId = response.data.workflow_job;  // ID of the launched job

    console.log(`AWX workflow job triggered: ${jobId}`);

    // Step 2: Poll the job status
    const jobStatusUrl = `${awxUrl}/api/v2/workflow_jobs/${jobId}/`;
    let status = '';

    while (true) {
      const jobResponse = await axios.get(jobStatusUrl, { headers });
      status = jobResponse.data.status;

      console.log(`Current job status: ${status}`);

      if (status === 'successful') {
        console.log('Deployment successful!');
        return;
      } else if (['failed', 'error', 'canceled'].includes(status)) {
        throw new Error(`Deployment failed with status: ${status}`);
      }

      // Wait for 10 seconds before checking the status again
      await new Promise(resolve => setTimeout(resolve, 10000));
    }

  } catch (error) {
    core.setFailed(`Action failed: ${error.message}`);
  }
}

triggerAWX();
