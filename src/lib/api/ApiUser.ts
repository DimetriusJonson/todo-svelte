import type { AuthData } from "$lib/model/AuthData.svelte";
import type { CreateUserRequest, User } from "$lib/model/User.svelte";
import type { Cookies } from "@sveltejs/kit";
import { ApiUserDb } from "./ApiUserDb";

export interface ApiUser {
    login(params: any, username: string, password: string,): Promise<User>;
    create(params: any, request: CreateUserRequest): Promise<User>;
    getUsers(params: any): Promise<User[]>;
    logout(params: any): Promise<boolean>;
    parseToken(params: any): AuthData | null;
    saveAuthDataAsCookie(cookies: Cookies, authData: AuthData): void;
    getUserByName(name: string): Promise<User | null>;
}

export const apiUser = new ApiUserDb();