import { v4 as uuidv4 } from 'uuid';
import cluster from 'cluster';

export type User = {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
};

class InMemoryDB {
  private users: User[] = [];
  private channel: string;

  constructor() {
    this.channel = 'db-events';
    this.setupIPC();
  }

  private setupIPC() {
    if (cluster.isWorker) {
      process.on('message', (msg: { event: string; data: any }) => {
        if (msg.event === this.channel) {
          this.applyChange(msg.data);
        }
      });
    }
  }

  private broadcastChange(event: string, data: any) {
    if (cluster.isWorker) {
      process.send!({ event: this.channel, data: { event, data } });
    }
  }

  private applyChange({ event, data }: { event: string; data: any }) {
    switch (event) {
      case 'create':
        this.users.push(data);
        break;
      case 'update':
        this.users = this.users.map((u) => (u.id === data.id ? data : u));
        break;
      case 'delete':
        this.users = this.users.filter((u) => u.id !== data);
        break;
    }
  }

  getAllUsers() {
    return this.users;
  }

  getUser(id: string) {
    return this.users.find((user) => user.id === id);
  }

  createUser(userData: Omit<User, 'id'>) {
    const newUser = { id: uuidv4(), ...userData };
    this.users.push(newUser);
    this.broadcastChange('create', newUser);
    return newUser;
  }

  updateUser(id: string, userData: Partial<Omit<User, 'id'>>) {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) return null;

    const updatedUser = { ...this.users[userIndex], ...userData };
    this.users[userIndex] = updatedUser;
    this.broadcastChange('update', updatedUser);
    return updatedUser;
  }

  deleteUser(id: string) {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) return false;

    this.users.splice(userIndex, 1);
    this.broadcastChange('delete', id);
    return true;
  }
}

export const DB = new InMemoryDB();
