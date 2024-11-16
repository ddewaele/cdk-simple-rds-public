import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import { Construct } from 'constructs';

export class CdkSimpleRdsPublicStack extends cdk.Stack {

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = ec2.Vpc.fromLookup(this, 'VPC', {
      isDefault: true
    });

    // Security group to allow PostGres remote connections in the default VPC
    const securityGroup = new ec2.SecurityGroup(this, 'SecurityGroup', {
      vpc,
      description: 'Allow PostGres access to rds instances from anywhere',
      allowAllOutbound: true
    });

    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(5432), 'allow public PostGres access');

    // Create the RDS instance
    const instance = new rds.DatabaseInstance(this, 'Instance', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_13_12
      }),
      instanceIdentifier: "new-database",
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      storageType: rds.StorageType.GP3,
      securityGroups: [securityGroup],
      publiclyAccessible: true,
      enablePerformanceInsights: true,
      deletionProtection: false,
      allocatedStorage: 20,
      cloudwatchLogsExports: ['postgresql', 'upgrade'],
      backupRetention: cdk.Duration.days(30),
    });

  }

}
