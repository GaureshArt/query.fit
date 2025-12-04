import postgresqlLink from "@/public/app-svgs/postgresql.svg"
import supabaseLink from "@/public/app-svgs/supabase-icon.svg"
import mysqlLink from "@/public/app-svgs/mysql-icon.svg"
import neonLink from "@/public/app-svgs/neon-icon.svg"

interface IDatabaseType{
    id:number;
    iconUrl:string;
    name:string;
}
export const DATABASE_TYPES:IDatabaseType[]= [
    {
        id:1,
        iconUrl:postgresqlLink,
        name:"PostgreSQL"
    },
    {
        id:2,
        iconUrl:supabaseLink,
        name:"Supabase"
    },
    {
        id:3,
        iconUrl:mysqlLink,
        name:"MySQL"
    },
    {
        id:4,
        iconUrl:neonLink,
        name:"Neon"
    }
]