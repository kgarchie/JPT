import 'dotenv/config';
import { Configuration, OpenAIApi } from "openai";
import * as fs from 'fs';

const filename = 'prompt.json';
let json_data_string = '{}'
let json_data = JSON.parse(json_data_string);
let message = '';

async function read_json_file() {
    try {
        json_data_string = fs.readFileSync(filename, 'utf-8');
    } catch (err) {
        console.log(err);
    }
}

function writeToConsole() {
    // process.stdout.write(placeholder);
    console.clear();
    console.log(message);
}

async function main(): Promise<void> {
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY
    });

    const openai = new OpenAIApi(configuration);

    const completion = await openai.createChatCompletion({
        ...json_data,
        temperature: 1,
        // top_p: 1, Choose either this or temparature
        n: 1,
        stream: true,
        max_tokens: 256,
    }, { responseType: 'stream' });

    let res_stringArray: string[] = [];
    let prefix: string;
    let jsonStartIndex: number;
    let jsonString: string;
    let placeholder: any;

    return new Promise((resolve, reject) => {
        // @ts-ignore
        completion.data.on('data', (chunk: any) => {
            res_stringArray = chunk.toString().split('\n');
            res_stringArray.forEach((res_string) => {
                if (res_string.trim() !== '') {
                    jsonStartIndex = res_string.indexOf('{');
                    if (jsonStartIndex !== -1) {
                        prefix = res_string.substring(0, jsonStartIndex);
                        jsonString = res_string.substring(jsonStartIndex);

                        if (prefix.trim() !== 'data:') throw new Error('Unexpected prefix: ' + prefix.trim());

                        placeholder = JSON.parse(jsonString).choices[0].delta?.content;

                        if (placeholder !== undefined) message += placeholder; writeToConsole();
                    } else {
                        // check for the [DONE] message
                        if (res_string.indexOf('[DONE]') !== -1) {
                            resolve();
                        } else {
                            reject('Unexpected response: ' + res_string);
                        }
                    }
                }
            });
        });
    });
}

read_json_file().then(
    async () => {
        json_data = JSON.parse(json_data_string);
        await main();
        const messageObject = {
            role: "assistant",
            content: message
        }
        json_data.messages.push(messageObject);
        // console.info("This is the complete message: ")
        // console.log(message); // Should be same as streamed message
        // write to file: If you uncomment this you will overwrite the file and have to recunstruct a new prompt
        // fs.writeFileSync(filename, JSON.stringify(json_data));
        // console.log('Done');
    }
)

