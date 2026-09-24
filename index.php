<?php
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
$v = time();
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>FotoLaudo — Câmera Técnica & Laudos de Engenharia</title>
    
    <!-- PWA Meta -->
    <link rel="manifest" href="manifest.json">
    <meta name="theme-color" content="#06080D">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <link rel="apple-touch-icon" href="assets/icon-192.png">
    <link rel="icon" type="image/png" href="assets/icon-192.png">

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">

    <!-- Tailwind CSS & Libraries -->
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>

    <!-- Custom CSS -->
    <link rel="stylesheet" href="style.css?v=<?php echo $v; ?>">
</head>
<body class="bg-[#05080f] text-slate-100 flex flex-col h-screen select-none overflow-hidden">

    <!-- FLASH DE DISPARO -->
    <div id="shutterFlash"></div>

    <!-- CANVAS OCULTO PARA PROCESSAMENTO E CARIMBO EM ALTA DEFINIÇÃO -->
    <canvas id="renderCanvas" class="hidden"></canvas>
    <canvas id="mapCanvas" class="hidden" width="160" height="160"></canvas>

    <!-- CONTAINER DA CÂMERA -->
    <div id="cameraContainer" class="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
        <!-- Vídeo da Câmera -->
        <video id="cameraVideo" autoplay playsinline muted class="w-full h-full object-cover"></video>

        <!-- Fallback caso não haja permissão de câmera direta -->
        <div id="cameraFallback" class="hidden absolute inset-0 bg-[#070b14] flex flex-col items-center justify-center p-6 text-center z-20">
            <div class="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 text-3xl">
                📷
            </div>
            <h2 class="text-xl font-bold text-white mb-2">Acesso à Câmera</h2>
            <p class="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">
                Permita o acesso à câmera para ver o visor técnico em tempo real ou use a câmera nativa do aparelho.
            </p>
            <div class="flex flex-col sm:flex-row gap-3">
                <button id="btnRetryCamera" class="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all">
                    Ativar Câmera WebRTC
                </button>
                <label class="px-5 py-3 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold text-sm cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2">
                    <span>Usar Câmera do Sistema</span>
                    <input type="file" id="fallbackFileInput" accept="image/*" capture="environment" class="hidden">
                </label>
            </div>
        </div>

        <!-- GRADE DO HUD (Regra dos Terços) -->
        <div id="hudGrid" class="hud-grid hidden">
            <div class="grid-thirds">
                <div></div><div></div><div></div>
                <div></div><div></div><div></div>
                <div></div><div></div><div></div>
            </div>
        </div>

        <!-- MIRA CENTRAL DO HUD (Crosshair) -->
        <div id="hudCrosshair" class="hud-crosshair">
            <div class="hud-crosshair-center"></div>
        </div>

        <!-- HORIZONTE VIRTUAL & NÍVEL DE BOLHA (Pitch / Roll) -->
        <div id="hudLevel" class="pointer-events-none">
            <div id="horizonLine" class="horizon-line"></div>
            <div id="levelDot" class="level-indicator-dot"></div>
        </div>

        <!-- HUD: BARRA SUPERIOR (Status, Obras, Toggles com Rolagem Horizontal) -->
        <div class="absolute top-0 inset-x-0 p-2 sm:p-4 bg-gradient-to-b from-black/85 via-black/45 to-transparent z-30 flex items-center justify-between gap-2 overflow-hidden">
            <!-- Seletor de Projeto / Obra -->
            <button id="btnProjectSelector" class="glass-pill px-3 py-1.5 rounded-full flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 transition-all max-w-[145px] sm:max-w-xs" title="Selecionar ou Configurar Obra">
                <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0"></span>
                <span id="currentProjectBadge" class="text-xs font-semibold text-amber-200 truncate">Pedágio P02 Km 84</span>
                <span class="text-[10px] text-amber-400 shrink-0">▾</span>
            </button>

            <!-- Telemetria Rápida Central (Graus / Nível) -->
            <div class="hidden md:flex items-center gap-3 text-xs font-telemetry bg-black/60 border border-white/10 px-3 py-1 rounded-full backdrop-blur-md shrink-0">
                <span id="quickAzimuth" class="text-cyan-400 font-bold">0° N</span>
                <span class="text-slate-600">|</span>
                <span id="quickLevel" class="text-emerald-400 font-bold">0.0°</span>
                <span class="text-slate-600">|</span>
                <span id="quickGpsAcc" class="text-slate-300">±--m</span>
            </div>

            <!-- Botões de Controle Rápido (Com rolagem horizontal para telas pequenas) -->
            <div id="topToolsBar" class="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-1 px-1 touch-pan-x flex-1 min-w-0 justify-start sm:justify-end">
                <!-- Lanterna / Flash -->
                <button id="btnTorch" class="w-9 h-9 shrink-0 rounded-full glass-pill flex items-center justify-center text-slate-200 hover:text-amber-400 active:scale-90 transition-all cursor-pointer" title="Lanterna/Flash">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                </button>
                <!-- Alternar Grade -->
                <button id="btnToggleGrid" class="w-9 h-9 shrink-0 rounded-full glass-pill flex items-center justify-center text-slate-200 hover:text-cyan-400 active:scale-90 transition-all cursor-pointer" title="Alternar Grade">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>
                </button>
                <!-- Alternar Nível -->
                <button id="btnToggleLevel" class="w-9 h-9 shrink-0 rounded-full glass-pill flex items-center justify-center text-emerald-400 border-emerald-500/40 hover:text-emerald-300 active:scale-90 transition-all cursor-pointer" title="Nível de Bolha">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg>
                </button>
                <!-- Inverter Câmera -->
                <button id="btnFlipCamera" class="w-9 h-9 shrink-0 rounded-full glass-pill flex items-center justify-center text-slate-200 hover:text-white active:scale-90 transition-all cursor-pointer" title="Trocar Câmera">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                </button>
                <!-- Configurações da Obra -->
                <button id="btnOpenSettings" class="w-9 h-9 shrink-0 rounded-full glass-pill flex items-center justify-center text-slate-200 hover:text-white active:scale-90 transition-all cursor-pointer" title="Configurações">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                </button>
            </div>
        </div>

        <!-- HUD: TARJA DE TELEMETRIA AO VIVO (Sobre o Visor) -->
        <div class="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md pointer-events-none z-20">
            <div class="glass-panel rounded-2xl p-3 border border-white/10 shadow-2xl space-y-1.5 font-telemetry text-[11px] leading-tight text-slate-200">
                <div class="flex items-center justify-between text-amber-400 font-bold border-b border-white/10 pb-1">
                    <span id="hudProjectTitle" class="truncate max-w-[200px]">Pedágio P02 Km 84</span>
                    <span id="hudDateTime" class="text-slate-400 text-[10px]">--:--:--</span>
                </div>
                <div class="flex items-center justify-between text-slate-300">
                    <span>GPS: <strong id="hudGpsCoord" class="text-white">Aguardando sinal...</strong></span>
                    <span id="hudAltitude" class="text-cyan-300 font-semibold">Alt: --m</span>
                </div>
                <div class="flex items-center justify-between text-slate-300">
                    <span>UTM: <strong id="hudUtmCoord" class="text-emerald-300">Fuso --</strong></span>
                    <span id="hudCompass" class="text-amber-300 font-semibold">Az: --°</span>
                </div>
                <div class="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                    <span id="hudEstaca" class="truncate">Km --+---</span>
                    <span id="hudElemento" class="text-amber-200 truncate">Geral</span>
                </div>
            </div>
        </div>
    </div>

    <!-- CONTROLES INFERIORES (Disparo, Chips Rápidos, Galeria e PDF) -->
    <div class="bg-[#080d1a] border-t border-white/10 p-3 sm:p-4 z-30 flex flex-col gap-3">
        <!-- Barra de Chips Rápidos de Elementos (Scroll Horizontal) -->
        <div id="quickChipsContainer" class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <!-- Chips injetados dinamicamente via JS -->
        </div>

        <!-- Barra Principal do Disparador -->
        <div class="flex items-center justify-between max-w-lg mx-auto w-full px-2 sm:px-6">
            <!-- Botão Galeria -->
            <button id="btnOpenGallery" class="relative w-12 h-12 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 flex flex-col items-center justify-center text-slate-200 active:scale-95 transition-all cursor-pointer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <span id="galleryCountBadge" class="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center px-1 shadow-md">0</span>
            </button>

            <!-- Botão de Disparo (Shutter) -->
            <div id="btnShutter" class="shutter-btn-outer">
                <div class="shutter-btn-inner"></div>
            </div>

            <!-- Botão Gerar Laudo PDF -->
            <button id="btnOpenPdfModal" class="w-12 h-12 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 flex flex-col items-center justify-center active:scale-95 transition-all cursor-pointer" title="Gerar Relatório Fotográfico em PDF">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                <span class="text-[9px] font-bold uppercase mt-0.5 tracking-wider">PDF</span>
            </button>
        </div>
    </div>

    <!-- ============================================================
         MODAIS & GAVETAS DO SISTEMA
         ============================================================ -->

    <!-- MODAL 1: REVISÃO DA FOTO RECÉM-CAPTURADA -->
    <div id="modalReviewPhoto" class="hidden fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col">
        <div class="p-3 border-b border-white/10 flex items-center justify-between">
            <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span class="text-sm font-bold text-white">Revisão do Registro Técnico</span>
            </div>
            <button id="btnCloseReview" class="text-slate-400 hover:text-white p-2">✕</button>
        </div>

        <div class="flex-1 overflow-y-auto p-4 flex flex-col lg:flex-row gap-4 max-w-6xl mx-auto w-full">
            <!-- Imagem com Carimbo e Ação de Anotação -->
            <div class="flex-1 flex flex-col items-center justify-center bg-black/60 rounded-2xl overflow-hidden border border-white/10 p-3">
                <div class="relative max-h-[58vh] lg:max-h-[72vh] flex items-center justify-center">
                    <img id="reviewImgPreview" class="max-h-[58vh] lg:max-h-[72vh] w-auto object-contain rounded-xl shadow-2xl" alt="Foto Carimbada">
                </div>
                <div class="mt-3 flex items-center gap-2">
                    <button id="btnOpenMarkupModal" type="button" class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                        <span>Anotar na Foto (Setas, Círculos, Textos)</span>
                    </button>
                    <span id="markupCountBadge" class="hidden text-[11px] font-bold px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">0 anotações</span>
                </div>
            </div>

            <!-- Painel de Edição de Metadados -->
            <div class="w-full lg:w-96 flex flex-col justify-between space-y-4 bg-slate-900/60 border border-white/10 rounded-2xl p-4 sm:p-5">
                <div class="space-y-3.5">
                    <h3 class="text-xs font-bold uppercase tracking-wider text-amber-400">Dados do Registro</h3>
                    
                    <div>
                        <label class="block text-xs text-slate-400 mb-1">Local / Estaca / Km</label>
                        <input type="text" id="reviewEstaca" class="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400">
                    </div>

                    <div>
                        <label class="block text-xs text-slate-400 mb-1">Elemento / Estrutura</label>
                        <input type="text" id="reviewElemento" class="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400">
                    </div>

                    <div>
                        <label class="block text-xs text-slate-400 mb-1">Classificação Técnica</label>
                        <div class="grid grid-cols-3 gap-2">
                            <label class="flex items-center justify-center gap-1.5 p-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-xs font-semibold cursor-pointer">
                                <input type="radio" name="reviewStatus" value="CONFORME" checked class="accent-emerald-400">
                                <span>Conforme</span>
                            </label>
                            <label class="flex items-center justify-center gap-1.5 p-2 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs font-semibold cursor-pointer">
                                <input type="radio" name="reviewStatus" value="OBSERVACAO" class="accent-amber-400">
                                <span>Atenção</span>
                            </label>
                            <label class="flex items-center justify-center gap-1.5 p-2 rounded-xl border border-red-500/40 bg-red-500/10 text-red-300 text-xs font-semibold cursor-pointer">
                                <input type="radio" name="reviewStatus" value="NAO_CONFORME" class="accent-red-400">
                                <span>RNC</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs text-slate-400 mb-1">Observações Técnicas</label>
                        <textarea id="reviewNotas" rows="3" class="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400" placeholder="Ex: Armadura conforme projeto estrutural NBR 6118, recobrimento validado em 35mm."></textarea>
                    </div>

                    <button id="btnReapplyStamp" class="w-full py-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-semibold transition-all">
                        🔄 Recarimbar com Novos Dados
                    </button>
                </div>

                <!-- Ações -->
                <div class="space-y-2 pt-2 border-t border-white/10">
                    <button id="btnSaveToGallery" class="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer">
                        <span>💾 Salvar Registro</span>
                    </button>
                    <div class="grid grid-cols-2 gap-2">
                        <button id="btnDownloadPhoto" class="py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                            <span>⬇️ Baixar JPG</span>
                        </button>
                        <button id="btnSharePhoto" class="py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                            <span>📤 WhatsApp</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- MODAL 2: GALERIA DE FOTOS TÉCNICAS -->
    <div id="modalGallery" class="hidden fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col">
        <div class="p-4 border-b border-white/10 flex items-center justify-between">
            <div class="flex items-center gap-2">
                <span class="text-lg">📁</span>
                <h2 class="text-base font-bold text-white">Galeria de Evidências Técnicas</h2>
                <span id="galleryCounterText" class="text-xs text-slate-400 font-telemetry">(0 registros)</span>
            </div>
            <div class="flex items-center gap-2">
                <button id="btnSelectAllGallery" class="text-xs text-amber-400 border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 rounded-lg">Selecionar Todas</button>
                <button id="btnCloseGallery" class="text-slate-400 hover:text-white p-2">✕</button>
            </div>
        </div>

        <!-- Grade de Fotos -->
        <div class="flex-1 overflow-y-auto p-4">
            <div id="galleryGrid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                <!-- Fotos injetadas via JS -->
            </div>
            <div id="galleryEmptyState" class="hidden flex flex-col items-center justify-center py-20 text-center">
                <span class="text-5xl mb-3">📷</span>
                <p class="text-base font-semibold text-white">Nenhum registro ainda</p>
                <p class="text-xs text-slate-400 mt-1">Dispare fotos com a câmera técnica para montar seu acervo de laudos.</p>
            </div>
        </div>

        <!-- Rodapé da Galeria com Ação de PDF -->
        <div class="p-3 sm:p-4 bg-slate-900 border-t border-white/10 flex items-center justify-between gap-3">
            <div class="text-xs text-slate-300">
                <span id="selectedPhotosCount">0</span> fotos selecionadas
            </div>
            <div class="flex items-center gap-2">
                <button id="btnDeleteSelected" class="px-3 py-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-all">
                    Excluir
                </button>
                <button id="btnExportSelectedToPdf" class="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-2">
                    <span>Exportar Relatório PDF</span>
                </button>
            </div>
        </div>
    </div>

    <!-- MODAL 3: GERADOR DE RELATÓRIO FOTOGRÁFICO EM PDF -->
    <div id="modalPdfGenerator" class="hidden fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
        <div class="bg-slate-900 border border-white/10 rounded-2xl max-w-lg w-full p-5 sm:p-6 space-y-4">
            <div class="flex items-center justify-between border-b border-white/10 pb-3">
                <div class="flex items-center gap-2">
                    <span class="text-emerald-400 text-xl">📄</span>
                    <h3 class="text-base font-bold text-white">Gerar Relatório Fotográfico (PDF)</h3>
                </div>
                <button id="btnClosePdfModal" class="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <div class="space-y-3 text-xs">
                <div>
                    <label class="block text-slate-400 mb-1">Título do Relatório / Laudo</label>
                    <input type="text" id="pdfReportTitle" value="Relatório Fotográfico de Fiscalização de Obra" class="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-emerald-400">
                </div>
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="block text-slate-400 mb-1">Obra / Concessionária</label>
                        <input type="text" id="pdfReportObra" value="Praça de Pedágio P02 - Km 84" class="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-white">
                    </div>
                    <div>
                        <label class="block text-slate-400 mb-1">Engenheiro / Fiscal</label>
                        <input type="text" id="pdfReportFiscal" value="Eng. Fabiano Braga" class="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-white">
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="block text-slate-400 mb-1">CREA / CAU</label>
                        <input type="text" id="pdfReportCrea" placeholder="Ex: CREA/SP 506070" class="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-white">
                    </div>
                    <div>
                        <label class="block text-slate-400 mb-1">Layout da Página</label>
                        <select id="pdfPhotosPerPage" class="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-white">
                            <option value="2">2 Fotos por Página (Laudo Detalhado)</option>
                            <option value="4">4 Fotos por Página (Vistoria Rápida)</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label class="block text-slate-400 mb-1">Observações Gerais do Laudo</label>
                    <textarea id="pdfReportObs" rows="2" class="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-white" placeholder="Vistoria técnica de rotina e acompanhamento das etapas executivas."></textarea>
                </div>
            </div>

            <div class="pt-3 border-t border-white/10 flex justify-end gap-2">
                <button id="btnCancelPdf" class="px-4 py-2.5 rounded-xl border border-white/10 text-slate-300 text-xs">Cancelar</button>
                <button id="btnGeneratePdfAction" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center gap-1.5">
                    <span>Gerar e Baixar PDF</span>
                </button>
            </div>
        </div>
    </div>

    <!-- MODAL 4: CONFIGURAÇÕES DA OBRA & CARIMBO -->
    <div id="modalSettings" class="hidden fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
        <div class="bg-slate-900 border border-white/10 rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between border-b border-white/10 pb-3">
                <div class="flex items-center gap-2">
                    <span class="text-amber-400 text-xl">⚙️</span>
                    <h3 class="text-base font-bold text-white">Configurações do FotoLaudo</h3>
                </div>
                <button id="btnCloseSettings" class="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <div class="space-y-3.5 text-xs">
                <div>
                    <label class="block text-slate-400 mb-1">Nome da Obra Ativa</label>
                    <input type="text" id="cfgObraName" class="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-white">
                </div>
                <div>
                    <label class="block text-slate-400 mb-1">Contratante / Concessionária</label>
                    <input type="text" id="cfgEmpresa" class="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-white">
                </div>
                <div>
                    <label class="block text-slate-400 mb-1">Responsável Técnico (Fiscal)</label>
                    <input type="text" id="cfgFiscalName" class="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-white">
                </div>
                <div>
                    <label class="block text-slate-400 mb-1">Estilo do Carimbo Técnico</label>
                    <select id="cfgStampStyle" class="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-white">
                        <option value="concessao">Rodovias & Concessão (Faixa Preta Alto Contraste)</option>
                        <option value="laudo">Laudo Duplo com Mini-Mapa Geográfico</option>
                        <option value="minimalista">Minimalista de Engenharia (Cantos)</option>
                    </select>
                </div>
                <div>
                    <label class="block text-slate-400 mb-1">Logotipo da Empresa (Aparece no carimbo)</label>
                    <div class="flex items-center gap-3">
                        <div id="cfgLogoPreviewBox" class="w-14 h-14 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden">
                            <span class="text-slate-500 text-xs">Sem logo</span>
                        </div>
                        <div class="flex-1 flex gap-2">
                            <label class="px-3 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white font-medium text-xs cursor-pointer">
                                Carregar Logo
                                <input type="file" id="cfgLogoFile" accept="image/*" class="hidden">
                            </label>
                            <button id="cfgRemoveLogoBtn" class="px-3 py-2 rounded-xl border border-white/10 text-slate-400 text-xs hover:text-red-400">Remover</button>
                        </div>
                    </div>
                </div>
                <div>
                    <label class="block text-slate-400 mb-1">Tags Rápidas (separadas por vírgula)</label>
                    <input type="text" id="cfgQuickTags" class="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-white" value="Cabine Manual, Cabine Automática, Pavimento Rígido, Armadura, Barreira New Jersey, Drenagem, Subestação, Cobertura">
                </div>
            </div>

            <div class="pt-3 border-t border-white/10 flex justify-end gap-2">
                <button id="btnSaveSettings" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 active:scale-95">
                    Salvar Configurações
                </button>
            </div>
        </div>
    </div>

    <!-- MODAL 5: EDITOR DE ANOTAÇÕES TÉCNICAS (SETAS, CÍRCULOS, TEXTOS) -->
    <div id="modalMarkupEditor" class="hidden fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col">
        <!-- Top Toolbar -->
        <div class="p-3 bg-slate-900 border-b border-white/10 flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
                <span class="text-amber-400 text-lg">✏️</span>
                <span class="text-sm font-bold text-white">Anotações & Destaques de Campo</span>
            </div>
            <div class="flex items-center gap-2">
                <button id="btnMarkupUndo" class="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200 flex items-center gap-1 active:scale-95 transition-all cursor-pointer" title="Desfazer última anotação">
                    <span>↩️ Desfazer</span>
                </button>
                <button id="btnMarkupClear" class="px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-xs font-semibold text-red-300 flex items-center gap-1 active:scale-95 transition-all cursor-pointer" title="Limpar todas as anotações">
                    <span>🗑️ Limpar</span>
                </button>
                <button id="btnMarkupApply" class="px-4 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-1 cursor-pointer">
                    <span>✓ Concluir</span>
                </button>
                <button id="btnMarkupCancel" class="text-slate-400 hover:text-white p-1.5 text-base cursor-pointer">✕</button>
            </div>
        </div>

        <!-- Canvas Drawing Surface -->
        <div id="markupCanvasContainer" class="flex-1 overflow-hidden relative flex items-center justify-center p-2 bg-[#03060c] touch-none">
            <canvas id="markupCanvas" class="max-w-full max-h-full object-contain border border-white/10 rounded-xl shadow-2xl cursor-crosshair"></canvas>
        </div>

        <!-- Bottom Floating Dock (Toolbox) -->
        <div class="p-3 bg-slate-900 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            <!-- Ferramentas de Desenho -->
            <div class="flex items-center gap-1.5 overflow-x-auto">
                <button type="button" data-tool="arrow" class="markup-tool-btn px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-amber-500/40 bg-amber-500/20 text-amber-300 transition-all cursor-pointer">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    <span>Seta</span>
                </button>
                <button type="button" data-tool="circle" class="markup-tool-btn px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 transition-all cursor-pointer">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/></svg>
                    <span>Círculo</span>
                </button>
                <button type="button" data-tool="rect" class="markup-tool-btn px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 transition-all cursor-pointer">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
                    <span>Retângulo</span>
                </button>
                <button type="button" data-tool="pen" class="markup-tool-btn px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 transition-all cursor-pointer">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    <span>Traço</span>
                </button>
                <button type="button" data-tool="text" class="markup-tool-btn px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 transition-all cursor-pointer">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
                    <span>Texto</span>
                </button>
            </div>

            <!-- Cores & Espessura -->
            <div class="flex items-center gap-4">
                <!-- Seletor de Cores Técnicas -->
                <div class="flex items-center gap-1.5">
                    <button type="button" data-color="#EF4444" class="markup-color-btn w-7 h-7 rounded-full bg-red-500 border-2 border-white shadow-md transition-transform scale-110 cursor-pointer" title="Vermelho RNC / Falha"></button>
                    <button type="button" data-color="#F59E0B" class="markup-color-btn w-7 h-7 rounded-full bg-amber-500 border-2 border-transparent hover:scale-105 transition-transform cursor-pointer" title="Amarelo Atenção"></button>
                    <button type="button" data-color="#10B981" class="markup-color-btn w-7 h-7 rounded-full bg-emerald-500 border-2 border-transparent hover:scale-105 transition-transform cursor-pointer" title="Verde Conforme"></button>
                    <button type="button" data-color="#00D2FF" class="markup-color-btn w-7 h-7 rounded-full bg-cyan-400 border-2 border-transparent hover:scale-105 transition-transform cursor-pointer" title="Ciano Medição"></button>
                    <button type="button" data-color="#FFFFFF" class="markup-color-btn w-7 h-7 rounded-full bg-white border-2 border-transparent hover:scale-105 transition-transform cursor-pointer" title="Branco"></button>
                </div>

                <!-- Espessura do Traço -->
                <div class="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
                    <button type="button" data-size="4" class="markup-size-btn px-2.5 py-1 rounded-lg text-xs text-slate-300 font-semibold border border-transparent hover:text-white cursor-pointer">Fino</button>
                    <button type="button" data-size="8" class="markup-size-btn px-2.5 py-1 rounded-lg text-xs text-amber-300 font-bold border border-amber-500/40 bg-amber-500/20 cursor-pointer">Médio</button>
                    <button type="button" data-size="14" class="markup-size-btn px-2.5 py-1 rounded-lg text-xs text-slate-300 font-semibold border border-transparent hover:text-white cursor-pointer">Grosso</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Scripts da Aplicação -->
    <script src="app.js?v=<?php echo $v; ?>"></script>
    <script>
        // Registro do Service Worker para suporte PWA offline
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./service-worker.js').catch(() => {});
        }
    </script>
</body>
</html>
