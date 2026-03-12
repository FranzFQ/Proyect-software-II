import { useState } from "react";

export default function ChecklistEjecucion({ checklist, onGuardar, onCancelar }) {

  const initialEval = checklist.criteriosList.map(() => ({
    completado:false,
    score:null
  }));

  const [evaluaciones,setEvaluaciones]=useState(initialEval);
  const [observaciones,setObservaciones]=useState("");

  const completados=evaluaciones.filter(e=>e.completado).length;

  const toggle=(i)=>{
    setEvaluaciones(prev=>
      prev.map((e,idx)=>
        idx===i
          ?{completado:!e.completado,score:!e.completado?5:null}
          :e
      )
    )
  }

  const score=(i,val)=>{
    setEvaluaciones(prev=>
      prev.map((e,idx)=>
        idx===i?{...e,score:val}:e
      )
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">

      <button
        onClick={onCancelar}
        className="text-yellow-500 font-bold mb-4"
      >
        ← Volver
      </button>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">

        <div className="bg-white rounded-lg p-6 shadow">

          <h2 className="font-bold text-lg mb-4">
            Criterios
          </h2>

          {checklist.criteriosList.map((c,i)=>{

            const e=evaluaciones[i]

            return(
              <div key={i} className="flex flex-col md:flex-row md:items-center justify-between py-3 border-b gap-3">

                <div className="flex items-center gap-3">

                  <input
                    type="checkbox"
                    checked={e.completado}
                    onChange={()=>toggle(i)}
                  />

                  <span>{c}</span>

                </div>

                {e.completado && (

                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={e.score}
                    onChange={(ev)=>score(i,Number(ev.target.value))}
                  />

                )}

              </div>
            )

          })}

        </div>

        <div className="flex flex-col gap-4">

          <textarea
            className="border rounded p-3 w-full"
            rows={6}
            placeholder="Observaciones..."
            value={observaciones}
            onChange={(e)=>setObservaciones(e.target.value)}
          />

          <button
            onClick={()=>onGuardar({evaluaciones,observaciones})}
            disabled={!completados}
            className="bg-yellow-400 font-bold py-3 rounded disabled:opacity-40"
          >
            Guardar
          </button>

        </div>

      </div>
    </div>
  )
}