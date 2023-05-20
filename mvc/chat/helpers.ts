import {stream} from "~/mvc/external/OpenAi";
import {allowedChatInterval, GPTChat, GPTChatQueueItem} from "~/types";
import {H3Event} from "h3";

declare global{
    var gptChatQueue: GPTChatQueueItem[]
    var processingGPTChat: boolean;
}

async function ProcessQueue(){
    let setProcessingInterval = setInterval(async () => {
        if(global.gptChatQueue.length > 0){
            global.processingGPTChat = true
            const gptChatITem = global.gptChatQueue.shift()
            if(gptChatITem) await stream(gptChatITem)
        } else if(global.gptChatQueue.length === 0){
            global.processingGPTChat = false
            clearInterval(setProcessingInterval)
        }
    }, allowedChatInterval)
}

export async function addRequestToGlobalProcessingQueue(event: H3Event, gptChat: GPTChat){
    if(!global.gptChatQueue) global.gptChatQueue = [] as GPTChatQueueItem[]
    global.gptChatQueue.push(new GPTChatQueueItem(event, gptChat))
    if(!global.processingGPTChat) ProcessQueue()
}