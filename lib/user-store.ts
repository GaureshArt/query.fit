import {create} from "zustand"

interface IUserInfo{
    name:string;
    setName:(name:string)=>void;
}

export const useUserInfo = create<IUserInfo>((set)=>({
    name:"",
    setName:(name)=>set((state)=>({name}))
}))