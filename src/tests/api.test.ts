import request from 'supertest';
import { app } from '../app';
import { DB } from '../database/database';

describe('User API Tests', () => {
    let createdUserId: string;

    beforeAll(async () => {
        DB.getAllUsers().forEach(user => DB.deleteUser(user.id));
    });

    test('Full CRUD flow', async () => {
        // 1. Create User
        const createResponse = await request(app)
            .post('/api/users')
            .send({
                username: 'TestUser',
                age: 25,
                hobbies: ['reading']
            });

        expect(createResponse.statusCode).toBe(201);
        createdUserId = createResponse.body.id;

        const getResponse = await request(app)
            .get(`/api/users/${createdUserId}`);

        expect(getResponse.statusCode).toBe(200);
        expect(getResponse.body).toEqual({
            id: createdUserId,
            username: 'TestUser',
            age: 25,
            hobbies: ['reading']
        });

        // 3. Update User
        const updateResponse = await request(app)
            .put(`/api/users/${createdUserId}`)
            .send({
                username: 'UpdatedUser',
                age: 30
            });

        expect(updateResponse.statusCode).toBe(200);
        expect(updateResponse.body).toEqual({
            id: createdUserId,
            username: 'UpdatedUser',
            age: 30,
            hobbies: ['reading']
        });

        // 4. Delete User
        const deleteResponse = await request(app)
            .delete(`/api/users/${createdUserId}`);

        expect(deleteResponse.statusCode).toBe(204);

        // 5. Verify Deletion
        const getAfterDelete = await request(app)
            .get(`/api/users/${createdUserId}`);

        expect(getAfterDelete.statusCode).toBe(404);
    });

    // Проверка невалидного UUID
    test('GET with invalid UUID', async () => {
        const response = await request(app)
            .get('/api/users/invalid-uuid');

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: 'Invalid UUID format'
        });
    });

    test('POST without required fields', async () => {
        const response = await request(app)
            .post('/api/users')
            .send({ age: 30 });

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: 'Missing required fields'
        });
    });

    test('PUT with invalid UUID', async () => {
        const response = await request(app)
            .put('/api/users/invalid-uuid')
            .send({ username: 'Test' });

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: 'Invalid UUID format'
        });
    });
});