export type Data = {
    "_id": string,
    "userEmail": string,
    "docID": string,
    "docName": string,
    "config"?: {
        "tone": number,
        "f0": number
    },
    "done": boolean
}

export type InsertData = {
    "userEmail": string,
    "docID": string,
    "docName": string,
    "done": boolean
}