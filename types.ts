import {ChatCompletionRequestMessage} from "openai/api";
import {H3Event} from "h3";

export type GPTChat = {
    model: string;
    messages: ChatCompletionRequestMessage[];
    temperature: number;
    n: number,
    stream: true,
    max_tokens: number,
}

export class GPTChatQueueItem {
    private readonly _event: H3Event;
    private readonly _gptChat: GPTChat;
    private headersSent: boolean = false;

    constructor(event: H3Event, gptChat: GPTChat) {
        this._event = event;
        if(!this.headersSent){
            // set header to text/event-stream
            this._event.node.res.setHeader('Content-Type', 'text/event-stream');
            // set header to no cache
            this._event.node.res.setHeader('Cache-Control', 'no-cache');
            // set header to keep connection alive
            this._event.node.res.setHeader('Connection', 'keep-alive');
            // flush headers
            this._event.node.res.flushHeaders();
            this.headersSent = true;
        } else {
            console.warn("Headers already sent")
        }

        const response = {} as HttpResponse
        response.statusCode = 204
        response.body = "Processing"

        this._event.node.res.write(JSON.stringify(response))

        this._gptChat = gptChat;
    }

    write(chunk: any) {
        this._event.node.res.write(chunk);
    }

    end() {
        this._event.node.res.end();
    }

    get gptChat(): GPTChat {
        return this._gptChat;
    }
}

export type HttpResponse = {
    statusCode: number;
    body?: any;
}

export const allowedChatInterval = 1000 * 3 // 3 seconds

export type UserStateType = {
    user_id: String,
    bearer: String,
    is_admin: String
}

export type UserCookie = {
    bearer: String
}