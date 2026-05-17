import type { AuthData } from "$lib/model/AuthData.svelte";
import type { CreateUserRequest, CreateUserResponse, LoginRequest, LoginResponse, LogoutResponse, User, UsersResponse } from "$lib/model/User.svelte";
import { checkPassword, hashPassword } from "$lib/server/crypt";
import db from "$lib/server/db";
import { createJwtToken, parseJwtToken } from "$lib/server/jwt";
import { SECURITY_COOKIE_NAME } from "$lib/store/settings.svelte";
import type { Cookies } from "@sveltejs/kit";
import { apiUser, type ApiUser } from "../ApiUser";
import type { ApiResponse } from "../apiTypes";

const GET_USERS_SQL = db.prepare(
    "SELECT * FROM users WHERE deleted_at is null");

const GET_USER_SQL = db.prepare(
    "SELECT * FROM users WHERE username=@username and deleted_at is null");

const UPDATE_USER_TOKEN_SQL = db.prepare(
    "UPDATE users SET token=@token WHERE id=@id");

const INSERT_USER_SQL = db.prepare(
    "INSERT INTO users(username, password) VALUES(@username, @password) RETURNING id");

const GET_USER_BY_TOKEN_SQL = db.prepare("SELECT * FROM Users WHERE token = ? and deleted_at is null");


export class ApiUserDb implements ApiUser {
    getUserByName(name: string): Promise<User | null> {
        throw new Error("Method not implemented.");
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

    async getUsers(_params: any): Promise<ApiResponse<UsersResponse>> {
        const dbUsers: any[] = GET_USERS_SQL.all();

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

    async create(_params: any, request: CreateUserRequest): Promise<ApiResponse<CreateUserResponse>> {
        try {
            let hashedPassword = await hashPassword(request.password);
            let insertInfo: any = INSERT_USER_SQL.run({ username: request.username, password: hashedPassword });
            return { success: true, status: 200, error: null, responseData: { id: insertInfo.id, username: request.username } as CreateUserResponse };
        } catch (error: any) {
            return { success: false, status: 500, responseData: null, error: { message: error.toString() } }
        }
    }

    async login(_params: any, request: LoginRequest): Promise<ApiResponse<LoginResponse>> {
        try {
            let userRow: any = GET_USER_SQL.get({ username: request.username });
            if (!userRow) {
                return { success: false, status: 404, responseData: null, error: { message: 'Not found user ' + request.username } };
            }

            if (!checkPassword(request.password, userRow.password)) {
                return { success: false, status: 400, responseData: null, error: { message: 'Wrong username or password!' } };
            }

            let token = createJwtToken(userRow.id, userRow.username);
            let updateInfo = UPDATE_USER_TOKEN_SQL.run({ token: token, id: userRow.id });
            if (updateInfo.changes > 0) {
                return { success: true, status: 200, error: null, responseData: { id: userRow.id, username: userRow.username, token: token } as LoginResponse };
            } else {
                return { success: false, status: 404, responseData: null, error: { message: 'Not found user.id=' + userRow.id } }
            }
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

            let updateInfo = UPDATE_USER_TOKEN_SQL.run({ token: null, id: user.id });
            if (updateInfo.changes > 0) {
                return { success: true, status: 200, error: null, responseData: { success: true } as LogoutResponse };
            } else {
                return { success: false, status: 404, responseData: null, error: { message: 'Not found user.id=' + user.id } }
            }
        } catch (error: any) {
            return { success: false, status: 500, responseData: null, error: { message: error.toString() } }
        }
    }
}

export async function getCurrentUser(params: any): Promise<User | null> {
    let authData = params.parent ? (await params.parent()).authData : apiUser.parseToken(params);
    if (authData) {
        const row: any = GET_USER_BY_TOKEN_SQL.get(authData.token);
        if (row) {
            return { id: row.id, name: row.username } as User;
        }
    }
    return null;
}

