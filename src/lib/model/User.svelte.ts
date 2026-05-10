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