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
        v.regex(/^[a-zA-Z][a-zA-Z0-9_]{2,15}$/, 'Начинается с буквы, за которой следуют буквы, цифры или подчеркивания.')
    ),
    password: v.pipe(
        v.string(),
        v.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, "Минимум 8 символов, как минимум одна заглавная буква, одна строчная буква, одна цифра и один специальный символ."),
    ),
    redirectTo: v.pipe(v.string()),
});
