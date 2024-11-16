#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import 'source-map-support/register';
import { CdkSimpleRdsPublicStack } from '../lib/cdk-simple-rds-public-stack';

const app = new cdk.App();
new CdkSimpleRdsPublicStack(app, 'CdkSimpleRdsPublicStack', {
   env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
}});