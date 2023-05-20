import {stream} from '~/mvc/external/OpenAi'
import {H3Event} from "h3";
import {GPTChat} from "~/types";

export async function completeGPT(event:H3Event){
    const gptChat:GPTChat = await readBody(event)
    return await stream(gptChat, event)
}