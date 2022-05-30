import './index.css';
import classnames from 'classnames';
import React from 'react'


function Button(props) {
	const { className, circle, children, right, danger, primary, ...others } =
		props;
	const cls = classnames(
		'callkit-component-button',
		{
			'callkit-component-button-circle': !!circle,
			'callkit-root-button-right': !!right,
			'callkit-root-button-danger': !!danger,
			'callkit-root-button-primary': !!primary,
			'callkit-root-button-default': !primary && !danger && !right,
		},
		className
	);
	return (
		<button className={cls} {...others}>
			{children}
		</button>
	);
}

export default Button;
