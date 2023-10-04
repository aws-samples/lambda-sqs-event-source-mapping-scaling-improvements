#!/usr/bin/env node

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const cdk = require('aws-cdk-lib');
const { TheStack } = require('../lib/stack');

const app = new cdk.App();
new TheStack(app, 'sqs-esm-improvements', {});
