# Employee Management CRUD Operations with AWS CDK TypeScript

This project demonstrates how to build a serverless employee management system using AWS CDK with TypeScript. The system supports Create, Read, Update, and Delete (CRUD) operations for managing employee data.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## AWS Services Used

* **AWS Lambda** - For running the CRUD operations.
* **Amazon API Gateway** - For exposing the Lambda functions as HTTP endpoints.
* **Amazon DynamoDB** - For storing employee data.
* **AWS IAM** - For managing access permissions.

## Useful commands

* `npm run build`   compile TypeScript to JavaScript
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template

## Endpoints

* `POST /employees` - Create a new employee
* `GET /employees/{id}` - Get an employee by ID
* `PUT /employees/{id}` - Update an employee by ID
* `DELETE /employees/{id}` - Delete an employee by ID

## Setup

1. Install dependencies: `npm install`
2. Build the project: `npm run build`
3. Deploy the stack: `npx cdk deploy`

## Testing

Run the unit tests using: `npm run test`

## Cleanup

To delete the deployed resources: `npx cdk destroy`

