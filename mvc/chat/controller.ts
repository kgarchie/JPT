import {createRouter, defineEventHandler} from "h3";
import {completeGPT} from "~/mvc/chat/functions";

const router = createRouter()

router.post('/gpt', defineEventHandler( event => {
    return completeGPT(event)
}))

export default useBase('/api/chat', router.handler)