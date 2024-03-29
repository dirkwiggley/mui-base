import * as React from "react";

import { UserInterface } from "../types";

export const instanceofUserInfo = (x: any): boolean => {
    if (x.id && x.login && x.nickname && x.email && x.roles)
        return true;
    else return false;
}


export const refreshTokenIsString = (refreshToken: string | undefined): refreshToken is string => {
    return typeof refreshToken === "string";
}

export const convertToUserInfo = (x: any): UserInterface => {
    let newUserInfo: UserInterface =
    {
        id: x.id,
        login: x.login,
        nickname: x.nickname,
        email: x.email,
        roles: x.roles,
        locale: x.locale,
        active: x.active,
        resetpwd: x.resetpwd,
        refreshtoken: x.refreshtoken
    };
    return newUserInfo;
}

export const defaultUserInfo: UserInterface = {
    id: 0,
    login: "nobody",
    nickname: "nobody",
    email: "default@default.com",
    roles: [],
    locale: "enUS",
    active: false,
    resetpwd: false,
    refreshtoken: "",
}

export const useAuthStore = (initial: UserInterface) => React.useState<UserInterface | null>(initial);
export type UseAuthStoreType = ReturnType<typeof useAuthStore>;
export type AuthStoreType = UseAuthStoreType[0];
export type SetAuthStoreType = UseAuthStoreType[1];

const AuthContext = React.createContext<UseAuthStoreType | null>(null);

export const useAuthContext = () => React.useContext(AuthContext)!;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => (
    <AuthContext.Provider value={useAuthStore(defaultUserInfo)}>
        {children}
    </AuthContext.Provider>
);



