// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { SQSClient, SendMessageBatchCommand } from '@aws-sdk/client-sqs';
import crypto from 'crypto';

const QUEUE_URL = '<queue-url>';
const NUMBER_OF_THREADS = 20;
const MESSAGES_TO_SEND = 200000;

const sqsClient = new SQSClient();
let messagesSent = 0;

async function run() {
    for (let i = 0; i < NUMBER_OF_THREADS; i++) {
        spawnThread({
            threadId: i,
            startTime: new Date()
        })
    }
}

function spawnThread(ctx) {
    new Promise(async () => {
        console.log(`[T_ID=${ctx.threadId}] Thread started, sending messages`);
        const commandInput = generateCommandInput();
        const command = new SendMessageBatchCommand(commandInput);
        try {
            await sqsClient.send(command);
            messagesSent += 10;
        } catch (e) {
            console.error(`[T_ID=${ctx.threadId}] Failed to send messages`);
            console.error(e);
        }

        const runTime = (new Date() - ctx.startTime) / 1000;
        const msgPerSec = Math.round(messagesSent / runTime * 100) / 100;

        console.log(`[T_ID=${ctx.threadId}] Thread done, messagesSent=${messagesSent}, runTime=${runTime}s, msgPerSec=${msgPerSec}`);
        if (messagesSent <= (MESSAGES_TO_SEND - (NUMBER_OF_THREADS*10))) {
            spawnThread(ctx);
        }
    });
}

function generateCommandInput() {
    const entries = [];
    for (let i = 0; i < 10; i++) {
        entries.push({
            Id: `message-${i}`,
            MessageBody: `document-${crypto.randomUUID()}`,
        });
    }

    const input = {
        QueueUrl: QUEUE_URL,
        Entries: entries
    }

    return input;
}

run();