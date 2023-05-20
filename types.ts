import {ChatCompletionRequestMessage} from "openai/api";

export type GPTChat = {
    model: string;
    messages: ChatCompletionRequestMessage[];
    temperature: number;
    n: number,
    stream: true,
    max_tokens: number,
}