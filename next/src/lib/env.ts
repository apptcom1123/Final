import { z } from "zod";

const envSchema = z.object({
    "AUTH_GITHUB_ID": z.string(),
    "AUTH_GITHUB_SECRET": z.string(),
    "NEXTAUTH_SECRET": z.string(),
    "FLASK_URL": z.string().url(),
    "MONGODB_URI": z.string().url(),
    
})

type Env = z.infer<typeof envSchema>

export const env: Env = {
    "AUTH_GITHUB_ID": process.env.AUTH_GITHUB_ID!,
    "AUTH_GITHUB_SECRET": process.env.AUTH_GITHUB_SECRET!,
    "NEXTAUTH_SECRET": process.env.NEXTAUTH_SECRET!,
    "FLASK_URL": process.env.FLASK_URL!,
    "MONGODB_URI": process.env.MONGODB_URI!,

}

envSchema.parse(env)