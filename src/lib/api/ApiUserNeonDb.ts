import type { AuthData } from "$lib/model/AuthData.svelte";
import type { CreateUserRequest, CreateUserResponse, LoginRequest, LoginResponse, LogoutResponse, User, UsersResponse } from "$lib/model/User.svelte";
import { checkPassword, hashPassword } from "$lib/server/crypt";
import { createJwtToken, parseJwtToken } from "$lib/server/jwt";
import { SECURITY_COOKIE_NAME } from "$lib/store/settings.svelte";
import type { Cookies } from "@sveltejs/kit";
import type { ApiResponse } from "./ApiCommon.svelte";
import { apiUser, type ApiUser } from "./ApiUser";
import sql from "$lib/server/neonDb";

export class ApiUserNeonDb implements ApiUser {
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

    async getUsers(_params: any): Promise<ApiResponse<UsersResponse>> {
        const dbUsers: any[] = await sql`SELECT * FROM users WHERE deleted_at is null`;

        let users: User[] = [];
        dbUsers.forEach(dbUser => {
            let user = {
                id: dbUser.id,
                name: dbUser.username
            } as User;
            users.push(user);
        });

        return { status: 200, success: true, responseData: { data: users }, error: null };
    }

    validate<T>(username: string, password: string): ApiResponse<T> | null {
        let errorsMap = new Map();
        if (!username || username.length < 3) {
            errorsMap.set('username', 'Минимальное число символов 3');
        }

        if (!password || password.length < 4) {
            errorsMap.set('password', 'Минимальное число символов 4');
        }

        if (errorsMap.size > 0) {
            return { success: false, status: 422, responseData: null, error: { message: 'Validate error', validateErrors: errorsMap } }
        }

        return null;
    }

    async create(_params: any, request: CreateUserRequest): Promise<ApiResponse<CreateUserResponse>> {
        let validateErrors = this.validate<CreateUserResponse>(request.username, request.password);
        if (validateErrors) {
            return validateErrors;
        }

        try {
            let hashedPassword = await hashPassword(request.password);
            let rows = await sql`INSERT INTO users(username, password) VALUES(${request.username}, ${hashedPassword}) RETURNING id`;
            return { success: true, status: 200, error: null, responseData: { id: rows[0].id, username: request.username } as CreateUserResponse };
        } catch (error: any) {
            return { success: false, status: 500, responseData: null, error: { message: error.toString() } }
        }
    }

    async login(_params: any, request: LoginRequest): Promise<ApiResponse<LoginResponse>> {
        let validateErrors = this.validate<LoginResponse>(request.username, request.password);
        if (validateErrors) {
            return validateErrors;
        }

        try {
            let userRow;

            let rows: any = await sql`SELECT * FROM users WHERE username=${request.username} and deleted_at is null`;
            if (rows && rows.length > 0) {
                userRow = rows[0];
            }

            if (!userRow) {
                return { success: false, status: 404, responseData: null, error: { message: `Пользователь ${request.username} не найден` } };
            }

            if (!checkPassword(request.password, userRow.password)) {
                return { success: false, status: 400, responseData: null, error: { message: 'Неверное имя пользователя или пароль!' } };
            }

            let token = createJwtToken(userRow.id, userRow.username);
            await sql`UPDATE users SET token=${token} WHERE id=${userRow.id}`;
            return { success: true, status: 200, error: null, responseData: { id: userRow.id, username: userRow.username, token: token } as LoginResponse };
        } catch (error: any) {
            return { success: false, status: 500, responseData: null, error: { message: error.toString() } }
        }
    }

    async logout(params: any): Promise<ApiResponse<LogoutResponse>> {
        try {
            let user = await getCurrentUser(params);
            if (!user) {
                return { success: true, status: 200, error: null, responseData: { success: true } as LogoutResponse };
            }

            await sql`UPDATE users SET token=null WHERE id=${user.id}`;
            return { success: true, status: 200, error: null, responseData: { success: true } as LogoutResponse };
        } catch (error: any) {
            return { success: false, status: 500, responseData: null, error: { message: error.toString() } }
        }
    }
}

export async function getCurrentUser(params: any): Promise<User | null> {
    let authData = params.parent ? (await params.parent()).authData : apiUser.parseToken(params);
    if (authData) {
        const rows: any = await sql`SELECT * FROM Users WHERE token = ${authData.token} and deleted_at is null`;
        if (rows && rows.length > 0) {
            let row = rows[0];
            return { id: row.id, name: row.username } as User;
        }
    }
    return null;
}

