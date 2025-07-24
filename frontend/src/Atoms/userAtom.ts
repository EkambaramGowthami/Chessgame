import { atom } from "recoil";
export interface user_Type {
    username:string,
    email:string,
    password:string
}
export interface signin_Type {
    userOremail:string,
    password:string
}

export const userAtom = atom<user_Type>({
    key:"userAtom",
    default:{
        username:"",
        email:"",
        password:""
    }
});
export const signinAtom = atom<signin_Type>({
    key:"signiAtom",
    default:{
        userOremail:"",
        password:""
    }
});
export const authUserAtom = atom<user_Type>({
    key: "authUserAtom",
    default: null, 
  });
