export function AdminSpinner() {
  return <span className="admin-spinner" aria-hidden="true" />
}

export default function AdminProgress({ message }) {
  return <div className="admin-progress" role="status" aria-live="polite"><span><AdminSpinner />{message}</span><progress aria-label={message} /></div>
}
