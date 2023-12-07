import { z } from "zod";

const envSchema = z.object({
    "AUTH_GITHUB_ID": z.string(),
    "AUTH_GITHUB_SECRET": z.string(),
    "NEXTAUTH_SECRET": z.string(),
    "NEXT_PUBLIC_AUTH_URL": z.string().url()
})

type Env = z.infer<typeof envSchema>

export const env: Env = {
    "AUTH_GITHUB_ID": process.env.AUTH_GITHUB_ID!,
    "AUTH_GITHUB_SECRET": process.env.AUTH_GITHUB_SECRET!,
    "NEXTAUTH_SECRET": process.env.NEXTAUTH_SECRET!,
    "NEXT_PUBLIC_AUTH_URL": process.env.NEXT_PUBLIC_AUTH_URL!
}

envSchema.parse(env)