<script setup lang="ts">
import {GPTChat, HttpResponse} from "~/types";
import {
    ChatCompletionRequestMessage,
    ChatCompletionRequestMessageRoleEnum,
    ChatCompletionResponseMessage
} from "openai";

const completion = ref('')
const textInput = ref('')
const prompt = reactive<GPTChat>({
    model: "gpt-3.5-turbo",
    messages: [
        {
            role: ChatCompletionRequestMessageRoleEnum.System,
            content: "You are ChatGPT, a large language model trained by OpenAI. Carefully heed the user's instructions. Respond using Markdown."
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

    function parseResponse(value) {
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

                    if (prefix.trim() !== 'data:'){
                        try {
                            response = JSON.parse(letters) as HttpResponse;
                            if(response.statusCode === 204){
                                processing.value = true
                            } else if(response.statusCode === 500){
                                alert('Error: ' + response.body)
                            }
                        } catch (e) {
                            console.warn(e)
                        }
                    } else {
                        placeholder = JSON.parse(jsonString).choices[0].delta?.content;
                        if (placeholder !== undefined) {
                            completion.value += placeholder
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

    const reader = response.getReader()
    reader.read().then(function processText({done, value}) {
        if (done) {
            console.log('Stream complete');
            loading.value = false
            processing.value = false
            return;
        }
        parseResponse(value);
        return reader.read().then(processText);
    });
}
</script>

<template>
    <Title>Chat</Title>
    <div class="container">
        <div class="columns">
            <div class="column is-8 is-offset-2">
                <div v-for="(message, index) in prompt.messages" :key="index">
                    <div v-if="message.role === ChatCompletionRequestMessageRoleEnum.System" class="system-message">
                        <p>{{ message.content }}</p>
                    </div>
                    <div v-else-if="message.role === ChatCompletionRequestMessageRoleEnum.User" class="user-message">
                        <p>{{ message.content }}</p>
                    </div>
                    <div v-else-if="message.role === ChatCompletionRequestMessageRoleEnum.Assistant"
                         class="assistant-message">
                        <p>{{ message.content }}</p>
                    </div>
                </div>
                <div class="assistant-message" v-if="completion !== ''">
                    <p>{{ completion }}</p>
                </div>
                <div class="field">
                    <div class="control">
                        <textarea class="textarea" type="text" placeholder="Type your message here..."
                                  v-model="textInput"></textarea>
                    </div>
                </div>
                <div class="buttons">
                    <button class="button" :class="{'is-loading': loading, 'is-success': processing}"
                            @click="getChatCompletion">Send
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.system-message {

}
</style>