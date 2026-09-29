import { Check, ClipboardList, Pencil, Save, X } from 'lucide-react'
import { useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useCounselorPortal } from './CounselorPortalContext'

function PrioritiesView() {
  const { state, dispatch } = useCounselorPortal()
  const [editing, setEditing] = useState(false)
  const [draftExcluded, setDraftExcluded] = useState<string[]>(state.excludedActivityIds)
  const [saved, setSaved] = useState(false)
  const activities = state.activities.filter((item) => item.type === 'REGISTRO' && item.participant === 'ESTUDIANTE')
  const blocks = [...new Set(activities.map((item) => item.block))]
  const startEditing = () => { setDraftExcluded(state.excludedActivityIds); setEditing(true); setSaved(false) }
  const toggleDraft = (activityId:string) => setDraftExcluded((current)=>current.includes(activityId)?current.filter((id)=>id!==activityId):[...current,activityId])
  const save = () => {
    activities.forEach((activity) => {
      if (state.excludedActivityIds.includes(activity.id) !== draftExcluded.includes(activity.id)) dispatch({type:'TOGGLE_PRIORITY',activityId:activity.id})
    })
    setEditing(false)
    setSaved(true)
  }
  const includedCount = activities.length - (editing ? draftExcluded.length : state.excludedActivityIds.length)
  return <div className="space-y-6 p-4 sm:p-6 lg:p-8">
    <PageHeader
      actions={editing ? <div className="flex gap-2"><Button onClick={()=>setEditing(false)} variant="outline"><X/> Cancelar</Button><Button onClick={save}><Save/> Guardar cambios</Button></div> : <Button onClick={startEditing}><Pencil/> Editar actividades</Button>}
      description="Configura las actividades de registro que producen respuestas o entregables visibles para orientación. Todas están incluidas inicialmente."
      eyebrow="Configuración"
      title="Configuración de actividades"
    />
    {saved&&<Card className="flex items-center gap-3 border-[var(--success)]/30 bg-[var(--success-soft)] p-4 text-sm text-[var(--success)]"><Check className="size-5"/><strong>Configuración guardada. El avance y las alertas se recalcularon.</strong></Card>}
    <Card className="p-4 text-sm text-muted-foreground"><strong className="text-foreground">{includedCount} de {activities.length} incluidas.</strong> Al editar puedes desmarcar las actividades que no usarás para el seguimiento. Este cambio solo afecta la vista de orientación.</Card>
    <div className="space-y-4">{blocks.map((block)=><Card className="overflow-hidden shadow-[var(--shadow-card)]" key={block}><div className="flex items-center gap-3 border-b bg-muted/40 p-4"><span className="flex size-9 items-center justify-center rounded-xl bg-primary font-bold text-white">{block}</span><div><h2 className="font-bold">Bloque {block.replace('B','')}</h2><p className="text-xs text-muted-foreground">{activities.filter((item)=>item.block===block).length} actividades de registro</p></div></div><div className="divide-y">{activities.filter((item)=>item.block===block).map((activity)=>{const included=!(editing?draftExcluded:state.excludedActivityIds).includes(activity.id);const complete=state.students.filter((student)=>student.progress.some((item)=>item.activityId===activity.id&&item.status==='COMPLETADA')).length;return <div className="flex flex-wrap items-center gap-4 p-4 sm:px-5" key={activity.id}><div className="flex size-10 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-primary"><ClipboardList/></div><div className="min-w-60 flex-1"><p className="font-medium">{activity.code} · {activity.name}</p><p className="text-xs text-muted-foreground">{complete}/{state.students.length} estudiantes completaron</p></div><label className={`flex items-center gap-3 text-sm font-medium ${editing ? 'cursor-pointer' : 'text-muted-foreground'}`}><span>Incluida</span><input aria-label={`Incluir ${activity.name}`} checked={included} className="size-5 accent-[var(--primary)]" disabled={!editing} onChange={()=>toggleDraft(activity.id)} type="checkbox"/></label></div>})}</div></Card>)}</div>
  </div>
}

export { PrioritiesView }
