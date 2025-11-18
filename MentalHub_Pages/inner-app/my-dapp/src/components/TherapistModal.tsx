"use client"
import React, { useEffect } from "react";
import { resolveIpfsUrl } from "@/lib/ipfs";

export interface TherapistNode {
	id: string;
	displayName?: string;
	name?: string;
	country?: string;
	city?: string;
	languages?: string[];
	pfp?: string;
	socialInstagram?: string;
	socialLinkedin?: string;
	socialFacebook?: string;
	socialX?: string;
	therapist?: {
		degrees?: string[];
		licenseNumber?: string;
		licenseJurisdiction?: string;
		licenseCountry?: string;
		yearsExperience?: number;
		approaches?: string[];
		specialties?: string[];
		populations?: string[];
		bioShort?: string;
		bioLong?: string;
		introVideoUrl?: string;
		acceptingNewClients?: boolean;
		roomId?: string;
	};
}

interface TherapistModalProps {
	isOpen: boolean;
	onClose: () => void;
	data: TherapistNode | null;
}

const TherapistModal: React.FC<TherapistModalProps> = ({ isOpen, onClose, data }) => {
	useEffect(() => {
		if (!isOpen) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [isOpen, onClose]);

	if (!isOpen || !data) return null;

	const avatar = resolveIpfsUrl(data.pfp || "");
	const fullName = data.displayName || data.name || "Terapeuta";
	const langs = Array.isArray(data.languages) ? data.languages.join(", ") : "";
	const approaches = data.therapist?.approaches || [];
	const specialties = data.therapist?.specialties || [];
	const populations = data.therapist?.populations || [];
	const bioLong = data.therapist?.bioLong || data.therapist?.bioShort || "";
	const degrees = data.therapist?.degrees || [];
	const licenseNumber = data.therapist?.licenseNumber || "";
	const licenseJurisdiction = data.therapist?.licenseJurisdiction || "";
	const licenseCountry = data.therapist?.licenseCountry || "";
	const yearsExperience = data.therapist?.yearsExperience;
	const introVideoUrl = data.therapist?.introVideoUrl || "";
	const acceptingNewClients = data.therapist?.acceptingNewClients;
	const roomId = data.therapist?.roomId || "";

	const SocialLink: React.FC<{ href?: string; label: string; children: React.ReactNode }> = ({ href, label, children }) => {
		if (!href) return null;
		return (
			<a
				href={href}
				target="_blank"
				rel="noopener noreferrer"
				aria-label={label}
				className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
				style={{ border: "1px solid rgba(255,255,255,0.2)" }}
			>
				{children}
			</a>
		);
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(5px)" }} onClick={onClose}>
			<div className="w-full max-w-3xl max-h-[85vh] rounded-2xl shadow-2xl text-white flex flex-col overflow-hidden" style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }} onClick={(e) => e.stopPropagation()}>
				<div className="flex items-center justify-between p-5 border-b shrink-0" style={{ borderColor: "rgba(255,255,255,0.18)" }}>
					<h3 className="text-xl font-semibold" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.1)" }}>{fullName}</h3>
					<button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10">
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<div className="p-6 space-y-6 flex-1 overflow-y-auto">
					<div className="flex items-start gap-5">
						<div className="w-28 h-28 rounded-full overflow-hidden border border-white/30 flex-shrink-0" style={{ background: "rgba(255,255,255,0.08)" }}>
							{avatar ? (
								<img src={avatar} alt={fullName} className="w-full h-full object-cover" />
							) : (
								<div className="w-full h-full flex items-center justify-center text-4xl">{fullName.slice(0, 1).toUpperCase()}</div>
							)}
                        </div>
						<div className="flex-1">
							<p className="text-white/90">
								{data.city ? `${data.city}, ` : ""}{data.country || ""}
							</p>
							{langs && <p className="text-white/70 text-sm">Idiomas: {langs}</p>}
						</div>
						<div className="flex items-center gap-2">
							<SocialLink href={data.socialInstagram} label="Instagram">
								<svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2C4.2 2 2 4.2 2 7v10c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5V7c0-2.8-2.2-5-5-5H7zm0 2h10c1.7 0 3 1.3 3 3v10c0 1.7-1.3 3-3 3H7c-1.7 0-3-1.3-3-3V7c0-1.7 1.3-3 3-3zm10 1.5a1 1 0 100 2 1 1 0 000-2zM12 7a5 5 0 100 10 5 5 0 000-10z"/></svg>
							</SocialLink>
							<SocialLink href={data.socialLinkedin} label="LinkedIn">
								<svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM0 8h5v16H0zM8 8h4.8v2.2h.1c.7-1.3 2.4-2.7 4.9-2.7 5.2 0 6.2 3.4 6.2 7.8V24h-5v-7.9c0-1.9 0-4.4-2.7-4.4-2.7 0-3.1 2.1-3.1 4.2V24H8z"/></svg>
							</SocialLink>
							<SocialLink href={data.socialFacebook} label="Facebook">
								<svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12.07C22 6.48 17.52 2 11.93 2 6.34 2 1.86 6.48 1.86 12.07c0 5.02 3.66 9.18 8.44 9.93v-7.02H7.9v-2.9h2.4V9.84c0-2.38 1.42-3.7 3.6-3.7 1.04 0 2.12.19 2.12.19v2.33h-1.2c-1.18 0-1.55.73-1.55 1.48v1.78h2.64l-.42 2.9h-2.22V22c4.78-.75 8.44-4.91 8.44-9.93z"/></svg>
							</SocialLink>
							<SocialLink href={data.socialX} label="X">
								<svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2H21l-6.55 7.48L22 22h-6.828l-5.35-7.018L3.9 22H1.142l7.03-8.03L2 2h6.914l4.82 6.42L18.244 2zm-2.394 18h2.1L8.28 4H6.063l9.787 16z"/></svg>
							</SocialLink>
						</div>
					</div>

					{approaches.length > 0 && (
						<div>
							<h4 className="font-semibold mb-2">Enfoques</h4>
							<div className="flex flex-wrap gap-2">
								{approaches.map((a, idx) => (
									<span key={idx} className="text-xs px-2 py-1 rounded-full border border-white/20 text-white/80 bg-white/5">{a}</span>
								))}
							</div>
						</div>
					)}

					{degrees.length > 0 && (
						<div>
							<h4 className="font-semibold mb-2">Titulaciones</h4>
							<div className="flex flex-wrap gap-2">
								{degrees.map((d, idx) => (
									<span key={idx} className="text-xs px-2 py-1 rounded-full border border-white/20 text-white/80 bg-white/5">{d}</span>
								))}
							</div>
						</div>
					)}

					{specialties.length > 0 && (
						<div>
							<h4 className="font-semibold mb-2">Especialidades</h4>
							<div className="flex flex-wrap gap-2">
								{specialties.map((s, idx) => (
									<span key={idx} className="text-xs px-2 py-1 rounded-full border border-white/20 text-white/80 bg-white/5">{s}</span>
								))}
							</div>
						</div>
					)}

					{populations.length > 0 && (
						<div>
							<h4 className="font-semibold mb-2">Poblaciones</h4>
							<div className="flex flex-wrap gap-2">
								{populations.map((p, idx) => (
									<span key={idx} className="text-xs px-2 py-1 rounded-full border border-white/20 text-white/80 bg-white/5">{p}</span>
								))}
							</div>
						</div>
					)}

					{bioLong && (
						<div>
							<h4 className="font-semibold mb-2">Sobre mí</h4>
							<p className="text-white/90 leading-relaxed">{bioLong}</p>
						</div>
					)}

					{/* Additional therapist model fields */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<h4 className="font-semibold mb-2">Años de experiencia</h4>
							<p className="text-white/90">{typeof yearsExperience === "number" ? yearsExperience : "—"}</p>
						</div>
						<div>
							<h4 className="font-semibold mb-2">Acepta nuevos consultantes</h4>
							<p className="text-white/90">{acceptingNewClients === true ? "Sí" : acceptingNewClients === false ? "No" : "—"}</p>
						</div>
						<div>
							<h4 className="font-semibold mb-2">Nº de licencia</h4>
							<p className="text-white/90">{licenseNumber || "—"}</p>
						</div>
						<div>
							<h4 className="font-semibold mb-2">Jurisdicción de licencia</h4>
							<p className="text-white/90">{licenseJurisdiction || "—"}</p>
						</div>
						<div>
							<h4 className="font-semibold mb-2">País de licencia</h4>
							<p className="text-white/90">{licenseCountry || "—"}</p>
						</div>
						<div>
							<h4 className="font-semibold mb-2">Sala</h4>
							<p className="text-white/90 break-all">{roomId || "—"}</p>
						</div>
						<div className="md:col-span-2">
							<h4 className="font-semibold mb-2">Video de presentación</h4>
							{introVideoUrl ? (
								<a href={introVideoUrl} target="_blank" rel="noreferrer" className="text-blue-200 underline break-all">{introVideoUrl}</a>
							) : (
								<p className="text-white/90">—</p>
							)}
						</div>
					</div>
				</div>

				<div className="p-5 border-t flex justify-end gap-3 shrink-0" style={{ borderColor: "rgba(255,255,255,0.18)" }}>
					<button onClick={onClose} className="px-4 py-2 rounded-xl text-white hover:bg-white/10" style={{ border: "1px solid rgba(255,255,255,0.3)" }}>
						Cerrar
					</button>
					<button className="px-4 py-2 rounded-xl text-white" style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)" }}>
						Agendar
					</button>
				</div>
			</div>
		</div>
	);
};

export default TherapistModal;


