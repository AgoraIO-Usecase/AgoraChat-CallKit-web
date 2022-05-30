import AgoraRTC from 'agora-rtc-sdk-ng';
import axios from 'axios';
import WebIM from 'easemob-websdk'
import store from '../redux';
import { updateConfr, setCallStatus, CALLSTATUS, setCallDuration, changeWinSize, updateJoinedMembers, setUidToUserId } from '../redux/reducer'
import { sendTextMsg, addListener, cancelCall, sendCMDMsg, sendAlerting } from './message'
import { formatTime } from './utils'

const client = AgoraRTC.createClient({ mode: 'live', codec: 'h264' });
client.setClientRole('host');

class Manager {
	constructor(params) {
		if (params) {
			this.init(params)
		}

		this.client = client
		this.props = {}
		this.callId = ''
		WebIM.rtc = this.rtc = {
			client,
			localAudioTrack: null,
			localVideoTrack: null,
			timer: null
		}
	}

	init(appId, agoraUid, connection) {
		this.appId = appId;
		this.agoraUid = agoraUid;
		WebIM.conn = connection;
		addListener()
	}

	setCallKitProps(props) {
		this.props = props
	}

	changeState(state) {
		this.props.onStateChange && this.props.onStateChange(state)
	}

	setToken(accessToken) {
		this.accessToken = accessToken;
	}

	setUserIdMap(idMap) {
		const { getState, dispatch } = store
		dispatch(setUidToUserId(idMap))
	}

	answerCall(result, accessToken) {
		const { getState, dispatch } = store
		const state = getState()
		const { confr } = state
		if (result) {
			this.accessToken = accessToken;
			sendAlerting(confr.callerIMName, confr.callerDevId, confr.callId)
		} else {
			const { dispatch } = store
			dispatch(setCallStatus(CALLSTATUS.idle))
		}
	}

	startCall(options) {
		const { getState, dispatch } = store
		const state = getState()
		let { callId, channel, chatType, callType, to, message, groupId, groupName, accessToken } = options;
		this.accessToken = accessToken;
		if (state.confr.callId && state.callStatus > 0) {
			channel = state.confr.channel
			callId = state.confr.callId
			callType = state.confr.type
		}
		let confInfo = {
			action: 'invite',
			channelName: channel,
			type: callType, //0 1v1 audio，1 1v1 video，2 multi video 3 multi audio
			callerDevId: WebIM.conn.context.jid.clientResource,
			callId: callId,
			ts: Date.now(),
			msgType: 'rtcCallWithAgora',
			callerIMName: WebIM.conn.context.jid.name,
		}

		let msgExt = {
			channelName: channel,
			token: null,
			type: callType,
			callerDevId: WebIM.conn.context.jid.clientResource,
			callId: callId,
			calleeIMName: to,
			callerIMName: WebIM.conn.context.jid.name,
		}
		this.callId = callId
		if (chatType === 'groupChat') {
			confInfo.ext = {
				groupId: groupId,
				groupName: groupName
			}
			msgExt.ext = {
				groupId: groupId,
				groupName: groupName
			}
			sendCMDMsg(chatType, to, message, confInfo)
		} else {
			sendTextMsg(chatType, to, message, confInfo)
		}

		dispatch(updateConfr({
			ext: msgExt,
			to: to,
			from: WebIM.conn.context.jid.name
		}))
		if (state.callStatus < CALLSTATUS.inviting) {
			dispatch(setCallStatus(CALLSTATUS.inviting))
		}
	}

	async join() {
		const { getState, dispatch } = store
		let state = getState()
		if (state.callStatus === CALLSTATUS.confirmCallee) {
			return
		}
		let { confr } = state
		const username = WebIM.conn.context.userId
		const uid = await client.join(this.appId, confr.channel, this.accessToken, Number(this.agoraUid));

		const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
		this.rtc.localAudioTrack = localAudioTrack
		let config = [localAudioTrack]

		if (confr.type === 0 || confr.type === 3) {
			await client.publish(config);
			if (confr.type === 3) {
				dispatch(updateJoinedMembers({ videoElm: null, name: username, type: 'audio', value: uid, action: 'add', audio: true, video: false }))
			}
		} else {
			const localVideoTrack = await AgoraRTC.createCameraVideoTrack();
			config.push(localVideoTrack)
			this.rtc.localVideoTrack = localVideoTrack;
			await client.publish(config);
			if (confr.type === 2) {
				let videoElm = 'video' + uid;

				let joinedMembersCp = [...state.joinedMembers]
				joinedMembersCp.push({ videoElm: videoElm, name: username, type: 'video', value: uid, actionType: 'add' })

				dispatch(updateJoinedMembers({ videoElm: videoElm, name: username, type: 'video', value: uid, action: 'add', audio: true, video: true }))
				localVideoTrack.play(videoElm);

			} else {
				localVideoTrack.play("local-player");
			}
		}
		this.startTime()
	}

	startTime() {
		const { dispatch } = store
		let hour = 0, minute = 0, second = 0;
		this.rtc.intervalTimer && clearInterval(WebIM.rtc.intervalTimer)
		let timerId = setInterval(() => {
			second += 1
			if (second === 60) {
				second = 0
				minute += 1
				if (minute === 60) {
					minute = 0
					hour += 1
					if (hour == 24) {
						hour = 0
					}
				}
			}
			let time = formatTime(hour, minute, second)
			dispatch(setCallDuration(time))
		}, 1000)
		this.rtc.intervalTimer = timerId
	}

	async hangup(reson, isCancel) {
		this.rtc.localAudioTrack && this.rtc.localAudioTrack.close();
		this.rtc.localVideoTrack && this.rtc.localVideoTrack.close();
		this.rtc.intervalTimer && clearInterval(this.rtc.intervalTimer)
		const { getState, dispatch } = store
		const state = getState()
		const { confr } = state
		if (isCancel && confr.callerIMName == WebIM.conn.context.jid.name) {
			cancelCall()
		}

		this.props.onStateChange && this.props.onStateChange({
			type: 'hangup',
			reson: reson,
			callInfo: {
				...state.confr,
				duration: state.callDuration,
				groupId: state.groupId,
				groupName: state.groupName
			}
		})
		this.callId = '';
		this.rtc.client && await this.rtc.client.leave();
		dispatch(setCallStatus(CALLSTATUS.idle))
		dispatch(setCallDuration('00:00'))
		dispatch(changeWinSize('normal'))
		dispatch(updateJoinedMembers([]))
		dispatch(updateConfr({
			to: '',
			ext: {}
		}))
	}
}

export const callManager = new Manager();

export { client, WebIM }

