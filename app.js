/**
 * ============================================================
 * FotoLaudo — Câmera Técnica de Engenharia & Infraestrutura
 * Lógica Completa: Sensores, WebRTC, UTM, Canvas, IndexedDB e PDF
 * ============================================================
 */

(function () {
    'use strict';

    // Estado Global da Aplicação
    const state = {
        stream: null,
        facingMode: 'environment', // 'environment' ou 'user'
        torchActive: false,
        screenTorchActive: false,
        gridVisible: false,
        levelVisible: true,
        currentProject: 'Praça de Pedágio P02 - Km 84',
        empresa: 'Concessionária Rodovias do Vale',
        fiscalName: 'Eng. Fabiano Braga',
        stampStyle: 'concessao', // 'concessao', 'laudo', 'minimalista'
        customLogoUrl: null,
        activeTag: 'Cabine Manual',
        quickTags: [
            'Cabine Manual',
            'Cabine Automática',
            'Pavimento Rígido',
            'Armadura',
            'Barreira New Jersey',
            'Drenagem',
            'Subestação',
            'Cobertura Metálica',
            'Laço Indutivo',
            'Sinalização'
        ],
        telemetry: {
            lat: null,
            lon: null,
            altitude: null,
            accuracy: null,
            azimuth: 0,
            pitch: 0,
            roll: 0,
            utm: { zone: '--', easting: 0, northing: 0 },
            isLevel: false,
            timestamp: new Date()
        },
        currentCapture: null, // dados da foto temporária em revisão
        markup: {
            activeTool: 'select', // 'select', 'arrow', 'dimension', 'pen', 'blur', 'text', 'circle', 'rect'
            color: '#EF4444',
            lineWidth: 8,
            annotations: [],
            selectedIndex: -1,
            isDrawing: false,
            isDraggingAnnotation: false,
            isResizing: false,
            activeResizeHandle: null,
            resizeInitialAnnotation: null,
            resizeInitialBounds: null,
            dragStartPoint: null,
            dragInitialAnnotation: null,
            pendingTextPos: null,
            pendingDimensionCoords: null,
            startX: 0,
            startY: 0,
            currentPoints: [],
            tempAnnotation: null,
            baseImage: null
        },
        db: null,
        selectedGalleryIds: new Set()
    };

    // Elementos DOM
    const video = document.getElementById('cameraVideo');
    const fallbackBox = document.getElementById('cameraFallback');
    const fallbackInput = document.getElementById('fallbackFileInput');
    const renderCanvas = document.getElementById('renderCanvas');
    const mapCanvas = document.getElementById('mapCanvas');
    const shutterFlash = document.getElementById('shutterFlash');
    const hudGrid = document.getElementById('hudGrid');
    const hudLevel = document.getElementById('hudLevel');
    const horizonLine = document.getElementById('horizonLine');
    const levelDot = document.getElementById('levelDot');
    const quickChipsContainer = document.getElementById('quickChipsContainer');
    const galleryCountBadge = document.getElementById('galleryCountBadge');

    // Inicialização da IndexedDB
    function initDatabase() {
        return new Promise((resolve, reject) => {
            const req = indexedDB.open('FotoLaudoDB', 1);
            req.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('photos')) {
                    const store = db.createObjectStore('photos', { keyPath: 'id', autoIncrement: true });
                    store.createIndex('obra', 'obra', { unique: false });
                    store.createIndex('createdAt', 'createdAt', { unique: false });
                }
            };
            req.onsuccess = (e) => {
                state.db = e.target.result;
                updateGalleryBadge();
                resolve(state.db);
            };
            req.onerror = (e) => reject(e);
        });
    }

    // Carregar configurações do localStorage
    function loadSavedSettings() {
        try {
            const saved = localStorage.getItem('fotolaudo_cfg_v1') || localStorage.getItem('camobra_cfg_v1');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.currentProject) state.currentProject = parsed.currentProject;
                if (parsed.empresa) state.empresa = parsed.empresa;
                if (parsed.fiscalName) state.fiscalName = parsed.fiscalName;
                if (parsed.stampStyle) state.stampStyle = parsed.stampStyle;
                if (parsed.customLogoUrl) state.customLogoUrl = parsed.customLogoUrl;
                if (parsed.quickTags && Array.isArray(parsed.quickTags)) state.quickTags = parsed.quickTags;
            }
        } catch (e) {
            console.warn('Erro ao carregar configurações salvas:', e);
        }
        updateProjectBadge();
        renderQuickChips();
    }

    function saveSettingsToDisk() {
        try {
            const payload = {
                currentProject: state.currentProject,
                empresa: state.empresa,
                fiscalName: state.fiscalName,
                stampStyle: state.stampStyle,
                customLogoUrl: state.customLogoUrl,
                quickTags: state.quickTags
            };
            localStorage.setItem('fotolaudo_cfg_v1', JSON.stringify(payload));
        } catch (e) {
            console.warn('Erro ao salvar configurações:', e);
        }
    }

    // ============================================================
    // CÁLCULO GEODÉSICO DE COORDENADAS UTM (WGS84 / SIRGAS 2000)
    // ============================================================
    function latLonToUtm(lat, lon) {
        if (lat === null || lon === null || isNaN(lat) || isNaN(lon)) {
            return { zone: '--', easting: 0, northing: 0 };
        }
        const a = 6378137.0; // semi-eixo maior
        const f = 1 / 298.257223563; // achatamento
        const e2 = 2 * f - f * f;
        const k0 = 0.9996; // fator de escala

        const zone = Math.floor((lon + 180) / 6) + 1;
        const lon0 = ((zone - 1) * 6 - 180 + 3) * (Math.PI / 180);
        const latRad = lat * (Math.PI / 180);
        const lonRad = lon * (Math.PI / 180);

        const ePrime2 = e2 / (1 - e2);
        const N = a / Math.sqrt(1 - e2 * Math.sin(latRad) * Math.sin(latRad));
        const T = Math.tan(latRad) * Math.tan(latRad);
        const C = ePrime2 * Math.cos(latRad) * Math.cos(latRad);
        const A = Math.cos(latRad) * (lonRad - lon0);

        const M = a * (
            (1 - e2 / 4 - 3 * e2 * e2 / 64 - 5 * e2 * e2 * e2 / 256) * latRad -
            (3 * e2 / 8 + 3 * e2 * e2 / 32 + 45 * e2 * e2 * e2 / 1024) * Math.sin(2 * latRad) +
            (15 * e2 * e2 / 256 + 45 * e2 * e2 * e2 / 1024) * Math.sin(4 * latRad) -
            (35 * e2 * e2 * e2 / 3072) * Math.sin(6 * latRad)
        );

        let x = k0 * N * (
            A + (1 - T + C) * Math.pow(A, 3) / 6 +
            (5 - 18 * T + T * T + 72 * C - 58 * ePrime2) * Math.pow(A, 5) / 120
        ) + 500000;

        let y = k0 * (
            M + N * Math.tan(latRad) * (
                Math.pow(A, 2) / 2 +
                (5 - T + 9 * C + 4 * C * C) * Math.pow(A, 4) / 24 +
                (61 - 58 * T + T * T + 600 * C - 330 * ePrime2) * Math.pow(A, 6) / 720
            )
        );

        if (lat < 0) {
            y += 10000000; // Hemisfério Sul
        }

        return {
            zone: zone + (lat < 0 ? 'S' : 'N'),
            easting: Math.round(x),
            northing: Math.round(y)
        };
    }

    // ============================================================
    // TELEMETRIA: GPS, GIROSCÓPIO, BÚSSOLA & NÍVEL
    // ============================================================
    function initSensors() {
        // 1. Geolocalização Contínua de Alta Precisão
        if ('geolocation' in navigator) {
            navigator.geolocation.watchPosition(
                (pos) => {
                    state.telemetry.lat = pos.coords.latitude;
                    state.telemetry.lon = pos.coords.longitude;
                    state.telemetry.altitude = pos.coords.altitude ? Math.round(pos.coords.altitude) : null;
                    state.telemetry.accuracy = Math.round(pos.coords.accuracy);
                    state.telemetry.utm = latLonToUtm(state.telemetry.lat, state.telemetry.lon);
                    updateHudTelemetry();
                },
                (err) => {
                    console.warn('Erro GPS:', err.message);
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 2000 }
            );
        }

        // 2. Giroscópio e Orientação (Nível de Bolha & Azimute)
        function handleOrientation(e) {
            // Roll (inclinação lateral) e Pitch (inclinação frontal)
            const roll = e.gamma || 0; // -90 a 90
            const pitch = e.beta || 0; // -180 a 180

            // Bússola (Azimute / Heading)
            let heading = e.webkitCompassHeading;
            if (heading === undefined && e.alpha !== null) {
                heading = 360 - e.alpha;
            }
            if (heading !== undefined) {
                state.telemetry.azimuth = Math.round((heading + 360) % 360);
            }

            state.telemetry.roll = Number(roll.toFixed(1));
            state.telemetry.pitch = Number(pitch.toFixed(1));

            // Avaliar se está no prumo / nivelado (tolerância de +- 1.5°)
            const isLevel = Math.abs(roll) <= 1.5;
            state.telemetry.isLevel = isLevel;

            updateHudOrientation(roll, pitch, isLevel);
        }

        if (window.DeviceOrientationEvent) {
            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                // iOS 13+ requer permissão explícita
                window.addEventListener('click', function reqPerm() {
                    DeviceOrientationEvent.requestPermission()
                        .then((res) => {
                            if (res === 'granted') {
                                window.addEventListener('deviceorientation', handleOrientation);
                            }
                        })
                        .catch(() => {});
                    window.removeEventListener('click', reqPerm);
                });
            } else {
                window.addEventListener('deviceorientation', handleOrientation);
            }
        }

        // Relógio de Timestamp
        setInterval(() => {
            state.telemetry.timestamp = new Date();
            const timeStr = state.telemetry.timestamp.toLocaleTimeString('pt-BR');
            const el = document.getElementById('hudDateTime');
            if (el) el.innerText = timeStr;
        }, 1000);
    }

    function getCardinalDirection(deg) {
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
        const idx = Math.round(deg / 45) % 8;
        return directions[idx];
    }

    function updateHudTelemetry() {
        const t = state.telemetry;
        const elGps = document.getElementById('hudGpsCoord');
        const elUtm = document.getElementById('hudUtmCoord');
        const elAlt = document.getElementById('hudAltitude');
        const elCompass = document.getElementById('hudCompass');
        const elQuickAz = document.getElementById('quickAzimuth');
        const elQuickAcc = document.getElementById('quickGpsAcc');

        if (t.lat !== null && t.lon !== null) {
            elGps.innerText = `${t.lat.toFixed(5)}°, ${t.lon.toFixed(5)}°`;
            elUtm.innerText = `Fuso ${t.utm.zone} X:${t.utm.easting} Y:${t.utm.northing}`;
            elAlt.innerText = t.altitude !== null ? `Alt: ${t.altitude}m` : 'Alt: --';
            elQuickAcc.innerText = `±${t.accuracy}m`;
        }

        const cardinal = getCardinalDirection(t.azimuth);
        elCompass.innerText = `Az: ${t.azimuth}° ${cardinal}`;
        elQuickAz.innerText = `${t.azimuth}° ${cardinal}`;
    }

    function updateHudOrientation(roll, pitch, isLevel) {
        const elQuickLevel = document.getElementById('quickLevel');
        if (elQuickLevel) {
            elQuickLevel.innerText = `${Math.abs(roll).toFixed(1)}°`;
            elQuickLevel.className = isLevel ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold';
        }

        if (horizonLine) {
            // Rotação suave da linha de horizonte artificial
            horizonLine.style.transform = `rotate(${-roll}deg) translateY(${Math.min(40, Math.max(-40, pitch - 90))}px)`;
            if (isLevel) {
                horizonLine.classList.add('horizon-level');
            } else {
                horizonLine.classList.remove('horizon-level');
            }
        }

        if (levelDot) {
            const offsetX = Math.min(45, Math.max(-45, roll * 2));
            const offsetY = Math.min(45, Math.max(-45, (pitch - 90) * 1.5));
            levelDot.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`;
            if (isLevel) {
                levelDot.classList.add('level-perfect');
            } else {
                levelDot.classList.remove('level-perfect');
            }
        }
    }

    // ============================================================
    // CÂMERA: WEBRTC & CONTROLES
    // ============================================================
    async function startCamera(preferredDeviceId = null) {
        if (state.stream) {
            state.stream.getTracks().forEach((track) => track.stop());
            state.stream = null;
        }

        const videoConstraints = preferredDeviceId ? {
            deviceId: { exact: preferredDeviceId }
        } : {
            facingMode: { ideal: state.facingMode },
            width: { ideal: 1920 },
            height: { ideal: 1080 }
        };

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: false,
                video: videoConstraints
            });
            state.stream = stream;
            video.srcObject = stream;
            await video.play();
            fallbackBox.classList.add('hidden');
        } catch (err) {
            console.warn('Tentativa 1 falhou, tentando fallback com facingMode:', err);
            try {
                const fallbackStream = await navigator.mediaDevices.getUserMedia({
                    audio: false,
                    video: { facingMode: state.facingMode }
                });
                state.stream = fallbackStream;
                video.srcObject = fallbackStream;
                await video.play();
                fallbackBox.classList.add('hidden');
            } catch (err2) {
                console.warn('Tentativa 2 falhou, tentando qualquer câmera disponível:', err2);
                try {
                    const basicStream = await navigator.mediaDevices.getUserMedia({
                        audio: false,
                        video: true
                    });
                    state.stream = basicStream;
                    video.srcObject = basicStream;
                    await video.play();
                    fallbackBox.classList.add('hidden');
                } catch (err3) {
                    console.error('Nenhuma câmera WebRTC pôde ser aberta:', err3);
                    fallbackBox.classList.remove('hidden');
                }
            }
        }
    }

    // Toast HUD não obstrutivo
    function showToast(message, duration = 3000) {
        let toast = document.getElementById('hudToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'hudToast';
            toast.className = 'fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-slate-900/95 border border-amber-500/40 text-white text-xs font-semibold shadow-2xl backdrop-blur-md transition-all duration-300 pointer-events-none opacity-0 scale-95 text-center max-w-[90vw] whitespace-normal';
            document.body.appendChild(toast);
        }
        toast.innerHTML = message;
        toast.classList.remove('opacity-0', 'scale-95');
        toast.classList.add('opacity-100', 'scale-100');

        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => {
            toast.classList.remove('opacity-100', 'scale-100');
            toast.classList.add('opacity-0', 'scale-95');
        }, duration);
    }

    function toggleTorch() {
        const btnTorch = document.getElementById('btnTorch');
        btnTorch?.classList.add('text-amber-400', 'border-amber-500/50', 'bg-amber-500/20');
        setTimeout(() => {
            btnTorch?.classList.remove('text-amber-400', 'border-amber-500/50', 'bg-amber-500/20');
        }, 3500);

        showToast('🔦 <strong>Iluminação para Fotos:</strong><br>Deslize o topo da tela do seu celular para baixo e ative a <strong>Lanterna nativa</strong> do aparelho!', 6000);
    }

    // Som de obturador sintético via Web Audio API (funciona offline e em qualquer navegador)
    function playShutterSound() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08);

            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.08);
        } catch (e) {}
    }

    function triggerVisualFlash() {
        shutterFlash.classList.add('flash-active');
        setTimeout(() => shutterFlash.classList.remove('flash-active'), 80);
    }

    // ============================================================
    // MOTOR DE CARIMBO TÉCNICO (CANVAS DE ALTA DEFINIÇÃO)
    // ============================================================
    function drawMiniMap(lat, lon) {
        const ctx = mapCanvas.getContext('2d');
        const w = mapCanvas.width;
        const h = mapCanvas.height;

        // Fundo estilo radar escuro
        ctx.fillStyle = '#0a1122';
        ctx.fillRect(0, 0, w, h);

        // Grade de coordenadas
        ctx.strokeStyle = 'rgba(0, 210, 255, 0.15)';
        ctx.lineWidth = 1;
        for (let i = 20; i < w; i += 25) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, h);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(w, i);
            ctx.stroke();
        }

        // Círculos concêntricos de radar
        ctx.strokeStyle = 'rgba(0, 210, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 35, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 65, 0, Math.PI * 2);
        ctx.stroke();

        // Pin de localização com pulso
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Cruz de mira
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(w / 2 - 12, h / 2);
        ctx.lineTo(w / 2 + 12, h / 2);
        ctx.moveTo(w / 2, h / 2 - 12);
        ctx.lineTo(w / 2, h / 2 + 12);
        ctx.stroke();

        // Borda
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, w - 2, h - 2);

        // Texto de coordenada
        ctx.fillStyle = '#00d2ff';
        ctx.font = '10px monospace';
        ctx.fillText('RADAR GPS', 8, 16);
    }

    // ============================================================
    // FUNÇÕES DE DESENHO DE ANOTAÇÕES TÉCNICAS (MARKUP)
    // ============================================================
    function drawArrow(ctx, x1, y1, x2, y2, color, lineWidth, scale) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dist = Math.hypot(dx, dy);
        if (dist < 4) return;

        const angle = Math.atan2(dy, dx);
        const sc = scale || 1;
        // Cabeça e traço proeminentes, adequados para visualização nítida em telas móveis e fotos
        const headLen = Math.max(30 * sc, lineWidth * 3.5);
        const headAngle = Math.PI / 5.5; // ~32 graus

        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        ctx.shadowBlur = 8 * sc;
        ctx.shadowOffsetX = 3 * sc;
        ctx.shadowOffsetY = 3 * sc;

        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = Math.max(4 * sc, lineWidth);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Linha da haste (para antes da ponta para encaixe estético perfeito)
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(
            x2 - Math.cos(angle) * (headLen * 0.45),
            y2 - Math.sin(angle) * (headLen * 0.45)
        );
        ctx.stroke();

        // Cabeça geométrica com entalhe técnico
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(
            x2 - headLen * Math.cos(angle - headAngle),
            y2 - headLen * Math.sin(angle - headAngle)
        );
        ctx.lineTo(
            x2 - (headLen * 0.65) * Math.cos(angle),
            y2 - (headLen * 0.65) * Math.sin(angle)
        );
        ctx.lineTo(
            x2 - headLen * Math.cos(angle + headAngle),
            y2 - headLen * Math.sin(angle + headAngle)
        );
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    function drawCircle(ctx, cx, cy, rx, ry, color, lineWidth, scale) {
        ctx.save();
        const sc = scale || 1;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        ctx.shadowBlur = 8 * sc;
        ctx.shadowOffsetX = 2 * sc;
        ctx.shadowOffsetY = 2 * sc;

        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(3 * sc, lineWidth);
        ctx.beginPath();
        ctx.ellipse(cx, cy, Math.max(12 * sc, rx), Math.max(12 * sc, ry), 0, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.restore();
    }

    function drawRect(ctx, x, y, w, h, color, lineWidth, scale) {
        ctx.save();
        const sc = scale || 1;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        ctx.shadowBlur = 8 * sc;
        ctx.shadowOffsetX = 2 * sc;
        ctx.shadowOffsetY = 2 * sc;

        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(3 * sc, lineWidth);
        ctx.strokeRect(x, y, w, h);
        ctx.restore();
    }

    function drawBlur(ctx, x, y, w, h, scale) {
        if (!w || !h || Math.abs(w) < 4 || Math.abs(h) < 4) return;

        const sc = scale || 1;
        const x0 = Math.max(0, Math.min(x, x + w));
        const y0 = Math.max(0, Math.min(y, y + h));
        const sw = Math.min(Math.abs(w), ctx.canvas.width - x0);
        const sh = Math.min(Math.abs(h), ctx.canvas.height - y0);

        if (sw <= 0 || sh <= 0) return;

        ctx.save();
        try {
            // Mosaico pixelado técnico de alta performance (sem bibliotecas externas)
            const pixelSize = Math.max(8, Math.round(16 * sc));
            const miniW = Math.max(1, Math.floor(sw / pixelSize));
            const miniH = Math.max(1, Math.floor(sh / pixelSize));

            const offCanvas = document.createElement('canvas');
            offCanvas.width = miniW;
            offCanvas.height = miniH;
            const offCtx = offCanvas.getContext('2d');

            // Amostra a área do canvas em baixa resolução
            offCtx.drawImage(ctx.canvas, x0, y0, sw, sh, 0, 0, miniW, miniH);

            // Redesenha ampliado no canvas principal com interpolação desligada (pixel mosaic)
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(offCanvas, 0, 0, miniW, miniH, x0, y0, sw, sh);
            ctx.imageSmoothingEnabled = true;

            // Borda técnica tracejada discreta em ciano/azul para indicar a área censurada
            ctx.strokeStyle = '#00D2FF';
            ctx.lineWidth = Math.max(2 * sc, 3);
            ctx.setLineDash([8 * sc, 5 * sc]);
            ctx.strokeRect(x0, y0, sw, sh);

            // Rótulo discreto "BLUR" no canto
            ctx.setLineDash([]);
            const tagSize = Math.max(10, Math.round(12 * sc));
            ctx.font = `bold ${tagSize}px "JetBrains Mono", Inter, sans-serif`;
            const labelText = 'BLUR';
            const textMetrics = ctx.measureText(labelText);
            ctx.fillStyle = 'rgba(7, 11, 20, 0.85)';
            ctx.fillRect(x0 + 2, y0 + 2, textMetrics.width + 8 * sc, tagSize + 6 * sc);
            ctx.fillStyle = '#00D2FF';
            ctx.textBaseline = 'top';
            ctx.fillText(labelText, x0 + 4 * sc, y0 + 3 * sc);
        } catch (e) {
            // Fallback para tarja fosca caso canvas esteja restrito
            ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
            ctx.fillRect(x0, y0, sw, sh);
            ctx.strokeStyle = '#00D2FF';
            ctx.lineWidth = Math.max(2 * sc, 3);
            ctx.strokeRect(x0, y0, sw, sh);
        }
        ctx.restore();
    }

    function drawPen(ctx, points, color, lineWidth, scale) {
        if (!points || points.length < 2) return;
        const sc = scale || 1;
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        ctx.shadowBlur = 8 * sc;
        ctx.shadowOffsetX = 2 * sc;
        ctx.shadowOffsetY = 2 * sc;

        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(3 * sc, lineWidth);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
        ctx.restore();
    }

    function drawTextLabel(ctx, x, y, text, color, scale, lineWidth) {
        if (!text) return;
        ctx.save();
        const sc = scale || 1;
        // Tamanho do texto amplo e perfeitamente legível no mobile e relatórios
        const baseSize = (lineWidth && lineWidth >= 14) ? 26 : ((lineWidth && lineWidth <= 4) ? 18 : 22);
        const fontSize = Math.max(16, Math.round(baseSize * sc));
        ctx.font = `bold ${fontSize}px "JetBrains Mono", Inter, sans-serif`;

        const padH = Math.round(14 * sc);
        const padV = Math.round(10 * sc);
        const textW = ctx.measureText(text).width;
        const textH = fontSize;

        let boxX = x;
        let boxY = y - textH - padV * 2;
        if (boxY < 15 * sc) boxY = y + padV + 6 * sc;
        if (boxX + textW + padH * 2 > ctx.canvas.width) {
            boxX = Math.max(10, ctx.canvas.width - textW - padH * 2 - 10);
        }

        const boxW = textW + padH * 2;
        const boxH = textH + padV * 2;
        const radius = Math.round(8 * sc);

        // Sombra da caixa
        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        ctx.shadowBlur = 10 * sc;
        ctx.shadowOffsetX = 3 * sc;
        ctx.shadowOffsetY = 4 * sc;

        // Fundo da etiqueta escura com borda na cor técnica
        ctx.fillStyle = 'rgba(7, 11, 20, 0.94)';
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(2.5 * sc, 3);

        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(boxX, boxY, boxW, boxH, radius);
        } else {
            ctx.rect(boxX, boxY, boxW, boxH);
        }
        ctx.fill();
        ctx.stroke();

        // Ponto de fixação na coordenada exata do clique
        ctx.beginPath();
        ctx.arc(x, y, Math.round(6 * sc), 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();

        // Texto com alto contraste
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.fillStyle = '#ffffff';
        ctx.textBaseline = 'top';
        ctx.fillText(text, boxX + padH, boxY + padV);

        ctx.restore();
    }

    function drawDimension(ctx, x1, y1, x2, y2, text, color, lw, scale) {
        const sc = scale || 1;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.hypot(dx, dy);
        if (len < 5) return;

        const ux = dx / len;
        const uy = dy / len;
        const nx = -uy;
        const ny = ux;

        ctx.save();
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = lw;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // 1. Linhas limitadoras perpendiculares nas pontas (witness lines)
        const tickLen = Math.max(18 * sc, 24);
        ctx.beginPath();
        ctx.moveTo(x1 - nx * (tickLen / 2), y1 - ny * (tickLen / 2));
        ctx.lineTo(x1 + nx * (tickLen / 2), y1 + ny * (tickLen / 2));
        ctx.moveTo(x2 - nx * (tickLen / 2), y2 - ny * (tickLen / 2));
        ctx.lineTo(x2 + nx * (tickLen / 2), y2 + ny * (tickLen / 2));
        ctx.stroke();

        // 2. Linha de cota principal
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // 3. Setas duplas nas pontas apontando para os extremos
        const arrowLen = Math.max(16 * sc, 20);
        const arrowAngle = Math.PI / 6;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1 + (ux * Math.cos(arrowAngle) - uy * Math.sin(arrowAngle)) * arrowLen,
                   y1 + (ux * Math.sin(arrowAngle) + uy * Math.cos(arrowAngle)) * arrowLen);
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1 + (ux * Math.cos(-arrowAngle) - uy * Math.sin(-arrowAngle)) * arrowLen,
                   y1 + (ux * Math.sin(-arrowAngle) + uy * Math.cos(-arrowAngle)) * arrowLen);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - (ux * Math.cos(arrowAngle) - uy * Math.sin(arrowAngle)) * arrowLen,
                   y2 - (ux * Math.sin(arrowAngle) + uy * Math.cos(arrowAngle)) * arrowLen);
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - (ux * Math.cos(-arrowAngle) - uy * Math.sin(-arrowAngle)) * arrowLen,
                   y2 - (ux * Math.sin(-arrowAngle) + uy * Math.cos(-arrowAngle)) * arrowLen);
        ctx.stroke();

        // 4. Badge com a medida no ponto médio
        if (text) {
            const mx = (x1 + x2) / 2;
            const my = (y1 + y2) / 2;
            const fontSize = Math.max(15, Math.round(18 * sc));
            ctx.font = `bold ${fontSize}px "JetBrains Mono", monospace, sans-serif`;
            const textMetrics = ctx.measureText(text);
            const textW = textMetrics.width;
            const padH = Math.round(10 * sc);
            const padV = Math.round(6 * sc);
            const boxW = textW + padH * 2;
            const boxH = fontSize + padV * 2;

            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
            ctx.shadowBlur = 8 * sc;
            ctx.fillStyle = '#080d1a';
            ctx.beginPath();
            if (typeof ctx.roundRect === 'function') {
                ctx.roundRect(mx - boxW / 2, my - boxH / 2, boxW, boxH, 6 * sc);
            } else {
                ctx.rect(mx - boxW / 2, my - boxH / 2, boxW, boxH);
            }
            ctx.fill();

            ctx.strokeStyle = color;
            ctx.lineWidth = Math.max(1.5 * sc, 2);
            ctx.stroke();
            ctx.restore();

            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, mx, my);
        }

        ctx.restore();
    }

    function drawAnnotation(ctx, a, scale) {
        if (!a) return;
        const lw = (a.lineWidth || 8) * scale;
        const col = a.color || '#EF4444';

        switch (a.type) {
            case 'arrow':
                drawArrow(ctx, a.x1, a.y1, a.x2, a.y2, col, lw, scale);
                break;
            case 'dimension':
                drawDimension(ctx, a.x1, a.y1, a.x2, a.y2, a.text, col, lw, scale);
                break;
            case 'circle':
                drawCircle(ctx, a.cx, a.cy, a.rx, a.ry, col, lw, scale);
                break;
            case 'rect':
                drawRect(ctx, a.x, a.y, a.w, a.h, col, lw, scale);
                break;
            case 'blur':
                drawBlur(ctx, a.x, a.y, a.w, a.h, scale);
                break;
            case 'pen':
                drawPen(ctx, a.points, col, lw, scale);
                break;
            case 'text':
                drawTextLabel(ctx, a.x, a.y, a.text, col, scale, a.lineWidth);
                break;
        }
    }

    // ============================================================
    // GESTÃO DE SELEÇÃO & DESLOCAMENTO (MOVER MARCAÇÕES)
    // ============================================================
    function getAnnotationBounds(a, scale) {
        if (!a) return null;
        const sc = scale || 1;
        switch (a.type) {
            case 'rect':
            case 'blur': {
                const x0 = Math.min(a.x, a.x + a.w);
                const y0 = Math.min(a.y, a.y + a.h);
                const w0 = Math.abs(a.w);
                const h0 = Math.abs(a.h);
                return { minX: x0, minY: y0, maxX: x0 + w0, maxY: y0 + h0 };
            }
            case 'circle': {
                return {
                    minX: a.cx - a.rx,
                    minY: a.cy - a.ry,
                    maxX: a.cx + a.rx,
                    maxY: a.cy + a.ry
                };
            }
            case 'arrow':
            case 'dimension': {
                const pad = Math.max(25 * sc, 35);
                return {
                    minX: Math.min(a.x1, a.x2) - pad,
                    minY: Math.min(a.y1, a.y2) - pad,
                    maxX: Math.max(a.x1, a.x2) + pad,
                    maxY: Math.max(a.y1, a.y2) + pad
                };
            }
            case 'text': {
                const baseSize = (a.lineWidth && a.lineWidth >= 14) ? 26 : ((a.lineWidth && a.lineWidth <= 4) ? 18 : 22);
                const fontSize = Math.max(16, Math.round(baseSize * sc));
                const padH = Math.round(14 * sc);
                const padV = Math.round(10 * sc);
                const textW = (a.text.length * fontSize * 0.65);
                const boxW = textW + padH * 2;
                const boxH = fontSize + padV * 2;
                let boxX = a.x;
                let boxY = a.y - fontSize - padV * 2;
                if (boxY < 15 * sc) boxY = a.y + padV + 6 * sc;
                return {
                    minX: boxX,
                    minY: boxY,
                    maxX: boxX + boxW,
                    maxY: boxY + boxH
                };
            }
            case 'pen': {
                if (!a.points || a.points.length === 0) return null;
                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                a.points.forEach(p => {
                    if (p.x < minX) minX = p.x;
                    if (p.y < minY) minY = p.y;
                    if (p.x > maxX) maxX = p.x;
                    if (p.y > maxY) maxY = p.y;
                });
                const pad = Math.max(15 * sc, 20);
                return { minX: minX - pad, minY: minY - pad, maxX: maxX + pad, maxY: maxY + pad };
            }
        }
        return null;
    }

    function isPointInAnnotation(px, py, a, scale) {
        if (!a) return false;
        const sc = scale || 1;
        // Tolerância generosa para o toque de dedo no celular (hit testing fácil)
        const tolerance = Math.max(30 * sc, 40);

        switch (a.type) {
            case 'rect':
            case 'blur': {
                const x0 = Math.min(a.x, a.x + a.w);
                const y0 = Math.min(a.y, a.y + a.h);
                const w0 = Math.abs(a.w);
                const h0 = Math.abs(a.h);
                return px >= x0 - tolerance && px <= x0 + w0 + tolerance &&
                       py >= y0 - tolerance && py <= y0 + h0 + tolerance;
            }
            case 'circle': {
                const dx = (px - a.cx) / (Math.max(15 * sc, a.rx) + tolerance);
                const dy = (py - a.cy) / (Math.max(15 * sc, a.ry) + tolerance);
                return (dx * dx + dy * dy) <= 1.25;
            }
            case 'text': {
                const bounds = getAnnotationBounds(a, sc);
                if (!bounds) return false;
                return px >= bounds.minX - tolerance && px <= bounds.maxX + tolerance &&
                       py >= bounds.minY - tolerance && py <= bounds.maxY + tolerance;
            }
            case 'arrow':
            case 'dimension': {
                const x1 = a.x1, y1 = a.y1, x2 = a.x2, y2 = a.y2;
                const l2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
                if (l2 === 0) return Math.hypot(px - x1, py - y1) <= tolerance;
                let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
                t = Math.max(0, Math.min(1, t));
                const projX = x1 + t * (x2 - x1);
                const projY = y1 + t * (y2 - y1);
                return Math.hypot(px - projX, py - projY) <= tolerance;
            }
            case 'pen': {
                if (!a.points || a.points.length === 0) return false;
                for (let i = 0; i < a.points.length - 1; i++) {
                    const p1 = a.points[i];
                    const p2 = a.points[i + 1];
                    const l2 = (p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2;
                    let t = l2 === 0 ? 0 : ((px - p1.x) * (p2.x - p1.x) + (py - p1.y) * (p2.y - p1.y)) / l2;
                    t = Math.max(0, Math.min(1, t));
                    const projX = p1.x + t * (p2.x - p1.x);
                    const projY = p1.y + t * (p2.y - p1.y);
                    if (Math.hypot(px - projX, py - projY) <= tolerance) return true;
                }
                return false;
            }
        }
        return false;
    }

    function moveAnnotation(a, dx, dy) {
        if (!a) return;
        switch (a.type) {
            case 'arrow':
            case 'dimension':
                a.x1 += dx;
                a.y1 += dy;
                a.x2 += dx;
                a.y2 += dy;
                break;
            case 'circle':
                a.cx += dx;
                a.cy += dy;
                break;
            case 'rect':
            case 'blur':
            case 'text':
                a.x += dx;
                a.y += dy;
                break;
            case 'pen':
                if (a.points) {
                    a.points.forEach(p => {
                        p.x += dx;
                        p.y += dy;
                    });
                }
                break;
        }
    }

    // Identificação de clique/toque sobre as alças de redimensionamento
    function getHandleAtPoint(px, py, a, scale) {
        if (!a) return null;
        const sc = scale || 1;
        const bounds = getAnnotationBounds(a, sc);
        if (!bounds) return null;

        const pad = Math.round(14 * sc);
        const minX = bounds.minX - pad;
        const minY = bounds.minY - pad;
        const w = (bounds.maxX - bounds.minX) + pad * 2;
        const h = (bounds.maxY - bounds.minY) + pad * 2;
        const touchRadius = Math.max(35 * sc, 45); // Toque amigável para dedos no celular

        // Para seta e cota: testar primeiro a ponta e a base
        if (a.type === 'arrow' || a.type === 'dimension') {
            if (Math.hypot(px - a.x2, py - a.y2) <= touchRadius) {
                return { type: 'arrow-head' };
            }
            if (Math.hypot(px - a.x1, py - a.y1) <= touchRadius) {
                return { type: 'arrow-tail' };
            }
        }

        const handles = [
            { type: 'tl', x: minX, y: minY, anchorX: minX + w, anchorY: minY + h },
            { type: 'tr', x: minX + w, y: minY, anchorX: minX, anchorY: minY + h },
            { type: 'bl', x: minX, y: minY + h, anchorX: minX + w, anchorY: minY },
            { type: 'br', x: minX + w, y: minY + h, anchorX: minX, anchorY: minY }
        ];

        for (const hnd of handles) {
            if (Math.hypot(px - hnd.x, py - hnd.y) <= touchRadius) {
                return hnd;
            }
        }
        return null;
    }

    // Redimensionamento (Aumentar / Diminuir) pelas alças
    function resizeAnnotation(target, initial, handle, coords, initBounds, scale) {
        if (!target || !initial || !handle) return;
        const sc = scale || 1;

        // Caso especial da seta e cota: esticar/rotacionar diretamente pela ponta ou base
        if ((initial.type === 'arrow' || initial.type === 'dimension') && handle.type === 'arrow-head') {
            target.x2 = coords.x;
            target.y2 = coords.y;
            return;
        }
        if ((initial.type === 'arrow' || initial.type === 'dimension') && handle.type === 'arrow-tail') {
            target.x1 = coords.x;
            target.y1 = coords.y;
            return;
        }

        const anchorX = handle.anchorX;
        const anchorY = handle.anchorY;

        const newW = Math.max(20 * sc, Math.abs(coords.x - anchorX));
        const newH = Math.max(20 * sc, Math.abs(coords.y - anchorY));
        const newMinX = Math.min(coords.x, anchorX);
        const newMinY = Math.min(coords.y, anchorY);

        const oldW = Math.max(1, initBounds.maxX - initBounds.minX);
        const oldH = Math.max(1, initBounds.maxY - initBounds.minY);

        const scaleX = newW / oldW;
        const scaleY = newH / oldH;

        switch (initial.type) {
            case 'rect':
            case 'blur': {
                target.x = Math.round(newMinX);
                target.y = Math.round(newMinY);
                target.w = Math.round(newW);
                target.h = Math.round(newH);
                break;
            }
            case 'circle': {
                target.cx = Math.round(newMinX + newW / 2);
                target.cy = Math.round(newMinY + newH / 2);
                target.rx = Math.round(newW / 2);
                target.ry = Math.round(newH / 2);
                break;
            }
            case 'arrow':
            case 'dimension': {
                target.x1 = Math.round(anchorX + (initial.x1 - anchorX) * scaleX);
                target.y1 = Math.round(anchorY + (initial.y1 - anchorY) * scaleY);
                target.x2 = Math.round(anchorX + (initial.x2 - anchorX) * scaleX);
                target.y2 = Math.round(anchorY + (initial.y2 - anchorY) * scaleY);
                break;
            }
            case 'text': {
                const factor = Math.max(0.5, (scaleX + scaleY) / 2);
                target.x = Math.round(anchorX + (initial.x - anchorX) * scaleX);
                target.y = Math.round(anchorY + (initial.y - anchorY) * scaleY);
                const initLw = initial.lineWidth || 8;
                target.lineWidth = Math.min(22, Math.max(3, Math.round(initLw * factor)));
                break;
            }
            case 'pen': {
                if (initial.points && target.points) {
                    for (let i = 0; i < initial.points.length; i++) {
                        target.points[i].x = Math.round(anchorX + (initial.points[i].x - anchorX) * scaleX);
                        target.points[i].y = Math.round(anchorY + (initial.points[i].y - anchorY) * scaleY);
                    }
                }
                break;
            }
        }
    }

    function drawSelectionBox(ctx, a, scale) {
        if (!a) return;
        const sc = scale || 1;
        const bounds = getAnnotationBounds(a, sc);
        if (!bounds) return;

        const pad = Math.round(14 * sc);
        const minX = bounds.minX - pad;
        const minY = bounds.minY - pad;
        const w = (bounds.maxX - bounds.minX) + pad * 2;
        const h = (bounds.maxY - bounds.minY) + pad * 2;

        ctx.save();
        // Borda tracejada ciano estilo CAD de seleção
        ctx.strokeStyle = '#00D2FF';
        ctx.lineWidth = Math.max(2, 2.5 * sc);
        ctx.setLineDash([8 * sc, 5 * sc]);
        ctx.strokeRect(minX, minY, w, h);

        // Alças nos 4 cantos para Aumentar / Diminuir
        ctx.setLineDash([]);
        const handleSize = Math.max(14, Math.round(18 * sc));
        const halfH = handleSize / 2;

        const corners = [
            { x: minX, y: minY },
            { x: minX + w, y: minY },
            { x: minX, y: minY + h },
            { x: minX + w, y: minY + h }
        ];

        // Sombra nas alças
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = 6 * sc;

        corners.forEach(c => {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(c.x - halfH, c.y - halfH, handleSize, handleSize);
            ctx.strokeStyle = '#00D2FF';
            ctx.lineWidth = Math.max(2 * sc, 2.5);
            ctx.strokeRect(c.x - halfH, c.y - halfH, handleSize, handleSize);

            // Ponto central ciano
            ctx.fillStyle = '#00D2FF';
            const dotSize = Math.max(4, Math.round(5 * sc));
            ctx.fillRect(c.x - dotSize / 2, c.y - dotSize / 2, dotSize, dotSize);
        });

        // Se for seta ou cota, desenha alças especiais circulares na ponta e na base
        if (a.type === 'arrow' || a.type === 'dimension') {
            const arrowRadius = Math.max(12, Math.round(15 * sc));
            // Alça do ponto 2 (ponta)
            ctx.beginPath();
            ctx.arc(a.x2, a.y2, arrowRadius, 0, 2 * Math.PI);
            ctx.fillStyle = '#00D2FF';
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = Math.max(2 * sc, 2.5);
            ctx.stroke();

            // Alça do ponto 1 (base)
            ctx.beginPath();
            ctx.arc(a.x1, a.y1, Math.max(10, Math.round(13 * sc)), 0, 2 * Math.PI);
            ctx.fillStyle = '#F59E0B';
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = Math.max(2 * sc, 2.5);
            ctx.stroke();
        }

        ctx.shadowBlur = 0;

        // Etiqueta indicativa "ARRASTE OU PUXE AS ALÇAS"
        const tagFontSize = Math.max(11, Math.round(13 * sc));
        ctx.font = `bold ${tagFontSize}px "JetBrains Mono", Inter, sans-serif`;
        const label = '👆 ARRASTE O ITEM OU PUXE AS ALÇAS ↔';
        const lm = ctx.measureText(label);
        const tagH = tagFontSize + 8 * sc;
        const tagW = lm.width + 16 * sc;
        const tagY = (minY - tagH - 8 * sc > 10) ? (minY - tagH - 8 * sc) : (minY + h + 10 * sc);

        ctx.fillStyle = 'rgba(0, 210, 255, 0.95)';
        ctx.fillRect(minX, tagY, tagW, tagH);
        ctx.fillStyle = '#030712';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, minX + 8 * sc, tagY + tagH / 2);

        ctx.restore();
    }

    async function stampImage(imageSource, meta) {
        const canvas = renderCanvas;
        const ctx = canvas.getContext('2d');

        // Determinar dimensões originais
        const width = imageSource.videoWidth || imageSource.naturalWidth || imageSource.width;
        const height = imageSource.videoHeight || imageSource.naturalHeight || imageSource.height;

        canvas.width = width;
        canvas.height = height;

        // 1. Desenhar a foto base
        ctx.drawImage(imageSource, 0, 0, width, height);

        // Escala dinâmica do carimbo proporcional à largura da imagem
        const scale = Math.max(1, width / 1280);

        // Escala específica para anotações e blur correspondente à visualização mobile de referência (380px)
        const markupScale = Math.max(1, Math.min(width, height) / 380);

        // 2. Desenhar as anotações técnicas sobre a foto base
        if (meta && meta.annotations && Array.isArray(meta.annotations) && meta.annotations.length > 0) {
            meta.annotations.forEach(a => drawAnnotation(ctx, a, markupScale));
        }

        const fontSans = 'Inter, -apple-system, sans-serif';
        const fontMono = '"JetBrains Mono", monospace';

        const style = meta.stampStyle || state.stampStyle;

        if (style === 'concessao') {
            // ESTILO RODOVIAS & CONCESSÃO (Faixa Preta Inferior Sólida de Alto Contraste)
            const bannerHeight = Math.round(180 * scale);
            const bannerY = height - bannerHeight;

            // Fundo escuro com leve gradiente
            ctx.fillStyle = 'rgba(7, 11, 20, 0.94)';
            ctx.fillRect(0, bannerY, width, bannerHeight);

            // Linha divisória técnica âmbar
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(0, bannerY, width, Math.round(4 * scale));

            const padX = Math.round(28 * scale);
            let currentY = bannerY + Math.round(30 * scale);

            // Título do Projeto & Contratante
            ctx.font = `bold ${Math.round(18 * scale)}px ${fontSans}`;
            ctx.fillStyle = '#ffffff';
            ctx.fillText(meta.obra.toUpperCase(), padX, currentY);

            // Status da Inspeção (Badge)
            const statusLabel = meta.status === 'CONFORME' ? '🟢 CONFORME' : (meta.status === 'OBSERVACAO' ? '🟡 ATENÇÃO' : '🔴 NÃO CONFORME (RNC)');
            const statusColor = meta.status === 'CONFORME' ? '#10b981' : (meta.status === 'OBSERVACAO' ? '#f59e0b' : '#ef4444');
            const statusWidth = ctx.measureText(statusLabel).width;
            
            ctx.font = `bold ${Math.round(14 * scale)}px ${fontSans}`;
            ctx.fillStyle = statusColor;
            ctx.fillText(statusLabel, width - padX - Math.round(180 * scale), currentY);

            currentY += Math.round(26 * scale);

            // Estaca / Local & Elemento
            ctx.font = `600 ${Math.round(15 * scale)}px ${fontSans}`;
            ctx.fillStyle = '#fef3c7';
            ctx.fillText(`LOCAL: ${meta.estaca} | ELEMENTO: ${meta.elemento}`, padX, currentY);

            currentY += Math.round(24 * scale);

            // Telemetria GPS & UTM
            ctx.font = `500 ${Math.round(13 * scale)}px ${fontMono}`;
            ctx.fillStyle = '#00d2ff';
            const latStr = meta.lat ? meta.lat.toFixed(6) : '--';
            const lonStr = meta.lon ? meta.lon.toFixed(6) : '--';
            const utmStr = meta.utm ? `UTM: ${meta.utm.zone} E:${meta.utm.easting} N:${meta.utm.northing}` : '';
            ctx.fillText(`GPS: ${latStr}, ${lonStr} | ${utmStr} | ALT: ${meta.altitude || '--'}m`, padX, currentY);

            currentY += Math.round(22 * scale);

            // Azimute, Precisão e Data/Hora
            ctx.fillStyle = '#94a3b8';
            ctx.fillText(`AZIMUTE: ${meta.azimuth}° (${getCardinalDirection(meta.azimuth)}) | PRECISÃO: ±${meta.accuracy || '--'}m | DATA: ${meta.dataHora}`, padX, currentY);

            // Observações (se houver)
            if (meta.notas) {
                currentY += Math.round(20 * scale);
                ctx.font = `italic ${Math.round(12 * scale)}px ${fontSans}`;
                ctx.fillStyle = '#cbd5e1';
                ctx.fillText(`OBS: ${meta.notas}`, padX, currentY);
            }

            // Inserir Mini-Mapa no canto direito
            drawMiniMap(meta.lat, meta.lon);
            const mapSize = Math.round(130 * scale);
            ctx.drawImage(mapCanvas, width - padX - mapSize, bannerY + Math.round(25 * scale), mapSize, mapSize);

        } else if (style === 'laudo') {
            // ESTILO LAUDO DUPLO (Faixa Superior com Obra + Faixa Inferior com Telemetria)
            const topHeight = Math.round(75 * scale);
            const bottomHeight = Math.round(110 * scale);

            // Faixa Superior
            ctx.fillStyle = 'rgba(7, 11, 20, 0.9)';
            ctx.fillRect(0, 0, width, topHeight);
            ctx.fillStyle = '#00d2ff';
            ctx.fillRect(0, topHeight - Math.round(3 * scale), width, Math.round(3 * scale));

            ctx.font = `bold ${Math.round(17 * scale)}px ${fontSans}`;
            ctx.fillStyle = '#ffffff';
            ctx.fillText(meta.obra, Math.round(24 * scale), Math.round(32 * scale));

            ctx.font = `500 ${Math.round(13 * scale)}px ${fontSans}`;
            ctx.fillStyle = '#94a3b8';
            ctx.fillText(`FISCAL: ${meta.fiscal} | ${meta.empresa}`, Math.round(24 * scale), Math.round(56 * scale));

            // Faixa Inferior
            const botY = height - bottomHeight;
            ctx.fillStyle = 'rgba(7, 11, 20, 0.9)';
            ctx.fillRect(0, botY, width, bottomHeight);
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(0, botY, width, Math.round(3 * scale));

            ctx.font = `600 ${Math.round(14 * scale)}px ${fontMono}`;
            ctx.fillStyle = '#fef3c7';
            ctx.fillText(`LOCAL: ${meta.estaca} • ${meta.elemento}`, Math.round(24 * scale), botY + Math.round(30 * scale));

            ctx.font = `500 ${Math.round(13 * scale)}px ${fontMono}`;
            ctx.fillStyle = '#00d2ff';
            ctx.fillText(`UTM: ${meta.utm.zone} ${meta.utm.easting}E ${meta.utm.northing}N | AZ: ${meta.azimuth}° | DATA: ${meta.dataHora}`, Math.round(24 * scale), botY + Math.round(58 * scale));

            ctx.font = `400 ${Math.round(12 * scale)}px ${fontSans}`;
            ctx.fillStyle = '#94a3b8';
            ctx.fillText(`GPS: ${meta.lat?.toFixed(5) || '--'}, ${meta.lon?.toFixed(5) || '--'} (±${meta.accuracy || '--'}m) | ALT: ${meta.altitude || '--'}m`, Math.round(24 * scale), botY + Math.round(84 * scale));

        } else {
            // ESTILO MINIMALISTA (Cantos)
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, height - Math.round(65 * scale), width, Math.round(65 * scale));

            ctx.font = `bold ${Math.round(13 * scale)}px ${fontMono}`;
            ctx.fillStyle = '#f59e0b';
            ctx.fillText(`${meta.obra} • ${meta.estaca}`, Math.round(20 * scale), height - Math.round(36 * scale));

            ctx.fillStyle = '#ffffff';
            ctx.font = `500 ${Math.round(12 * scale)}px ${fontMono}`;
            ctx.fillText(`${meta.dataHora} • UTM: ${meta.utm.zone} ${meta.utm.easting}/${meta.utm.northing} • AZ: ${meta.azimuth}°`, Math.round(20 * scale), height - Math.round(16 * scale));
        }

        // Desenhar Logotipo customizado se houver
        if (state.customLogoUrl) {
            try {
                const logoImg = await loadImage(state.customLogoUrl);
                const logoH = Math.round(45 * scale);
                const aspect = logoImg.width / logoImg.height;
                const logoW = Math.round(logoH * aspect);
                ctx.drawImage(logoImg, width - Math.round(24 * scale) - logoW, Math.round(20 * scale), logoW, logoH);
            } catch (e) {}
        }

        return canvas.toDataURL('image/jpeg', 0.92);
    }

    function loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = (e) => reject(e);
            img.src = src;
        });
    }

    // ============================================================
    // CAPTURA DA FOTO & REVISÃO
    // ============================================================
    async function takePhoto() {
        if (!video.srcObject && fallbackBox.classList.contains('hidden')) {
            alert('Câmera não inicializada.');
            return;
        }

        playShutterSound();
        triggerVisualFlash();

        // Coletar snapshot dos metadados
        const now = new Date();
        const meta = {
            obra: state.currentProject,
            empresa: state.empresa,
            fiscal: state.fiscalName,
            estaca: document.getElementById('hudEstaca')?.innerText || 'Km 84+200 Sentido Norte',
            elemento: state.activeTag || 'Estrutura Geral',
            status: 'CONFORME',
            lat: state.telemetry.lat,
            lon: state.telemetry.lon,
            altitude: state.telemetry.altitude,
            accuracy: state.telemetry.accuracy,
            azimuth: state.telemetry.azimuth,
            utm: state.telemetry.utm,
            dataHora: now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR'),
            notas: '',
            stampStyle: state.stampStyle,
            annotations: []
        };

        let rawDataUrl;

        // Capturar do vídeo WebRTC
        if (video.videoWidth > 0) {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = video.videoWidth;
            tempCanvas.height = video.videoHeight;
            const tCtx = tempCanvas.getContext('2d');
            tCtx.drawImage(video, 0, 0);
            rawDataUrl = tempCanvas.toDataURL('image/jpeg', 0.95);
        } else {
            alert('Aguardando câmera...');
            return;
        }

        const rawImg = await loadImage(rawDataUrl);
        const stampedDataUrl = await stampImage(rawImg, meta);

        state.currentCapture = {
            rawImg: rawImg,
            stampedDataUrl: stampedDataUrl,
            meta: meta
        };

        openReviewModal();
    }

    // Processar foto vinda de input de arquivo (fallback)
    async function handleFilePhoto(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (e) => {
            const rawImg = await loadImage(e.target.result);
            const now = new Date();
            const meta = {
                obra: state.currentProject,
                empresa: state.empresa,
                fiscal: state.fiscalName,
                estaca: 'Km 84+200',
                elemento: state.activeTag || 'Geral',
                status: 'CONFORME',
                lat: state.telemetry.lat,
                lon: state.telemetry.lon,
                altitude: state.telemetry.altitude,
                accuracy: state.telemetry.accuracy,
                azimuth: state.telemetry.azimuth,
                utm: state.telemetry.utm,
                dataHora: now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR'),
                notas: '',
                stampStyle: state.stampStyle,
                annotations: []
            };

            const stampedDataUrl = await stampImage(rawImg, meta);
            state.currentCapture = {
                rawImg: rawImg,
                stampedDataUrl: stampedDataUrl,
                meta: meta
            };
            openReviewModal();
        };
        reader.readAsDataURL(file);
    }

    // Atualizar contador de anotações no modal de revisão
    function updateMarkupBadge() {
        const badge = document.getElementById('markupCountBadge');
        if (!badge) return;
        const count = (state.currentCapture?.meta?.annotations || []).length;
        if (count > 0) {
            badge.innerText = `${count} anotaç${count === 1 ? 'ão' : 'ões'}`;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    // Modal de Revisão
    function openReviewModal() {
        const c = state.currentCapture;
        if (!c) return;

        document.getElementById('reviewImgPreview').src = c.stampedDataUrl;
        document.getElementById('reviewEstaca').value = c.meta.estaca;
        document.getElementById('reviewElemento').value = c.meta.elemento;
        document.getElementById('reviewNotas').value = c.meta.notas || '';

        const radios = document.getElementsByName('reviewStatus');
        radios.forEach((r) => {
            r.checked = r.value === c.meta.status;
        });

        updateMarkupBadge();

        document.getElementById('modalReviewPhoto').classList.remove('hidden');
    }

    async function reapplyStamp() {
        const c = state.currentCapture;
        if (!c) return;

        c.meta.estaca = document.getElementById('reviewEstaca').value.trim();
        c.meta.elemento = document.getElementById('reviewElemento').value.trim();
        c.meta.notas = document.getElementById('reviewNotas').value.trim();

        const radios = document.getElementsByName('reviewStatus');
        for (const r of radios) {
            if (r.checked) {
                c.meta.status = r.value;
                break;
            }
        }

        const newStamped = await stampImage(c.rawImg, c.meta);
        c.stampedDataUrl = newStamped;
        document.getElementById('reviewImgPreview').src = newStamped;
    }

    // ============================================================
    // EDITOR DE ANOTAÇÕES TÉCNICAS (SETAS, CÍRCULOS, TEXTOS, BLUR)
    // ============================================================
    function getMarkupScale() {
        const canvas = document.getElementById('markupCanvas');
        if (!canvas) return 1;
        const rect = canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) {
            return Math.max(1, Math.min(canvas.width, canvas.height) / 380);
        }
        // Razão exata entre pixels do canvas interno e pixels visíveis no viewport da tela
        return Math.max(canvas.width / rect.width, canvas.height / rect.height);
    }

    function openMarkupEditor() {
        const c = state.currentCapture;
        if (!c || !c.rawImg) return;

        state.markup.baseImage = c.rawImg;
        state.markup.annotations = JSON.parse(JSON.stringify(c.meta.annotations || []));
        state.markup.tempAnnotation = null;
        state.markup.isDrawing = false;
        state.markup.isDraggingAnnotation = false;
        state.markup.dragStartPoint = null;
        state.markup.dragInitialAnnotation = null;
        state.markup.pendingTextPos = null;
        state.markup.pendingDimensionCoords = null;
        state.markup.currentPoints = [];

        // Se já houver anotações na imagem, abre no modo 'select' (Mover) para facilitar edição
        // Se a foto estiver limpa, inicia na ferramenta 'arrow' (Seta)
        state.markup.activeTool = state.markup.annotations.length > 0 ? 'select' : 'arrow';
        state.markup.selectedIndex = -1;

        const delBtn = document.getElementById('btnMarkupDeleteSelected');
        if (delBtn) delBtn.classList.add('hidden');

        const canvas = document.getElementById('markupCanvas');
        if (canvas) {
            canvas.width = c.rawImg.naturalWidth || c.rawImg.width;
            canvas.height = c.rawImg.naturalHeight || c.rawImg.height;
        }

        updateMarkupToolUi();
        updateMarkupColorUi();
        updateMarkupSizeUi();
        renderMarkupCanvas();

        document.getElementById('modalMarkupEditor').classList.remove('hidden');
    }

    function closeMarkupEditor() {
        state.markup.isDrawing = false;
        state.markup.isDraggingAnnotation = false;
        state.markup.tempAnnotation = null;
        state.markup.selectedIndex = -1;
        document.getElementById('modalMarkupEditor').classList.add('hidden');
    }

    async function applyMarkup() {
        const c = state.currentCapture;
        if (!c) return;

        c.meta.annotations = JSON.parse(JSON.stringify(state.markup.annotations));
        updateMarkupBadge();

        const stampedDataUrl = await stampImage(c.rawImg, c.meta);
        c.stampedDataUrl = stampedDataUrl;
        document.getElementById('reviewImgPreview').src = stampedDataUrl;

        document.getElementById('modalMarkupEditor').classList.add('hidden');
    }

    function undoMarkup() {
        if (state.markup.annotations.length > 0) {
            state.markup.annotations.pop();
            state.markup.selectedIndex = -1;
            document.getElementById('btnMarkupDeleteSelected')?.classList.add('hidden');
            renderMarkupCanvas();
        }
    }

    function clearMarkup() {
        if (state.markup.annotations.length > 0) {
            if (confirm('Deseja apagar todas as marcações desta foto?')) {
                state.markup.annotations = [];
                state.markup.selectedIndex = -1;
                document.getElementById('btnMarkupDeleteSelected')?.classList.add('hidden');
                renderMarkupCanvas();
            }
        }
    }

    function deleteSelectedMarkup() {
        if (state.markup.selectedIndex >= 0 && state.markup.selectedIndex < state.markup.annotations.length) {
            state.markup.annotations.splice(state.markup.selectedIndex, 1);
            state.markup.selectedIndex = -1;
            document.getElementById('btnMarkupDeleteSelected')?.classList.add('hidden');
            renderMarkupCanvas();
        }
    }

    function renderMarkupCanvas() {
        const canvas = document.getElementById('markupCanvas');
        if (!canvas || !state.markup.baseImage) return;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(state.markup.baseImage, 0, 0, canvas.width, canvas.height);

        const scale = getMarkupScale();

        // Desenhar anotações existentes
        state.markup.annotations.forEach(a => drawAnnotation(ctx, a, scale));

        // Desenhar anotação em criação (preview em tempo real)
        if (state.markup.tempAnnotation) {
            drawAnnotation(ctx, state.markup.tempAnnotation, scale);
        }

        // Desenhar destaque técnico (caixa de seleção) no item selecionado
        if (state.markup.selectedIndex >= 0 && state.markup.selectedIndex < state.markup.annotations.length) {
            drawSelectionBox(ctx, state.markup.annotations[state.markup.selectedIndex], scale);
        }
    }

    function getMarkupCanvasCoords(e) {
        const canvas = document.getElementById('markupCanvas');
        const rect = canvas.getBoundingClientRect();
        const scaleX = rect.width ? canvas.width / rect.width : 1;
        const scaleY = rect.height ? canvas.height / rect.height : 1;
        return {
            x: Math.round((e.clientX - rect.left) * scaleX),
            y: Math.round((e.clientY - rect.top) * scaleY)
        };
    }

    // Modal de Inserção de Texto
    function openTextInputModal(x, y) {
        state.markup.pendingTextPos = { x, y };
        const input = document.getElementById('textInputContent');
        if (input) {
            input.value = '';
            setTimeout(() => input.focus(), 150);
        }
        document.getElementById('modalTextInput')?.classList.remove('hidden');
    }

    function closeTextInputModal() {
        document.getElementById('modalTextInput')?.classList.add('hidden');
        state.markup.pendingTextPos = null;
        // Sempre retorna com segurança para o modo Mover
        state.markup.activeTool = 'select';
        updateMarkupToolUi();
    }

    function confirmTextInput(presetText) {
        const input = document.getElementById('textInputContent');
        const text = (presetText || (input ? input.value : '')).trim();
        if (text && state.markup.pendingTextPos) {
            state.markup.annotations.push({
                type: 'text',
                x: state.markup.pendingTextPos.x,
                y: state.markup.pendingTextPos.y,
                text: text,
                color: state.markup.color,
                lineWidth: state.markup.lineWidth
            });
            state.markup.selectedIndex = state.markup.annotations.length - 1;
            document.getElementById('btnMarkupDeleteSelected')?.classList.remove('hidden');
            renderMarkupCanvas();
        }
        closeTextInputModal();
    }

    // Modal de Inserção de Cota Técnica / Medição
    function openDimensionInputModal(x1, y1, x2, y2) {
        state.markup.pendingDimensionCoords = { x1, y1, x2, y2 };
        const input = document.getElementById('dimensionInputContent');
        if (input) {
            input.value = '';
            setTimeout(() => input.focus(), 150);
        }
        document.getElementById('modalDimensionInput')?.classList.remove('hidden');
    }

    function closeDimensionInputModal() {
        document.getElementById('modalDimensionInput')?.classList.add('hidden');
        state.markup.pendingDimensionCoords = null;
        state.markup.activeTool = 'select';
        updateMarkupToolUi();
        renderMarkupCanvas();
    }

    function confirmDimensionInput(presetText) {
        const input = document.getElementById('dimensionInputContent');
        const text = (presetText || (input ? input.value : '')).trim();
        if (text && state.markup.pendingDimensionCoords) {
            const coords = state.markup.pendingDimensionCoords;
            state.markup.annotations.push({
                type: 'dimension',
                x1: coords.x1,
                y1: coords.y1,
                x2: coords.x2,
                y2: coords.y2,
                text: text,
                color: state.markup.color,
                lineWidth: state.markup.lineWidth
            });
            state.markup.selectedIndex = state.markup.annotations.length - 1;
            document.getElementById('btnMarkupDeleteSelected')?.classList.remove('hidden');
            renderMarkupCanvas();
        }
        closeDimensionInputModal();
    }

    function onMarkupPointerDown(e) {
        const canvas = document.getElementById('markupCanvas');
        if (!canvas) return;
        const coords = getMarkupCanvasCoords(e);
        const scale = getMarkupScale();

        // 1. Se a ferramenta selecionada for TEXTO:
        if (state.markup.activeTool === 'text') {
            openTextInputModal(coords.x, coords.y);
            return;
        }

        // 2. Se houver um item selecionado, verificar se tocou em uma ALÇA DE REDIMENSIONAMENTO:
        if (state.markup.selectedIndex >= 0 && state.markup.selectedIndex < state.markup.annotations.length) {
            const selectedAnn = state.markup.annotations[state.markup.selectedIndex];
            const handle = getHandleAtPoint(coords.x, coords.y, selectedAnn, scale);
            if (handle) {
                state.markup.isResizing = true;
                state.markup.activeResizeHandle = handle;
                state.markup.resizeInitialAnnotation = JSON.parse(JSON.stringify(selectedAnn));
                state.markup.resizeInitialBounds = getAnnotationBounds(state.markup.resizeInitialAnnotation, scale);
                state.markup.dragStartPoint = { x: coords.x, y: coords.y };
                canvas.style.cursor = 'nwse-resize';
                try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
                renderMarkupCanvas();
                return;
            }
        }

        // 3. Se a ferramenta for MOVER (select):
        if (state.markup.activeTool === 'select') {
            let hitIndex = -1;
            for (let i = state.markup.annotations.length - 1; i >= 0; i--) {
                if (isPointInAnnotation(coords.x, coords.y, state.markup.annotations[i], scale)) {
                    hitIndex = i;
                    break;
                }
            }

            if (hitIndex >= 0) {
                state.markup.selectedIndex = hitIndex;
                state.markup.isDraggingAnnotation = true;
                state.markup.dragStartPoint = { x: coords.x, y: coords.y };
                state.markup.dragInitialAnnotation = JSON.parse(JSON.stringify(state.markup.annotations[hitIndex]));
                document.getElementById('btnMarkupDeleteSelected')?.classList.remove('hidden');
                canvas.style.cursor = 'grabbing';
                try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
                renderMarkupCanvas();
                return;
            } else {
                // Toque fora de qualquer anotação: desmarca
                state.markup.selectedIndex = -1;
                state.markup.isDraggingAnnotation = false;
                state.markup.isResizing = false;
                document.getElementById('btnMarkupDeleteSelected')?.classList.add('hidden');
                canvas.style.cursor = 'default';
                renderMarkupCanvas();
                return;
            }
        }

        // 4. Ferramentas de Desenho (arrow, pen, blur, circle, rect)
        state.markup.selectedIndex = -1;
        state.markup.isResizing = false;
        document.getElementById('btnMarkupDeleteSelected')?.classList.add('hidden');
        state.markup.isDrawing = true;
        state.markup.startX = coords.x;
        state.markup.startY = coords.y;
        if (state.markup.activeTool === 'pen') {
            state.markup.currentPoints = [{ x: coords.x, y: coords.y }];
        }
        state.markup.tempAnnotation = null;

        try {
            canvas.setPointerCapture(e.pointerId);
        } catch (err) {}
    }

    function onMarkupPointerMove(e) {
        const canvas = document.getElementById('markupCanvas');
        if (!canvas) return;
        const coords = getMarkupCanvasCoords(e);
        const col = state.markup.color;
        const lw = state.markup.lineWidth;
        const scale = getMarkupScale();

        // 1. Redimensionando pelas alças (Aumentar / Diminuir)
        if (state.markup.isResizing && state.markup.selectedIndex >= 0) {
            resizeAnnotation(
                state.markup.annotations[state.markup.selectedIndex],
                state.markup.resizeInitialAnnotation,
                state.markup.activeResizeHandle,
                coords,
                state.markup.resizeInitialBounds,
                scale
            );
            renderMarkupCanvas();
            return;
        }

        // 2. Arrastando anotação para deslocar em tempo real (Mover)
        if (state.markup.isDraggingAnnotation && state.markup.selectedIndex >= 0) {
            const dx = coords.x - state.markup.dragStartPoint.x;
            const dy = coords.y - state.markup.dragStartPoint.y;
            const moved = JSON.parse(JSON.stringify(state.markup.dragInitialAnnotation));
            moveAnnotation(moved, dx, dy);
            state.markup.annotations[state.markup.selectedIndex] = moved;
            renderMarkupCanvas();
            return;
        }

        // 3. Desenhando nova anotação
        if (!state.markup.isDrawing) return;
        const tool = state.markup.activeTool;
        const sx = state.markup.startX;
        const sy = state.markup.startY;

        if (tool === 'arrow' || tool === 'dimension') {
            const dist = Math.hypot(coords.x - sx, coords.y - sy);
            if (dist >= 4) {
                state.markup.tempAnnotation = {
                    type: tool,
                    x1: sx,
                    y1: sy,
                    x2: coords.x,
                    y2: coords.y,
                    text: '',
                    color: col,
                    lineWidth: lw
                };
            }
        } else if (tool === 'circle') {
            const cx = (sx + coords.x) / 2;
            const cy = (sy + coords.y) / 2;
            const rx = Math.abs(coords.x - sx) / 2;
            const ry = Math.abs(coords.y - sy) / 2;
            if (rx >= 3 || ry >= 3) {
                state.markup.tempAnnotation = {
                    type: 'circle',
                    cx: Math.round(cx),
                    cy: Math.round(cy),
                    rx: Math.round(rx),
                    ry: Math.round(ry),
                    color: col,
                    lineWidth: lw
                };
            }
        } else if (tool === 'rect' || tool === 'blur') {
            const rx = Math.min(sx, coords.x);
            const ry = Math.min(sy, coords.y);
            const rw = Math.abs(coords.x - sx);
            const rh = Math.abs(coords.y - sy);
            if (rw >= 3 || rh >= 3) {
                state.markup.tempAnnotation = {
                    type: tool,
                    x: Math.round(rx),
                    y: Math.round(ry),
                    w: Math.round(rw),
                    h: Math.round(rh),
                    color: col,
                    lineWidth: lw
                };
            }
        } else if (tool === 'pen') {
            state.markup.currentPoints.push({ x: coords.x, y: coords.y });
            state.markup.tempAnnotation = {
                type: 'pen',
                points: [...state.markup.currentPoints],
                color: col,
                lineWidth: lw
            };
        }

        renderMarkupCanvas();
    }

    function onMarkupPointerUp(e) {
        const canvas = document.getElementById('markupCanvas');
        if (canvas) {
            try {
                canvas.releasePointerCapture(e.pointerId);
            } catch (err) {}
            canvas.style.cursor = state.markup.activeTool === 'select' ? 'default' : 'crosshair';
        }

        const coords = getMarkupCanvasCoords(e);

        // Se estava redimensionando pelas alças:
        if (state.markup.isResizing) {
            state.markup.isResizing = false;
            state.markup.activeResizeHandle = null;
            renderMarkupCanvas();
            return;
        }

        // Se estava arrastando para deslocar:
        if (state.markup.isDraggingAnnotation) {
            state.markup.isDraggingAnnotation = false;
            renderMarkupCanvas();
            return;
        }

        // Se estava desenhando:
        if (state.markup.isDrawing) {
            state.markup.isDrawing = false;
            const tool = state.markup.activeTool;
            if (tool === 'dimension') {
                let x1, y1, x2, y2;
                if (state.markup.tempAnnotation && state.markup.tempAnnotation.type === 'dimension') {
                    x1 = state.markup.tempAnnotation.x1;
                    y1 = state.markup.tempAnnotation.y1;
                    x2 = state.markup.tempAnnotation.x2;
                    y2 = state.markup.tempAnnotation.y2;
                    // Se o usuário arrastou muito pouco (< 35px), expande para cota nítida e visível de pelo menos 140px
                    const dist = Math.hypot(x2 - x1, y2 - y1);
                    if (dist < 35) {
                        const midX = (x1 + x2) / 2;
                        const midY = (y1 + y2) / 2;
                        x1 = Math.round(midX - 70);
                        y1 = Math.round(midY);
                        x2 = Math.round(midX + 70);
                        y2 = Math.round(midY);
                    }
                } else {
                    // Tap sem arrasto: gera cota horizontal padrão de 140px centrada no toque
                    const cx = coords ? coords.x : state.markup.startX;
                    const cy = coords ? coords.y : state.markup.startY;
                    x1 = Math.round(cx - 70);
                    y1 = Math.round(cy);
                    x2 = Math.round(cx + 70);
                    y2 = Math.round(cy);
                }
                state.markup.tempAnnotation = null;
                state.markup.currentPoints = [];
                renderMarkupCanvas();
                openDimensionInputModal(x1, y1, x2, y2);
                return;
            }

            if (state.markup.tempAnnotation) {
                state.markup.annotations.push(state.markup.tempAnnotation);
                state.markup.tempAnnotation = null;
                // Seleciona automaticamente o item recém-desenhado e alterna para modo Mover
                state.markup.selectedIndex = state.markup.annotations.length - 1;
                state.markup.activeTool = 'select';
                updateMarkupToolUi();
                document.getElementById('btnMarkupDeleteSelected')?.classList.remove('hidden');
            }
            state.markup.currentPoints = [];
            renderMarkupCanvas();
        }
    }

    function updateMarkupToolUi() {
        document.querySelectorAll('.markup-tool-btn').forEach(btn => {
            const tool = btn.dataset.tool;
            if (tool === state.markup.activeTool) {
                if (tool === 'select') {
                    btn.className = 'markup-tool-btn shrink-0 px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border border-cyan-500/50 bg-cyan-500/25 text-cyan-300 shadow-md transition-all cursor-pointer';
                } else {
                    btn.className = 'markup-tool-btn shrink-0 px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border border-amber-500/50 bg-amber-500/25 text-amber-300 shadow-md transition-all cursor-pointer';
                }
            } else {
                btn.className = 'markup-tool-btn shrink-0 px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 transition-all cursor-pointer';
            }
        });

        const canvas = document.getElementById('markupCanvas');
        if (canvas) {
            canvas.style.cursor = state.markup.activeTool === 'select' ? 'default' : 'crosshair';
        }
    }

    function updateMarkupColorUi() {
        document.querySelectorAll('.markup-color-btn').forEach(btn => {
            const col = btn.dataset.color || '#EF4444';
            btn.style.backgroundColor = col;
            const active = (state.markup.color && state.markup.color.toLowerCase() === col.toLowerCase());
            if (active) {
                btn.className = 'markup-color-btn relative w-6 h-6 rounded-full ring-2 ring-white ring-offset-2 ring-offset-slate-900 shadow-lg scale-110 transition-all cursor-pointer flex items-center justify-center';
                btn.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-white shadow-sm pointer-events-none"></span>';
            } else {
                btn.className = 'markup-color-btn relative w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-white/30 hover:scale-105 transition-all cursor-pointer opacity-85 flex items-center justify-center';
                btn.innerHTML = '';
            }
        });
    }

    function updateMarkupSizeUi() {
        document.querySelectorAll('.markup-size-btn').forEach(btn => {
            const sz = parseInt(btn.dataset.size, 10);
            if (sz === state.markup.lineWidth) {
                btn.className = 'markup-size-btn px-2 py-1 rounded-lg text-[11px] text-amber-300 font-bold border border-amber-500/50 bg-amber-500/25 cursor-pointer';
            } else {
                btn.className = 'markup-size-btn px-2 py-1 rounded-lg text-[11px] text-slate-300 font-semibold border border-transparent hover:text-white cursor-pointer';
            }
        });
    }

    // Salvar Registro na IndexedDB
    async function saveCurrentToDb() {
        const c = state.currentCapture;
        if (!c || !state.db) return;

        // Criar miniatura de 300px para listagem rápida
        const thumbCanvas = document.createElement('canvas');
        const aspect = c.rawImg.width / c.rawImg.height;
        thumbCanvas.width = 300;
        thumbCanvas.height = Math.round(300 / aspect);
        const tCtx = thumbCanvas.getContext('2d');
        tCtx.drawImage(renderCanvas, 0, 0, thumbCanvas.width, thumbCanvas.height);
        const thumbDataUrl = thumbCanvas.toDataURL('image/jpeg', 0.8);

        const record = {
            createdAt: Date.now(),
            obra: c.meta.obra,
            estaca: c.meta.estaca,
            elemento: c.meta.elemento,
            status: c.meta.status,
            notas: c.meta.notas,
            telemetry: {
                lat: c.meta.lat,
                lon: c.meta.lon,
                utm: c.meta.utm,
                azimuth: c.meta.azimuth,
                altitude: c.meta.altitude,
                accuracy: c.meta.accuracy
            },
            dataHora: c.meta.dataHora,
            fullImg: c.stampedDataUrl,
            thumbImg: thumbDataUrl,
            annotations: c.meta.annotations || []
        };

        const tx = state.db.transaction('photos', 'readwrite');
        const store = tx.objectStore('photos');
        store.add(record);

        tx.oncomplete = () => {
            updateGalleryBadge();
            document.getElementById('modalReviewPhoto').classList.add('hidden');
            state.currentCapture = null;
        };
    }

    function downloadCurrentPhoto() {
        const c = state.currentCapture;
        if (!c) return;
        const link = document.createElement('a');
        const sanitizedObra = c.meta.obra.replace(/[^a-zA-Z0-9]/g, '_');
        const sanitizedElem = c.meta.elemento.replace(/[^a-zA-Z0-9]/g, '_');
        link.download = `FotoLaudo_${sanitizedObra}_${sanitizedElem}_${Date.now()}.jpg`;
        link.href = c.stampedDataUrl;
        link.click();
    }

    async function shareCurrentPhoto() {
        const c = state.currentCapture;
        if (!c) return;
        try {
            const res = await fetch(c.stampedDataUrl);
            const blob = await res.blob();
            const file = new File([blob], `FotoLaudo_${Date.now()}.jpg`, { type: 'image/jpeg' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: `${c.meta.obra} - ${c.meta.elemento}`,
                    text: `Registro Técnico: ${c.meta.obra} | ${c.meta.estaca} (${c.meta.dataHora})`
                });
            } else {
                downloadCurrentPhoto();
            }
        } catch (e) {
            downloadCurrentPhoto();
        }
    }

    // ============================================================
    // GALERIA DE FOTOS
    // ============================================================
    async function updateGalleryBadge() {
        if (!state.db) return;
        const tx = state.db.transaction('photos', 'readonly');
        const store = tx.objectStore('photos');
        const countReq = store.count();
        countReq.onsuccess = () => {
            const count = countReq.result || 0;
            if (galleryCountBadge) galleryCountBadge.innerText = count;
            const counterText = document.getElementById('galleryCounterText');
            if (counterText) counterText.innerText = `(${count} registros)`;
        };
    }

    async function openGalleryModal() {
        if (!state.db) return;
        const tx = state.db.transaction('photos', 'readonly');
        const store = tx.objectStore('photos');
        const req = store.getAll();

        req.onsuccess = () => {
            const photos = req.result || [];
            photos.sort((a, b) => b.createdAt - a.createdAt);

            const grid = document.getElementById('galleryGrid');
            const empty = document.getElementById('galleryEmptyState');

            grid.innerHTML = '';
            state.selectedGalleryIds.clear();
            updateSelectedCount();

            if (photos.length === 0) {
                empty.classList.remove('hidden');
                grid.classList.add('hidden');
            } else {
                empty.classList.add('hidden');
                grid.classList.remove('hidden');

                photos.forEach((p) => {
                    const card = document.createElement('div');
                    card.className = 'group relative rounded-xl overflow-hidden border border-white/10 bg-slate-900/60 p-1 cursor-pointer transition-all hover:border-amber-400';
                    card.innerHTML = `
                        <div class="aspect-video w-full overflow-hidden rounded-lg bg-black relative">
                            <img src="${p.thumbImg}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy">
                            <input type="checkbox" data-id="${p.id}" class="photo-checkbox absolute top-2 left-2 w-5 h-5 rounded accent-amber-400 cursor-pointer">
                            <span class="absolute bottom-1 right-1 text-[9px] font-bold px-1.5 py-0.5 rounded ${p.status === 'CONFORME' ? 'bg-emerald-500/80 text-white' : (p.status === 'OBSERVACAO' ? 'bg-amber-500/80 text-black' : 'bg-red-500/80 text-white')}">${p.status}</span>
                        </div>
                        <div class="p-1.5 text-[11px] truncate font-medium text-slate-200">${escapeHtml(p.elemento)}</div>
                        <div class="px-1.5 pb-1 text-[10px] text-slate-400 flex items-center justify-between">
                            <span>${escapeHtml(p.estaca)}</span>
                            <button data-delete-id="${p.id}" class="text-red-400 hover:text-red-300 p-0.5" title="Excluir">✕</button>
                        </div>
                    `;

                    // Checkbox para seleção
                    const chk = card.querySelector('.photo-checkbox');
                    chk.addEventListener('change', (e) => {
                        e.stopPropagation();
                        if (chk.checked) state.selectedGalleryIds.add(p.id);
                        else state.selectedGalleryIds.delete(p.id);
                        updateSelectedCount();
                    });

                    // Botão de deletar
                    const btnDel = card.querySelector('[data-delete-id]');
                    btnDel.addEventListener('click', async (e) => {
                        e.stopPropagation();
                        if (confirm(`Excluir registro "${p.elemento}"?`)) {
                            await deletePhoto(p.id);
                            openGalleryModal();
                        }
                    });

                    // Clique na foto para abrir em alta resolução
                    card.addEventListener('click', () => {
                        const win = window.open('');
                        win.document.write(`<title>${p.elemento} - ${p.obra}</title><body style="margin:0;background:#05080f;display:flex;align-items:center;justify-content:center;height:100vh;"><img src="${p.fullImg}" style="max-width:98%;max-height:98%;border-radius:12px;box-shadow:0 0 40px rgba(0,0,0,0.8);"></body>`);
                    });

                    grid.appendChild(card);
                });
            }

            document.getElementById('modalGallery').classList.remove('hidden');
        };
    }

    function deletePhoto(id) {
        return new Promise((resolve) => {
            const tx = state.db.transaction('photos', 'readwrite');
            const store = tx.objectStore('photos');
            store.delete(id);
            tx.oncomplete = () => {
                updateGalleryBadge();
                resolve();
            };
        });
    }

    function updateSelectedCount() {
        const el = document.getElementById('selectedPhotosCount');
        if (el) el.innerText = state.selectedGalleryIds.size;
    }

    // ============================================================
    // GERADOR DE RELATÓRIO FOTOGRÁFICO EM PDF (jsPDF)
    // ============================================================
    async function generatePdfReport() {
        if (!window.jspdf) {
            alert('Biblioteca de PDF carregando. Tente novamente em instantes.');
            return;
        }
        const { jsPDF } = window.jspdf;

        // Buscar fotos selecionadas ou todas
        const tx = state.db.transaction('photos', 'readonly');
        const store = tx.objectStore('photos');
        const allReq = store.getAll();

        allReq.onsuccess = async () => {
            let photos = allReq.result || [];
            if (state.selectedGalleryIds.size > 0) {
                photos = photos.filter((p) => state.selectedGalleryIds.has(p.id));
            }

            if (photos.length === 0) {
                alert('Nenhuma foto selecionada para gerar o relatório.');
                return;
            }

            photos.sort((a, b) => a.createdAt - b.createdAt);

            const title = document.getElementById('pdfReportTitle').value.trim() || 'Relatório Fotográfico de Fiscalização';
            const obra = document.getElementById('pdfReportObra').value.trim() || state.currentProject;
            const fiscal = document.getElementById('pdfReportFiscal').value.trim() || state.fiscalName;
            const crea = document.getElementById('pdfReportCrea').value.trim() || 'CREA Não Informado';
            const obsGeral = document.getElementById('pdfReportObs').value.trim();
            const perPage = parseInt(document.getElementById('pdfPhotosPerPage').value, 10) || 2;

            const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pageW = 210;
            const pageH = 297;
            const margin = 15;
            const contentW = pageW - margin * 2;

            // Função de Cabeçalho Padrão de Engenharia
            function drawHeader(pageNum, totalPages) {
                doc.setDrawColor(200, 200, 200);
                doc.setLineWidth(0.4);
                doc.rect(margin, margin, contentW, 25);

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(13);
                doc.setTextColor(20, 30, 50);
                doc.text(title.toUpperCase(), margin + 5, margin + 8);

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9);
                doc.setTextColor(80, 90, 100);
                doc.text(`OBRA: ${obra} | FISCAL: ${fiscal} (${crea})`, margin + 5, margin + 16);
                doc.text(`DATA DE EMISSÃO: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, margin + 5, margin + 22);

                doc.setFont('helvetica', 'italic');
                doc.setFontSize(8);
                doc.text(`Página ${pageNum}`, pageW - margin - 20, margin + 22);
            }

            // Função de Rodapé com Assinatura
            function drawFooter() {
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.setTextColor(100, 100, 100);
                doc.text('Relatório emitido via FotoLaudo — 4U.IA.BR Tecnologia para Engenharia', margin, pageH - margin + 5);
            }

            // Calcular Páginas
            const totalPages = Math.ceil(photos.length / perPage);

            for (let i = 0; i < photos.length; i += perPage) {
                const pageIndex = Math.floor(i / perPage) + 1;
                if (pageIndex > 1) doc.addPage();

                drawHeader(pageIndex, totalPages);

                const chunk = photos.slice(i, i + perPage);

                if (perPage === 2) {
                    // LAYOUT: 2 FOTOS POR PÁGINA
                    const slotHeight = 110;
                    chunk.forEach((p, idx) => {
                        const topY = margin + 30 + idx * (slotHeight + 10);

                        // Moldura da Foto
                        doc.setDrawColor(220, 225, 230);
                        doc.setLineWidth(0.3);
                        doc.rect(margin, topY, contentW, slotHeight);

                        // Imagem
                        const imgW = 95;
                        const imgH = 70;
                        doc.addImage(p.thumbImg, 'JPEG', margin + 4, topY + 4, imgW, imgH);

                        // Tabela de Dados ao Lado
                        const textX = margin + imgW + 10;
                        let textY = topY + 12;

                        doc.setFont('helvetica', 'bold');
                        doc.setFontSize(11);
                        doc.setTextColor(20, 30, 60);
                        doc.text(`REGISTRO FOTOGRÁFICO #${i + idx + 1}`, textX, textY);

                        textY += 8;
                        doc.setFont('helvetica', 'bold');
                        doc.setFontSize(9);
                        doc.setTextColor(60, 60, 60);
                        doc.text('Elemento:', textX, textY);
                        doc.setFont('helvetica', 'normal');
                        doc.text(p.elemento, textX + 20, textY);

                        textY += 6;
                        doc.setFont('helvetica', 'bold');
                        doc.text('Local/Estaca:', textX, textY);
                        doc.setFont('helvetica', 'normal');
                        doc.text(p.estaca, textX + 24, textY);

                        textY += 6;
                        doc.setFont('helvetica', 'bold');
                        doc.text('Status:', textX, textY);
                        doc.setFont('helvetica', 'bold');
                        if (p.status === 'CONFORME') doc.setTextColor(16, 185, 129);
                        else if (p.status === 'OBSERVACAO') doc.setTextColor(245, 158, 11);
                        else doc.setTextColor(239, 68, 68);
                        doc.text(p.status, textX + 16, textY);

                        textY += 8;
                        doc.setFont('helvetica', 'bold');
                        doc.setTextColor(60, 60, 60);
                        doc.text('Telemetria de Campo:', textX, textY);
                        textY += 5;
                        doc.setFont('courier', 'normal');
                        doc.setFontSize(8);
                        doc.setTextColor(40, 40, 40);
                        const utmStr = p.telemetry.utm ? `UTM: ${p.telemetry.utm.zone} E:${p.telemetry.utm.easting} N:${p.telemetry.utm.northing}` : '';
                        doc.text(utmStr, textX, textY);
                        textY += 4.5;
                        doc.text(`GPS: ${p.telemetry.lat?.toFixed(5) || '--'}, ${p.telemetry.lon?.toFixed(5) || '--'} (Alt: ${p.telemetry.altitude || '--'}m)`, textX, textY);
                        textY += 4.5;
                        doc.text(`Azimute: ${p.telemetry.azimuth || '--'}° | ${p.dataHora}`, textX, textY);

                        if (p.notas) {
                            textY += 7;
                            doc.setFont('helvetica', 'italic');
                            doc.setFontSize(8);
                            doc.setTextColor(80, 80, 80);
                            const splitNotas = doc.splitTextToSize(`Obs: ${p.notas}`, contentW - imgW - 16);
                            doc.text(splitNotas, textX, textY);
                        }
                    });

                } else {
                    // LAYOUT: 4 FOTOS POR PÁGINA
                    const boxW = (contentW - 6) / 2;
                    const boxH = 115;

                    chunk.forEach((p, idx) => {
                        const col = idx % 2;
                        const row = Math.floor(idx / 2);
                        const posX = margin + col * (boxW + 6);
                        const posY = margin + 30 + row * (boxH + 6);

                        doc.setDrawColor(220, 225, 230);
                        doc.setLineWidth(0.3);
                        doc.rect(posX, posY, boxW, boxH);

                        doc.addImage(p.thumbImg, 'JPEG', posX + 3, posY + 3, boxW - 6, 60);

                        let textY = posY + 68;
                        doc.setFont('helvetica', 'bold');
                        doc.setFontSize(9);
                        doc.setTextColor(20, 30, 60);
                        doc.text(`Foto #${i + idx + 1}: ${p.elemento}`, posX + 4, textY);

                        textY += 5;
                        doc.setFont('helvetica', 'normal');
                        doc.setFontSize(8);
                        doc.setTextColor(70, 70, 70);
                        doc.text(`Local: ${p.estaca} | ${p.dataHora}`, posX + 4, textY);

                        textY += 4.5;
                        doc.setFont('courier', 'normal');
                        doc.setFontSize(7);
                        const utmStr = p.telemetry.utm ? `UTM: ${p.telemetry.utm.zone} ${p.telemetry.utm.easting}E ${p.telemetry.utm.northing}N` : '';
                        doc.text(utmStr, posX + 4, textY);
                    });
                }

                drawFooter();
            }

            // Baixar o arquivo PDF
            const safeName = obra.replace(/[^a-zA-Z0-9]/g, '_');
            doc.save(`Laudo_Fotografico_${safeName}_${Date.now()}.pdf`);

            document.getElementById('modalPdfGenerator').classList.add('hidden');
        };
    }

    // ============================================================
    // UI: CHIPS, MODAIS & EVENT HANDLERS
    // ============================================================
    function renderQuickChips() {
        if (!quickChipsContainer) return;
        quickChipsContainer.innerHTML = '';

        state.quickTags.forEach((tag, idx) => {
            const btn = document.createElement('button');
            btn.className = `quick-chip ${tag === state.activeTag ? 'active' : ''}`;
            btn.innerText = tag;
            btn.addEventListener('click', () => {
                state.activeTag = tag;
                const hudElem = document.getElementById('hudElemento');
                if (hudElem) hudElem.innerText = tag;
                renderQuickChips();
            });
            quickChipsContainer.appendChild(btn);
        });
    }

    function updateProjectBadge() {
        const badge = document.getElementById('currentProjectBadge');
        if (badge) badge.innerText = state.currentProject;
        const hudTitle = document.getElementById('hudProjectTitle');
        if (hudTitle) hudTitle.innerText = state.currentProject;
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function bindEvents() {
        // Disparador da Câmera
        document.getElementById('btnShutter')?.addEventListener('click', takePhoto);

        // Disparo por Tecla (Espaço / Enter) para Teclado e Controles Remotos Bluetooth
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.key === ' ' || e.code === 'Enter') {
                const activeTag = document.activeElement?.tagName;
                if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT') return;
                const reviewHidden = document.getElementById('modalReviewPhoto')?.classList.contains('hidden');
                const markupHidden = document.getElementById('modalMarkupEditor')?.classList.contains('hidden');
                const galleryHidden = document.getElementById('modalGallery')?.classList.contains('hidden');
                const pdfHidden = document.getElementById('modalPdfGenerator')?.classList.contains('hidden');
                const settingsHidden = document.getElementById('modalSettings')?.classList.contains('hidden');
                if (reviewHidden && markupHidden && galleryHidden && pdfHidden && settingsHidden) {
                    e.preventDefault();
                    takePhoto();
                }
            }
        });

        // Fallback File Input
        fallbackInput?.addEventListener('change', (e) => {
            handleFilePhoto(e.target.files?.[0]);
        });
        document.getElementById('btnRetryCamera')?.addEventListener('click', startCamera);

        // Toggles da Barra Superior
        document.getElementById('btnTorch')?.addEventListener('click', toggleTorch);
        document.getElementById('btnToggleGrid')?.addEventListener('click', () => {
            state.gridVisible = !state.gridVisible;
            hudGrid.classList.toggle('hidden', !state.gridVisible);
        });
        document.getElementById('btnToggleLevel')?.addEventListener('click', () => {
            state.levelVisible = !state.levelVisible;
            hudLevel.classList.toggle('hidden', !state.levelVisible);
        });
        document.getElementById('btnFlipCamera')?.addEventListener('click', () => {
            state.facingMode = state.facingMode === 'environment' ? 'user' : 'environment';
            startCamera();
        });

        // Modal de Revisão
        document.getElementById('btnCloseReview')?.addEventListener('click', () => {
            document.getElementById('modalReviewPhoto').classList.add('hidden');
        });
        document.getElementById('btnOpenMarkupModal')?.addEventListener('click', openMarkupEditor);
        document.getElementById('btnReapplyStamp')?.addEventListener('click', reapplyStamp);
        document.getElementById('btnSaveToGallery')?.addEventListener('click', saveCurrentToDb);
        document.getElementById('btnDownloadPhoto')?.addEventListener('click', downloadCurrentPhoto);
        document.getElementById('btnSharePhoto')?.addEventListener('click', shareCurrentPhoto);

        // Modal de Editor de Anotações Técnicas (Markup)
        document.getElementById('btnMarkupDeleteSelected')?.addEventListener('click', deleteSelectedMarkup);
        document.getElementById('btnMarkupUndo')?.addEventListener('click', undoMarkup);
        document.getElementById('btnMarkupClear')?.addEventListener('click', clearMarkup);
        document.getElementById('btnMarkupApply')?.addEventListener('click', applyMarkup);
        document.getElementById('btnMarkupCancel')?.addEventListener('click', closeMarkupEditor);

        // Modal de Inserção de Texto Técnico
        document.getElementById('btnCancelTextInput')?.addEventListener('click', closeTextInputModal);
        document.getElementById('btnDismissTextInput')?.addEventListener('click', closeTextInputModal);
        document.getElementById('btnConfirmTextInput')?.addEventListener('click', () => confirmTextInput());
        document.getElementById('textInputContent')?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                confirmTextInput();
            }
        });
        document.querySelectorAll('#modalTextInput .text-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                confirmTextInput(chip.textContent.trim());
            });
        });

        // Modal de Inserção de Cota Técnica / Medição
        document.getElementById('btnCancelDimensionInput')?.addEventListener('click', closeDimensionInputModal);
        document.getElementById('btnDismissDimensionInput')?.addEventListener('click', closeDimensionInputModal);
        document.getElementById('btnConfirmDimensionInput')?.addEventListener('click', () => confirmDimensionInput());
        document.getElementById('dimensionInputContent')?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                confirmDimensionInput();
            }
        });
        document.querySelectorAll('#modalDimensionInput .dim-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                confirmDimensionInput(chip.textContent.trim());
            });
        });

        document.querySelectorAll('.markup-tool-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                state.markup.activeTool = btn.dataset.tool;
                if (state.markup.activeTool !== 'select') {
                    state.markup.selectedIndex = -1;
                    document.getElementById('btnMarkupDeleteSelected')?.classList.add('hidden');
                    renderMarkupCanvas();
                }
                updateMarkupToolUi();
            });
        });

        document.querySelectorAll('.markup-color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                state.markup.color = btn.dataset.color;
                if (state.markup.selectedIndex >= 0 && state.markup.selectedIndex < state.markup.annotations.length) {
                    state.markup.annotations[state.markup.selectedIndex].color = state.markup.color;
                    renderMarkupCanvas();
                }
                updateMarkupColorUi();
            });
        });

        document.querySelectorAll('.markup-size-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                state.markup.lineWidth = parseInt(btn.dataset.size, 10);
                if (state.markup.selectedIndex >= 0 && state.markup.selectedIndex < state.markup.annotations.length) {
                    state.markup.annotations[state.markup.selectedIndex].lineWidth = state.markup.lineWidth;
                    renderMarkupCanvas();
                }
                updateMarkupSizeUi();
            });
        });

        const mCanvas = document.getElementById('markupCanvas');
        if (mCanvas) {
            mCanvas.addEventListener('pointerdown', onMarkupPointerDown);
            mCanvas.addEventListener('pointermove', onMarkupPointerMove);
            mCanvas.addEventListener('pointerup', onMarkupPointerUp);
            mCanvas.addEventListener('pointercancel', onMarkupPointerUp);
        }

        // Suporte a arrasto horizontal com mouse (desktop & tablets)
        function makeHorizontalScrollable(el) {
            if (!el) return;
            let isDown = false;
            let startX = 0;
            let scrollLeft = 0;

            el.addEventListener('mousedown', (e) => {
                isDown = true;
                startX = e.pageX - el.offsetLeft;
                scrollLeft = el.scrollLeft;
            });
            el.addEventListener('mouseleave', () => { isDown = false; });
            el.addEventListener('mouseup', () => { isDown = false; });
            el.addEventListener('mousemove', (e) => {
                if (!isDown) return;
                e.preventDefault();
                const x = e.pageX - el.offsetLeft;
                const walk = (x - startX) * 1.5;
                el.scrollLeft = scrollLeft - walk;
            });
        }
        makeHorizontalScrollable(document.getElementById('topToolsBar'));
        makeHorizontalScrollable(document.getElementById('quickChipsContainer'));
        makeHorizontalScrollable(document.getElementById('markupToolsBar'));

        // Modal de Galeria
        document.getElementById('btnOpenGallery')?.addEventListener('click', openGalleryModal);
        document.getElementById('btnCloseGallery')?.addEventListener('click', () => {
            document.getElementById('modalGallery').classList.add('hidden');
        });
        document.getElementById('btnSelectAllGallery')?.addEventListener('click', () => {
            const boxes = document.querySelectorAll('.photo-checkbox');
            const allChecked = Array.from(boxes).every((b) => b.checked);
            boxes.forEach((b) => {
                b.checked = !allChecked;
                const id = parseInt(b.dataset.id, 10);
                if (!allChecked) state.selectedGalleryIds.add(id);
                else state.selectedGalleryIds.delete(id);
            });
            updateSelectedCount();
        });
        document.getElementById('btnDeleteSelected')?.addEventListener('click', async () => {
            if (state.selectedGalleryIds.size === 0) return;
            if (confirm(`Excluir as ${state.selectedGalleryIds.size} fotos selecionadas?`)) {
                for (const id of state.selectedGalleryIds) {
                    await deletePhoto(id);
                }
                openGalleryModal();
            }
        });
        document.getElementById('btnExportSelectedToPdf')?.addEventListener('click', () => {
            document.getElementById('modalGallery').classList.add('hidden');
            document.getElementById('modalPdfGenerator').classList.remove('hidden');
        });

        // Modal de PDF
        document.getElementById('btnOpenPdfModal')?.addEventListener('click', () => {
            document.getElementById('pdfReportObra').value = state.currentProject;
            document.getElementById('pdfReportFiscal').value = state.fiscalName;
            document.getElementById('modalPdfGenerator').classList.remove('hidden');
        });
        document.getElementById('btnClosePdfModal')?.addEventListener('click', () => {
            document.getElementById('modalPdfGenerator').classList.add('hidden');
        });
        document.getElementById('btnCancelPdf')?.addEventListener('click', () => {
            document.getElementById('modalPdfGenerator').classList.add('hidden');
        });
        document.getElementById('btnGeneratePdfAction')?.addEventListener('click', generatePdfReport);

        // Modal de Configurações
        const openCfg = () => {
            document.getElementById('cfgObraName').value = state.currentProject;
            document.getElementById('cfgEmpresa').value = state.empresa;
            document.getElementById('cfgFiscalName').value = state.fiscalName;
            document.getElementById('cfgStampStyle').value = state.stampStyle;
            document.getElementById('cfgQuickTags').value = state.quickTags.join(', ');
            updateLogoPreview();
            document.getElementById('modalSettings').classList.remove('hidden');
        };
        document.getElementById('btnOpenSettings')?.addEventListener('click', openCfg);
        document.getElementById('btnProjectSelector')?.addEventListener('click', openCfg);
        document.getElementById('btnCloseSettings')?.addEventListener('click', () => {
            document.getElementById('modalSettings').classList.add('hidden');
        });

        // Logo Upload no Settings
        document.getElementById('cfgLogoFile')?.addEventListener('change', (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const r = new FileReader();
            r.onload = (ev) => {
                state.customLogoUrl = ev.target.result;
                updateLogoPreview();
            };
            r.readAsDataURL(file);
        });
        document.getElementById('cfgRemoveLogoBtn')?.addEventListener('click', () => {
            state.customLogoUrl = null;
            updateLogoPreview();
        });

        function updateLogoPreview() {
            const box = document.getElementById('cfgLogoPreviewBox');
            if (state.customLogoUrl) {
                box.innerHTML = `<img src="${state.customLogoUrl}" class="max-h-full max-w-full object-contain">`;
            } else {
                box.innerHTML = `<span class="text-slate-500 text-xs">Sem logo</span>`;
            }
        }

        document.getElementById('btnSaveSettings')?.addEventListener('click', () => {
            state.currentProject = document.getElementById('cfgObraName').value.trim() || 'Obra Sem Título';
            state.empresa = document.getElementById('cfgEmpresa').value.trim() || '';
            state.fiscalName = document.getElementById('cfgFiscalName').value.trim() || '';
            state.stampStyle = document.getElementById('cfgStampStyle').value;
            const tagsStr = document.getElementById('cfgQuickTags').value;
            state.quickTags = tagsStr.split(',').map((t) => t.trim()).filter(Boolean);

            saveSettingsToDisk();
            updateProjectBadge();
            renderQuickChips();
            document.getElementById('modalSettings').classList.add('hidden');
        });
    }

    // Inicialização Geral do App
    async function boot() {
        loadSavedSettings();
        await initDatabase();
        initSensors();
        bindEvents();
        await startCamera();
    }

    window.addEventListener('DOMContentLoaded', boot);
})();
