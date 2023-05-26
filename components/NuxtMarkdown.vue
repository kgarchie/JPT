<template>
    <div class="markdown-container">
        <div class="markdown" v-html="html"></div>
    </div>
</template>
<script setup lang="ts">
import MarkdownIt from 'markdown-it'
import MathJax from 'markdown-it-mathjax3'
import hljs from 'highlight.js'

const copyCodeButtons = ref<NodeListOf<HTMLButtonElement>>()

const props = defineProps({
    markdownText: {
        type: String,
        required: true
    }
})

const copyCodeButtonHTML = `<div style="
                                position: absolute;
                                top: 0;
                                right: 50px;
                                padding: 0.5rem;
                                background-color: #000000;
                                color: #ffffff;
                                border-radius: 0 0 0 0.5rem;
                                font-size: 0.75rem;
                                font-weight: bold;
                                opacity: 0;
                                transition: opacity 0.2s ease-in-out;"></div>
                                <button class="copy-code-button">Copy</button>`

function highlighter(code: string, lang: string) {
    if (lang && hljs.getLanguage(lang)) {
        try {
            return ['<pre class="hljs"><code>' + hljs.highlight(code, { language: lang, ignoreIllegals: true }).value + '</code></pre>', true];
        } catch (__) {}
    }

    return ['<br><pre class="hljs"><code>' + md.utils.escapeHtml(code) + '</code></pre><br>', false];
}

const md = new MarkdownIt({
    html: true,
    breaks: true,
    xhtmlOut: true,
    linkify: true,
    typographer: true,
    highlight: highlighter
})

md.use(MathJax)

md.renderer.rules.fence = (tokens: any, idx: string | number, options: any, env: any, slf: any) => {
    const token = tokens[idx]
    const code = token.content
    const lang = token.info
    const [highlightedCode, _] = highlighter(code, lang)
    return `<div class="code-container">${copyCodeButtonHTML}<pre class="code-block">${highlightedCode}</pre></div>`
}

const html = computed(() => {
    if(props.markdownText && props.markdownText.trim() != ''){
        return md.render(props.markdownText)
    }
})

nextTick(
    () => {
        copyCodeButtons.value = document.querySelectorAll('.copy-code-button')
        for(const el of copyCodeButtons.value){
            el.addEventListener('click', (e) => {
                // @ts-ignore
                const state = e.target.previousElementSibling
                // @ts-ignore
                let code = e.target.nextElementSibling?.innerText
                if(code){
                    navigator.clipboard.writeText(code)
                    if(state){
                        state.innerText = 'Copied!'
                        state.style.opacity = '1'
                        setTimeout(() => {
                            state.style.opacity = '0'
                        }, 1000)
                    }
                } else {
                    if(state){
                        state.innerText = 'Error!'
                        state.style.opacity = '1'
                        setTimeout(() => {
                            state.style.opacity = '0'
                        }, 1000)
                    }
                }
            })
        }
    }
)
</script>