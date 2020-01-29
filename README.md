# Reproduce Instructions
* `npm install`
* `npm run build`
* deploy to AWS. To do this using Serverless:
  * update NEW_RELIC_ parameter values in serverless.yml
  * `npx serverless package`
  * `npx serverless deploy`
* configure the lambda's CloudWatch logs to stream to the New Relic lambda (https://docs.newrelic.com/docs/serverless-function-monitoring/aws-lambda-monitoring/get-started/enable-new-relic-monitoring-aws-lambda#stream-logs)
* Invoke the lambda with the test event defined in `debug/event.json`
* observe in the New Relic One dashboard for the lambda that it shows 2 AwsLambdaInvocation transactions even if only invoked once. One will be named `WebTransaction/Function/double-transaction-repro-dev-EchoLambda` and the other `WebTransaction/Custom/echo#POST`

# Running Locally with SAM Local

Invoke test event using SAM Local: `debug/run.sh`
