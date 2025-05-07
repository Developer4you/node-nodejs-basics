export type User = {
    id: string;
    username: string;
    age: number;
    hobbies: string[];
};

export type UserWithoutId = Omit<User, 'id'>;

export type ErrorResponse = {
    error: string;
    details?: string[];
};

export interface Database {
    getAllUsers(): User[];
    getUser(id: string): User | undefined;
    createUser(userData: UserWithoutId): User;
    updateUser(id: string, userData: Partial<UserWithoutId>): User;
    deleteUser(id: string): boolean;
}

export type RequestHandler = (
    req: import('node:http').IncomingMessage,
    res: import('node:http').ServerResponse
) => Promise<void>;