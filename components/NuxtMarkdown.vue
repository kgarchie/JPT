<template>
    <div class="markdown-container">
        <div class="markdown" v-html="html"></div>
    </div>
</template>
<script setup lang="ts">
import MarkdownIt from 'markdown-it'
import MathJax from 'markdown-it-mathjax3'
import hljs from 'highlight.js'
import { constrainedMemory } from 'process';

const copyCodeButtons = ref<NodeListOf<HTMLButtonElement>>();

const props = defineProps({
    markdownText: {
        type: String,
        required: true
    }
})

const copyCodeButtonHTML = `<button class="copy-code-button">Copy</button>`

function highlighter(code: string, lang: string) {
    if (lang && hljs.getLanguage(lang)) {
        try {
            return '<pre class="hljs"><code>' +
                hljs.highlight(code, { language: lang, ignoreIllegals: true }).value + '</code></pre>';
        } catch (__) { }
    }

    return '<br><pre class="hljs"><code>' + md.utils.escapeHtml(code) + '</code></pre><br>';
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

md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
    const token = tokens[idx]
    const code = token.content
    const lang = token.info
    const highlightedCode = highlighter(code, lang)
    return `<div class="code-container">${copyCodeButtonHTML}<pre class="code-block">${highlightedCode}</pre></div>`
}

const html = computed(() => {
    return md.render(props.markdownText)
})
</script>