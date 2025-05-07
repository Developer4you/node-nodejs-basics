import { v4 as uuidv4 } from 'uuid';

export type User = {
    id: string;
    username: string;
    age: number;
    hobbies: string[];
};

class InMemoryDB {
    private users: User[] = [];

    getAllUsers() {
        return this.users;
    }

    getUser(id: string) {
        return this.users.find(user => user.id === id);
    }

    createUser(userData: Omit<User, 'id'>) {
        const newUser = { id: uuidv4(), ...userData };
        this.users.push(newUser);
        return newUser;
    }

    // Добавить методы update и delete
}

export const DB = new InMemoryDB();