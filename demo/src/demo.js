
import CallKit, { join } from '../../src/index'
import './index.css';
import { WebIM } from './webim'
import React, { useState } from 'react';
import { getLoginToken, getRtctoken } from './api'
import { appId } from './config'

function App() {
    const [userInfo, setUserInfo] = useState({})
    const [groupCallData, setGroupCallData] = useState({})
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
        console.log('receive invite', accessToken, {
            channel: data.channel,
            agoraId: WebIM.conn.agoraUid,
            username: WebIM.conn.context.userId
        })
        CallKit.answerCall(true, accessToken)
    }

    const startGroupCall = async () => {
        const channel = String(Math.ceil(Math.random() * 100000000));
        const type = 2
        const { accessToken } = await getRtctoken({
            channel: channel,
            agoraId: WebIM.conn.agoraUid,
            username: WebIM.conn.context.userId
        })
        console.log('groupCallData', groupCallData)
        let options = {
            callType: 2,
            chatType: 'groupChat',
            to: groupCallData.usersId.split(','),
            // agoraUid: agoraUid,
            message: `Start video call`,
            groupId: groupCallData.groupId,
            groupName: 'Group Name',
            accessToken: accessToken,
            channel: channel,
        };
        CallKit.startCall(options);

        CallKit.setUserIdMap({ 'uid': 'chatUserId' });

    }

    const handleCallStateChange = async (info) => {
        switch (info.type) {
            case 'hangup':
            case 'refuse':
                break;
            case 'user-published':
                // getIdMap
                CallKit.setUserIdMap({ 'uid': 'chatUserId' });;
                break;
            default:
                break;
        }
    };

    const handleInputChange = (type) => (e) => {
        setGroupCallData((data) => {
            return {
                ...data,
                [type]: e.target.value
            }
        })
    }
    return (
        <div className="App">
            <h1>CallKit Demo</h1>
            <h2>1 v 1 call</h2>
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


            {/** group call */}
            <h2>group call</h2>
            <div className='form-container'>
                <label>User ID</label>
                <input onChange={handleChange('userId')} className="input"></input>

                <label>Password</label>
                <input onChange={handleChange('password')} className="input"></input>
                <button onClick={login} className="button">Login</button>

                <br />
                <label>group ID</label>
                <input onChange={handleInputChange('groupId')} className="input"></input>
                <br />
                <label>Target Users ID</label>
                <input onChange={handleInputChange('usersId')} className="input"></input>
                <button onClick={startGroupCall} className="button">startCall</button>
            </div>

            <CallKit agoraUid={WebIM.conn.agoraUid} onInvite={handleInvite} onStateChange={handleCallStateChange}></CallKit>
        </div>
    );
}

export default App;
