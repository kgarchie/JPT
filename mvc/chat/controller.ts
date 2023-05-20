import {createRouter, defineEventHandler} from "h3";
import {completeGPT} from "~/mvc/chat/functions";

const router = createRouter()

router.post('/gpt', defineEventHandler(async event => {
    return await completeGPT(event)
}))


export default useBase('/api/chat', router.handler)