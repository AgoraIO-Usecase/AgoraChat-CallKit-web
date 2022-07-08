
import CallKit, { join } from '../../src/index'
import './index.css';
import { WebIM } from './webim'
import React, { useState } from 'react';
import { getLoginToken, getRtctoken } from './api'
import { appId } from './config'

function App() {
    const [userInfo, setUserInfo] = useState({})

    const login = async () => {
        console.log(userInfo)
        const { accessToken, agoraUid } = await getLoginToken(userInfo.userId, userInfo.password)
        WebIM.conn.agoraUid = agoraUid
        WebIM.conn.open({
            user: userInfo.userId,
            agoraToken: accessToken,
        })
        CallKit.init(appId, agoraUid, WebIM.conn)
    }

    const handleChange = (type) => {
        return (e) => {
            console.log('type', type)
            console.log(e.target.value)
            setUserInfo((info) => {
                return {
                    ...info,
                    [type]: e.target.value
                }
            })
        }
    }

    const startCall = async () => {
        const channel = Math.uuid(8)
        const type = 1
        const { accessToken } = await getRtctoken({
            channel: channel,
            agoraId: WebIM.conn.agoraUid,
            username: WebIM.conn.context.userId
        })

        let options = {
            callType: type,
            chatType: 'singleChat',
            to: userInfo.targetId,
            message: `invite you to video call`,
            accessToken,
            channel
        }
        CallKit.startCall(options)
    }

    const handleInvite = async (data) => {
        console.log('handleInvite data', data)
        const { accessToken } = await getRtctoken({
            channel: data.channel,
            agoraId: WebIM.conn.agoraUid,
            username: WebIM.conn.context.userId
        })

        CallKit.answerCall(true, accessToken)
    }

    return (
        <div className="App">
            <h1>CallKit Demo</h1>
            <div className='form-container'>
                <label>User ID</label>
                <input onChange={handleChange('userId')} className="input"></input>

                <label>Password</label>
                <input onChange={handleChange('password')} className="input"></input>
                <button onClick={login} className="button">Login</button>

                <br />
                <label>Target User ID</label>
                <input onChange={handleChange('targetId')} className="input"></input>
                <button onClick={startCall} className="button">startCall</button>
            </div>

            <CallKit agoraUid={WebIM.conn.agoraUid} onInvite={handleInvite}></CallKit>
        </div>
    );
}

export default App;
