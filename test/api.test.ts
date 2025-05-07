import { test, expect } from 'vitest';
import { DB } from '../src/database.js';

test('CRUD operations', async () => {
    // Тест создания
    const newUser = DB.createUser({
        username: 'John',
        age: 30,
        hobbies: ['coding']
    });

    // Тест чтения
    const foundUser = DB.getUser(newUser.id);
    expect(foundUser).toEqual(newUser);

    // Тест удаления
    DB.deleteUser(newUser.id);
    expect(DB.getUser(newUser.id)).toBeUndefined();
});