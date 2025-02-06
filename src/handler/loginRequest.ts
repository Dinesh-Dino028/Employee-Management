import { APIGatewayProxyResult } from "aws-lambda";
import { verifyLoginDetails } from "../dynamodb/dynamodb";
import { EmployeeValidationError, IllegalArgumentError } from "../helper/errorList";

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