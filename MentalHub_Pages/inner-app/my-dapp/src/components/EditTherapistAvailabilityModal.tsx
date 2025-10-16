"use client"
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type ScheduleState = "Active" | "Archived";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialState: ScheduleState;
  initialStart: Date;
  initialEnd: Date;
  onSave: (data: { state: ScheduleState; start: Date; end: Date }) => void;
}

const EditTherapistAvailabilityModal: React.FC<Props> = ({ isOpen, onClose, initialState, initialStart, initialEnd, onSave }) => {
  const [start, setStart] = useState<Date>(initialStart);
  const [end, setEnd] = useState<Date>(initialEnd);
  const [state, setState] = useState<ScheduleState>(initialState);

  useEffect(() => {
    if (isOpen) {
      setStart(initialStart);
      setEnd(initialEnd);
      setState(initialState);
    }
  }, [isOpen, initialStart, initialEnd, initialState]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)' }}
    >
      <div 
        className="w-full max-w-xl rounded-2xl shadow-2xl"
        style={{ background: 'linear-gradient(135deg, #6666ff 0%, #7a7aff 50%, #339999 100%)', border: '1px solid rgba(255,255,255,0.18)' }}
      >
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.25)' }}>
          <h4 className="text-lg font-semibold text-white">Editar Disponibilidad</h4>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-white">Inicio</label>
              <DatePicker 
                selected={start}
                onChange={(d) => d && setStart(d)}
                showTimeSelect
                timeIntervals={15}
                timeCaption="Hora"
                dateFormat="dd/MM/yyyy HH:mm"
                className="w-full px-3 py-2 rounded border text-black bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-white">Fin</label>
              <DatePicker 
                selected={end}
                onChange={(d) => d && setEnd(d)}
                showTimeSelect
                timeIntervals={15}
                timeCaption="Hora"
                dateFormat="dd/MM/yyyy HH:mm"
                className="w-full px-3 py-2 rounded border text-black bg-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-white">Estado</label>
            <select value={state} onChange={(e) => setState(e.target.value as ScheduleState)} className="w-full px-3 py-2 rounded border bg-white text-black">
              <option value="Active">Active</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button onClick={onClose} className="px-4 py-2 rounded border text-white border-white/40 hover:bg-white/10">Cancelar</button>
            <button
              onClick={() => onSave({ state, start, end })}
              className="px-4 py-2 rounded text-white shadow-lg"
              style={{ background: 'linear-gradient(135deg, #6666ff 0%, #4d4dcc 100%)', border: '1px solid rgba(255,255,255,0.25)' }}
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTherapistAvailabilityModal;


