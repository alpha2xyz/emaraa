import * as React from "react"

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 4000

export type ToastProps = {
  id: string
  title?: string
  description?: string
  variant?: "default" | "destructive"
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

type Action =
  | { type: "ADD_TOAST"; toast: ToastProps }
  | { type: "UPDATE_TOAST"; toast: Partial<ToastProps> & { id: string } }
  | { type: "DISMISS_TOAST"; toastId?: string }
  | { type: "REMOVE_TOAST"; toastId?: string }

let count = 0
function genId() { count = (count + 1) % Number.MAX_SAFE_INTEGER; return count.toString() }

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()
type Listener = (state: { toasts: ToastProps[] }) => void
let memoryState: { toasts: ToastProps[] } = { toasts: [] }
const listeners: Listener[] = []

function reducer(state: { toasts: ToastProps[] }, action: Action): { toasts: ToastProps[] } {
  switch (action.type) {
    case "ADD_TOAST": return { toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT) }
    case "UPDATE_TOAST": return { toasts: state.toasts.map((t) => t.id === action.toast.id ? { ...t, ...action.toast } : t) }
    case "DISMISS_TOAST": return { toasts: state.toasts.map((t) => t.id === action.toastId || !action.toastId ? { ...t, open: false } : t) }
    case "REMOVE_TOAST": return { toasts: action.toastId ? state.toasts.filter((t) => t.id !== action.toastId) : [] }
  }
}

function dispatch(action: Action) { memoryState = reducer(memoryState, action); listeners.forEach((l) => l(memoryState)) }

function addToRemoveQueue(toastId: string) {
  if (toastTimeouts.has(toastId)) return
  const timeout = setTimeout(() => { toastTimeouts.delete(toastId); dispatch({ type: "REMOVE_TOAST", toastId }) }, TOAST_REMOVE_DELAY)
  toastTimeouts.set(toastId, timeout)
}

export function toast(props: Omit<ToastProps, "id">) {
  const id = genId()
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })
  dispatch({ type: "ADD_TOAST", toast: { ...props, id, open: true, onOpenChange: (open) => { if (!open) { addToRemoveQueue(id); dismiss() } } } })
  return { id, dismiss, update: (p: Omit<ToastProps, "id">) => dispatch({ type: "UPDATE_TOAST", toast: { ...p, id } }) }
}

export function useToast() {
  const [state, setState] = React.useState(memoryState)
  React.useEffect(() => {
    listeners.push(setState)
    return () => { const i = listeners.indexOf(setState); if (i > -1) listeners.splice(i, 1) }
  }, [])
  return {
    ...state, toast,
    dismiss: (toastId?: string) => { dispatch({ type: "DISMISS_TOAST", toastId }); if (toastId) addToRemoveQueue(toastId) },
  }
}
