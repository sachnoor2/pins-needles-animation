import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	Sequence,
	spring,
	useCurrentFrame,
	useVideoConfig,
	Easing,
} from 'remotion';

// Mandatory Colors from CHANNEL_CODEX
const BG_COLOR = '#0E1117';
const GOLD = '#FDCB6E';
const TEAL = '#00CEC9';

const Nerve = ({pressure}: {pressure: number}) => {
	const frame = useCurrentFrame();
	const {width} = useVideoConfig();
	
	const pathWidth = 800;
	const nerveWidth = interpolate(pressure, [0, 1], [40, 15], {extrapolateRight: 'clamp'});
	
	return (
		<svg width="1000" height="200" viewBox="0 0 1000 200">
			<path
				d={`M 0 100 Q 500 ${100 + pressure * 150} 1000 100`}
				fill="none"
				stroke={GOLD}
				strokeWidth={nerveWidth}
				strokeLinecap="round"
			/>
		</svg>
	);
};

const Signal = ({delay, blocked}: {delay: number; blocked: boolean}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	
	const progress = interpolate(frame - delay, [0, 60], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	if (blocked && progress > 0.5) return null;

	const x = interpolate(progress, [0, 1], [0, 1000]);
	const opacity = interpolate(progress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);

	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: 100,
				width: 20,
				height: 20,
				backgroundColor: TEAL,
				borderRadius: '50%',
				filter: 'blur(4px)',
				opacity,
				boxShadow: `0 0 10px ${TEAL}`,
			}}
		/>
	);
};

const Tingling = () => {
	const frame = useCurrentFrame();
	const particles = Array.from({length: 20});
	
	return (
		<AbsoluteFill>
			{particles.map((_, i) => {
				const x = (Math.random() * 1000);
				const y = (Math.random() * 1000);
				const offset = Math.sin(frame * 0.5 + i) * 10;
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: x + offset,
							top: y + offset,
							width: 4,
							height: 4,
							backgroundColor: GOLD,
							opacity: 0.6,
						}}
					/>
				);
			})}
		</AbsoluteFill>
	);
};

export const PinsNeedlesViral = () => {
	const frame = useCurrentFrame();
	const {fps, width, height} = useVideoConfig();

	// Animations phases
	// 0-120: Normal flow
	// 120-300: Pressure applied (blocking)
	// 300-450: Pressure released (surge + tingling)
	
	const pressure = spring({
		frame: frame - 120,
		fps,
		config: {stiffness: 50},
	});

	const release = spring({
		frame: frame - 300,
		fps,
		config: {stiffness: 100},
	});

	const actualPressure = interpolate(pressure - release, [0, 1], [0, 1]);

	return (
		<AbsoluteFill style={{backgroundColor: BG_COLOR}}>
			{/* Dynamic Camera Movement - Mandatory */}
			<div
				style={{
					width: '100%',
					height: '100%',
					transform: `scale(${interpolate(frame, [0, 450], [1, 1.2])}) rotate(${interpolate(frame, [0, 450], [0, 2])}deg)`,
				}}
			>
				<Sequence from={0} duration={450}>
					<div style={{position: 'relative', top: height / 2 - 100, left: width / 2 - 500}}>
						<Nerve pressure={actualPressure} />
						{Array.from({length: 30}).map((_, i) => (
							<Signal 
								key={i} 
								delay={i * 20} 
								blocked={frame > 150 && frame < 300} 
							/>
						))}
					</div>
				</Sequence>

				{frame > 300 && (
					<Sequence from={300}>
						<Tingling />
					</Sequence>
				)}

				<div
					style={{
						position: 'absolute',
						bottom: 200,
						width: '100%',
						textAlign: 'center',
						fontFamily: 'Bebas Neue',
						fontSize: 80,
						color: GOLD,
						textShadow: '2px 2px 10px rgba(0,0,0,0.5)',
					}}
				>
					{frame < 120 && "NORMAL NERVE FLOW"}
					{frame >= 120 && frame < 300 && "NERVE PINCHED!"}
					{frame >= 300 && "SIGNAL OVERLOAD!"}
				</div>
			</div>
		</AbsoluteFill>
	);
};
