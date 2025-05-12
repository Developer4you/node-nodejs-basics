import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'node:fs';
import path from 'node:path';

export type User = {
    id: string;
    username: string;
    age: number;
    hobbies: string[];
};

const DB_PATH = path.join(process.cwd(), 'db.json');

class InMemoryDB {
    private users: User[] = [];

    constructor() {
        this.init();
    }

    private async init() {
        try {
            const data = await fs.readFile(DB_PATH, 'utf-8');
            this.users = JSON.parse(data);
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                await this.saveToFile();
            } else {
                console.error('Error initializing database:', error);
            }
        }
    }

    private async saveToFile() {
        try {
            await fs.writeFile(DB_PATH, JSON.stringify(this.users, null, 2));
        } catch (error) {
            console.error('Error saving database:', error);
        }
    }

    getAllUsers() {
        return this.users;
    }

    getUser(id: string) {
        return this.users.find(user => user.id === id);
    }

    async createUser(userData: Omit<User, 'id'>) {
        const newUser = { id: uuidv4(), ...userData };
        this.users.push(newUser);
        await this.saveToFile();
        return newUser;
    }

    async updateUser(id: string, userData: Partial<Omit<User, 'id'>>) {
        const userIndex = this.users.findIndex(user => user.id === id);
        if (userIndex === -1) return null;

        this.users[userIndex] = {
            ...this.users[userIndex],
            ...userData
        };

        await this.saveToFile();
        return this.users[userIndex];
    }

    async deleteUser(id: string) {
        const userIndex = this.users.findIndex(user => user.id === id);
        if (userIndex === -1) return false;

        this.users.splice(userIndex, 1);
        await this.saveToFile();
        return true;
    }
}

export const DB = new InMemoryDB();