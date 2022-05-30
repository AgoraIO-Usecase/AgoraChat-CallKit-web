import './index.css';
import React from 'react';
import Icon from '../../components/Icon';
import { useSelector, useDispatch } from 'react-redux';
import { changeWinSize } from '../../redux/reducer';

function Header(props) {
	const dispatch = useDispatch();
	const currentSize = useSelector((state) => state.windowSize);
	const confr = useSelector((state) => state.confr)
	const state = useSelector((state) => state)
	const isGroup = confr.type === 2 || confr.type === 3;
	const onZoomWindow = () => {
		const nextSize = currentSize === 'normal' ? 'large' : 'normal';
		dispatch(changeWinSize(nextSize));
	};

	const handleClose = () => {
		dispatch(changeWinSize('mini'));
	};

	const onAddPerson = () => {
		let confrData = Object.assign({}, confr)
		confrData.groupId = state.groupId
		confrData.groupName = state.groupName
		let joinedMembers = [...state.joinedMembers]
		confrData.joinedMembers = joinedMembers.map((item) => {
			return {
				imUserId: item.name,
				agoraUid: item.value
			}
		})
		props.onAddPerson && props.onAddPerson(confrData);
	};

	const headTitle = confr.type === 0 || confr.type === 3 ? 'Audio Call' : 'Video Call'

	return (
		<div className="callkit-header-cantainer">
			<span className="callkit-header-name">{headTitle}</span>
			<div className="callkit-header-contral">
				{isGroup && <span onClick={onAddPerson}>
					<Icon className="iconfont icon-add_person icon-style"></Icon>
				</span>}
				{
					currentSize === 'normal' ? <span onClick={onZoomWindow}>
						<Icon className="iconfont icon-a-4_arrows_separation icon-style"></Icon>
					</span> : (currentSize === 'large' ? <span onClick={onZoomWindow}>
						<Icon className="iconfont icon-a-4_arrows_gathering icon-style"></Icon>
					</span> : null)
				}
				<span onClick={handleClose}>
					<Icon className="iconfont icon-x icon-style"></Icon>
				</span>
			</div>
		</div>
	);
}

export default Header;
