import './index.css';
import Avatar from '../../components/avatar';
import head from '../../assets/images/head.png';
import classnames from 'classnames';
import React, { useEffect, useContext } from 'react';
import Draggable, { DraggableCore } from 'react-draggable';
import { useSelector, useDispatch } from 'react-redux';
import { changeWinSize, CALLSTATUS } from '../../redux/reducer'
import { WebIM } from '../callManager'
import { CallkitContext } from '../../index'
function MiniWindow(props) {
	const { className } = props;
	const dispatch = useDispatch()
	const state = useSelector(state => state)
	const { callDuration, callStatus, confr } = state
	const isVideo = confr.type === 1;
	const text = callStatus < CALLSTATUS.answerCall ? 'Calling' : callDuration
	const CallkitProps = useContext(CallkitContext);
	const { contactAvatar, groupAvatar } = CallkitProps
	const cls = classnames(className, {
		'callkit-miniwin-container': true,
		'callkit-miniwin-minivideo': isVideo,
	});

	let temp
	const handleStart = () => {
		temp = Date.now()
	}

	const handleStop = () => {
		let current = Date.now()
		if (current - temp < 300) {
			dispatch(changeWinSize('normal'))
		}
	}

	useEffect(() => {
		if (confr.type !== 1) return
		if (state.windowSize === 'mini') {
			WebIM.rtc.remoteVideoTrack && WebIM.rtc.remoteVideoTrack.play('mini-player')
		}
		return () => {
			WebIM.rtc.remoteVideoTrack && WebIM.rtc.remoteVideoTrack.play('remote-player')
		}
	}, [state.windowSize])

	let avatar;
	if (confr.type > 1) {
		avatar = groupAvatar ? groupAvatar : head
	} else {
		avatar = contactAvatar ? contactAvatar : head
	}
	const avatarToShow = typeof avatar == 'object' ? avatar : <Avatar className="callkit-miniwin-avatar" src={avatar || head} alt="name" style={{ borderRadius: groupAvatar ? 'inherit' : '50%' }}></Avatar>
	const content = isVideo ? (
		<>
			<div
				id="mini-player"
				className="callkit-miniwin-video"
			></div>
			<div className="callkit-miniwin-video-text">{text}</div>
		</>
	) : (
		<>	{
			typeof avatar == 'object' ? <div className='callkit-miniwin-avatar'>
				{avatarToShow}
			</div> : avatarToShow
		}

			<span className="callkit-miniwin-text">{text}</span>
		</>
	);

	return <Draggable
		onStart={handleStart}
		onStop={handleStop}>
		<div className={cls}>{content}</div>
	</Draggable>
}

export default MiniWindow;
