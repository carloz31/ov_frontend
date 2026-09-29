import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'

type MapPointDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  eyebrow: string
  badge?: string
  meta?: string
  imageUrl?: string
  visual?: ReactNode
  footer?: ReactNode
}

function MapPointDrawer({
  open,
  onOpenChange,
  title,
  description,
  eyebrow,
  badge,
  meta,
  imageUrl,
  visual,
  footer,
}: MapPointDrawerProps) {
  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange} shouldScaleBackground={false}>
      <DrawerContent className="!inset-x-auto !inset-y-0 !bottom-auto !left-auto !right-0 !mt-0 box-border flex !h-dvh max-h-dvh !w-[calc(100vw-1rem)] max-w-full flex-col gap-0 overflow-hidden rounded-none rounded-l-2xl border-y-0 border-r-0 bg-[#f6fbfa] p-0 [&>div:first-child]:hidden sm:!w-[400px] sm:!max-w-[400px]">
        <DrawerClose asChild>
          <button
            type="button"
            aria-label="Cerrar ficha"
            className="absolute right-4 top-4 z-20 grid size-9 place-items-center rounded-full border border-white/70 bg-white/90 text-[#38515c] shadow-sm transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <X className="size-4" />
          </button>
        </DrawerClose>

        <div
          className="relative grid h-44 shrink-0 place-items-center overflow-hidden bg-[radial-gradient(circle_at_50%_20%,#fffbe9,#e6efe7)]"
          style={
            imageUrl
              ? {
                  backgroundImage: `linear-gradient(to top, rgb(26 43 51 / 48%), transparent 65%), url(${imageUrl})`,
                  backgroundPosition: 'center',
                  backgroundSize: 'cover',
                }
              : undefined
          }
        >
          {!imageUrl && visual}
          <span className="absolute bottom-3 left-5 rounded-full border border-white/70 bg-white/88 px-3 py-1 text-[10px] font-bold text-[#49645a] shadow-sm backdrop-blur">
            {eyebrow}
          </span>
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto p-5 sm:p-6">
          <DrawerHeader className="p-0 pr-7 text-left">
            {(badge || meta) && (
              <div className="mb-1 flex flex-wrap items-center gap-2 text-xs">
                {badge && (
                  <span className="rounded-full bg-[#82c495] px-3 py-1 font-bold text-white">{badge}</span>
                )}
                {meta && <span className="text-[#677d87]">{meta}</span>}
              </div>
            )}
            <DrawerTitle className="text-2xl font-bold leading-tight text-[#2d4049]">{title}</DrawerTitle>
            <DrawerDescription className="pt-2 text-sm leading-7 text-[#607783]">
              {description}
            </DrawerDescription>
          </DrawerHeader>

          {footer && <div className="mt-auto pt-8">{footer}</div>}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export { MapPointDrawer }
