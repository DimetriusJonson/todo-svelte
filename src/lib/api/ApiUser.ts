import type { AuthData } from "$lib/model/AuthData.svelte";
import type { CreateUserRequest, CreateUserResponse, LoginRequest, LoginResponse, LogoutResponse, User, UsersResponse } from "$lib/model/User.svelte";
import type { Cookies } from "@sveltejs/kit";
import type { ApiResponse } from "./ApiCommon.svelte";

export interface ApiUser {
    login(params: any, request: LoginRequest): Promise<ApiResponse<LoginResponse>>;
    create(params: any, request: CreateUserRequest): Promise<ApiResponse<CreateUserResponse>>;
    getUsers(params: any): Promise<ApiResponse<UsersResponse>>;
    logout(params: any): Promise<ApiResponse<LogoutResponse>>;
    parseToken(params: any): AuthData | null;
    saveAuthDataAsCookie(cookies: Cookies, authData: AuthData): void;
    getUserByName(name: string): Promise<User | null>;
}

//import { ApiUserRemote } from "./ApiUserRemote";
//export const apiUser = new ApiUserRemote();

//import { ApiUserDb } from "./ApiUserDb";
//export const apiUser = new ApiUserDb();

import { ApiUserNeonDb } from "./ApiUserNeonDb";
export const apiUser = new ApiUserNeonDb();