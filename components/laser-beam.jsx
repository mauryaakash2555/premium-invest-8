'use client';

import { useId, useMemo } from 'react';

export default function LaserBeam({
	children,
	color = 'rgba(214,179,106,0.95)',
	duration = 2600,
	direction = 'clockwise',
	beamLength = 0.22,
	glowIntensity = 1,
	borderRadius = 16,
	className,
	style,
}) {
	const id = useId().replace(/:/g, '');

	const dash = useMemo(() => {
		const pathLength = 1000;
		const clamped = Math.max(0.05, Math.min(0.6, beamLength));
		const dashLen = Math.round(pathLength * clamped);
		const gapLen = pathLength - dashLen;
		return { dashLen, gapLen, pathLength };
	}, [beamLength]);

	const dur = `${Math.max(800, duration)}ms`;
	const dirSign = direction === 'counterclockwise' ? 1 : -1;
	const glow = Math.max(0, glowIntensity);

	return (
		<div
			className={['laser-beam', className].filter(Boolean).join(' ')}
			style={{
				position: 'relative',
				borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
				...style,
			}}
		>
			{children}

			<svg aria-hidden="true" className="laser-beam__svg" viewBox="0 0 100 100" preserveAspectRatio="none">
				<defs>
					<filter id={`laserGlow_${id}`} x="-50%" y="-50%" width="200%" height="200%">
						<feGaussianBlur stdDeviation={1.8 + 2.4 * glow} result="blur" />
						<feMerge>
							<feMergeNode in="blur" />
							<feMergeNode in="SourceGraphic" />
						</feMerge>
					</filter>
				</defs>

				<rect
					x="2"
					y="2"
					width="96"
					height="96"
					rx={typeof borderRadius === 'number' ? Math.max(0, (borderRadius / 16) * 6) : 6}
					ry={typeof borderRadius === 'number' ? Math.max(0, (borderRadius / 16) * 6) : 6}
					fill="none"
					stroke="rgba(214,179,106,0.14)"
					strokeWidth="1"
				/>

				<rect
					className="laser-beam__trail"
					x="2"
					y="2"
					width="96"
					height="96"
					rx={typeof borderRadius === 'number' ? Math.max(0, (borderRadius / 16) * 6) : 6}
					ry={typeof borderRadius === 'number' ? Math.max(0, (borderRadius / 16) * 6) : 6}
					fill="none"
					stroke={color}
					strokeWidth={1.6}
					strokeLinecap="round"
					filter={`url(#laserGlow_${id})`}
					pathLength={dash.pathLength}
					strokeDasharray={`${dash.dashLen} ${dash.gapLen}`}
					style={{
						animationDuration: dur,
						animationDirection: 'normal',
						['--laserDir']: dirSign,
					}}
				/>
			</svg>

			<style jsx>{`
				.laser-beam__svg {
					position: absolute;
					inset: 0;
					width: 100%;
					height: 100%;
					pointer-events: none;
					z-index: 5;
				}

				.laser-beam__trail {
					opacity: 0.98;
					animation-name: laserDash_${id};
					animation-timing-function: linear;
					animation-iteration-count: infinite;
				}

				@keyframes laserDash_${id} {
					0% {
						stroke-dashoffset: 0;
					}
					100% {
						stroke-dashoffset: calc(var(--laserDir) * 1000);
					}
				}

				@media (prefers-reduced-motion: reduce) {
					.laser-beam__trail {
						animation: none !important;
						opacity: 0.55;
					}
				}
			`}</style>
		</div>
	);
}
