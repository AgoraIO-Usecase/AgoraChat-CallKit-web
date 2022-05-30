import React, { useEffect } from 'react'
import Draggable from 'react-draggable';
import Header from './header';
import Main from './main';
import './index.css';
import { useSelector } from 'react-redux';
import classnames from 'classnames';
import MiniWindow from '../modules/miniWindow'
import { CALLSTATUS } from '../redux/reducer'

function Layout({ onAddPerson, onStateChange, onInvite }) {
	const confr = useSelector((state) => state.confr);
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
	useEffect(() => {
		if (callStatus === CALLSTATUS.alerting) {
			onInvite && onInvite(confr)
		}
	}, [callStatus])

	return (
		callStatus > CALLSTATUS.idle ?
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
