"use client"
import React from "react";
import { resolveIpfsUrl } from "@/lib/ipfs";
import type { TherapistNode } from "./TherapistModal";

interface TherapistCardProps {
	data: TherapistNode;
	onViewMore: (data: TherapistNode) => void;
}

const TherapistCard: React.FC<TherapistCardProps> = ({ data, onViewMore }) => {
	const fullName = data.displayName || data.name || "Terapeuta";
	const avatar = resolveIpfsUrl(data.pfp || "");
	const location = [data.city, data.country].filter(Boolean).join(", ");
	const langs = Array.isArray(data.languages) ? data.languages.join(", ") : "";
	const approaches = data.therapist?.approaches || [];
	const specialties = data.therapist?.specialties || [];
	const populations = data.therapist?.populations || [];
	const bioShort = data.therapist?.bioShort || "";
	const degrees = data.therapist?.degrees || [];

	const SocialIcon: React.FC<{ href?: string; label: string; children: React.ReactNode }> = ({ href, label, children }) => {
		if (!href) return null;
		return (
			<a
				href={href}
				target="_blank"
				rel="noopener noreferrer"
				aria-label={label}
				className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
				style={{ border: "1px solid rgba(255,255,255,0.2)" }}
				onClick={(e) => e.stopPropagation()}
			>
				{children}
			</a>
		);
	};

	return (
		<div
			className="shrink-0 w-80 snap-start rounded-2xl p-4 text-white"
			style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", boxShadow: "0 10px 30px rgba(0,0,0,0.12)" }}
		>
			<div className="flex items-start gap-4">
				<div className="w-24 h-24 rounded-full overflow-hidden border border-white/30 flex-shrink-0" style={{ background: "rgba(255,255,255,0.08)" }}>
					{avatar ? (
						<img src={avatar} alt={fullName} className="w-full h-full object-cover" />
					) : (
						<div className="w-full h-full flex items-center justify-center text-3xl">{fullName.slice(0, 1).toUpperCase()}</div>
					)}
				</div>
				<div className="flex-1 min-w-0">
					<h4 className="text-lg font-semibold truncate" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.1)" }}>{fullName}</h4>
					{location && <p className="text-white/80 text-sm truncate">{location}</p>}
					{langs && <p className="text-white/70 text-xs mt-1 truncate">Idiomas: {langs}</p>}
				</div>
			</div>

			{bioShort && (
				<p className="text-white/90 text-sm mt-3 line-clamp-3">{bioShort}</p>
			)}

			{degrees.length > 0 && (
				<div className="mt-3">
					<p className="text-xs text-white/70 mb-1">Titulaciones</p>
					<div className="flex flex-wrap gap-2">
						{degrees.slice(0, 4).map((d, idx) => (
							<span key={idx} className="text-[10px] px-2 py-1 rounded-full border border-white/20 text-white/80 bg-white/5">{d}</span>
						))}
					</div>
				</div>
			)}

			{specialties.length > 0 && (
				<div className="mt-3">
					<p className="text-xs text-white/70 mb-1">Especialidades</p>
					<div className="flex flex-wrap gap-2">
						{specialties.slice(0, 4).map((s, idx) => (
							<span key={idx} className="text-[10px] px-2 py-1 rounded-full border border-white/20 text-white/80 bg-white/5">{s}</span>
						))}
					</div>
				</div>
			)}

			{/* Poblaciones removido por petición */}

			<div className="mt-4 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<SocialIcon href={data.socialInstagram} label="Instagram">
						<svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2C4.2 2 2 4.2 2 7v10c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5V7c0-2.8-2.2-5-5-5H7zm0 2h10c1.7 0 3 1.3 3 3v10c0 1.7-1.3 3-3 3H7c-1.7 0-3-1.3-3-3V7c0-1.7 1.3-3 3-3zm10 1.5a1 1 0 100 2 1 1 0 000-2zM12 7a5 5 0 100 10 5 5 0 000-10z"/></svg>
					</SocialIcon>
					<SocialIcon href={data.socialLinkedin} label="LinkedIn">
						<svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM0 8h5v16H0zM8 8h4.8v2.2h.1c.7-1.3 2.4-2.7 4.9-2.7 5.2 0 6.2 3.4 6.2 7.8V24h-5v-7.9c0-1.9 0-4.4-2.7-4.4-2.7 0-3.1 2.1-3.1 4.2V24H8z"/></svg>
					</SocialIcon>
					<SocialIcon href={data.socialFacebook} label="Facebook">
						<svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12.07C22 6.48 17.52 2 11.93 2 6.34 2 1.86 6.48 1.86 12.07c0 5.02 3.66 9.18 8.44 9.93v-7.02H7.9v-2.9h2.4V9.84c0-2.38 1.42-3.7 3.6-3.7 1.04 0 2.12.19 2.12.19v2.33h-1.2c-1.18 0-1.55.73-1.55 1.48v1.78h2.64l-.42 2.9h-2.22V22c4.78-.75 8.44-4.91 8.44-9.93z"/></svg>
					</SocialIcon>
					<SocialIcon href={data.socialX} label="X">
						<svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2H21l-6.55 7.48L22 22h-6.828l-5.35-7.018L3.9 22H1.142l7.03-8.03L2 2h6.914l4.82 6.42L18.244 2zm-2.394 18h2.1L8.28 4H6.063l9.787 16z"/></svg>
					</SocialIcon>
				</div>
				<div className="flex items-center gap-2">
					<button
						onClick={() => onViewMore(data)}
						className="px-3 py-2 rounded-lg text-white text-sm"
						style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.28)" }}
					>
						Ver más
					</button>
					<button
						className="px-3 py-2 rounded-lg text-white text-sm"
						style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)" }}
						onClick={(e) => { e.stopPropagation(); /* sin lógica por ahora */ }}
					>
						Agendar
					</button>
				</div>
			</div>
		</div>
	);
};

export default TherapistCard;


