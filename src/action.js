const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const AWS = require('aws-sdk');

async function run() {
    try {

        const functionName = core.getInput('function-name');
        const package = core.getInput('package');
        const AWS_SECRET_ACCESS_KEY = core.getInput('AWS_SECRET_ACCESS_KEY');
        const AWS_ACCESS_KEY_ID = core.getInput('AWS_ACCESS_KEY_ID');
        const AWS_REGION = core.getInput('AWS_REGION');
        const aliasName = core.getInput('alias-name');
        const publish = core.getInput('publish') == 'true';
        const dryRun = core.getInput('dry-run') == 'true';

        console.log(`Updating Function Name ${functionName} with ${package}!`);
      
        var zipBuffer = fs.readFileSync(`./${package}`);
        core.debug('Package put into memory buffer');
        core.debug(`AWS_REGION: ${AWS_REGION}`);

        const lambda = new AWS.Lambda({
            apiVersion: '2015-03-31',
            region: AWS_REGION,
            secretAccessKey: AWS_SECRET_ACCESS_KEY,
            accessKeyId: AWS_ACCESS_KEY_ID,
            maxRetries: 3,
            sslEnabled: true,
            logger: console,
        });

        const update_params = {
            FunctionName: functionName,
            Publish: publish, // publish new version
            ZipFile: zipBuffer,
            DryRun: dryRun
        };

        const data = await lambda.updateFunctionCode(update_params).promise();

        // avoid printing out environment variables:
        const data_log = (({ FunctionName, FunctionArn, Version, RevisionId, LastUpdateStatus }) => ({ FunctionName, FunctionArn, Version, RevisionId, LastUpdateStatus }))(data);
        console.log("\nsuccess! updated lambda function:", data_log, "\n");

        console.log(`Updating Alias Name ${aliasName} to ${functionName}:${data.Version}!`);

        const alias_params = {
            FunctionName: functionName, /* required */
            Name: aliasName, /* required */
            FunctionVersion: data.Version,
            // RevisionId: 'STRING_VALUE',
            //RoutingConfig: {
            //  AdditionalVersionWeights: {
            //    '<AdditionalVersion>': 'NUMBER_VALUE',
            //  }
            //}
        };

        if (dryRun !== true) {
            const alias = await lambda.updateAlias(alias_params).promise();
            const alias_log = (({ AliasArn, Name, FunctionVersion, Description, RevisionId }) => ({ AliasArn, Name, FunctionVersion, Description, RevisionId }))(data);
            console.log("\nsuccess! updated alias:");
            console.log(alias_log);
        }        

    } catch (error) {
        core.setFailed(error.message);
    }
}
  
run();