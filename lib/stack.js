// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const { Stack, Duration, CfnOutput } = require('aws-cdk-lib');
const lambda = require('aws-cdk-lib/aws-lambda');
const sqs = require('aws-cdk-lib/aws-sqs');
const lambdaEventSources = require('aws-cdk-lib/aws-lambda-event-sources');
const cloudWatch = require('aws-cdk-lib/aws-cloudwatch');
const path = require('path');

class TheStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // Document processing resources
    const documentQueue = new sqs.Queue(this, 'DocumentQueue',{
      visibilityTimeout: Duration.seconds(60)
    });
    const documentsEventSource = new lambdaEventSources.SqsEventSource(documentQueue, {
      batchSize: 1,
      enabled: false
    });

    const processDocumentFunction = new lambda.Function(this, 'ProcessDocument', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, './../src/process-document')),
      memorySize: 256,
      timeout: Duration.seconds(30),
      events: [documentsEventSource]
    });

    new CfnOutput(this, 'QueueUrl', {
      value: documentQueue.queueUrl
    });

    // CloudWatch Dashboard
    const cwDashboard = new cloudWatch.Dashboard(this, 'LambdaSqsEsmScalingDemoDashboard', {
      start: '-PT30M'
    });

    const cwWidget = new cloudWatch.GraphWidget({
      title: 'Function concurrency / Messages the in queue',
      width: 24,
      height: 12,
      liveData: true,
      period: Duration.seconds(60),
      view: cloudWatch.GraphWidgetView.TIME_SERIES,
      left: [
        processDocumentFunction.metric('ConcurrentExecutions', {
          color: '#08aad2',
          label: 'Function concurrency',
          statistic: 'max'
        })
      ],
      right: [
        documentQueue.metricApproximateNumberOfMessagesVisible({
          color: '#f89256',
          label: 'Messages in the queue',
          statistic: 'max'
        })
      ]
    });

    cwDashboard.addWidgets(cwWidget);
  }
}

module.exports = { TheStack }
