import {Configuration, OpenAIApi} from "openai";
import {GPTChat} from "~/types";
import {H3Event} from "h3";

export async function stream(gptChat: GPTChat, event:H3Event): Promise<void> {
    // set header to text/event-stream
    event.node.res.setHeader('Content-Type', 'text/event-stream');
    // set header to no cache
    event.node.res.setHeader('Cache-Control', 'no-cache');
    // set header to keep connection alive
    event.node.res.setHeader('Connection', 'keep-alive');
    // flush headers
    event.node.res.flushHeaders();

    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY
    });

    const openai = new OpenAIApi(configuration);
    const completion = await openai.createChatCompletion({
        ...gptChat,
        stream: true,
    }, {responseType: 'stream'});

    // @ts-ignore
    // completion.data.pipe(event.node.res)

    return new Promise((resolve, reject) => {
        // @ts-ignore
        completion.data.on('data', (chunk: any) => {
            event.node.res.write(chunk);
        });

        // @ts-ignore
        completion.data.on('error', (err: Error) => {
            event.node.res.end();
            reject(err);
        });

        // @ts-ignore
        completion.data.on('end', () => {
            event.node.res.end();
            resolve();
        });
    });
}
