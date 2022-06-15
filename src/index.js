import React from 'react'
import './style.css'
import './assets/icon/iconfont.css';
import {
  Provider,
} from 'react-redux';
import store from './redux';
import Layout from './layout';
import { callManager } from './modules/callManager'
import { sendTextMsg } from './modules/message'

window.callkit_store = store;
export const CallkitContext = React.createContext()
function Callkit(props) {
  return (
    <Provider store={store}>
      <div>
        <CallkitContext.Provider value={props}>
          <Layout {...props}></Layout>
        </CallkitContext.Provider>
      </div>
    </Provider>
  );
}

Callkit.init = (appId, uid, conn) => {
  if (typeof appId !== 'string') {
    throw new Error(`invalid parameter appId: ${appId}`)
  } else if (typeof uid !== 'string') {
    throw new Error(`invalid parameter uid: ${uid}`)
  } else if (typeof conn !== 'object') {
    throw new Error(`invalid parameter conn: ${conn}`)
  }
  callManager.init(appId, uid, conn)
}

Callkit.startCall = function (options) {
  if (typeof options.to !== 'string' && !(options.to instanceof Array)) {
    throw new Error(`invalid parameter options.to: ${options.to}`)
  } else if (typeof options.channel !== 'string') {
    throw new Error(`invalid parameter options.channel: ${options.channel}`)
  } else if (typeof options.accessToken !== 'string') {
    throw new Error(`invalid parameter options.accessToken: ${options.accessToken}`)
  } else if (![0, 1, 2, 3].includes(options.callType)) {
    throw new Error(`invalid parameter options.callType: ${options.callType}`)
  } else if (options.chatType === 'groupChat' && !options.groupId) {
    throw new Error(`The groupId is required`)
  }

  if (options.chatType === 'groupChat' && Array.isArray(options.to)) {
    const callId = WebIM.conn.getUniqueId().toString();
    const channel = options.channel || Math.uuid(8)
    const params = {
      ...options,
      callId,
      channel
    }
    options.to.forEach((userId) => {
      params.to = userId
      params.chatType = 'singleChat'
      callManager.startCall(params)
    })

    sendTextMsg(options.chatType, options.groupId, options.message, { action: 'invite', type: options.callType, msgType: 'rtcCallWithAgora', callId, channelName: channel, callerDevId: WebIM.conn.context.jid.clientResource, ts: Date.now() })
    return
  }
  const callId = WebIM.conn.getUniqueId().toString();
  const params = {
    ...options,
    callId,
  }
  callManager.startCall(params)
  return {
    callId
  }
}

Callkit.answerCall = function (result, token) {
  if (typeof result !== 'boolean') {
    throw new Error(`invalid parameter result: ${result}`)
  } else if (typeof token !== 'string') {
    throw new Error(`invalid parameter token: ${token}`)
  }
  callManager.answerCall(result, token)
}

Callkit.setUserIdMap = function (idMap) {
  if (typeof idMap !== 'object') {
    throw new Error(`invalid parameter idMap: ${idMap}`)
  }
  callManager.setUserIdMap(idMap)
}

export default Callkit;

