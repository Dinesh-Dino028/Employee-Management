import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import * as path from 'path';


export class ServerlessAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB Tables
    const employeeTable = new dynamodb.Table(this, 'EmployeeTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      tableName: 'employee-management-data-table',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const loginTable = new dynamodb.Table(this, 'LoginTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      tableName: 'employee-management-login-table',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Add GSI for username in login table
    loginTable.addGlobalSecondaryIndex({
      indexName: 'UsernameIndex',
      partitionKey: { name: 'username', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL
    });

    // Lambda Function
    const handler = new lambda.Function(this, 'EmployeeHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'handler.commonHandler',  // ✅ Ensure this matches handler.js
      code: lambda.Code.fromAsset(path.join(__dirname, '../dist/src/lambda')),  // ✅ Use built JS code
      environment: {
        EMP_DATA_TABLE_NAME: employeeTable.tableName,
        EMP_LOGIN_TABLE_NAME: loginTable.tableName,
        IS_OFFLINE: 'false',
      }
    });

    // Grant permissions
    employeeTable.grantReadWriteData(handler);
    loginTable.grantReadWriteData(handler);

    // API Gateway
    const api = new apigateway.RestApi(this, 'EmployeeApi', {
      restApiName: 'Employee Management API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token'
        ],
        allowCredentials: true
      }
    });

    // API Resources and Methods
    const employees = api.root.addResource('employee');
    const singleEmployee = employees.addResource('{id}');
    const login = employees.addResource('login');

    // CRUD Operations
    employees.addResource('add').addMethod('POST', new apigateway.LambdaIntegration(handler));
    employees.addResource('list').addMethod('GET', new apigateway.LambdaIntegration(handler));
    singleEmployee.addMethod('GET', new apigateway.LambdaIntegration(handler));
    singleEmployee.addMethod('PUT', new apigateway.LambdaIntegration(handler));
    singleEmployee.addMethod('DELETE', new apigateway.LambdaIntegration(handler));
    login.addMethod('POST', new apigateway.LambdaIntegration(handler));

    // New API Resources and Methods
    const updateEmployee = employees.addResource('update').addResource('{id}');
    const deleteEmployee = employees.addResource('delete').addResource('{id}');
    updateEmployee.addMethod('PUT', new apigateway.LambdaIntegration(handler));
    deleteEmployee.addMethod('DELETE', new apigateway.LambdaIntegration(handler));

    // Output the API URL
    new cdk.CfnOutput(this, 'EmployeeApiEndpoint', {
      value: api.url,
      description: 'The base URL for the Employee Management API',
    });
  }
}