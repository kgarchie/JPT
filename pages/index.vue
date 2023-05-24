<template>
    <Title>Chat</Title>
    <div class="container">
        <div class="main-column">
            <div class="completion">
                <div v-for="(message, index) in prompt.messages" :key="index">
                    <div v-if="message.role === ChatCompletionRequestMessageRoleEnum.System" class="message system-message">
                        <p>{{ message.content }}</p>
                    </div>
                    <div v-else-if="message.role === ChatCompletionRequestMessageRoleEnum.User"
                        class="message user-message">
                        <p>{{ message.content }}</p>
                    </div>
                    <div v-else-if="message.role === ChatCompletionRequestMessageRoleEnum.Assistant"
                        class="message assistant-message">
                        <NuxtMarkdown :markdownText="message.content"/>
                    </div>
                </div>
                <div class="message assistant-message" v-if="processing">
                    <NuxtMarkdown :markdownText="completion"/>
                </div>
            </div>
            <div class="query">
                <div class="field">
                    <textarea class="textarea" type="text" placeholder="Type your message here..."
                        v-model="textInput"></textarea>
                    <button class="button" :class="{ 'is-loading': loading, 'is-success': processing }"
                        @click="getChatCompletion" id="sendCompletionRequest">Send</button>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { GPTChat, HttpResponse } from "~/types";
import {
    ChatCompletionRequestMessage,
    ChatCompletionRequestMessageRoleEnum,
    ChatCompletionResponseMessage
} from "openai";

const completion = ref('')
const textInput = ref('')

// @ts-expect-error Type Error
const prompt = reactive<GPTChat>({
    model: "gpt-3.5-turbo",
    messages: [
        {
            role: ChatCompletionRequestMessageRoleEnum.System,
            content: "You are ChatGPT, a large language model trained by OpenAI. Carefully heed the user's instructions. Respond using Markdown. When told to write code, enclose it in backticks. use MathJax for mathematical expressions."
        }
    ]
})
const loading = ref(false)
const processing = ref(false)

async function getChatCompletion() {
    loading.value = true
    let chatCompletionRequestMessage = {} as ChatCompletionRequestMessage;
    chatCompletionRequestMessage.role = ChatCompletionRequestMessageRoleEnum.User
    chatCompletionRequestMessage.content = textInput.value

    prompt.messages.push(chatCompletionRequestMessage)
    textInput.value = ''

    // @ts-ignore
    function parseResponse(value) {
        // @ts-ignore
        const asciiCodes = value.map(code => parseInt(code));
        const letters = String.fromCharCode(...asciiCodes);

        let res_stringArray: string[] = [];
        let prefix: string;
        let jsonStartIndex: number;
        let jsonString: string;
        let placeholder: any;
        let responseMessage = {} as ChatCompletionResponseMessage;
        let response: HttpResponse;
        responseMessage.role = ChatCompletionRequestMessageRoleEnum.Assistant
        responseMessage.content = completion.value

        res_stringArray = letters.split('\n');
        res_stringArray.forEach((res_string) => {
            if (res_string.trim() !== '') {
                jsonStartIndex = res_string.indexOf('{');
                if (jsonStartIndex !== -1) {
                    prefix = res_string.substring(0, jsonStartIndex);
                    jsonString = res_string.substring(jsonStartIndex);

                    if (prefix.trim() !== 'data:') {
                        try {
                            response = JSON.parse(letters) as HttpResponse;
                            if (response.statusCode === 204) {
                                processing.value = true
                            } else if (response.statusCode === 500) {
                                alert('Error: ' + response.body)
                            }
                        } catch (e) {
                            console.warn(e)
                        }
                    } else {
                        const responseMessage = JSON.parse(jsonString);
                        const finishReason = responseMessage.choices[0].finish_reason;
                        placeholder = responseMessage.choices[0].delta?.content;
                        if (placeholder !== undefined) {
                            completion.value += placeholder
                        }
                        if (finishReason !== null && finishReason !== 'stop') {
                            alert('Error: ' + finishReason)
                        }
                    }
                } else {
                    if (res_string.indexOf('[DONE]') !== -1) {
                        prompt.messages.push(responseMessage)
                        completion.value = ''
                        loading.value = false
                        processing.value = false
                    } else {
                        throw new Error('Unexpected response: ' + res_string);
                    }
                }
            }
        })
    }

    // WARNING: Do not use inbuilt useFetch because it sends the request twice. For a reason that I don't know.
    const response = await $fetch('/api/chat/gpt', {
        method: 'POST',
        body: prompt,
        responseType: 'stream',
    }).catch(
        (error) => {
            console.log(error)
            loading.value = false
        }
    )

    // @ts-ignore
    const reader = response.getReader()
    // @ts-ignore
    reader.read().then(function processText({ done, value }) {
        if (done) {
            loading.value = false
            processing.value = false
            return;
        }
        parseResponse(value);
        return reader.read().then(processText);
    });
}

onMounted(() => {
    const sendButton = document.getElementById('sendCompletionRequest')
    const textArea = document.querySelector('.textarea')

    textArea?.addEventListener('keydown', (e: any) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendButton?.click()
        }
    })
})
</script>
<style scoped lang="scss">
.main-column {
    width: 500px;
    min-height: 85vh;
    min-height: 85dvh;
    margin: 0 auto;
    font-size: 0.9em;
    display: flex;
    flex-direction: column;
    padding-bottom: 0.5em;

    @media screen and (max-width: 768px) {
        width: 100%;
    }

    @media screen and (min-width: 1280px) {
        width: 700px;
    }

    ;

    .query {
        margin-top: auto;

        .field {
            display: flex;
            flex-direction: row;
            align-items: center;
            width: 100%;
            position: relative;

            .textarea {
                width: 100%;
                font-family: 'Roboto Mono', monospace;
                font-size: 0.9em;
                border-radius: 5px;
                padding-left: 0.5em;
                padding-top: 0.5em;
            }

            .button {
                position: absolute;
                right: 0;
                background-color: transparent;
                border: none;
                height: 100%;
                color: hsl(0, 0%, 0%, 0.5);

                &:hover {
                    cursor: pointer;
                    color: hsl(0, 0%, 0%, 0.8);
                }

                &.is-success {
                    background-color: #85b690;
                    color: white;
                }

                &.is-loading {
                    background-color: #1d202c;
                    color: white;
                    cursor: not-allowed;
                    pointer-events: none;
                }
            }
        }
    }

    .completion {
        .message {
            margin-bottom: 0.5em;
            padding: 0.5em;

            &.user-message {
                background-color: #1c1f42;
                color: white;
                border-radius: 5px 5px 5px 0;
            }

            &.assistant-message {
                background-color: #85b690;
                color: black;
                border-radius: 5px 5px 0 5px;
            }

            &.system-message {
                background-color: #1d202c;
                border-radius: 5px 5px 5px 5px;
            }
        }
    }
}</style>
