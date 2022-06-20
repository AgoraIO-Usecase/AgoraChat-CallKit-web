import Avatar from '../../components/avatar';
import Button from '../../components/button';
import Icon from '../../components/Icon';
import './index.css';
import head from '../../assets/images/head.png';
import { useEffect, useState } from 'react';
import React, { useContext } from 'react';
import { WebIM, callManager } from '../callManager'
import { useSelector, useDispatch } from 'react-redux';
import { setCallStatus, CALLSTATUS, updateJoinedMembers } from '../../redux/reducer'
import { answerCall } from '../message'
import { CallkitContext } from '../../index'
import store from '../../redux';
function VideoCall() {
	const [selfScreenFull, setScreen] = useState(true);
	const swichScreen = () => {
		setScreen(() => {
			return !selfScreenFull;
		});
	};
	return (
		<div className="callkit-single-videobox">
			<div
				id="local-player"
				className={
					selfScreenFull
						? 'callkit-single-video-self'
						: 'callkit-single-video-target'
				}
				onClick={swichScreen}
			></div>
			<div
				id="remote-player"
				className={
					!selfScreenFull
						? 'callkit-single-video-self'
						: 'callkit-single-video-target'
				}
				onClick={swichScreen}
			></div>
		</div>
	);
}
function SingleCall(props) {
	const CallkitProps = useContext(CallkitContext);
	const { style } = props;
	const [isMute, setMute] = useState(false)
	const [isCloseCamera, setCamera] = useState(false)
	const state = useSelector(state => state)
	const dispatch = useDispatch();
	const { contactAvatar } = CallkitProps
	const uid2userids = useSelector(state => state.uid2userId)
	const { client } = callManager
	callManager.setCallKitProps(CallkitProps)

	const addListener = () => {
		client.on("user-published", async (user, mediaType) => {
			CallkitProps.onStateChange && CallkitProps.onStateChange({
				type: "user-published",
				user,
				mediaType
			})

			if (uid2userids[user.uid]) {
				user.uid2userid = uid2userids[user.uid] // user.uid2userid - im user
			} else {
				user.uid2userid = user.uid
			}

			// subscribe user
			await client.subscribe(user, mediaType);

			let joined = {}
			joined = {
				name: user.uid2userid,
				videoElm: 'remote-player',
				type: mediaType,
				value: user.uid,
				action: 'add',
				audio: true,
				video: true
			}

			if (mediaType === "video") {
				const remoteVideoTrack = user.videoTrack;
				joined.video = true
				dispatch(updateJoinedMembers(joined))
				remoteVideoTrack.play('remote-player');
				WebIM.rtc.remoteVideoTrack = remoteVideoTrack;
			}

			if (mediaType === "audio") {
				const remoteAudioTrack = user.audioTrack;
				joined.audio = true
				dispatch(updateJoinedMembers(joined))
				WebIM.rtc.other = user
				remoteAudioTrack.play();
			}
		});

		client.on("user-left", (user, mediaType) => {
			CallkitProps.onStateChange && CallkitProps.onStateChange({
				type: "user-left",
				user,
				mediaType
			})
			hangup('user-left')
		})

		client.on("user-unpublished", (user, mediaType) => {
			CallkitProps.onStateChange && CallkitProps.onStateChange({
				type: "user-unpublished",
				user,
				mediaType
			})
		});
	}

	useEffect(() => {
		addListener()
		return () => {
			WebIM.rtc.client.removeAllListeners()
		}
	}, [])

	useEffect(() => {
		if (state.callStatus === CALLSTATUS.confirmRing || state.callStatus === CALLSTATUS.answerCall) {
			joinConfr()
		}
	}, [state.callStatus])

	const joinConfr = () => {
		callManager.join()
	}

	const hangup = () => {
		callManager.hangup('normal', true)
		dispatch(setCallStatus(CALLSTATUS.idle))
	}

	const accept = () => {
		answerCall('accept')
		dispatch(setCallStatus(CALLSTATUS.answerCall))

		CallkitProps.onStateChange && CallkitProps.onStateChange({
			type: "accept",
			callInfo: state.confr
		})
		clearTimeout(WebIM.rtc.timer)
	}

	const refuse = () => {
		answerCall('refuse')
		if (state.callStatus < CALLSTATUS.confirmCallee) {
			callManager.hangup('normal')
			dispatch(setCallStatus(CALLSTATUS.idle))
		}
		// CallkitProps.onStateChange && CallkitProps.onStateChange({
		// 	type: "refuse",
		// 	callInfo: state.confr,
		// 	groupId: state.groupId,
		// 	groupName: state.groupName
		// })
		clearTimeout(WebIM.rtc.timer)
	}

	const swichMic = () => {
		if (state.callStatus < CALLSTATUS.confirmRing || state.callStatus === CALLSTATUS.receivedConfirmRing) {
			return console.warn('not joined the call yet')
		}
		setMute((isMute) => !isMute)
		WebIM.rtc.localAudioTrack.setEnabled(isMute)
	}

	const swichCamera = () => {
		if (state.callStatus < CALLSTATUS.confirmRing || state.callStatus === CALLSTATUS.receivedConfirmRing) {
			return console.warn('not joined the call yet')
		}
		setCamera((isCloseCamera) => !isCloseCamera)
		let status = isCloseCamera ? true : false
		WebIM.rtc.localVideoTrack.setEnabled && WebIM.rtc.localVideoTrack.setEnabled(status)
	}

	function getControls() {
		if (state.confr.type === 0) {
			if (state.callStatus === CALLSTATUS.alerting || state.callStatus === CALLSTATUS.receivedConfirmRing) {
				// btn for callee
				return (
					<>
						<Button circle danger onClick={refuse}>
							<Icon className="iconfont icon-phone_down callkit-main-button"></Icon>
						</Button>

						<Button circle right onClick={accept}>
							<Icon className="iconfont icon-phone callkit-main-button"></Icon>
						</Button>
					</>
				)
			} else {
				return (<>
					{
						isMute ? <Button className="callkit-singleCall-slash" circle onClick={swichMic}>
							<Icon className="iconfont icon-mic_slash callkit-main-button"></Icon>
						</Button> : <Button circle onClick={swichMic}>
							<Icon className="iconfont icon-mic callkit-main-button"></Icon>
						</Button>
					}
					<Button circle danger onClick={hangup}>
						<Icon className="iconfont icon-phone_down callkit-main-button"></Icon>
					</Button>
				</>)
			}
		} else {
			if (state.callStatus === CALLSTATUS.alerting || state.callStatus === CALLSTATUS.receivedConfirmRing) {
				// btn for callee
				return (
					<>
						{
							isCloseCamera ? <Button className="callkit-singleCall-slash" circle onClick={swichCamera}>
								<Icon className="iconfont icon-video_slash callkit-main-button"></Icon>
							</Button> : <Button circle onClick={swichCamera}>
								<Icon className="iconfont icon-video callkit-main-button"></Icon>
							</Button>
						}

						<Button circle danger onClick={refuse}>
							<Icon className="iconfont icon-phone_down callkit-main-button"></Icon>
						</Button>

						<Button circle right onClick={accept}>
							<Icon className="iconfont icon-phone callkit-main-button"></Icon>
						</Button>
					</>
				)
			} else {
				return <>
					{
						isCloseCamera ? <Button className="callkit-singleCall-slash" circle onClick={swichCamera}>
							<Icon className="iconfont icon-video_slash callkit-main-button"></Icon>
						</Button> : <Button circle onClick={swichCamera}>
							<Icon className="iconfont icon-video callkit-main-button"></Icon>
						</Button>
					}

					{
						isMute ? <Button circle onClick={swichMic} className="callkit-singleCall-slash">
							<Icon className="iconfont icon-mic_slash callkit-main-button"></Icon>
						</Button> : <Button circle onClick={swichMic}>
							<Icon className="iconfont icon-mic callkit-main-button"></Icon>
						</Button>
					}

					<Button circle danger onClick={hangup}>
						<Icon className="iconfont icon-phone_down callkit-main-button"></Icon>
					</Button>
				</>
			}
		}
	}

	const showAvatar = state.confr.type === 0 ? true : (state.callStatus === 7 ? false : true)
	let callType = state.confr.type === 0 ? 'Audio Call' : 'Video Call'

	let { callerIMName, calleeIMName } = state.confr
	let myName = WebIM.conn.context.jid.name;

	let targetUserId = callerIMName == myName ? calleeIMName : callerIMName;
	let targetUserName = targetUserId
	if (uid2userids[targetUserId]) {
		targetUserName = uid2userids[targetUserId]
	}
	if (state.callStatus > CALLSTATUS.answerCall && state.confr.type === 0) {
		callType = state.callDuration
	}
	return (
		<div style={style} className="callkit-singleCall-container">
			{showAvatar && <>
				<Avatar src={contactAvatar || head} alt="name" style={{ zIndex: 9 }}></Avatar>
				<div className="callkit-singleCall-username">{targetUserName}</div>
				<div className="callkit-singleCall-title">{callType}</div>
			</>}
			{
				callType === 'Video Call' && <VideoCall />
			}
			<div className="callkit-singleCall-control">
				{getControls()}
			</div>
		</div>
	);
}

export default SingleCall;
