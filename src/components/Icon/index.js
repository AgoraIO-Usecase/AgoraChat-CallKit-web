import './index.css';
import classnames from 'classnames';
import React from 'react';

function Icon(props) {
	const { className, spin, style, children, ...other } = props;
	const cls = classnames(className, {
		'callkit-component-icon': true,
		'icon-spin': !!spin,
	});
	return (
		<i className={cls} style={style} {...other}>
			{children}
		</i>
	);
}

export default Icon;
