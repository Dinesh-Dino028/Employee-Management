export type Employee = {
    name: string;
    email: string;
    phone: string;
    department: string;
    designation: string;
};

export type EmployeeUpdate = {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
    department?: string;
    designation?: string;
};