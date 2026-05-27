import { useSearchParams, Navigate } from 'react-router-dom'
import WorldFlowCanvas from '../components/WorldFlowCanvas'

export default function ExplorePage() {
  const [searchParams] = useSearchParams()
  const topic = searchParams.get('q')

  if (!topic) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="w-full h-full">
      <WorldFlowCanvas topic={topic} />
    </div>
  )
}
