import { form, getRequestEvent, query } from "$app/server";
import { LoginSchema, passwordValidateRegExp, userNameValidateRegExp, type User } from '$lib/model/User.svelte';
import { checkPassword } from "$lib/server/crypt";
import { dbInsertUser, dbUpdateUserToken, findAllUsers, findUserByName } from "$lib/server/dao/user.dao";
import { createJwtToken } from "$lib/server/jwt";
import { invalid, redirect } from '@sveltejs/kit';
import { error } from "node:console";
import * as v from "valibot";

const isUserNameExist = async (input: string) => {
    return await findUserByName(input, false) === null;
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

    const dbUser = await findUserByName(userName, true);
    if (!dbUser || !dbUser.id) {
        invalid(issue.password('Неверное имя пользователя или пароль.'));
    }

    if (!await checkPassword(password, dbUser.password ?? '')) {
        invalid(issue.password('Неверное имя пользователя или пароль.'));
    }

    let token = createJwtToken(dbUser.id, dbUser.name ?? '');
    await dbUpdateUserToken(dbUser.id, token);

    event.cookies.set('todo-token', token ?? '', {
        path: '/',
        maxAge: 14 * 60 * 60 * 24
    });

    redirect(303, redirectTo);
});

export const createUser = form(CreateUserServerSchema, async ({ userName, password }) => {
    await dbInsertUser({ name: userName, password: password } as User);
    redirect(303, '/login?defUserName=' + userName);
});

export const logout = form(async () => {
    const event = getRequestEvent();

    let result = await dbUpdateUserToken(event.locals.user.id, null);
    if (result) {
        event.cookies.delete('todo-token', { path: '/' });
        redirect(302, '/');
    } else {
        error(500, 'Cant logout!');
    }
});

export const getUsers = query(async () => {
    return await findAllUsers();
});
