import { form, getRequestEvent, query } from "$app/server";
import { apiUser } from '$lib/api/ApiUser';
import { LoginSchema, passwordValidateRegExp, userNameValidateRegExp, type CreateUserRequest } from '$lib/model/User.svelte';
import { deleteOnServerSecurityCookie } from "$lib/store/settings.svelte";
import { invalid, redirect } from '@sveltejs/kit';
import { error } from "node:console";
import * as v from "valibot";

const isUserNameExist = async (input: string) => {
    console.log('isUserNameExist ' + input);
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
});

export const login = form(LoginSchema, async ({ userName, password, redirectTo }, issue) => {
    const event = getRequestEvent();

    let user = await apiUser.login(null, userName, password);
    if (!user) {
        invalid(issue.password('Неверное имя пользователя или пароль.'));
    }
    apiUser.saveAuthDataAsCookie(event.cookies, { userId: user.id ?? 0, userName: user.name ?? '', token: user.token ?? '' });
    redirect(303, redirectTo);
});

export const createUser = form(CreateUserServerSchema, async ({ userName, password }) => {
    const event = getRequestEvent();

    let user = await apiUser.create({ user: event.locals.user }, { username: userName, password: password } as CreateUserRequest);
    console.log('createdUser=' + user);
    redirect(303, '/login?defUserName=' + userName);
});

export const logout = form(async () => {
    const event = getRequestEvent();

    let result = await apiUser.logout({ user: event.locals.user });
    if (result) {
        deleteOnServerSecurityCookie(event.cookies);
        redirect(302, '/');
    } else {
        error(500, 'Cant logout!');
    }
});

export const getUsers = query(async () => {
    return await apiUser.getUsers({});
});
