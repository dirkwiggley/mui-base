import * as React from "react";

export interface UserInfo {
    id: number;
    login: string;
    nickname: string;
    email: string;
    roles: string[];
    active: boolean;
    resetpwd: boolean;
    refreshtoken?: string;
};

export const instanceofUserInfo = (x: any): boolean => {
    if (x.id && x.login && x.nickname && x.email && x.roles) 
        return true;
    else return false;
}

export const convertToUserInfo = (x: any): UserInfo => {
    let newUserInfo: UserInfo = 
    {
        id: x.id,
        login: x.login,
        nickname: x.nickname,
        email: x.email,
        roles: x.roles,
        active: x.active,
        resetpwd: x.resetpwd,
        refreshtoken: x.refreshtoken
    };
    return newUserInfo;
}

const defaultUserInfo: UserInfo = {
    id: 0,
    login: "nobody",
    nickname: "nobody",
    email: "default@default.com",
    roles: [],
    active: false,
    resetpwd: false,
    refreshtoken: "",
}

export const useAuthStore = (initial: UserInfo) => React.useState<UserInfo | null>(initial);
export type UseAuthStoreType = ReturnType<typeof useAuthStore>;
export type AuthStoreType = UseAuthStoreType[0];
export type SetAuthStoreType = UseAuthStoreType[1];

const AuthContext = React.createContext<UseAuthStoreType | null>(null);

export const useAuthContext = () => React.useContext(AuthContext)!; 

export const AuthProvider = ({ children }: {children: React.ReactNode}) => (
        <AuthContext.Provider value={useAuthStore(defaultUserInfo)}>
            {children}
        </AuthContext.Provider>
 );



