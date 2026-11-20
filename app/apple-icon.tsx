import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				background: "#1C1C3A",
			}}
		>
			<svg width="140" height="117" viewBox="0 0 120 100" aria-hidden="true">
				<rect x="46" y="40" width="7" height="42" fill="#E6E8F2" />
				<rect x="57" y="18" width="7" height="64" fill="#E6E8F2" />
				<rect x="68" y="28" width="7" height="54" fill="#E6E8F2" />
				<path d="M20 92 C40 62 72 30 98 8" stroke="#9A9EF0" strokeWidth="8" fill="none" strokeLinecap="round" />
				<path d="M24 90 C52 72 82 82 104 82" stroke="#9A9EF0" strokeWidth="7" fill="none" strokeLinecap="round" />
				<circle cx="98" cy="8" r="5" fill="#00AEEF" />
				<circle cx="104" cy="82" r="4.5" fill="#00AEEF" />
			</svg>
		</div>,
		size,
	);
}
