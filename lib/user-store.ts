import { create } from "zustand";

interface IUserInfo {
  name: string;
  setName: (name: string) => void;
  dbid: string;
  setDbid: (id: string) => void;
  dbType:"mysql" | "postgresql" | "supabase" | "neon",
  setDbType:(type:"mysql" | "postgresql" | "supabase" | "neon")=>void;
}

export const useUserInfo = create<IUserInfo>((set) => ({
  name: "",
  setName: (name) => set((state) => ({ name })),
  dbid: "",
  setDbid: (id) => set((state) => ({ dbid: id })),
  dbType:"mysql",
  setDbType:(type)=>set((state)=>({dbType:type}))
}));
