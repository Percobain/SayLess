import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Radio, ArrowLeft, Volume2, VolumeX, Send, RotateCcw, HelpCircle } from 'lucide-react';
import Layout from '../components/Layout';
import NeoCard from '../components/NeoCard';
import NeoButton from '../components/NeoButton';
import { useSession } from '../context/SessionContext';

// Morse-like patterns for categories
const patterns = {
  'theft': { code: '• •', label: 'Theft', taps: 2 },
  'assault': { code: '• • •', label: 'Assault', taps: 3 },
  'fraud': { code: '• — •', label: 'Fraud', taps: 3 },
  'harassment': { code: '• • • •', label: 'Harassment', taps: 4 },
  'emergency': { code: '— — —', label: 'Emergency', taps: 3 },
};

// Severity patterns (number of long taps)
const severityPatterns = {
  low: { code: '—', level: 1-3 },
  medium: { code: '— —', level: 4-6 },
  high: { code: '— — —', level: 7-10 },
};

export default function SilentReport() {
  const { sessionId, walletAddress } = useSession();
  const [taps, setTaps] = useState([]);
  const [holding, setHolding] = useState(false);
  const [holdStart, setHoldStart] = useState(0);
  const [decodedCategory, setDecodedCategory] = useState(null);
  const [decodedSeverity, setDecodedSeverity] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  // Decode pattern on tap changes
  useEffect(() => {
    if (taps.length === 0) {
      setDecodedCategory(null);
      setDecodedSeverity(null);
      return;
    }

    // Simple pattern matching (count short vs long taps)
    const shortTaps = taps.filter(t => t === 'short').length;
    const longTaps = taps.filter(t => t === 'long').length;

    // Match category by short tap count
    if (shortTaps === 2 && longTaps === 0) setDecodedCategory('theft');
    else if (shortTaps === 3 && longTaps === 0) setDecodedCategory('assault');
    else if (shortTaps === 2 && longTaps === 1) setDecodedCategory('fraud');
    else if (shortTaps === 4) setDecodedCategory('harassment');
    else if (longTaps >= 3 && shortTaps === 0) setDecodedCategory('emergency');
    else setDecodedCategory(null);

    // Match severity by long tap count
    if (longTaps === 1) setDecodedSeverity('low');
    else if (longTaps === 2) setDecodedSeverity('medium');
    else if (longTaps >= 3) setDecodedSeverity('high');
    else setDecodedSeverity(null);
  }, [taps]);

  const handleTapStart = useCallback(() => {
    setHolding(true);
    setHoldStart(Date.now());
  }, []);

  const handleTapEnd = useCallback(() => {
    if (!holding) return;
    
    const duration = Date.now() - holdStart;
    const tapType = duration > 500 ? 'long' : 'short';
    
    setTaps(prev => [...prev, tapType]);
    setHolding(false);
    setHoldStart(0);
  }, [holding, holdStart]);

  const resetTaps = () => {
    setTaps([]);
    setDecodedCategory(null);
    setDecodedSeverity(null);
  };

  const handleSubmit = () => {
    if (decodedCategory) {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center p-4">
          <NeoCard variant="green" className="p-8 text-center max-w-md">
            <div className="w-20 h-20 bg-neo-black border-[3px] border-neo-black flex items-center justify-center mx-auto mb-6">
              <Radio className="w-10 h-10 text-neo-green" />
            </div>
            <h2 className="text-3xl font-heading font-bold mb-2">Silent Report Sent!</h2>
            <p className="text-gray-700 mb-4">
              Your {patterns[decodedCategory]?.label || 'report'} has been transmitted silently.
            </p>
            <div className="neo-badge bg-neo-black text-neo-white mb-6">
              Pattern: {taps.map(t => t === 'short' ? '•' : '—').join(' ')}
            </div>
            <Link to="/reporter">
              <NeoButton className="w-full">Back to Dashboard</NeoButton>
            </Link>
          </NeoCard>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link to="/reporter" className="inline-flex items-center gap-2 text-gray-600 hover:text-neo-black mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-heading font-bold mb-2">Silent Report</h1>
              <p className="text-gray-600">Tap to report without typing</p>
            </div>
            <button 
              onClick={() => setShowInstructions(!showInstructions)}
              className="neo-btn p-2"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Instructions */}
        {showInstructions && (
          <NeoCard variant="purple" className="p-6 mb-8">
            <h3 className="font-heading font-bold text-lg mb-4">How It Works</h3>
            <div className="space-y-3 text-sm">
              <p className="flex items-center gap-2">
                <span className="font-mono bg-neo-white text-neo-black px-2 py-1 border-[2px] border-neo-black">•</span>
                <span>Short tap (&lt;0.5s)</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="font-mono bg-neo-white text-neo-black px-2 py-1 border-[2px] border-neo-black">—</span>
                <span>Long tap (&gt;0.5s)</span>
              </p>
            </div>
            <div className="mt-4 pt-4 border-t-[2px] border-neo-white/30">
              <p className="font-bold mb-2">Quick Codes:</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(patterns).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="font-mono">{val.code}</span>
                    <span>= {val.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </NeoCard>
        )}

        {/* Tap Area */}
        <NeoCard className="p-8 mb-8">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500 uppercase font-bold mb-2">Tap Zone</p>
          </div>

          {/* Main Tap Button */}
          <button
            onMouseDown={handleTapStart}
            onMouseUp={handleTapEnd}
            onMouseLeave={() => holding && handleTapEnd()}
            onTouchStart={handleTapStart}
            onTouchEnd={handleTapEnd}
            className={`
              w-full h-48 border-[4px] border-neo-black transition-all duration-100 select-none
              flex items-center justify-center
              ${holding 
                ? 'bg-neo-orange shadow-none translate-x-[4px] translate-y-[4px]' 
                : 'bg-gray-100 shadow-neo-lg hover:bg-gray-200'
              }
            `}
          >
            <div className="text-center">
              <Radio className={`w-16 h-16 mx-auto mb-2 ${holding ? 'text-neo-black' : 'text-gray-400'}`} />
              <p className="font-heading font-bold text-lg">
                {holding ? 'HOLDING...' : 'TAP HERE'}
              </p>
            </div>
          </button>

          {/* Pattern Display */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 uppercase font-bold mb-2">Your Pattern</p>
            <div className="min-h-[60px] bg-neo-black border-[3px] border-neo-black p-4 flex items-center justify-center gap-3">
              {taps.length === 0 ? (
                <span className="text-gray-500">Waiting for taps...</span>
              ) : (
                taps.map((tap, i) => (
                  <span 
                    key={i} 
                    className={`
                      inline-block
                      ${tap === 'short' 
                        ? 'w-4 h-4 rounded-full bg-neo-orange' 
                        : 'w-12 h-4 rounded-full bg-neo-green'
                      }
                    `}
                  />
                ))
              )}
            </div>
            <p className="text-xs text-gray-400 mt-2 font-mono">
              {taps.map(t => t === 'short' ? '•' : '—').join(' ') || '—'}
            </p>
          </div>
        </NeoCard>

        {/* Decoded Result */}
        <NeoCard className="p-6 mb-8">
          <h3 className="font-heading font-bold mb-4">Decoded Result</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Category</p>
              <div className={`neo-badge ${decodedCategory ? 'bg-neo-orange' : 'bg-gray-200'}`}>
                {decodedCategory ? patterns[decodedCategory]?.label : 'Not detected'}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Severity</p>
              <div className={`neo-badge ${decodedSeverity ? 'bg-neo-purple text-neo-white' : 'bg-gray-200'}`}>
                {decodedSeverity ? decodedSeverity.toUpperCase() : 'Not detected'}
              </div>
            </div>
          </div>
        </NeoCard>

        {/* Actions */}
        <div className="flex gap-4">
          <NeoButton onClick={resetTaps} className="flex-1">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </NeoButton>
          <NeoButton 
            onClick={handleSubmit} 
            variant="orange" 
            className="flex-1"
            disabled={!decodedCategory}
          >
            <Send className="w-4 h-4 mr-2" />
            Submit Silent Report
          </NeoButton>
        </div>
      </div>
    </Layout>
  );
}
