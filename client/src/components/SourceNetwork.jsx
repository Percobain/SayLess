import { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { 
  Link2, ExternalLink, Filter, RotateCcw, Maximize2, 
  Settings, ChevronRight, Globe, Calendar, Shield
} from 'lucide-react';
import NeoCard from './NeoCard';

// 3D Node Component
function SourceNode({ position, node, isHovered, onHover, onClick }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  // Get color based on reputation tier
  const getNodeColor = (tier) => {
    const colors = {
      'high': '#14b8a6',      // neo-teal
      'fact-check': '#f59e0b', // amber/orange
      'government': '#22c55e', // green
      'educational': '#3b82f6', // blue
      'organization': '#8b5cf6', // purple
      'medium': '#fb923c',    // neo-orange
      'low': '#ef4444',       // red
      'unknown': '#94a3b8'    // gray
    };
    return colors[tier] || colors.unknown;
  };
  
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
      
      // Scale on hover
      const scale = hovered || isHovered ? 1.3 : 1;
      meshRef.current.scale.lerp({ x: scale, y: scale, z: scale }, 0.1);
    }
  });
  
  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        onHover?.(node);
      }}
      onPointerOut={() => {
        setHovered(false);
        onHover?.(null);
      }}
      onClick={() => onClick?.(node)}
    >
      <sphereGeometry args={[0.15, 32, 32]} />
      <meshStandardMaterial 
        color={getNodeColor(node.reputationTier)}
        emissive={getNodeColor(node.reputationTier)}
        emissiveIntensity={hovered || isHovered ? 0.5 : 0.2}
        metalness={0.3}
        roughness={0.4}
      />
    </mesh>
  );
}

// 3D Edge Component
function NetworkEdge({ start, end }) {
  const points = useMemo(() => {
    return [start, end];
  }, [start, end]);
  
  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={2}
          array={new Float32Array([...start, ...end])}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#475569" opacity={0.4} transparent />
    </line>
  );
}

// 3D Graph Scene
function NetworkScene({ nodes, edges, hoveredNode, onNodeHover, onNodeClick }) {
  const groupRef = useRef();
  
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;
    }
  });
  
  // Calculate positions for nodes in a 3D space
  const nodePositions = useMemo(() => {
    if (!nodes || nodes.length === 0) return [];
    
    return nodes.map((node, idx) => {
      const angle = (idx / nodes.length) * Math.PI * 2;
      const radius = 1.5 + (node.reputationScore / 100) * 0.5;
      const height = (node.reputationScore - 50) / 50;
      
      return [
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      ];
    });
  }, [nodes]);
  
  // Create a map for quick position lookup
  const positionMap = useMemo(() => {
    const map = {};
    nodes?.forEach((node, idx) => {
      map[node.id] = nodePositions[idx];
    });
    return map;
  }, [nodes, nodePositions]);
  
  return (
    <group ref={groupRef}>
      {/* Render edges */}
      {edges?.map((edge, idx) => {
        const startPos = positionMap[edge.from];
        const endPos = positionMap[edge.to];
        if (startPos && endPos) {
          return <NetworkEdge key={edge.id || idx} start={startPos} end={endPos} />;
        }
        return null;
      })}
      
      {/* Render nodes */}
      {nodes?.map((node, idx) => (
        <SourceNode
          key={node.id}
          position={nodePositions[idx]}
          node={node}
          isHovered={hoveredNode?.id === node.id}
          onHover={onNodeHover}
          onClick={onNodeClick}
        />
      ))}
      
      {/* Ambient lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
    </group>
  );
}

// Source List Item
function SourceListItem({ source, isHovered, onHover }) {
  const getTierColor = (tier) => {
    const colors = {
      'high': 'bg-neo-teal',
      'fact-check': 'bg-amber-500',
      'government': 'bg-green-500',
      'educational': 'bg-blue-500',
      'organization': 'bg-purple-500',
      'medium': 'bg-neo-orange',
      'low': 'bg-red-500',
      'unknown': 'bg-gray-500'
    };
    return colors[tier] || colors.unknown;
  };
  
  const getRoleBadge = (role) => {
    const badges = {
      'origin': { text: 'Origin', color: 'text-green-600 bg-green-100' },
      'verifier': { text: 'Fact-Check', color: 'text-amber-600 bg-amber-100' },
      'amplifier': { text: 'Amplifier', color: 'text-blue-600 bg-blue-100' },
      'primary': { text: 'Primary', color: 'text-purple-600 bg-purple-100' },
      'commentary': { text: 'Commentary', color: 'text-gray-600 bg-gray-100' }
    };
    return badges[role] || badges.commentary;
  };
  
  const roleBadge = getRoleBadge(source.role);
  
  return (
    <div 
      className={`
        p-3 border-b-[2px] border-neo-navy/10 transition-colors cursor-pointer
        ${isHovered ? 'bg-neo-orange/10' : 'hover:bg-neo-cream/50'}
      `}
      onMouseEnter={() => onHover?.(source)}
      onMouseLeave={() => onHover?.(null)}
    >
      <div className="flex items-start gap-3">
        {/* Reputation indicator dot */}
        <div className={`w-3 h-3 rounded-full mt-1 ${getTierColor(source.reputationTier)}`} />
        
        <div className="flex-1 min-w-0">
          {/* Domain name */}
          <div className="flex items-center gap-2 mb-1">
            <p className="font-bold text-neo-navy truncate">{source.domain}</p>
            <span className={`px-1.5 py-0.5 text-[10px] font-bold uppercase rounded ${roleBadge.color}`}>
              {roleBadge.text}
            </span>
          </div>
          
          {/* Title */}
          <p className="text-xs text-neo-navy/70 line-clamp-2 mb-1">{source.title}</p>
          
          {/* Meta info */}
          <div className="flex items-center gap-3 text-[10px] text-neo-navy/50">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              {source.reputationScore}%
            </span>
            {source.publishDate && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(source.publishDate).toLocaleDateString()}
              </span>
            )}
          </div>
          
          {/* View source link */}
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-xs text-neo-teal hover:text-neo-orange transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            View source <ChevronRight className="w-3 h-3" />
          </a>
        </div>
        
        {/* Reputation score badge */}
        <div className={`
          w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold
          ${source.reputationScore >= 80 ? 'bg-neo-teal/20 text-neo-teal' :
            source.reputationScore >= 60 ? 'bg-neo-orange/20 text-neo-orange' :
            'bg-red-100 text-red-600'}
        `}>
          {source.reputationScore}
        </div>
      </div>
    </div>
  );
}

// Main SourceNetwork Component
export default function SourceNetwork({ webContext, onChainHash }) {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  if (!webContext || !webContext.sources || webContext.sources.length === 0) {
    return null;
  }
  
  const { sources, sourceNetwork, metadata } = webContext;
  const nodes = sourceNetwork?.nodes || [];
  const edges = sourceNetwork?.edges || [];
  
  return (
    <div className="overflow-hidden border-[2px] border-neo-navy">
      {/* Header Stats Bar - Compact */}
      <div className="p-2 bg-neo-cream border-b-[2px] border-neo-navy flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4 text-neo-navy" />
          <span className="text-neo-navy/60">Sources:</span>
          <span className="font-bold text-neo-navy">{metadata?.totalAnalyzed || sources.length} analyzed</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-neo-navy" />
          <span className="text-neo-navy/60">Verified:</span>
          <span className="font-bold text-neo-navy">
            {metadata?.verifiedAt ? new Date(metadata.verifiedAt).toLocaleDateString() : 'Now'}
          </span>
        </div>
        
        {metadata?.factCheckSources > 0 && (
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-500" />
            <span className="text-neo-navy/60">Fact-checks:</span>
            <span className="font-bold text-amber-600">{metadata.factCheckSources}</span>
          </div>
        )}
        
        {onChainHash && (
          <div className="flex items-center gap-2 ml-auto">
            <Globe className="w-4 h-4 text-neo-teal" />
            <span className="text-neo-navy/60">On-chain:</span>
            <a 
              href={`https://sepolia.etherscan.io/tx/${onChainHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-neo-teal hover:underline"
            >
              {onChainHash.slice(0, 10)}...
            </a>
          </div>
        )}
      </div>
      
      {/* Main Content */}
      <div className="grid lg:grid-cols-5 divide-x-[3px] divide-neo-navy">
        {/* 3D Graph Panel */}
        <div className="lg:col-span-3 relative">
          <div className="p-3 border-b-[2px] border-neo-navy/20 flex items-center justify-between bg-neo-navy/5">
            <span className="font-bold text-neo-navy text-sm">Source Network</span>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="p-1.5 hover:bg-neo-navy/10 rounded transition-colors"
              >
                <Filter className="w-4 h-4 text-neo-navy/60" />
              </button>
            </div>
          </div>
          
          {/* 3D Canvas */}
          <div className="h-[280px] bg-neo-navy relative">
            <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
              <color attach="background" args={['#1e293b']} />
              <fog attach="fog" args={['#1e293b', 5, 15]} />
              
              <NetworkScene 
                nodes={nodes}
                edges={edges}
                hoveredNode={hoveredNode}
                onNodeHover={setHoveredNode}
                onNodeClick={(node) => {
                  if (node?.url) {
                    window.open(node.url, '_blank');
                  }
                }}
              />
              
              <OrbitControls 
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                autoRotate={false}
                minDistance={2}
                maxDistance={10}
              />
            </Canvas>
            
            {/* Controls hint */}
            <div className="absolute bottom-3 left-3 text-[10px] text-neo-cream/50 bg-neo-navy/50 px-2 py-1 rounded">
              <span className="text-neo-teal">Drag</span> to rotate · 
              <span className="text-neo-teal"> Scroll</span> to zoom · 
              <span className="text-neo-teal"> Right-click</span> to pan
            </div>
            
            {/* Hovered node info */}
            {hoveredNode && (
              <div className="absolute top-3 left-3 bg-neo-cream p-3 rounded shadow-lg max-w-xs border-[2px] border-neo-navy">
                <p className="font-bold text-neo-navy text-sm">{hoveredNode.label}</p>
                <p className="text-xs text-neo-navy/70 line-clamp-2 mt-1">{hoveredNode.title}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`
                    px-1.5 py-0.5 text-[10px] font-bold uppercase rounded
                    ${hoveredNode.reputationScore >= 80 ? 'bg-neo-teal/20 text-neo-teal' :
                      hoveredNode.reputationScore >= 60 ? 'bg-neo-orange/20 text-neo-orange' :
                      'bg-red-100 text-red-600'}
                  `}>
                    {hoveredNode.reputationTier}
                  </span>
                  <span className="text-[10px] text-neo-navy/50">
                    {hoveredNode.reputationScore}% credibility
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Sources List Panel */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="p-3 border-b-[2px] border-neo-navy/20 bg-neo-navy/5">
            <span className="font-bold text-neo-navy text-sm">
              Sources ({sources.length})
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto max-h-[280px]">
            {sources.map((source) => (
              <SourceListItem
                key={source.id}
                source={source}
                isHovered={hoveredNode?.id === source.id}
                onHover={setHoveredNode}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Credibility Summary */}
      {metadata && (
        <div className="p-3 bg-neo-navy/5 border-t-[2px] border-neo-navy/20 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-neo-teal" />
            <span className="text-neo-navy/70">High credibility:</span>
            <span className="font-bold text-neo-teal">{metadata.highCredibility}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-neo-orange" />
            <span className="text-neo-navy/70">Medium:</span>
            <span className="font-bold text-neo-orange">{metadata.mediumCredibility}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-neo-navy/70">Low:</span>
            <span className="font-bold text-red-500">{metadata.lowCredibility}</span>
          </div>
        </div>
      )}
    </div>
  );
}
