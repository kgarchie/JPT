// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    css: [
        '~/assets/css/style.css',
        '~/assets/css/highlight.css'
    ],
    runtimeConfig: {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY
    }
})