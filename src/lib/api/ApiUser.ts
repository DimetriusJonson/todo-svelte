import type { CreateUserRequest, User } from "$lib/model/User.svelte";
import { ApiUserDb } from "./ApiUserDb";

export interface ApiUser {
    login(params: any, username: string, password: string,): Promise<User | null>;
    create(params: any, request: CreateUserRequest): Promise<User>;
    getUsers(params: any): Promise<User[]>;
    logout(params: any): Promise<boolean>;
    getUserByName(name: string): Promise<User | null>;
}

export const apiUser = new ApiUserDb();