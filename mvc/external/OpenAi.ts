import {Configuration, OpenAIApi} from "openai";
import {GPTChatQueueItem, HttpResponse} from "~/types";

export async function stream(gptChatQueueItem: GPTChatQueueItem): Promise<void> {
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY
    });

    const openai = new OpenAIApi(configuration);
    const completion = await openai.createChatCompletion({
        ...gptChatQueueItem.gptChat,
        stream: true,
    }, {responseType: 'stream'});

    // @ts-ignore
    // completion.data.pipe(event.node.res)

    return new Promise((resolve, reject) => {
        // @ts-ignore
        completion.data.on('data', (chunk: any) => {
            console.log(chunk.toString());
            gptChatQueueItem.write(chunk);
        });

        // @ts-ignore
        completion.data.on('error', (err: Error) => {
            gptChatQueueItem.write(JSON.stringify(
                {
                    statusCode: 500,
                    body: err
                } as HttpResponse
            ))
            gptChatQueueItem.end();
            reject(err);
        });

        // @ts-ignore
        completion.data.on('end', () => {
            gptChatQueueItem.end();
            resolve();
        });
    });
}
