interface Props {
  value: string
}

export default function NoteRich({ value }: Props) {
  if (!value) return null
  const parts = value.split(/(\s+)/g)
  return (
    <span>
      {parts.map((p, i) => {
        if (/^#\S+/.test(p)) return (
          <span key={i} style={{ color: 'var(--accent)', background: 'oklch(0.74 0.14 240 / 0.10)', padding: '1px 5px', borderRadius: 4 }}>{p}</span>
        )
        if (/^@\S+/.test(p)) return (
          <span key={i} style={{ color: 'var(--violet)', background: 'oklch(0.72 0.16 290 / 0.10)', padding: '1px 5px', borderRadius: 4 }}>{p}</span>
        )
        return <span key={i}>{p}</span>
      })}
    </span>
  )
}
