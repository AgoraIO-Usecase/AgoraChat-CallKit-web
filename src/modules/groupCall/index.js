import './index.css';
import Avatar from '../../components/avatar';
import React, { useState, useEffect, memo, useContext } from 'react';

import head from '../../assets/images/head.png';
import classnames from 'classnames';
import Icon from '../../components/Icon';
import Button from '../../components/button';
import { useSelector, useDispatch } from 'react-redux';
import { updateConfr, setCallStatus, CALLSTATUS, updateJoinedMembers, setUidToUserId } from '../../redux/reducer'
import { answerCall } from '../message'
import { WebIM, callManager } from '../callManager'
import store from '../../redux';
import { CallkitContext } from '../../index';

const MAXUSERS = 16
function VideoCall(props) {
	const { text, className, id, avatarUrl } = props;
	const CallkitProps = useContext(CallkitContext);
	// const { contactAvatar } = CallkitProps
	const cls = classnames(className, {
		'callkit-group-video-box-4': true
	})
	const data = props.data
	const audioIconClass = classnames({
		iconfont: true,
		'icon-mic_slash': true,
		'callkit-group-audio-icon2': true,
		'display-none': data.audio,
	});
	const videoIconClass = classnames({
		iconfont: true,
		'icon-video_slash': true,
		'callkit-group-video-icon': true,
		'display-none': data.video,
	});
	const showAvatar = !data.video

	const nameClass = classnames('callkit-group-video-name', {
		'callkit-group-video-name-left': !showAvatar && data.isSelf
	})
	return (
		<div className={cls} id={id}>
			{showAvatar && <div className='callkit-group-video-avatar-box'><Avatar src={avatarUrl || head} className="callkit-group-audio-avatar"></Avatar></div>}
			<span className={nameClass}>{text}</span>
			<Icon className={audioIconClass}></Icon>
			<Icon className={videoIconClass}></Icon>
		</div>
	);
}

function AudioCall(props) {
	const { active, text, mute, avatarUrl } = props;
	const CallkitProps = useContext(CallkitContext);
	// const { contactAvatar } = CallkitProps
	const cls = classnames({
		'callkit-group-audio-avatar': true,
		'callkit-group-audio-active': active,
	});

	const iconClass = classnames({
		iconfont: true,
		'icon-mic_slash': true,
		'callkit-group-audio-icon': true,
		'display-none': !mute,
	});
	return (
		<div className="callkit-group-audio-container">
			<Avatar src={avatarUrl || head} alt="name" className={cls}>{text}</Avatar>
			<Icon className={iconClass}></Icon>
			<div className="callkit-group-audio-username">
				{text}
			</div>
		</div>
	);
}

function GroupCall(props) {
	const CallkitProps = useContext(CallkitContext);
	const [isMute, setMute] = useState(false)
	const [isCloseCamera, setCamera] = useState(false)
	const [isTalking, setTalkings] = useState([])
	const state = useSelector(state => state)
	const uid2userids = useSelector(state => state.uid2userId)
	const userInfo = useSelector(state => state.userInfo)
	const dispatch = useDispatch();
	const username = WebIM.conn.context.userId
	const { groupAvatar } = CallkitProps
	function getControls() {
		if (state.confr.type === 3) {
			if (state.callStatus === 2 || state.callStatus === 4) {
				// 受邀请方按钮
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
			if (state.callStatus === 2 || state.callStatus === 4) {
				// 受邀请方按钮
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
	callManager.setCallKitProps(CallkitProps)

	async function addListener() {
		WebIM.rtc.client.on("user-published", async (user, mediaType) => {
			let state = store.getState()
			if (state.joinedMembers.length >= MAXUSERS) return;
			CallkitProps.onStateChange && CallkitProps.onStateChange({
				type: "user-published",
				user,
				mediaType,
				confr: state.confr
			})
			if (uid2userids[user.uid]) {
				user.uid2userid = uid2userids[user.uid] // user.uid2userid - im user
			} else {
				user.uid2userid = user.uid
			}
			await WebIM.rtc.client.subscribe(user, mediaType);
			let videoElm = ''
			let joined = {}
			joined = {
				name: user.uid2userid,
				videoElm: 'video' + user.uid,
				type: mediaType,
				value: user.uid,
				action: 'add',
				audio: true,
				video: true
			}
			state.joinedMembers.forEach((member) => {
				if (member.value == user.uid) {
					joined = Object.assign({ action: 'add' }, member)
				}
			})

			videoElm = 'video' + user.uid;

			// subscribe video stream。
			if (mediaType === "video") {
				const remoteVideoTrack = user.videoTrack;
				joined.video = true
				dispatch(updateJoinedMembers(joined))
				setTimeout(() => {
					remoteVideoTrack.play(videoElm);
				}, 500)
			}

			// subscribe audio stream。
			if (mediaType === "audio") {
				joined.audio = true
				dispatch(updateJoinedMembers(joined))
				const remoteAudioTrack = user.audioTrack;
				remoteAudioTrack && remoteAudioTrack.play();
			}
		});

		WebIM.rtc.client.on("user-unpublished", (user, mediaType) => {
			let state = store.getState()
			CallkitProps.onStateChange && CallkitProps.onStateChange({
				type: "user-unpublished",
				user,
				mediaType
			})
			const joinedMembersCp = [...state.joinedMembers]
			joinedMembersCp.forEach((item, index) => {
				if (item.value == user.uid) {
					let user = Object.assign({}, item)
					if (mediaType === 'audio') {
						user.audio = false
					} else {
						user.video = false
					}
					joinedMembersCp[index] = user
				}
			})
			dispatch(updateJoinedMembers(joinedMembersCp))
		});

		WebIM.rtc.client.on("user-left", (user, mediaType) => {
			CallkitProps.onStateChange && CallkitProps.onStateChange({
				type: "user-left",
				user,
				mediaType
			})
			let state = store.getState()

			let joinCurrent = state.joinedMembers.filter((item) => {
				return item.value !== user.uid
			});
			dispatch(updateJoinedMembers(joinCurrent))
		})

		WebIM.rtc.client.enableAudioVolumeIndicator();
		WebIM.rtc.client.on("volume-indicator", (result) => {
			let isTalkingCp = [...isTalking]
			result.forEach((volume, index) => {
				let userId = uid2userids[volume.uid] // userId - im user id
				if (!userId) return;
				if (volume.level > 1 && !isTalkingCp.includes(userId)) {
					isTalkingCp.push(userId)
				} else {
					if (volume.level < 1 && isTalkingCp.includes(userId)) {
						let i = isTalkingCp.indexOf(userId)
						isTalkingCp.splice(i, 1)
					}
				}
			});
			setTalkings(isTalkingCp)
		});
	}

	useEffect(() => {
		addListener()
		return () => {
			WebIM.rtc.client.removeAllListeners()
			dispatch(updateConfr({}))
			dispatch(setCallStatus(CALLSTATUS.idle))
			clearTimeout(WebIM.rtc.timer)
		}
	}, [])

	useEffect(() => {
		let newJoined = [...state.joinedMembers]
		newJoined.forEach((item, index) => {
			let newJoinedItem = {
				name: item.name,
				type: item.type,
				value: item.value,
				videoElm: item.videoElm,
				video: item.video,
				audio: item.audio,
				isSelf: item.isSelf
			}
			if (newJoinedItem.value in uid2userids) {
				newJoinedItem.name = uid2userids[newJoinedItem.value]
			}
			newJoined[index] = newJoinedItem
		})
		dispatch(updateJoinedMembers(newJoined))
	}, [Object.keys(state.uid2userId).length, state.joinedMembers.length])


	const joinConfr = async () => {
		await callManager.join()
	}

	useEffect(() => {
		if (state.callStatus === CALLSTATUS.confirmRing || state.callStatus === CALLSTATUS.answerCall) {
			joinConfr()
		}
	}, [state.callStatus])


	const hangup = () => {
		if (state.callStatus < CALLSTATUS.confirmCallee) {
			// The call has not been connected, send cancel call
			callManager.hangup('normal', true)
		} else {
			// The call has been connected, don't send cancel call
			if (state.joinedMembers.length == 1 && state.confr.callerIMName == username) {
				// send cancel when you are left alone
				callManager.hangup('normal', true)
				return
			}
			callManager.hangup('normal', false)
		}
		dispatch(setCallStatus(CALLSTATUS.idle))
	}

	const accept = () => {
		answerCall('accept')
		dispatch(setCallStatus(CALLSTATUS.answerCall)) // 5
		CallkitProps.onStateChange && CallkitProps.onStateChange({
			type: "accept",
			callInfo: state.confr
		})
		clearTimeout(WebIM.rtc.timer)
	}

	const refuse = () => {
		answerCall('refuse') // 
		if (state.callStatus < 7) { //拒接
			callManager.hangup('refuse')
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

		const joinedMembersCp = [...state.joinedMembers]
		joinedMembersCp.forEach((item, index) => {
			if (item.value == callManager.agoraUid) {
				let user = Object.assign({}, item)
				user.video = status
				joinedMembersCp[index] = user
			}
		})
		dispatch(updateJoinedMembers(joinedMembersCp))
	}

	const showAvatar = [0, 3, 5, 6, 7].includes(state.callStatus) ? false : true

	const callType = state.confr.type === 3 ? 'Audio Call' : 'Video Call'
	const containerCls = classnames({
		'callkit-groupCall-container': true,
		'callkit-group-flex-start': state.joinedMembers.length > 6,
		'callkit-group-container-video': state.confr.type === 2
	})
	const avatarToShow = typeof groupAvatar == 'object' ? groupAvatar : <Avatar src={groupAvatar || head} alt="name" style={{ zIndex: 9 }}></Avatar>
	return (
		<div className={containerCls}>

			{showAvatar && <div className='callkit-group-avatar'>
				{avatarToShow}
				<div className="callkit-singleCall-username">{state.groupName}</div>
				<div className="callkit-singleCall-title">{callType}</div>
			</div>}

			{
				state.confr.type === 3 && state.joinedMembers.map((item) => {
					let talking = isTalking.includes(item.name)
					return <AudioCall key={item.name} active={talking} text={userInfo[item.name]?.nickname || item.name} mute={!item.audio} avatarUrl={userInfo[item.name]?.avatarUrl}></AudioCall>
				})
			}

			{
				state.confr.type === 2 && state.joinedMembers.map((item) => {
					let className = ''
					if (state.joinedMembers.length <= 2) {
						if (item.isSelf) {
							className = 'callkit-group-video-2-self'
						} else {
							className = 'callkit-group-video-2-target'
						}
					}
					return <VideoCall key={item.value} text={userInfo[item.name]?.nickname || item.name} id={'video' + item.value} className={className} data={item} avatarUrl={userInfo[item.name]?.avatarUrl}></VideoCall>
				})
			}

			<div className="callkit-group-control">
				{getControls()}
			</div>
		</div>
	);
}

export default memo(GroupCall);
