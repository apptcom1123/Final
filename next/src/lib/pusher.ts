import PusherClient from 'pusher-js'
import { publicENV } from './publicENV'

export const pusherClient = new PusherClient(`${publicENV.NEXT_PUBLIC_PUSHER_KEY}`, {
    cluster: `${publicENV.NEXT_PUBLIC_PUSHER_CLUSTER}`
})