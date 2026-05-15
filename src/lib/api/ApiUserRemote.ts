import type { AuthData } from "$lib/model/AuthData.svelte";
import type { CreateUserRequest, CreateUserResponse, LoginRequest, LoginResponse, LogoutResponse, User, UsersResponse } from "$lib/model/User.svelte";
import { SECURITY_COOKIE_NAME } from "$lib/store/settings.svelte";
import type { Cookies } from "@sveltejs/kit";
import { fetchData, makeRequest, type ApiResponse } from "./ApiCommon.svelte";
import type { ApiUser } from "./ApiUser";

export class ApiUserRemote implements ApiUser {
    getUserByName(name: string): Promise<User | null> {
        throw new Error("Method not implemented.");
    }
    
    parseToken(params: any): AuthData | null {
        let value = params.cookies.get(SECURITY_COOKIE_NAME);
        if (value) {
            let parts = decodeURIComponent(value).split(":");
            if (parts.length == 2) {
                return { userId: null, userName: parts[0], token: parts[1] };
            }
        }

        return null;
    }

    saveAuthDataAsCookie(cookies: Cookies, authData: AuthData) {
        if (authData.token) {
            cookies.set(SECURITY_COOKIE_NAME, authData.userName + ':' + authData.token, {
                path: '/',
                maxAge: 14 * 60 * 60 * 24
            });
        } else {
            cookies.delete(SECURITY_COOKIE_NAME, { path: '/' });
        }
    }

    async logout(params: any): Promise<ApiResponse<LogoutResponse>> {
        return await makeRequest('/users/logout', 'GET', null, params.cookies);
    }

    async getUsers(params: any): Promise<ApiResponse<UsersResponse>> {
        return await await fetchData<UsersResponse>(params.parent, params.fetch, '/users');
    }
    async create(params: any, request: CreateUserRequest): Promise<ApiResponse<CreateUserResponse>> {
        return await makeRequest<CreateUserResponse>('/users', 'POST', request, params.cookies);
    }
    async login(params: any, request: LoginRequest): Promise<ApiResponse<LoginResponse>> {
        return await makeRequest<LoginResponse>('/users/login', 'POST', request, params.cookies);
    }

}