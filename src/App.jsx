import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Trash2 } from 'lucide-react';
import { RotatingLogo3D } from './components/RotatingLogo3D';

const WORDS = [
  'manzana', 'banana', 'cereza', 'dragon', 'elefante', 'flamenco', 'jirafa', 
  'miel', 'iguana', 'gelatina', 'coala', 'limon', 'mango', 'ninja', 'naranja', 
  'panda', 'quokka', 'arcoiris', 'sol', 'tigre', 'unicornio', 'volcan', 
  'sandia', 'xilofono', 'amarillo', 'zebra', 'aguila', 'bosque', 'cascada',
  'delfin', 'estrella', 'fuego', 'galaxia', 'hielo', 'isla', 'jardin',
  'luna', 'montana', 'nube', 'orquidea', 'planeta', 'rayo', 'selva', 'trueno'
];
const SEPARATORS = ['-', '_', '.', '!', '@', '#', '$', '%', '&', '*'];

function hashSeed(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export default function App() {
  const [mode, setMode] = useState('friendly'); // 'friendly' | 'strong' | 'custom'
  const [length, setLength] = useState(12);
  const [seed, setSeed] = useState('');
  
  // Custom options
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);

  // App state
  const [password, setPassword] = useState('');
  const [displayedPassword, setDisplayedPassword] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isFlashBtn, setIsFlashBtn] = useState(false);
  const [savedPasswords, setSavedPasswords] = useState(() => {
    try {
      const stored = localStorage.getItem('savedPasswords');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notification, setNotification] = useState({ show: false, text: '', color: 'purple' });

  // Level computation
  const level = Math.floor(savedPasswords.length / 5) + 1;

  useEffect(() => {
    localStorage.setItem('savedPasswords', JSON.stringify(savedPasswords));
  }, [savedPasswords]);

  const showNotification = (text, color) => {
    setNotification({ show: true, text, color });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  const playSound = (type) => {
    if (!soundEnabled) return;
    console.log(`Reproduciendo sonido ${type}`);
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (newMode === 'friendly') {
      setLength(12);
    } else if (newMode === 'strong') {
      setLength(16);
    }
    if (soundEnabled) playSound('click');
  };

  const generatePassword = () => {
    let charset = '';
    let generated = '';

    if (mode === 'friendly') {
      if (seed) {
        const seedNum = hashSeed(seed);
        const w1 = WORDS[seedNum % WORDS.length];
        const w2 = WORDS[(seedNum + 1) % WORDS.length];
        const sep = SEPARATORS[(seedNum + 2) % SEPARATORS.length];
        const n = (seedNum % 90) + 10;
        generated = `${w1}${sep}${w2}${n}`;
      } else {
        const word1 = WORDS[Math.floor(Math.random() * WORDS.length)];
        const word2 = WORDS[Math.floor(Math.random() * WORDS.length)];
        const separator = SEPARATORS[Math.floor(Math.random() * SEPARATORS.length)];
        const num = Math.floor(Math.random() * 90) + 10;
        generated = `${word1}${separator}${word2}${num}`;
      }
      if (generated.length > length) {
        generated = generated.substring(0, length);
      }
    } else if (mode === 'strong') {
      charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
      if (seed) {
        const seedNum = hashSeed(seed);
        for (let i = 0; i < length; i++) {
          const index = (seedNum + i) % charset.length;
          generated += charset.charAt(index);
        }
      } else {
        for (let i = 0; i < length; i++) {
          const randomIndex = Math.floor(Math.random() * charset.length);
          generated += charset.charAt(randomIndex);
        }
      }
    } else {
      // Custom
      if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
      if (includeNumbers) charset += '0123456789';
      if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

      if (charset.length === 0) {
        showNotification('¡Selecciona al menos un conjunto de caracteres!', 'red');
        return;
      }

      if (seed) {
        const seedNum = hashSeed(seed);
        for (let i = 0; i < length; i++) {
          const index = (seedNum + i) % charset.length;
          generated += charset.charAt(index);
        }
      } else {
        for (let i = 0; i < length; i++) {
          const randomIndex = Math.floor(Math.random() * charset.length);
          generated += charset.charAt(randomIndex);
        }
      }
    }

    setPassword(generated);
    setDisplayedPassword('');
    setIsTyping(true);
    setIsFlashBtn(true);
    setTimeout(() => setIsFlashBtn(false), 300);

    let idx = 0;
    const typingInterval = setInterval(() => {
      if (idx < generated.length) {
        setDisplayedPassword(generated.substring(0, idx + 1));
        idx++;
        if (soundEnabled && idx % 2 === 0) {
          playSound('type');
        }
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
        showNotification('¡CONTRASEÑA GENERADA!', 'green');
        if (soundEnabled) playSound('success');
      }
    }, 50);
  };

  const copyPassword = () => {
    if (!password) {
      showNotification('¡No hay contraseña para copiar!', 'red');
      return;
    }
    navigator.clipboard.writeText(password)
      .then(() => {
        showNotification('¡COPIADA AL PORTAPAPELES!', 'blue');
        if (soundEnabled) playSound('click');
      })
      .catch(() => {
        showNotification('¡Error al copiar!', 'red');
      });
  };

  const savePassword = () => {
    if (!password) {
      showNotification('¡No hay contraseña para guardar!', 'red');
      return;
    }
    if (savedPasswords.includes(password)) {
      showNotification('¡Contraseña ya guardada!', 'yellow');
      return;
    }

    const prevLevel = level;
    const updated = [...savedPasswords, password];
    setSavedPasswords(updated);
    showNotification('¡CONTRASEÑA GUARDADA!', 'green');
    if (soundEnabled) playSound('coin');

    const newLevel = Math.floor(updated.length / 5) + 1;
    if (newLevel > prevLevel) {
      setTimeout(() => {
        showNotification('¡NIVEL ALCANZADO!', 'pink');
        if (soundEnabled) playSound('levelup');
      }, 500);
    }
  };

  const deletePassword = (index) => {
    const updated = savedPasswords.filter((_, i) => i !== index);
    setSavedPasswords(updated);
    showNotification('¡CONTRASEÑA ELIMINADA!', 'red');
    if (soundEnabled) playSound('delete');
  };

  const clearAllPasswords = () => {
    if (savedPasswords.length === 0) {
      showNotification('¡No hay contraseñas para borrar!', 'red');
      return;
    }
    setSavedPasswords([]);
    showNotification('¡TODAS LAS CONTRASEÑAS BORRADAS!', 'red');
    if (soundEnabled) playSound('delete');
  };

  const downloadPasswords = () => {
    if (savedPasswords.length === 0) {
      showNotification('¡No hay contraseñas para descargar!', 'red');
      return;
    }
    const content = savedPasswords.join('\n\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contrasenas-arcade.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('¡DESCARGA INICIADA!', 'blue');
    if (soundEnabled) playSound('click');
  };

  const toggleSound = () => {
    const nextSound = !soundEnabled;
    setSoundEnabled(nextSound);
    showNotification(nextSound ? '¡SONIDO ACTIVADO!' : '¡SONIDO DESACTIVADO!', nextSound ? 'green' : 'red');
    if (nextSound) playSound('click');
  };

  const getNotificationBorderColor = (color) => {
    switch (color) {
      case 'yellow': return 'border-yellow-400 bg-yellow-600';
      case 'red': return 'border-red-400 bg-red-600';
      case 'blue': return 'border-blue-400 bg-blue-600';
      case 'green': return 'border-green-400 bg-green-600';
      case 'pink': return 'border-pink-400 bg-pink-600';
      default: return 'border-pink-500 bg-purple-600';
    }
  };

  return (
    <div className="bg-black text-white pixel-font min-h-screen flex flex-col items-center justify-center p-3 sm:p-6 select-none">
      {/* Toast Notification */}
      <div
        className={`fixed top-4 left-1/2 -translate-x-1/2 sm:left-auto sm:right-5 sm:translate-x-0 p-3 sm:p-4 rounded-lg shadow-2xl border-2 z-50 transition-all duration-300 max-w-[90vw] text-center text-xs sm:text-sm ${
          notification.show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        } ${getNotificationBorderColor(notification.color)}`}
      >
        <span>{notification.text}</span>
      </div>

      {/* Main Container */}
      <div className="max-w-3xl w-full border-2 sm:border-4 border-purple-600 rounded-xl p-4 sm:p-6 bg-gray-900 bg-opacity-95 shadow-2xl my-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-blue-400 to-green-400 mb-3 leading-tight tracking-wider">
            Arcade PassGen
          </h1>
          <div className="flex justify-center items-center gap-2 sm:gap-4 mt-2">
            <div className="bg-blue-900/80 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border sm:border-2 border-blue-400 text-[10px] sm:text-xs">
              <span className="text-green-400">GUARDADAS: </span>
              <span className="text-yellow-300">
                {savedPasswords.length.toString().padStart(2, '0')}
              </span>
            </div>
            <div className="bg-purple-900/80 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border sm:border-2 border-purple-400 text-[10px] sm:text-xs">
              <span className="text-pink-400">NIVEL: </span>
              <span className="text-yellow-300">
                {level.toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* Password Display */}
        <div className="bg-black p-3 sm:p-4 rounded-lg border-2 border-green-500 mb-5 sm:mb-6 relative shadow-inner">
          <div className="flex justify-between items-center mb-2">
            <span className="text-green-400 text-xs sm:text-sm">CONTRASEÑA:</span>
            <div className="flex gap-2">
              <button
                onClick={copyPassword}
                className="arcade-btn bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 sm:px-3 sm:py-1 rounded bounce-hover text-[10px] sm:text-xs active:scale-95 transition-transform"
              >
                COPIAR
              </button>
              <button
                onClick={savePassword}
                className="arcade-btn bg-pink-600 hover:bg-pink-500 text-white px-2.5 py-1 sm:px-3 sm:py-1 rounded bounce-hover text-[10px] sm:text-xs active:scale-95 transition-transform"
              >
                GUARDAR
              </button>
            </div>
          </div>
          <div className="text-lg sm:text-2xl md:text-3xl text-center py-3 sm:py-4 bg-gray-800/90 rounded border border-gray-700 relative min-h-[3.5rem] sm:min-h-[4rem] flex items-center justify-center overflow-x-auto">
            <span className="text-yellow-300 break-all px-2 tracking-widest">
              {displayedPassword || (isTyping ? '' : 'PRESIONA GENERAR')}
            </span>
            <span className="animate-blink text-green-400 ml-1">|</span>
          </div>
        </div>

        {/* Generator Controls */}
        <div className="flex flex-col gap-3 sm:gap-4 mb-5 sm:mb-6">
          {/* Mode Selector */}
          <div className="bg-gray-800 p-3 sm:p-4 rounded-lg border-2 border-blue-400">
            <h3 className="text-blue-400 mb-2 text-center text-xs sm:text-sm">MODO</h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleModeChange('friendly')}
                className={`arcade-btn bg-green-700 hover:bg-green-600 text-white py-2.5 rounded bounce-hover text-[10px] sm:text-xs md:text-sm ${
                  mode === 'friendly' ? 'glow' : ''
                }`}
              >
                AMIGABLE
              </button>
              <button
                onClick={() => handleModeChange('strong')}
                className={`arcade-btn bg-yellow-600 hover:bg-yellow-500 text-white py-2.5 rounded bounce-hover text-[10px] sm:text-xs md:text-sm ${
                  mode === 'strong' ? 'glow' : ''
                }`}
              >
                FUERTE
              </button>
              <button
                onClick={() => handleModeChange('custom')}
                className={`arcade-btn bg-purple-700 hover:bg-purple-600 text-white py-2.5 rounded bounce-hover text-[10px] sm:text-xs md:text-sm ${
                  mode === 'custom' ? 'glow' : ''
                }`}
              >
                CUSTOM
              </button>
            </div>
          </div>

          {/* Custom Options (Shown right below MODO when CUSTOM is active) */}
          {mode === 'custom' && (
            <div className="bg-gray-800 p-3 sm:p-4 rounded-lg border-2 border-green-400 animate-fadeIn">
              <h3 className="text-green-400 mb-2 text-center text-xs sm:text-sm">OPCIONES CUSTOM</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] sm:text-xs">
                <label className="flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeUppercase}
                    onChange={(e) => setIncludeUppercase(e.target.checked)}
                    className="mr-1.5 sm:mr-2 accent-green-500 w-3.5 h-3.5 sm:w-4 sm:h-4"
                  />
                  <span>Mayúsculas (A-Z)</span>
                </label>
                <label className="flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeLowercase}
                    onChange={(e) => setIncludeLowercase(e.target.checked)}
                    className="mr-1.5 sm:mr-2 accent-green-500 w-3.5 h-3.5 sm:w-4 sm:h-4"
                  />
                  <span>Minúsculas (a-z)</span>
                </label>
                <label className="flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeNumbers}
                    onChange={(e) => setIncludeNumbers(e.target.checked)}
                    className="mr-1.5 sm:mr-2 accent-green-500 w-3.5 h-3.5 sm:w-4 sm:h-4"
                  />
                  <span>Números (0-9)</span>
                </label>
                <label className="flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeSymbols}
                    onChange={(e) => setIncludeSymbols(e.target.checked)}
                    className="mr-1.5 sm:mr-2 accent-green-500 w-3.5 h-3.5 sm:w-4 sm:h-4"
                  />
                  <span>Símbolos (!@#$)</span>
                </label>
              </div>
            </div>
          )}

          {/* Length Slider (Below Custom Options / Mode) */}
          <div className="bg-gray-800 p-3 sm:p-4 rounded-lg border-2 border-pink-400">
            <h3 className="text-pink-400 mb-2 text-center text-xs sm:text-sm">LONGITUD</h3>
            <div className="flex flex-col items-center py-1">
              <input
                type="range"
                min="4"
                max="32"
                value={length}
                onChange={(e) => setLength(parseInt(e.target.value))}
                className="w-full mb-2 accent-pink-500 cursor-pointer h-2 bg-gray-900 rounded-lg"
              />
              <span className="text-yellow-300 text-base sm:text-lg">{length}</span>
            </div>
          </div>
        </div>

        {/* Seed Input */}
        <div className="bg-gray-800 p-3 sm:p-4 rounded-lg border-2 border-yellow-400 mb-5 sm:mb-6">
          <h3 className="text-yellow-400 mb-2 text-xs sm:text-sm">SEMILLA (OPCIONAL)</h3>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Semilla para reproducibilidad"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              className="flex-1 bg-black text-white p-2.5 sm:p-2 rounded border border-gray-700 text-[10px] sm:text-xs focus:outline-none focus:border-yellow-400"
            />
            <button
              onClick={generatePassword}
              className={`arcade-btn bg-red-600 hover:bg-red-500 text-white px-4 py-2.5 sm:py-2 rounded-lg bounce-hover text-xs sm:text-sm font-bold active:scale-95 transition-transform ${
                isFlashBtn ? 'animate-flash' : ''
              }`}
            >
              GENERAR
            </button>
          </div>
        </div>

        {/* Saved Passwords */}
        <div className="bg-gray-800 p-3 sm:p-4 rounded-lg border-2 border-purple-400">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3 sm:mb-4">
            <h3 className="text-purple-400 text-xs sm:text-sm">CONTRASEÑAS GUARDADAS</h3>
            <div className="flex gap-2">
              <button
                onClick={downloadPasswords}
                className="arcade-btn bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 sm:px-3 sm:py-1 rounded bounce-hover text-[9px] sm:text-xs"
              >
                DESCARGAR .TXT
              </button>
              <button
                onClick={clearAllPasswords}
                className="arcade-btn bg-red-600 hover:bg-red-500 text-white px-2.5 py-1 sm:px-3 sm:py-1 rounded bounce-hover text-[9px] sm:text-xs"
              >
                BORRAR TODO
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto pr-1">
            {savedPasswords.length === 0 ? (
              <div className="text-center text-gray-500 py-4 text-[10px] sm:text-xs">Aún no hay contraseñas guardadas</div>
            ) : (
              savedPasswords.map((pwd, index) => (
                <div
                  key={index}
                  className="password-item bg-gray-700/90 p-2.5 sm:p-3 rounded-lg border border-gray-600 flex justify-between items-center text-[10px] sm:text-xs"
                >
                  <div className="flex items-center overflow-hidden mr-2">
                    <span className="text-yellow-400 mr-2 flex-shrink-0">
                      {(index + 1).toString().padStart(2, '0')}
                    </span>
                    <span className="text-green-300 font-mono truncate">{pwd}</span>
                  </div>
                  <button
                    onClick={() => deletePassword(index)}
                    className="arcade-btn bg-red-600 hover:bg-red-500 text-white p-1.5 sm:p-2 rounded bounce-hover flex-shrink-0"
                    title="Eliminar contraseña"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Credits */}
        <div className="flex items-center justify-center gap-1 mt-4 sm:mt-6 text-[9px] sm:text-[10px] text-gray-400">
          <span>DESARROLLADO POR</span>
          <a
            href="https://waveframe.com.ar"
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-500 hover:text-pink-400 transition-colors flex items-center gap-1"
          >
            <span>Waveframe Studio</span>
            <RotatingLogo3D />
          </a>
        </div>
      </div>

      {/* Sound toggle */}
      <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-40">
        <button
          onClick={toggleSound}
          className="arcade-btn bg-gray-800 hover:bg-gray-700 text-white p-2.5 sm:p-3 rounded-full bounce-hover shadow-lg border border-gray-600 active:scale-90 transition-transform"
          title={soundEnabled ? 'Desactivar sonido' : 'Activar sonido'}
        >
          {soundEnabled ? <Volume2 size={18} className="sm:w-5 sm:h-5" /> : <VolumeX size={18} className="sm:w-5 sm:h-5" />}
        </button>
      </div>
    </div>
  );
}
