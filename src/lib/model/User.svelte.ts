import * as v from "valibot";

export type User = {
    id: number | null;
    name: string | null;
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

export const userNameValidateRegExp = v.regex(/^[a-zA-Z][a-zA-Z0-9_]{2,15}$/, 'Начинается с буквы, за которой следуют буквы, цифры или подчеркивания.');
export const passwordValidateRegExp = v.regex(/^.{4,}$/, "Минимум 4 символов.");

export const LoginSchema = v.object({
    userName: v.pipe(
        v.string(),
        userNameValidateRegExp
    ),
    password: v.pipe(
        v.string(),
        passwordValidateRegExp,
    ),
    redirectTo: v.pipe(v.string()),
});

export const CreateUserSchema = v.object({
    userName: v.pipe(
        v.string(),
        userNameValidateRegExp,
    ),
    password: v.pipe(
        v.string(),
        passwordValidateRegExp,
    ),
    redirectTo: v.pipe(v.string()),
});

