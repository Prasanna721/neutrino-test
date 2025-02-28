'use server';

export async function getSecret(){
    return process.env.API_SECRET;
}