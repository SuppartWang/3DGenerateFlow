import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGLTF, OrbitControls, Center, Stage, PresentationControls } from '@react-three/drei'
import { useJobStore } from '../store/jobStore'

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  return <primitive object={scene} scale={1} />
}

export function ModelViewer() {
  const { currentJob } = useJobStore()
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  const modelUrl = currentJob?.result_model_path
    ? `${baseUrl}/files/${encodeURIComponent(currentJob.result_model_path)}`
    : null

  return (
    <div className="h-80 rounded-2xl overflow-hidden border border-slate-700 bg-slate-900">
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }} shadows dpr={[1, 2]}>
        <Suspense fallback={null}>
          {modelUrl ? (
            <PresentationControls
              speed={1.5}
              global
              zoom={0.7}
              polar={[-0.1, Math.PI / 2]}
            >
              <Stage environment="city" intensity={0.6} castShadow={false}>
                <Center>
                  <Model url={modelUrl} />
                </Center>
              </Stage>
            </PresentationControls>
          ) : (
            <group>
              <ambientLight intensity={0.6} />
              <directionalLight position={[5, 5, 5]} intensity={1.2} />
              <mesh>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="#6366f1" />
              </mesh>
              <OrbitControls autoRotate />
            </group>
          )}
        </Suspense>
      </Canvas>
      <p className="text-xs text-center text-slate-500 py-2">
        {modelUrl
          ? '3D 预览 · 拖动旋转 / 滚轮缩放'
          : '上传照片并生成后可预览 3D 模型'}
      </p>
    </div>
  )
}
