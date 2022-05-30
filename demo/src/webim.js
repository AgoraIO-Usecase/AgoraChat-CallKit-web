import WebIM from "agora-chat";
import { appKey } from './config'
WebIM.conn = new WebIM.connection({
    appKey: appKey
})

WebIM.conn.addEventHandler('connection', {
    onConnected: () => {
        console.log('login success')
        alert('login success')
    },
})

export { WebIM }