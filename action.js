const { getInput, setFailed, debug } = require('@actions/core');
const Lambda = require('aws-sdk/clients/lambda');
const fs = require('fs');

const AWS_SECRET_ACCESS_KEY = getInput('AWS_SECRET_ACCESS_KEY');
const AWS_ACCESS_KEY_ID = getInput('AWS_ACCESS_KEY_ID');
const AWS_REGION = getInput('AWS_REGION');

const lambda = new Lambda({
    apiVersion: '2015-03-31',
    region: AWS_REGION,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    accessKeyId: AWS_ACCESS_KEY_ID,
    maxRetries: 3,
    sslEnabled: true,
    logger: console,
});

async function run() {
    try {

        const functionName = getInput('function-name');
        const package = getInput('package');
        const aliasName = getInput('alias-name');
        const publish = getInput('publish') == 'true';
        const dryRun = getInput('dry-run') == 'true';

        debug(`Updating Function Name ${functionName} with ${package}!`);
      
        var zipBuffer = fs.readFileSync(`./${package}`);
        debug('Package put into memory buffer');
        debug(`AWS_REGION: ${AWS_REGION}`);

        const update_params = {
            FunctionName: functionName,
            Publish: publish, // publish new version
            ZipFile: zipBuffer,
            DryRun: dryRun
        };

        const data = await lambda.updateFunctionCode(update_params).promise();

        // avoid printing out environment variables:
        const data_log = (({ FunctionName, Version, RevisionId, LastUpdateStatus }) => ({ FunctionName, Version, RevisionId, LastUpdateStatus }))(data);
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
            console.log("\nsuccess! updated alias");
        }        

    } catch (error) {
        setFailed(error.message);
    }
}
  
run();