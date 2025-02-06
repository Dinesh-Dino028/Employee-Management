export class ItemNotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ItemNotFoundError';
    }
}

export class IllegalArgumentError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'IllegalArgumentError';
    }
}

export class EmployeeValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ItemNotFoundError';
    }
}