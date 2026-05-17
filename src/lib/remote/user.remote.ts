import { form, getRequestEvent } from "$app/server";
import { apiUser } from '$lib/api/ApiUser';
import { LoginSchema, passwordValidateRegExp, userNameValidateRegExp, type CreateUserRequest, type LoginRequest } from '$lib/model/User.svelte';
import { deleteOnServerSecurityCookie } from "$lib/store/settings.svelte";
import { redirect } from '@sveltejs/kit';
import { error } from "node:console";
import * as v from "valibot";

const isUserNameExist = async (input: string) => {
    return await apiUser.getUserByName(input) === null;
};

const CreateUserServerSchema = v.objectAsync({
    userName: v.pipeAsync(
        v.string(),
        userNameValidateRegExp,
        v.checkAsync(isUserNameExist, "Пользователь уже существует."),
    ),
    password: v.pipe(
        v.string(),
        passwordValidateRegExp,
    ),
    redirectTo: v.pipe(v.string()),
});

export const login = form(LoginSchema, async ({ userName, password, redirectTo }) => {
    const event = getRequestEvent();

    let result = await apiUser.login(null, { username: userName, password: password } as LoginRequest);
    if (result.success) {
        apiUser.saveAuthDataAsCookie(event.cookies, { userId: result.responseData?.id ?? 0, userName: result.responseData?.username ?? '', token: result.responseData?.token ?? '' });
        redirect(303, redirectTo);
    }
    error(result.status, result.error?.message);
});

export const createUser = form(CreateUserServerSchema, async ({ userName, password, redirectTo }) => {
    const event = getRequestEvent();

    let result = await apiUser.create({ user: event.locals.user }, { username: userName, password: password } as CreateUserRequest);
    if (result.success) {
        redirect(303, redirectTo + userName);
    }
    error(result.status, result.error?.message);
});

export const logout = form(async () => {
    const event = getRequestEvent();

    let result = await apiUser.logout({ user: event.locals.user });
    if (!result.success && !result.error?.unAuthorized) {
        error(result.status, result.error?.message);
    }

    deleteOnServerSecurityCookie(event.cookies);
    redirect(302, '/');
});