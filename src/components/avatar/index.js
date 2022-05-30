import './index.css';
import classnames from 'classnames';
import React from 'react'

function Avatar(props) {
	const { src, alt, className, ...others } = props;
	const cls = classnames('callkit-component-avatar', className);
	return (
		<div className={cls} {...others}>
			<img src={src} alt={alt} draggable={false}></img>
		</div>
	);
}

export default Avatar;
