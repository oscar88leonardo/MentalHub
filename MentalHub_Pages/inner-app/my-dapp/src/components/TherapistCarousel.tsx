"use client"
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useCeramic } from "@/context/CeramicContext";
import TherapistCard from "./TherapistCard";
import TherapistModal, { TherapistNode } from "./TherapistModal";
import { languages as languageList } from "@/lib/languages";

const TherapistCarousel: React.FC = () => {
	const { executeQuery } = useCeramic();
	const [items, setItems] = useState<TherapistNode[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [selected, setSelected] = useState<TherapistNode | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	// Filtros
	const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
	const [cityQuery, setCityQuery] = useState("");
	const [approachesQuery, setApproachesQuery] = useState("");
	const [specialtiesQuery, setSpecialtiesQuery] = useState("");
	const [populationsQuery, setPopulationsQuery] = useState("");
	// Paginación
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(8);

	const scrollerRef = useRef<HTMLDivElement | null>(null);

	const fetchTherapists = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const q = `
				query {
					innerverProfileIndex(filters: { where: { rol: { in: Terapeuta } } }, first: 100) {
						edges {
							node {
								id
								displayName
								name
								country
								city
								languages
								pfp
								socialInstagram
								socialLinkedin
								socialFacebook
								socialX
								therapist(first: 1) {
									edges {
										node {
											degrees
											licenseNumber
											licenseJurisdiction
											licenseCountry
											yearsExperience
											approaches
											specialties
											populations
											bioShort
											bioLong
											introVideoUrl
											acceptingNewClients
											roomId
										}
									}
								}
							}
						}
					}
				}
			`;
			const res: any = await executeQuery(q);
			const edges = res?.data?.innerverProfileIndex?.edges || [];
			const mapped: TherapistNode[] = edges.map((e: any) => {
				const n = e?.node || {};
				const tNode = n?.therapist?.edges?.[0]?.node || {};
				return {
					id: n.id,
					displayName: n.displayName,
					name: n.name,
					country: n.country,
					city: n.city,
					languages: n.languages || [],
					pfp: n.pfp,
					socialInstagram: n.socialInstagram,
					socialLinkedin: n.socialLinkedin,
					socialFacebook: n.socialFacebook,
					socialX: n.socialX,
					therapist: {
						degrees: tNode.degrees || [],
						licenseNumber: tNode.licenseNumber || undefined,
						licenseJurisdiction: tNode.licenseJurisdiction || undefined,
						licenseCountry: tNode.licenseCountry || undefined,
						yearsExperience: typeof tNode.yearsExperience === "number" ? tNode.yearsExperience : undefined,
						approaches: tNode.approaches || [],
						specialties: tNode.specialties || [],
						populations: tNode.populations || [],
						bioShort: tNode.bioShort || "",
						bioLong: tNode.bioLong || "",
						introVideoUrl: tNode.introVideoUrl || undefined,
						acceptingNewClients: typeof tNode.acceptingNewClients === "boolean" ? tNode.acceptingNewClients : undefined,
						roomId: tNode.roomId || undefined,
					}
				};
			});
			setItems(mapped);
		} catch (e: any) {
			console.error(e);
			setError("No se pudo cargar la lista de terapeutas.");
		} finally {
			setIsLoading(false);
		}
	}, [executeQuery]);

	useEffect(() => { fetchTherapists(); }, [fetchTherapists]);

	const scrollByAmount = (dx: number) => {
		const el = scrollerRef.current;
		if (!el) return;
		el.scrollBy({ left: dx, behavior: "smooth" });
	};

	const onViewMore = (data: TherapistNode) => {
		setSelected(data);
		setIsModalOpen(true);
	};

	// Filtros y paginación derivados
	const tokenize = (s: string) =>
		s.split(",").map(x => x.trim().toLowerCase()).filter(Boolean);
	const hasAny = (haystack: string[] | undefined, needles: string[]) => {
		if (!needles.length) return true;
		const hs = (haystack || []).map(x => String(x).toLowerCase());
		return needles.some(n => hs.includes(n));
	};
	const includesText = (text: string | undefined, q: string) => {
		if (!q) return true;
		return (text || "").toLowerCase().includes(q.toLowerCase());
	};

	const filtered = useMemo(() => {
		const appTokens = tokenize(approachesQuery);
		const specTokens = tokenize(specialtiesQuery);
		const popTokens = tokenize(populationsQuery);
		const langSet = new Set(selectedLanguages.map(x => x.toLowerCase()));
		return items.filter((it) => {
			if (langSet.size > 0) {
				const langs = (it.languages || []).map(x => String(x).toLowerCase());
				const hasLang = langs.some(l => langSet.has(l));
				if (!hasLang) return false;
			}
			if (!includesText(it.city, cityQuery)) return false;
			if (!hasAny(it.therapist?.approaches, appTokens)) return false;
			if (!hasAny(it.therapist?.specialties, specTokens)) return false;
			if (!hasAny(it.therapist?.populations, popTokens)) return false;
			return true;
		});
	}, [items, selectedLanguages, cityQuery, approachesQuery, specialtiesQuery, populationsQuery]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
	const currentPage = Math.min(page, totalPages);
	const startIdx = (currentPage - 1) * pageSize;
	const pageItems = filtered.slice(startIdx, startIdx + pageSize);

	useEffect(() => { setPage(1); }, [selectedLanguages, cityQuery, approachesQuery, specialtiesQuery, populationsQuery, pageSize]);

	return (
		<div className="mb-8">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-xl font-semibold text-white" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.1)" }}>
					Terapeutas
				</h3>
				<div className="flex items-center gap-2">
					<button
						onClick={() => scrollByAmount(-320)}
						className="w-9 h-9 rounded-full flex items-center justify-center text-white hover:bg-white/10"
						style={{ border: "1px solid rgba(255,255,255,0.25)" }}
						aria-label="Anterior"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
						</svg>
					</button>
					<button
						onClick={() => scrollByAmount(320)}
						className="w-9 h-9 rounded-full flex items-center justify-center text-white hover:bg-white/10"
						style={{ border: "1px solid rgba(255,255,255,0.25)" }}
						aria-label="Siguiente"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
						</svg>
					</button>
				</div>
			</div>

			{/* Filtros */}
			<div className="rounded-2xl p-4 mb-4 text-white" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)" }}>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
					<div>
						<label className="block text-sm text-white/80 mb-1">Idiomas</label>
						<div className="flex flex-wrap gap-2">
							{languageList.slice(0, 8).map((l) => {
								const checked = selectedLanguages.includes(l.code);
								return (
									<label key={l.code} className="text-xs flex items-center gap-1 cursor-pointer">
										<input
											type="checkbox"
											checked={checked}
											onChange={(e) => {
												const on = e.target.checked;
												setSelectedLanguages((prev) => on ? Array.from(new Set([...prev, l.code])) : prev.filter(c => c !== l.code));
											}}
											className="w-4 h-4"
										/>
										<span>{l.name}</span>
									</label>
								);
							})}
						</div>
					</div>
					<div>
						<label className="block text-sm text-white/80 mb-1">Ciudad</label>
						<input
							value={cityQuery}
							onChange={(e) => setCityQuery(e.target.value)}
							placeholder="Ej: Bogotá"
							className="w-full px-3 py-2 rounded-lg border-0 text-white placeholder-white/60"
							style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}
						/>
					</div>
					<div>
						<label className="block text-sm text-white/80 mb-1">Enfoques (coma-separado)</label>
						<input
							value={approachesQuery}
							onChange={(e) => setApproachesQuery(e.target.value)}
							placeholder="ACT, DBT"
							className="w-full px-3 py-2 rounded-lg border-0 text-white placeholder-white/60"
							style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}
						/>
					</div>
					<div>
						<label className="block text-sm text-white/80 mb-1">Especialidades (coma-separado)</label>
						<input
							value={specialtiesQuery}
							onChange={(e) => setSpecialtiesQuery(e.target.value)}
							placeholder="Ansiedad, Depresión"
							className="w-full px-3 py-2 rounded-lg border-0 text-white placeholder-white/60"
							style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}
						/>
					</div>
					<div className="md:col-span-2 lg:col-span-4">
						<label className="block text-sm text-white/80 mb-1">Poblaciones (coma-separado)</label>
						<input
							value={populationsQuery}
							onChange={(e) => setPopulationsQuery(e.target.value)}
							placeholder="Adultos, Adolescentes"
							className="w-full px-3 py-2 rounded-lg border-0 text-white placeholder-white/60"
							style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}
						/>
					</div>
				</div>
				<div className="mt-3 flex items-center justify-between">
					<button
						onClick={() => { setSelectedLanguages([]); setCityQuery(""); setApproachesQuery(""); setSpecialtiesQuery(""); setPopulationsQuery(""); }}
						className="px-3 py-2 rounded-lg text-white text-sm hover:bg-white/10"
						style={{ border: "1px solid rgba(255,255,255,0.25)" }}
					>
						Limpiar filtros
					</button>
					<div className="flex items-center gap-2">
						<label className="text-sm text-white/80">Por página:</label>
						<select
							value={pageSize}
							onChange={(e) => setPageSize(Number(e.target.value))}
							className="px-2 py-1 rounded-lg text-white"
							style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}
						>
							<option value={6} className="bg-gray-800 text-white">6</option>
							<option value={8} className="bg-gray-800 text-white">8</option>
							<option value={12} className="bg-gray-800 text-white">12</option>
						</select>
					</div>
				</div>
			</div>

			<div
				ref={scrollerRef}
				className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2"
				style={{ scrollbarWidth: "thin" }}
			>
				{isLoading && (
					<div className="text-white/80">Cargando terapeutas…</div>
				)}
				{!isLoading && error && (
					<div className="text-red-200">{error}</div>
				)}
				{!isLoading && !error && filtered.length === 0 && (
					<div className="text-white/80">Aún no hay terapeutas registrados.</div>
				)}
				{pageItems.map((it) => (
					<TherapistCard key={it.id} data={it} onViewMore={onViewMore} />
				))}
			</div>

			{filtered.length > pageSize && (
				<div className="mt-3 flex items-center justify-center gap-2">
					<button
						onClick={() => setPage((p) => Math.max(1, p - 1))}
						disabled={currentPage <= 1}
						className="px-3 py-1 rounded-lg text-white text-sm disabled:opacity-50"
						style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.28)" }}
					>
						Anterior
					</button>
					<span className="text-white/80 text-sm">Página {currentPage} de {totalPages}</span>
					<button
						onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
						disabled={currentPage >= totalPages}
						className="px-3 py-1 rounded-lg text-white text-sm disabled:opacity-50"
						style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.28)" }}
					>
						Siguiente
					</button>
				</div>
			)}

			<TherapistModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} data={selected} />
		</div>
	);
};

export default TherapistCarousel;


