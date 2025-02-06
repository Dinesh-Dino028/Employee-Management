import { APIGatewayProxyResult } from "aws-lambda";
import { getItem, getItemList } from "../dynamodb/dynamodb";
import { ItemNotFoundError } from "../helper/errorList";

export const getItemRequest = async (id: string): Promise<APIGatewayProxyResult> => {
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

export const getItemListRequest = async (): Promise<APIGatewayProxyResult> => {
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
}