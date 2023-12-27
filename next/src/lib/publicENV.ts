import { z } from "zod";

const envSchema = z.object({
    "NEXT_PUBLIC_PUSHER_KEY": z.string(),
    "NEXT_PUBLIC_PUSHER_CLUSTER": z.string()
    
})

type Env = z.infer<typeof envSchema>

export const publicENV: Env = {
    "NEXT_PUBLIC_PUSHER_KEY": process.env.NEXT_PUBLIC_PUSHER_KEY!,
    "NEXT_PUBLIC_PUSHER_CLUSTER":process.env.NEXT_PUBLIC_PUSHER_CLUSTER!

}

envSchema.parse(publicENV)