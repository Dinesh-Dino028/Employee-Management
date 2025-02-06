import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
//import { EmployeeValidationError, IllegalArgumentError, ItemNotFoundError } from '../helper/errorList';
//import { verifyLogin } from '../handler/loginRequest';
import { DynamoDBClient, GetItemCommand, QueryCommand, DeleteItemCommand, ScanCommand, PutItemCommand, ReturnValue, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
// import { deleteItemRequest } from '../handler/deleteItemRequest';
// import { getItemListRequest, getItemRequest } from '../handler/getItemRequest';
// import { createItemRequest } from '../handler/createItemRequest';
// import { updateItemRequest } from '../handler/updateItemRequest';

// Lambda function handler
export const commonHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Add CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Credentials': 'true'
    };

    // Handle OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: ''
        };
    }

    try {
        console.log('Event:', JSON.stringify(event));
        let result: APIGatewayProxyResult;

        // Process other HTTP methods
        switch (event.httpMethod) {
            case 'GET':
                result = await handleGetRequest(event);
                break;

            case 'POST':
                result = await handlePostRequest(event);
                break;

            case 'PUT':
                result = await handlePutRequest(event);
                break;

            case 'DELETE':
                result = await handleDeleteRequest(event);
                break;

            default:
                return {
                    statusCode: 405,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify({
                        message: 'Method not allowed',
                    }),
                };
        }

        return {
            statusCode: result.statusCode,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Credentials': true
            },
            body: result.body,
        };
    } catch (error) {
        return handleError(error);
    }
};

// Function to handle GET requests
const handleGetRequest = async (event: APIGatewayProxyEvent): Promise<any> => {
    if (event.path === `/employee/${event.pathParameters?.id}`) {
        return await fetchItemRequest(event);
    }
    else if (event.path === `/employee/list`) {
        return await getItemListRequest();
    } else {
        throw new ItemNotFoundError('Path not found');
    }
};

// Function to handle POST requests
const handlePostRequest = async (event: APIGatewayProxyEvent): Promise<any> => {
    if (event.path === '/employee/login') {
        return await loginRequest(event);
    }
    else if (event.path === '/employee/add') {
        return await addItemRequest(event);
    } else {
        throw new ItemNotFoundError('Path not found');
    }
};

// Function to handle PUT requests
const handlePutRequest = async (event: APIGatewayProxyEvent): Promise<any> => {
    if (event.path === `/employee/update/${event.pathParameters?.id}`) {
        return await updateRequest(event);
    }
    else {
        throw new ItemNotFoundError('Path not found');
    }
};

// Function to handle DELETE requests
const handleDeleteRequest = async (event: APIGatewayProxyEvent): Promise<any> => {
    if (event.path === `/employee/delete/${event.pathParameters?.id}`) {
        return await deleteRequest(event);
    } else {
        throw new ItemNotFoundError('Path not found');
    }
};

// Function to handle errors
const handleError = (error: any): APIGatewayProxyResult => {
    console.error('Error:', error);

    const headers = {
        'Access-Control-Allow-Origin': '*',
    };

    if (error instanceof ItemNotFoundError) {
        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({
                message: 'Item not found',
                error: error.message,
            }),
        };
    }

    if (error instanceof IllegalArgumentError) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
                message: 'Bad request',
                error: error.message,
            }),
        };
    }

    if (error instanceof EmployeeValidationError) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                message: 'Employee validation error',
                error: error.message,
            }),
        };
    }

    return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
            message: 'Internal server error',
            error: error.message,
        }),
    };
};

// Function to handle login request
const loginRequest = async (event: APIGatewayProxyEvent): Promise<any> => {
    const requestBody = event.body;
    if (!requestBody) {
        throw new IllegalArgumentError('Missing login and password');
    }
    return await verifyLogin(requestBody);
};

// Function to handle fetch item request
const fetchItemRequest = async (event: APIGatewayProxyEvent): Promise<any> => {
    const id = event.pathParameters?.id;
    if (!id) {
        throw new IllegalArgumentError('Missing id parameter');
    }
    return await getItemRequest(id);
};

const addItemRequest = async (event: APIGatewayProxyEvent): Promise<any> => {
    const requestBody = event.body;
    if (!requestBody) {
        throw new IllegalArgumentError('Missing item details');
    }
    return await createItemRequest(requestBody);
};

const updateRequest = async (event: APIGatewayProxyEvent): Promise<any> => {
    const requestBody = event.body;
    const id = event.pathParameters?.id;
    if (!id) {
        throw new IllegalArgumentError('Missing id parameter');
    }
    if (!requestBody) {
        throw new IllegalArgumentError('Missing item details');
    }
    return await updateItemRequest(id, requestBody);
};

const deleteRequest = async (event: APIGatewayProxyEvent): Promise<any> => {
    const id = event.pathParameters?.id;
    if (!id) {
        throw new IllegalArgumentError('Missing id parameter');
    }
    return await deleteItemRequest(id);
};

// helper folder

export const customErrors = (err: Error) => {
    if (err instanceof ItemNotFoundError) {
        return {
            statusCode: 404,
            body: JSON.stringify({
                message: 'Item not found',
                error: err.message
            })
        };
    }
    if (err instanceof EmployeeValidationError) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'EmployeeValidationError',
                error: err.message
            })
        };
    }
    return {
        statusCode: 500,
        body: JSON.stringify({
            message: 'Internal Server Error',
            error: err.message
        })
    };
}

class ItemNotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ItemNotFoundError';
    }
}

class IllegalArgumentError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'IllegalArgumentError';
    }
}

class EmployeeValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ItemNotFoundError';
    }
}

//

// handler folder

const createItemRequest = async (requestBody: string): Promise<any> => {
    try {
        const itemDetails: Employee = JSON.parse(requestBody);
        if (itemDetails.name === undefined || itemDetails.email === undefined || itemDetails.phone === undefined || itemDetails.department === undefined || itemDetails.designation === undefined) {
            throw new IllegalArgumentError('Missing item details');
        }
        const createdItem = await createItem(itemDetails);
        return {
            statusCode: 201,
            body: JSON.stringify(createdItem)
        };
    } catch (error) {
        if (error instanceof Error) {
            throw new EmployeeValidationError(error.message);
        } else {
            throw new EmployeeValidationError("An unknown error occurred");
        }
    }
};

const deleteItemRequest = async (id: string): Promise<APIGatewayProxyResult> => {
    try {
        const item = await getItem(id);
        await deleteItem(id);
        return {
            statusCode: 200,
            body: JSON.stringify(item)
        };
    } catch (error) {
        console.error('Error:', error);
        if (error instanceof ItemNotFoundError) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: 'Item not found',
                    error: (error as Error).message
                })
            };

        }
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Internal server error',
                error: (error as Error).message
            })
        };
    }
};

const getItemRequest = async (id: string): Promise<APIGatewayProxyResult> => {
    try {
        const item = await getItem(id);
        return {
            statusCode: 200,
            body: JSON.stringify(item) // Return the item directly
        };
    } catch (error) {
        console.error('Error:', error);
        if (error instanceof ItemNotFoundError) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: 'Item not found',
                    error: (error as Error).message
                })
            };
        }
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Internal server error',
                error: (error as Error).message
            })
        };
    }
};

const getItemListRequest = async (): Promise<APIGatewayProxyResult> => {
    try {
        const items = await getItemList();
        return {
            statusCode: 200,
            body: JSON.stringify(items)
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Internal server error',
                error: (error as Error).message
            })
        };
    }
};

const updateItemRequest = async (id: string, requestBody: string): Promise<any> => {
    try {
        const itemDetails: EmployeeUpdate = JSON.parse(requestBody);
        if (itemDetails.name === undefined || itemDetails.email === undefined || itemDetails.phone === undefined || itemDetails.department === undefined || itemDetails.designation === undefined) {
            throw new IllegalArgumentError('Missing item details');
        }
        const updatedItem = await updateItem(id, itemDetails);
        return {
            statusCode: 200,
            body: JSON.stringify(updatedItem)
        };
    } catch (error) {
        if (error instanceof Error) {
            throw new EmployeeValidationError(error.message);
        } else {
            throw new EmployeeValidationError("An unknown error occurred");
        }
    }
};
//


// dynamodb folder

// Initialize DynamoDB Client
const client = new DynamoDBClient({
    region: 'ap-south-1',
    //  endpoint: process.env.IS_OFFLINE ? 'http://host.docker.internal:8000' : undefined,
});

const dynamoDB = DynamoDBDocumentClient.from(client);

// Function to get an item from DynamoDB table
export const getItem = async (id: string): Promise<any> => {
    const tableName = process.env.EMP_DATA_TABLE_NAME;
    if (!tableName) throw new Error('TABLE_NAME environment variable is not set');

    const params = {
        TableName: tableName,
        Key: marshall({ id }),
    };

    try {
        const result = await dynamoDB.send(new GetItemCommand(params));
        if (!result.Item) throw new ItemNotFoundError(`Item not found for ${id}`);
        return unmarshall(result.Item);
    } catch (error) {
        console.error('Error getting item from DynamoDB:', error);
        throw error;
    }
};

// Function to verify login details
export const verifyLoginDetails = async (username: string, password: string): Promise<any> => {
    const tableName = process.env.EMP_LOGIN_TABLE_NAME;
    if (!tableName) throw new Error('EMP_LOGIN_TABLE_NAME environment variable is not set');

    const params = {
        TableName: tableName,
        IndexName: "UsernameIndex",
        KeyConditionExpression: "#username = :username",
        FilterExpression: "#password = :password",
        ExpressionAttributeNames: {
            "#username": "username",
            "#password": "password"
        },
        ExpressionAttributeValues: marshall({
            ":username": username,
            ":password": password
        })
    };

    try {
        const result = await dynamoDB.send(new QueryCommand(params));
        if (!result.Items || result.Items.length === 0) throw new ItemNotFoundError("Invalid username or password");
        return unmarshall(result.Items[0]);
    } catch (error) {
        console.error("Error verifying login from DynamoDB:", error);
        throw error;
    }
};

// Function to delete an item
export const deleteItem = async (id: string): Promise<any> => {
    const tableName = process.env.EMP_DATA_TABLE_NAME;
    if (!tableName) throw new Error('TABLE_NAME environment variable is not set');

    const params = {
        TableName: tableName,
        Key: marshall({ id }),
    };

    try {
        const result = await dynamoDB.send(new DeleteItemCommand(params));
        console.log('Item deleted:', result);
        return result;
    } catch (error) {
        console.error('Error deleting item from DynamoDB:', error);
        throw error;
    }
};

// Function to get all employee items
export const getItemList = async (): Promise<any> => {
    const tableName = process.env.EMP_DATA_TABLE_NAME;
    if (!tableName) throw new Error('TABLE_NAME environment variable is not set');

    const params = { TableName: tableName };

    try {
        const result = await dynamoDB.send(new ScanCommand(params));
        if (!result.Items) throw new ItemNotFoundError('No items found');
        return result.Items.map(item => unmarshall(item));
    } catch (error) {
        console.error('Error getting items from DynamoDB:', error);
        throw error;
    }
};

// Function to create a new employee item
export const createItem = async (item: any): Promise<any> => {
    const tableName = process.env.EMP_DATA_TABLE_NAME;
    if (!tableName) throw new Error('TABLE_NAME environment variable is not set');

    const id = Math.floor(Math.random() * 1000000000).toString();
    const employeeData = { id, ...item };

    const params = {
        TableName: tableName,
        Item: marshall(employeeData),
    };

    try {
        await dynamoDB.send(new PutItemCommand(params));
        console.log('Item created:', employeeData);
        return employeeData;
    } catch (error) {
        console.error('Error creating item in DynamoDB:', error);
        throw error;
    }
};

// Function to update an existing employee item
export const updateItem = async (id: string, updatedItem: Record<string, any>): Promise<any> => {
    const tableName = process.env.EMP_DATA_TABLE_NAME;
    if (!tableName) throw new Error("EMP_DATA_TABLE_NAME environment variable is not set");

    if (!id || Object.keys(updatedItem).length === 0) throw new Error("Invalid ID or no fields provided for update");

    // Construct Update Expression
    let updateExpressionParts: string[] = [];
    let expressionAttributeNames: Record<string, string> = {};
    let expressionAttributeValues: Record<string, any> = {};

    Object.entries(updatedItem).forEach(([key, value], index) => {
        const attrName = `#attr${index}`;
        const attrValue = `:val${index}`;
        updateExpressionParts.push(`${attrName} = ${attrValue}`);
        expressionAttributeNames[attrName] = key;
        expressionAttributeValues[attrValue] = value;
    });

    const updateExpression = `SET ${updateExpressionParts.join(", ")}`;

    const params = {
        TableName: tableName,
        Key: marshall({ id }), // ✅ Marshalling the primary key
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: marshall(expressionAttributeValues), // ✅ Marshalling attribute values
        ConditionExpression: "attribute_exists(id)", // Ensures the item exists before updating
        ReturnValues: ReturnValue.ALL_NEW // ✅ Using the correct type for ReturnValues
    };

    try {
        const result = await dynamoDB.send(new UpdateItemCommand(params));
        if (!result.Attributes) throw new Error("Failed to update item");

        console.log("Item updated:", unmarshall(result.Attributes));
        return unmarshall(result.Attributes);
    } catch (error) {
        console.error("Error updating item in DynamoDB:", error);
        throw error;
    }
};

export const verifyLogin = async (requestBody: string): Promise<APIGatewayProxyResult> => {
    try {
        const loginDetails = JSON.parse(requestBody);
        const username = loginDetails.username;
        const password = loginDetails.password;
        if (username === undefined || password === undefined) {
            throw new IllegalArgumentError('Missing login and password');
        }
        const result = await verifyLoginDetails(username, password);
        console.log("result:", result);
        if (result.username === username && result.password === password) {
            return {
                statusCode: 200,
                body: "Login successful"
            };
        } else {
            throw new IllegalArgumentError("Invalid username or password");
        }
    } catch (error) {
        if (error instanceof Error) {
            throw new EmployeeValidationError(error.message);
        } else {
            throw new EmployeeValidationError("An unknown error occurred");
        }
    }
};

//