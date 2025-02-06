#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ServerlessAppStack } from '../lib/serverlessapp-stack';

console.log("Starting CDK application...");
const app = new cdk.App();
console.log("App initialized");
new ServerlessAppStack(app, 'ServerlessAppStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT || '492545072733',
    region: process.env.CDK_DEFAULT_REGION || 'ap-south-1'
  },

});

console.log("Stack created");