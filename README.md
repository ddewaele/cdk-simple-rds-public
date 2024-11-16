# CDK Simple Public RDS

## Stack

This project is an AWS Cloud Development Kit (CDK) application that provisions

- a public RDS PostgreSQL database.

![](./docs/ec2-rds.png)

It has the following features

### Publically accessible

The DB instance is an internet-facing instance. It is publically accesible (so has a public hostname associated with it) and providing the appropriate security groups are setup it will be accessible from the internet by anyone.

## DB Logs

Both the Postgres and Upgrade DB logs are exported to CloudWatch.
This means you will get easy access to the logs by cloudwatch through higly durable AWS storage.

## Performance Insights

Performance insights is enabled.
This will allow you to get a better insight in how the RDS instance is performing, what queries are slow running, and what needs to be optimized.

## Backups

Automated backups have been setup with a 30 day retention policy.
This means you will not only get daily automated snapshots created for you, but you also get PITR capabilities.

## Delete protection

Delete protection is disabled for this demo. For production usage this should be enabled so you don't accidently remove the database.

## Master database password

One of the resources this stack creates is an AWS SecretsManager secret that contains the master postgres password.
This is something that the RDS construct does by default.
It allows for secure storage of your master password.

You can fetch this secret via the AWS console of via the AWS CLI

```
aws secretsmanager get-secret-value --secret-id <secret-arn>
```

This will return the following JSON string where the password will be included

```
{
    "ARN": "arn:aws:secretsmanager:eu-central-1:ACCOUNT_ID:secret:InstanceSecretabc-sBNmMQ",
    "Name": "InstanceSecretabc",
    "VersionId": "a16fde39-28b5-4aa1-bb81-5e0e9b200a35",
    "SecretString": "{\"password\":\"SuperSecret",\"engine\":\"postgres\",\"port\":5432,\"dbInstanceIdentifier\":\"new-database\",\"host\":\"new-database.cr7dks4kzrrf.eu-central-1.rds.amazonaws.com\",\"username\":\"postgres\"}",
    "VersionStages": [
        "AWSCURRENT"
    ],
    "CreatedDate": "2024-11-16T11:42:05.362000+01:00"
}
```

## Connecting

You can use any tool you like to connect to the instance, including the psql CLI.

```
psql --host <hostname> --port=5432 --username=postgres
Password for user postgres:
psql (14.13 (Homebrew), server 13.12)
SSL connection (protocol: TLSv1.2, cipher: ECDHE-RSA-AES256-GCM-SHA384, bits: 256, compression: off)
Type "help" for help.

postgres=> \d
Did not find any relations.
postgres=>
```

## CDK Environment Configuration

As this stack needs to lookup the default VPC we need to specify the env property in our stack.

```
const app = new cdk.App();
new CdkSimpleRdsPublicStack(app, 'CdkSimpleRdsPublicStack', {
   env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
}});
```

Otherwise the stack will fail with this error.

```
Error: Cannot retrieve value from context provider vpc-provider since account/region are not specified at the stack level. Configure "env" with an account and region when you define your stack.See https://docs.aws.amazon.com/cdk/latest/guide/environments.html for more details.
```

When executing this stack you will be prompted with the following security group changes.
These are needed if you want to access your database from the outiside world.

```
Security Group Changes
┌───┬──────────────────────────┬─────┬────────────┬─────────────────┐
│   │ Group                    │ Dir │ Protocol   │ Peer            │
├───┼──────────────────────────┼─────┼────────────┼─────────────────┤
│ + │ ${SecurityGroup.GroupId} │ In  │ TCP 5432   │ Everyone (IPv4) │
│ + │ ${SecurityGroup.GroupId} │ Out │ Everything │ Everyone (IPv4) │
└───┴──────────────────────────┴─────┴────────────┴─────────────────┘
```

## Stack creation duration
The stack takes somewhere between 10-15minutes to complete, as creating an RDS database is timeconsuming and involves a couple of steps.

Once the database is created you can see in the Logs and Events tab just what happend

- November 16, 2024, 11:37 (UTC+01:00) : DB instance created
- November 16, 2024, 11:37 (UTC+01:00) : CloudWatch Logs Export enabled for logs[postgresql, upgrade]
- November 16, 2024, 11:39 (UTC+01:00) : Performance Insights has been enabled
- November 16, 2024, 11:39 (UTC+01:00) : Monitoring Interval changed to 0
- November 16, 2024, 11:39 (UTC+01:00) : Backing up DB instance
- November 16, 2024, 11:41 (UTC+01:00) : Finished DB Instance backup
- November 16, 2024, 11:46 (UTC+01:00) : The DB instance has a DB engine minor version upgrade available.


## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template
