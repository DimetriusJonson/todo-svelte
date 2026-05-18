import type { CreateUserRequest, User } from "$lib/model/User.svelte";
import { checkPassword, hashPassword } from "$lib/server/crypt";
import { createJwtToken } from "$lib/server/jwt";
import sql from "$lib/server/db";
import type { UserDao } from "../UserDao";

export class UserDaoImpl implements UserDao {
    async getUserByName(name: string): Promise<User | null> {
        let rows = await sql`SELECT id FROM users WHERE upper(username)=${name.toUpperCase()} and deleted_at is null`;
        if (rows && rows.length > 0) {
            return { id: rows[0].id, name: rows[0].username } as User;
        }

        return null;
    }

    async getUsers(_params: any): Promise<User[]> {
        const dbUsers: any[] = await sql`SELECT * FROM users WHERE deleted_at is null`;

        let users: User[] = [];
        dbUsers.forEach(dbUser => {
            let user = {
                id: dbUser.id,
                name: dbUser.username
            } as User;
            users.push(user);
        });

        return users;
    }

    async create(_params: any, request: CreateUserRequest): Promise<User> {
        let hashedPassword = await hashPassword(request.password);
        let rows = await sql`INSERT INTO users(username, password) VALUES(${request.username}, ${hashedPassword}) RETURNING id`;
        return { id: rows[0].id, name: request.username } as User;
    }

    async login(_params: any, username: string, password: string): Promise<User | null> {
        let userRow;

        let rows: any = await sql`SELECT * FROM users WHERE username=${username} and deleted_at is null`;
        if (rows && rows.length > 0) {
            userRow = rows[0];
        }

        if (!userRow) {
            return null;
        }

        if (!await checkPassword(password, userRow.password)) {
            return null;
        }

        let token = createJwtToken(userRow.id, userRow.username);
        await sql`UPDATE users SET token=${token} WHERE id=${userRow.id}`;
        return { id: userRow.id, name: userRow.username, token: token } as User;
    }

    async logout(params: any): Promise<boolean> {
        if (params.user) {
            await sql`UPDATE users SET token=null WHERE id=${params.user.id}`;
        }
        return true;
    }
}

