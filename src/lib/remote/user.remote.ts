import { form, getRequestEvent, query } from "$app/server";
import { LoginSchema, passwordValidateRegExp, userNameValidateRegExp, type CreateUserRequest } from '$lib/model/User.svelte';
import { invalid, redirect } from '@sveltejs/kit';
import { error } from "node:console";
import * as v from "valibot";
import { userDao } from "../server/dao/UserDao";

const isUserNameExist = async (input: string) => {
    console.log('isUserNameExist ' + input);
    return await userDao.getUserByName(input) === null;
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

    let user = await userDao.login(null, userName, password);
    if (!user) {
        invalid(issue.password('Неверное имя пользователя или пароль.'));
    }

    event.cookies.set('todo-token', user.token ?? '', {
        path: '/',
        maxAge: 14 * 60 * 60 * 24
    });

    redirect(303, redirectTo);
});

export const createUser = form(CreateUserServerSchema, async ({ userName, password }) => {
    const event = getRequestEvent();

    let user = await userDao.create({ user: event.locals.user }, { username: userName, password: password } as CreateUserRequest);
    console.log('createdUser=' + user);
    redirect(303, '/login?defUserName=' + userName);
});

export const logout = form(async () => {
    const event = getRequestEvent();

    let result = await userDao.logout({ user: event.locals.user });
    if (result) {
        event.cookies.delete('todo-token', { path: '/' });
        redirect(302, '/');
    } else {
        error(500, 'Cant logout!');
    }
});

export const getUsers = query(async () => {
    return await userDao.getUsers({});
});
