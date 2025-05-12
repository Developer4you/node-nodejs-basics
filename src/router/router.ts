import { IncomingMessage, ServerResponse } from 'node:http';
import { DB } from '../database/database';
import { UserWithoutId } from '../types';

const parseRequestBody = (req: IncomingMessage): Promise<any> => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk.toString()));
    req.on('end', () => {
      try {
        console.log(body);
        resolve(JSON.parse(body));
      } catch (e: any) {
        console.log(e.message);
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
};

const sendResponse = (
  res: ServerResponse,
  statusCode: number,
  data?: object,
  headers: Record<string, string> = { 'Content-Type': 'application/json' }
): void => {
  res.writeHead(statusCode, headers);
  res.end(data ? JSON.stringify(data) : undefined);
};

export const router = async (
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> => {
  try {
    const url = req.url || '';
    const method = req.method || '';

    const UUID_REGEX =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (url.startsWith('/api/users')) {
      const userId = url.split('/')[3];

      switch (method) {
        case 'GET':
          if (!userId) {
            return sendResponse(res, 200, DB.getAllUsers());
          }

          if (!UUID_REGEX.test(userId)) {
            return sendResponse(res, 400, { error: 'Invalid UUID format' });
          }

          const user = DB.getUser(userId);
          if (!user) {
            return sendResponse(res, 404, { error: 'User not found' });
          }
          return sendResponse(res, 200, user);

        case 'POST':
          try {
            const body = await parseRequestBody(req);

            if (!body.username || !body.age) {
              return sendResponse(res, 400, {
                error: 'Missing required fields'
              });
            }

            if (typeof body.age !== 'number') {
              return sendResponse(res, 400, { error: 'Age must be a number' });
            }

            if (!Array.isArray(body.hobbies)) {
              return sendResponse(res, 400, {
                error: 'Hobbies must be an array'
              });
            }

            const newUser = DB.createUser({
              username: body.username,
              age: body.age,
              hobbies: body.hobbies || []
            });
            return sendResponse(res, 201, newUser);
          } catch (error) {
            if (error instanceof Error) {
              return sendResponse(res, 400, { error: error.message });
            }
            return sendResponse(res, 500, { error: 'Internal server error' });
          }

        case 'PUT':
          if (!userId) {
            return sendResponse(res, 400, { error: 'User ID is required' });
          }
          if (!UUID_REGEX.test(userId)) {
            return sendResponse(res, 400, { error: 'Invalid UUID format' });
          }

          try {
            const body = await parseRequestBody(req);
            const existingUser = DB.getUser(userId);

            if (!existingUser) {
              return sendResponse(res, 404, { error: 'User not found' });
            }

            const updateData: Partial<UserWithoutId> = {};

            if (body.username !== undefined) {
              if (typeof body.username !== 'string') {
                return sendResponse(res, 400, {
                  error: 'Username must be a string'
                });
              }
              updateData.username = body.username;
            }

            if (body.age !== undefined) {
              if (typeof body.age !== 'number') {
                return sendResponse(res, 400, {
                  error: 'Age must be a number'
                });
              }
              updateData.age = body.age;
            }

            if (body.hobbies !== undefined) {
              if (
                !Array.isArray(body.hobbies) ||
                body.hobbies.some((h: string) => typeof h !== 'string')
              ) {
                return sendResponse(res, 400, {
                  error: 'Hobbies must be an array of strings'
                });
              }
              updateData.hobbies = body.hobbies;
            }

            const updatedUser = DB.updateUser(userId, updateData);
            return sendResponse(res, 200, updatedUser!); // Non-null assertion
          } catch (error) {
            if (error instanceof Error && error.message === 'Invalid JSON') {
              return sendResponse(res, 400, { error: error.message });
            }
            return sendResponse(res, 500, { error: 'Internal server error' });
          }

        case 'DELETE':
          if (!userId) {
            return sendResponse(res, 400, { error: 'User ID is required' });
          }
          if (!UUID_REGEX.test(userId)) {
            return sendResponse(res, 400, { error: 'Invalid UUID format' });
          }
          try {
            const isDeleted = DB.deleteUser(userId);
            if (!isDeleted) {
              return sendResponse(res, 404, { error: 'User not found' });
            }
            return sendResponse(res, 204);
          } catch (error) {
            return sendResponse(res, 500, { error: 'Internal server error' });
          }

        default:
          return sendResponse(res, 405, { error: 'Method not allowed' });
      }
    }

    return sendResponse(res, 404, { error: 'Endpoint not found' });
  } catch (error) {
    console.error('Server error:', error);
    return sendResponse(res, 500, { error: 'Internal server error' });
  }
};
