import React, { useEffect, useContext, useRef } from 'react'
import Draggable from 'react-draggable';
import Header from './header';
import Main from './main';
import './index.css';
import { useSelector } from 'react-redux';
import classnames from 'classnames';
import MiniWindow from '../modules/miniWindow'
import { CALLSTATUS } from '../redux/reducer'
import { CallkitContext } from '../index'
function Layout({ onAddPerson, onStateChange, onInvite }) {
	const CallkitProps = useContext(CallkitContext);
	const confr = useSelector((state) => state.confr);
	const state = useSelector((state) => state)
	const size = useSelector((state) => state.windowSize);
	const callStatus = useSelector((state) => state.callStatus);
	const cls = classnames('callkit-layout-cantainer', {
		'callkit-layout-large': size === 'large',
		'callkit-layout-displaynone': size === 'mini'
	});
	const miniCls = classnames({
		'callkit-layout-displaynone': size !== 'mini'
	})
	const position = size === 'large' ? { x: 0, y: 0 } : null

	const addPerson = (confr) => {
		onAddPerson && onAddPerson(confr)
	}
	let audio = useRef(null)
	useEffect(() => {
		if (callStatus === CALLSTATUS.alerting) {
			const confrCopy = { ...confr }
			if (confr.type === 2 || confr.type === 3) {
				confrCopy.groupId = state.groupId
				confrCopy.groupName = state.groupName
			}
			onInvite && onInvite(confrCopy)
			if (!CallkitProps.ringingSource) {
				console.warn('no ringing source.')
				return
			}
			audio.current = new Audio()
			audio.current.muted = "muted"
			audio.current.src = CallkitProps.ringingSource
			audio.current.play()
			audio.current.muted = false

			audio.current.onended = () => {
				audio.current.load()
				audio.current.play()
			}
		} else if (callStatus != CALLSTATUS.receivedConfirmRing) {
			if (!audio.current) return
			audio.current.pause()
			audio.current.src = null;
			audio.current.load()
		}

	}, [callStatus])

	return (
		callStatus > CALLSTATUS.idle && callStatus != CALLSTATUS.alerting ?
			<>
				<Draggable position={position}>
					<div className={cls}>
						<Header onAddPerson={addPerson}></Header>
						<Main></Main>
					</div>
				</Draggable>

				<MiniWindow className={miniCls}></MiniWindow>
			</>
			: null
	);
}

export default Layout;
