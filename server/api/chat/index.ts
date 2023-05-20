import chatController from '~/mvc/chat/controller';

export default defineEventHandler(async event => {
    return chatController(event)
})