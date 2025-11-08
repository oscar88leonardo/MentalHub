"use client";

import React, { useState, FormEvent, ChangeEvent } from "react";
import { useCeramic } from "@/context/CeramicContext";
import { resolveIpfsUrl } from "@/lib/ipfs";


const initialForm = {
  workshop: "",
  descripcion: "",
  fechaHora: "",
  image: "",
  capacity: "",
  tags: "",
};


interface WorkshopCreationProps {
  onCreated?: () => Promise<void> | void;
}

const WorkshopCreation: React.FC<WorkshopCreationProps> = ({ onCreated }) => {
  
  const { profile, executeQuery, authenticateForWrite } = useCeramic();
  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/uploadFile", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok || !json?.IpfsHash) throw new Error(json?.error || "No se pudo subir la imagen");
      const ipfsUrl = `ipfs://${json.IpfsHash}`;
      setFormData((prev) => ({ ...prev, image: ipfsUrl }));
      setToast({ text: "Imagen subida correctamente", type: "success" });
      setTimeout(() => setToast(null), 3000);
    } catch (e: any) {
      setToast({ text: String(e?.message || e), type: "error" });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setIsUploading(false);
    }
  };

  const createWorkshop = async () => {
    if (!profile?.id) throw new Error("No hay perfil cargado");
    if (!formData.workshop.trim()) throw new Error("El workshop debe tener nombre");
    if (!formData.fechaHora) throw new Error("Debes seleccionar fecha y hora");

    await authenticateForWrite();

    // Crear sala en Huddle y obtener roomId
    const res = await fetch("/api/huddle/createRoom", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: formData.workshop }),
    });
    const json = await res.json();
    if (!res.ok || !json?.roomId) {
      throw new Error(json?.error || "No se pudo crear la sala");
    }

    // Crear documento Workshop
    const mutation = `
      mutation CreateWorkshop($title: String!, $description: String!, $status: WorkshopState!, $startAt: DateTime!, $roomId: String!, $creatorId: CeramicStreamID!, $image: String, $capacity: Int, $tags: [String!]) {
        createWorkshop(input: { content: {
          title: $title,
          description: $description,
          image: $image,
          status: $status,
          startAt: $startAt,
          roomId: $roomId,
          creatorId: $creatorId,
          capacity: $capacity,
          tags: $tags
        }}) {
          document { id title status startAt roomId }
        }
      }
    `;

    const tagsArr = (formData.tags || "").split(",").map((t) => t.trim()).filter(Boolean);
    const capacityInt = formData.capacity ? parseInt(formData.capacity, 10) : undefined;

    const variables: any = {
      title: formData.workshop,
      description: formData.descripcion,
      image: formData.image || undefined,
      status: "Upcoming",
      startAt: new Date(formData.fechaHora).toISOString(),
      roomId: json.roomId,
      creatorId: profile.id,
      capacity: Number.isFinite(capacityInt as any) ? capacityInt : undefined,
      tags: tagsArr.length ? tagsArr : undefined,
    };

    const gql = await executeQuery(mutation, variables);
    if (gql?.errors?.length) {
      throw new Error(gql.errors.map((e: any) => e.message).join(" | "));
    }
    return gql?.data?.createWorkshop?.document;
  };

  
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      setToast(null);
      const doc = await createWorkshop();
      setToast({ text: `¡Workshop creado! (${doc?.title})`, type: "success" });
      setTimeout(() => setToast(null), 4000);
      setFormData(initialForm);
      if (onCreated) await onCreated();
    } catch (error: any) {
      console.error("Error al crear el workshop:", error);
      setToast({ text: String(error?.message || error), type: "error" });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white/10 border border-white/20 rounded-3xl p-10 shadow-xl backdrop-blur mt-10">
      <h3
        className="text-2xl font-bold text-white mb-6"
        style={{ textShadow: "0 2px 6px rgba(0,0,0,0.25)" }}
      >
        Crear nuevo Workshop
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="workshop"
            className="block text-sm font-medium text-white/80 mb-2"
          >
            Título del Workshop
          </label>
          <input
            id="workshop"
            name="workshop"
            type="text"
            value={formData.workshop}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl bg-white/90 text-gray-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
          />
        </div>

        <div>
          <label
            htmlFor="image"
            className="block text-sm font-medium text-white/80 mb-2"
          >
            Imagen representativa
          </label>
          <div className="flex items-center gap-4">
            <input
              id="image"
              name="imageFile"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-white/90 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-white/80 file:text-gray-800 hover:file:bg-white"
            />
            {formData.image && (
              <img src={resolveIpfsUrl(formData.image)} alt="preview" className="w-16 h-16 rounded-lg object-cover border border-white/30" />
            )}
          </div>
          {isUploading && (
            <p className="text-white/70 text-sm mt-2">Subiendo imagen...</p>
          )}
        </div>

        <div>
          <label
            htmlFor="descripcion"
            className="block text-sm font-medium text-white/80 mb-2"
          >
            Descripción
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            required
            rows={5}
            className="w-full px-4 py-3 rounded-xl bg-white/90 text-gray-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-400 transition resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="capacity" className="block text-sm font-medium text-white/80 mb-2">Capacidad</label>
            <input
              id="capacity"
              name="capacity"
              type="number"
              min={1}
              value={formData.capacity}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-white/90 text-gray-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
            />
          </div>
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-white/80 mb-2">Tags (separados por coma)</label>
            <input
              id="tags"
              name="tags"
              type="text"
              placeholder="mindfulness, grupo, beginner"
              value={formData.tags}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-white/90 text-gray-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="fechaHora"
            className="block text-sm font-medium text-white/80 mb-2"
          >
            Fecha y hora
          </label>
          <input
            id="fechaHora"
            name="fechaHora"
            type="datetime-local"
            value={formData.fechaHora}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl bg-white/90 text-gray-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:shadow-xl transition disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ textShadow: "0 1px 3px rgba(0,0,0,0.2)" }}
        >
          {isSubmitting ? "Creando Workshop..." : "Crear Workshop"}
        </button>
      </form>

      {toast && (
        <div
          className="mt-6 px-4 py-3 rounded-xl border shadow-lg"
          style={{
            background: toast.type === "error"
              ? "rgba(239, 68, 68, 0.15)"
              : toast.type === "success"
                ? "rgba(16, 185, 129, 0.15)"
                : "rgba(59, 130, 246, 0.15)",
            borderColor: toast.type === "error"
              ? "rgba(239, 68, 68, 0.35)"
              : toast.type === "success"
                ? "rgba(16, 185, 129, 0.35)"
                : "rgba(59, 130, 246, 0.35)",
            color: '#fff'
          }}
        >
          <p className="text-sm font-medium">{toast.text}</p>
        </div>
      )}
    </div>
  );
};

export default WorkshopCreation;