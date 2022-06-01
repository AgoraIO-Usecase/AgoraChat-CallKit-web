import { createSlice } from '@reduxjs/toolkit';
export const CALLSTATUS = {
	idle: 0,
	inviting: 1,
	alerting: 2,
	confirmRing: 3, // caller
	receivedConfirmRing: 4, // callee
	answerCall: 5,
	receivedAnswerCall: 6,
	confirmCallee: 7
}

export const counterSlice = createSlice({
	name: 'call',
	initialState: {
		callStatus: CALLSTATUS.idle,
		windowSize: 'normal',
		callDuration: '00:00',
		confr: {
			channel: '',
			token: '',
			type: null,
			callId: null,
			callerDevId: null,
			calleeDevId: null,
			confrName: '',
			callerIMName: '',
			calleeIMName: ''
		},
		groupId: '',
		groupName: '',
		uid2userId: {},
		joinedMembers: [],
		invitedMembers: [],
	},
	reducers: {
		changeWinSize: (state, action) => {
			state.windowSize = action.payload;
		},
		setCallStatus: (state, action) => {
			state.callStatus = action.payload;
		},
		setCallDuration: (state, action) => {
			state.callDuration = action.payload;
		},
		updateConfr: (state, action) => {
			let msg = action.payload
			let confrInfo = action.payload.ext || {}
			// let confrInfo = msg.customExts || {}
			let groupId
			let gName
			let confr = {
				channel: confrInfo.channelName,
				token: confrInfo.token,
				type: confrInfo.type,
				callId: confrInfo.callId,
				callerDevId: confrInfo.callerDevId,
				calleeDevId: confrInfo.calleeDevId
			}

			if (confrInfo.type === 2 || confrInfo.type === 3) {
				confr.confrName = msg.to
			} else {
				confr.confrName = msg.from
			}

			if (confrInfo.calleeIMName) {
				confr.calleeIMName = confrInfo.calleeIMName
			}

			if (confrInfo.callerIMName) {
				confr.callerIMName = confrInfo.callerIMName
			}
			if (confrInfo.ext) {
				groupId = confrInfo.ext.groupId
				gName = confrInfo.ext.groupName
			}
			state.groupName = gName
			state.groupId = groupId
			state.confr = confr
		},

		setUidToUserId: (state, action) => {
			state.uid2userId = action.payload
		},

		updateJoinedMembers: (state, action, oth) => {
			const actionType = action.payload.action
			if (actionType === 'add') {
				let exist = false;
				let joinedMembers = [...state.joinedMembers]
				joinedMembers.forEach((item, index) => {
					if (item.name === action.payload.name || item.value === action.payload.name) {
						if (item.value === action.payload.name) {
							item.videoElm = action.payload.videoElm
							item.mediaType = action.payload.mediaType
							item.audio = action.payload.audio || false
							item.video = action.payload.video || false
							item.isSelf = action.payload.isSelf
							state.joinedMembers = joinedMembers
						}
						exist = true
					}
				})
				if (!exist) {
					delete action.payload.action
					joinedMembers.push(action.payload)
					state.joinedMembers = joinedMembers
				}
			} else {
				state.joinedMembers = action.payload
			}
		},

		updateInvitedMembers: (state, action) => {
			state.invitedMembers = action.payload
		},

	},
});

export const { changeWinSize, setCallStatus, setCallDuration, updateConfr, setUidToUserId, updateJoinedMembers, updateInvitedMembers } =
	counterSlice.actions;

export default counterSlice.reducer;
