// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

export const handler = async (event) => {
    await new Promise((resolve, _)=>setTimeout(resolve, 2000));
    const numberOfRecordsReceived = event.Records.length;
    console.log({numberOfRecordsReceived});
};
  