import SingleCall from '../../modules/singleCall';
import GroupCall from '../../modules/groupCall';
import './index.css';
import React from 'react';
import { useSelector } from 'react-redux';
function Main() {
	const state = useSelector(state => state)
	const isGroup = state.confr.type === 2 || state.confr.type === 3

	return (
		<div className="callkit-main-cantainer">
			{isGroup ? <GroupCall></GroupCall> : <SingleCall style={{ marginTop: '96px' }}></SingleCall>}
		</div>
	);
}

export default Main;
