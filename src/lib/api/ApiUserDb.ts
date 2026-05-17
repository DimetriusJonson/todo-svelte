import type { AuthData } from "$lib/model/AuthData.svelte";
import type { CreateUserRequest, User } from "$lib/model/User.svelte";
import { checkPassword, hashPassword } from "$lib/server/crypt";
import { createJwtToken, parseJwtToken } from "$lib/server/jwt";
import { SECURITY_COOKIE_NAME } from "$lib/store/settings.svelte";
import { error, type Cookies } from "@sveltejs/kit";
import { type ApiUser } from "./ApiUser";
import sql from "$lib/server/db";

export class ApiUserDb implements ApiUser {
    async getUserByName(name: string): Promise<User | null> {
        let rows = await sql`SELECT id FROM users WHERE upper(username)=${name.toUpperCase()} and deleted_at is null`;
        if (rows && rows.length > 0) {
            return { id: rows[0].id, name: rows[0].username } as User;
        }

        return null;
    }

    parseToken(params: any): AuthData | null {
        let value = params.cookies.get(SECURITY_COOKIE_NAME);
        if (value) {
            return parseJwtToken(value);
        }
        return null;
    }

    saveAuthDataAsCookie(cookies: Cookies, authData: AuthData) {
        if (authData.token) {
            cookies.set(SECURITY_COOKIE_NAME, authData.token, {
                path: '/',
                maxAge: 14 * 60 * 60 * 24
            });
        } else {
            cookies.delete(SECURITY_COOKIE_NAME, { path: '/' });
        }
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

    async login(_params: any, username: string, password: string): Promise<User> {
        let userRow;

        let rows: any = await sql`SELECT * FROM users WHERE username=${username} and deleted_at is null`;
        if (rows && rows.length > 0) {
            userRow = rows[0];
        }

        if (!userRow) {
            error(404, `Пользователь ${username} не найден`);
        }

        if (!await checkPassword(password, userRow.password)) {
            error(400, 'Неверное имя пользователя или пароль!');
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

