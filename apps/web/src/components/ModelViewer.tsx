import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Box, Environment } from '@react-three/drei'

export function ModelViewer() {
  return (
    <div className="h-80 rounded-2xl overflow-hidden border border-slate-700 bg-slate-900">
      <Canvas camera={{ position: [3, 3, 3], fov: 35 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} />
          <Box args={[1, 1, 1]}>
            <meshStandardMaterial color="#6366f1" />
          </Box>
          <OrbitControls autoRotate />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
      <p className="text-xs text-center text-slate-500 py-2">3D 预览占位（接入真实模型后替换为 GLB/OBJ 加载）</p>
    </div>
  )
}
