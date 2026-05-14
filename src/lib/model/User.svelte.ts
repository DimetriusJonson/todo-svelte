import * as v from "valibot";

export type User = {
    id: number | null;
    name: string | null;
    token: string | null;
};

export type UsersResponse = {
    data: User[],
}

export type LoginRequest = {
    username: string,
    password: string,
}

export type LoginResponse = {
    id: number;
    username: string;
    token: string;
}

export type CreateUserResponse = {
    id: number;
    username: string;
}

export type CreateUserRequest = {
    username: string,
    password: string,
}

export type LogoutResponse = {
    success: boolean,
}

export const LoginSchema = v.object({
    userName: v.pipe(
        v.string(),
        v.minLength(3, "Минимальное число символов 3"),
    ),
    password: v.pipe(
        v.string(),
        v.minLength(4, "Минимальное число символов 4"),
    ),
    redirectTo: v.pipe(v.string()),
});
