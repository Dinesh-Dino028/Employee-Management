import { DynamoDBClient, GetItemCommand, QueryCommand, DeleteItemCommand, ScanCommand, PutItemCommand, UpdateItemCommand, ReturnValue } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb"; 
import { ItemNotFoundError } from '../helper/errorList';

// Initialize DynamoDB Client
const client = new DynamoDBClient({
  region: 'ap-south-1',
  endpoint: process.env.IS_OFFLINE ? 'http://host.docker.internal:8000' : undefined,
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

