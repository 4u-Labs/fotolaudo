<?php
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
$v = time();
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tutorial & Guia do Usuário — FotoLaudo</title>
    <link rel="icon" type="image/x-icon" href="favicon.ico?v=<?php echo $v; ?>">
    <link rel="apple-touch-icon" href="assets/apple-touch-icon.png?v=<?php echo $v; ?>">
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
    </style>
</head>
<body class="bg-[#060a12] text-slate-200 min-h-screen p-4 sm:p-8">
    <div class="max-w-4xl mx-auto space-y-6">
        <!-- Topo com Navegação e Seletor de Idioma -->
        <header class="bg-slate-900/80 border border-white/10 rounded-2xl p-4 sm:p-6 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-3">
                <a href="index.php" class="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xl hover:scale-105 transition-all">
                    📷
                </a>
                <div>
                    <h1 class="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                        <span>FotoLaudo</span>
                        <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">PRO</span>
                    </h1>
                    <p class="text-xs text-slate-400" id="headerSubtitle">Guia Prático de Campo e Emissão de Laudos</p>
                </div>
            </div>

            <div class="flex items-center gap-3">
                <!-- Seletor PT / EN -->
                <div class="rounded-full p-0.5 flex items-center border border-white/15 bg-black/40 text-xs">
                    <button id="btnPt" onclick="setPageLang('pt')" class="px-2.5 py-1 rounded-full font-bold transition-all bg-amber-500 text-slate-950">PT</button>
                    <button id="btnEn" onclick="setPageLang('en')" class="px-2.5 py-1 rounded-full font-bold transition-all text-slate-400 hover:text-white">EN</button>
                </div>
                <a href="index.php" class="px-3.5 py-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-all" id="btnBack">
                    ← Voltar ao App
                </a>
            </div>
        </header>

        <!-- Conteúdo do Tutorial -->
        <main class="space-y-6">
            <!-- 1. Sensores de Campo -->
            <section class="bg-slate-900/70 border border-white/10 rounded-2xl p-5 sm:p-7 space-y-3">
                <div class="flex items-center gap-2 text-amber-400 font-bold text-sm sm:text-base">
                    <span>🛰️</span>
                    <h2 id="sec1Title">1. Sensores de Campo & Telemetria em Tempo Real</h2>
                </div>
                <p class="text-xs sm:text-sm text-slate-300 leading-relaxed" id="sec1Desc">
                    O FotoLaudo captura automaticamente no instante exato do disparo:
                </p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                    <div class="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                        <strong class="text-cyan-400 font-semibold" id="sec1GpsTitle">📍 GPS & Coordenadas UTM</strong>
                        <p class="text-slate-400 leading-relaxed" id="sec1GpsDesc">Conversão geodésica em tempo real para o Fuso UTM correspondente (WGS84 / SIRGAS 2000), altitude ortométrica e margem de precisão em metros.</p>
                    </div>
                    <div class="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                        <strong class="text-emerald-400 font-semibold" id="sec1CompassTitle">🧭 Bússola & Nível Virtual</strong>
                        <p class="text-slate-400 leading-relaxed" id="sec1CompassDesc">Azimute magnético com rumos cardeais (ex: 335° NO) e nível de bolha virtual bi-axial (pitch/roll) para garantir o prumo da foto.</p>
                    </div>
                </div>
            </section>

            <!-- 2. Ferramentas de Desenho e Cota Técnica -->
            <section class="bg-slate-900/70 border border-white/10 rounded-2xl p-5 sm:p-7 space-y-3">
                <div class="flex items-center gap-2 text-amber-400 font-bold text-sm sm:text-base">
                    <span>📏</span>
                    <h2 id="sec2Title">2. Editor Técnico CAD & Ferramenta Cota</h2>
                </div>
                <p class="text-xs sm:text-sm text-slate-300 leading-relaxed" id="sec2Desc">
                    Após capturar a foto, toque em <b>"✏️ Desenho & Anotações"</b> para marcar anomalias e elementos técnicos:
                </p>
                <ul class="space-y-2 text-xs text-slate-300 list-disc list-inside pt-1 leading-relaxed" id="sec2List">
                    <li><b>Ferramenta Cota (<--->)</b>: Trace sobre a fissura ou vão. Ao soltar, escolha uma medida rápida com 1 toque (de 0.5 mm até 2.0 m) ou digite livremente. O traço ganha padrão CAD com linhas limitadoras perpendiculares e badge central.</li>
                    <li><b>Alças de Redimensionamento</b>: Selecione com <b>"👆 Mover"</b> para esticar ou girar pelas pontas da cota (alça ciano e âmbar) ou redimensionar pelos cantos.</li>
                    <li><b>Censura / Blur</b>: Aplique desfoque óptico instantâneo sobre placas de veículos, documentos ou rostos de trabalhadores.</li>
                    <li><b>Setas, Círculos e Retângulos</b>: Destaque armaduras expostas, falhas de concretagem ou infiltrações em 5 cores técnicas.</li>
                </ul>
            </section>

            <!-- 3. Emissão de Relatório Fotográfico PDF -->
            <section class="bg-slate-900/70 border border-white/10 rounded-2xl p-5 sm:p-7 space-y-3">
                <div class="flex items-center gap-2 text-amber-400 font-bold text-sm sm:text-base">
                    <span>📄</span>
                    <h2 id="sec3Title">3. Emissão do Relatório Fotográfico em PDF</h2>
                </div>
                <p class="text-xs sm:text-sm text-slate-300 leading-relaxed" id="sec3Desc">
                    Na tela principal, toque no botão verde <b>[PDF]</b> ou acesse a <b>Galeria</b> para gerar o laudo técnico:
                </p>
                <ul class="space-y-2 text-xs text-slate-300 list-disc list-inside pt-1 leading-relaxed" id="sec3List">
                    <li>Diagramação profissional A4 com 2 fotos por página (detalhado) ou 4 fotos por página (compacto).</li>
                    <li>Cabeçalho com nome do projeto, empresa fiscalizadora, dados do perito/fiscal e registro CREA/CAU.</li>
                    <li>Quadro individual com foto carimbada em alta resolução, classificação de conformidade e coordenadas completas.</li>
                </ul>
            </section>

            <!-- Doação via PayPal -->
            <section class="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div class="space-y-1 text-center sm:text-left">
                    <h3 class="text-sm font-bold text-amber-400 flex items-center justify-center sm:justify-start gap-1.5" id="donateTitle">
                        <span>☕</span> <span>Apoie o Projeto FotoLaudo</span>
                    </h3>
                    <p class="text-xs text-slate-300 max-w-xl leading-relaxed" id="donateDesc">
                        O FotoLaudo é 100% gratuito e independente. Se este software otimiza seu trabalho de campo, considere fazer uma contribuição voluntária para mantermos o projeto ativo!
                    </p>
                </div>
                <a href="https://www.paypal.com/ncp/payment/L7YRCS984T33N" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 rounded-xl bg-[#0070BA] hover:bg-[#005ea6] text-white font-bold text-xs shrink-0 shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2" id="donateBtn">
                    Doar via PayPal
                </a>
            </section>
        </main>

        <!-- Rodapé Oficial com Links -->
        <footer class="pt-6 border-t border-white/10 text-center text-xs text-slate-400 space-y-3">
            <div class="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold">
                <a href="tutorial.php" class="text-amber-400 hover:underline" id="fLinkTutorial">Tutorial & Guia</a>
                <span class="text-slate-600">•</span>
                <a href="suporte.php" class="hover:text-white" id="fLinkSupport">Suporte & FAQ</a>
                <span class="text-slate-600">•</span>
                <a href="privacidade.php" class="hover:text-white" id="fLinkPrivacy">Privacidade & LGPD</a>
                <span class="text-slate-600">•</span>
                <a href="termos.php" class="hover:text-white" id="fLinkTerms">Termos de Uso</a>
            </div>
            <p id="fCopyright">© <?php echo date('Y'); ?> FotoLaudo — 4U.IA.BR Tecnologia para Engenharia & Infraestrutura.</p>
        </footer>
    </div>

    <script>
        const i18n = {
            pt: {
                headerSubtitle: "Guia Prático de Campo e Emissão de Laudos",
                btnBack: "← Voltar ao App",
                sec1Title: "1. Sensores de Campo & Telemetria em Tempo Real",
                sec1Desc: "O FotoLaudo captura automaticamente no instante exato do disparo:",
                sec1GpsTitle: "📍 GPS & Coordenadas UTM",
                sec1GpsDesc: "Conversão geodésica em tempo real para o Fuso UTM correspondente (WGS84 / SIRGAS 2000), altitude ortométrica e margem de precisão em metros.",
                sec1CompassTitle: "🧭 Bússola & Nível Virtual",
                sec1CompassDesc: "Azimute magnético com rumos cardeais (ex: 335° NO) e nível de bolha virtual bi-axial (pitch/roll) para garantir o prumo da foto.",
                sec2Title: "2. Editor Técnico CAD & Ferramenta Cota",
                sec2Desc: "Após capturar a foto, toque em \"✏️ Desenho & Anotações\" para marcar anomalias e elementos técnicos:",
                sec2List: `
                    <li><b>Ferramenta Cota (<--->)</b>: Trace sobre a fissura ou vão. Ao soltar, escolha uma medida rápida com 1 toque (de 0.5 mm até 2.0 m) ou digite livremente. O traço ganha padrão CAD com linhas limitadoras perpendiculares e badge central.</li>
                    <li><b>Alças de Redimensionamento</b>: Selecione com <b>"👆 Mover"</b> para esticar ou girar pelas pontas da cota (alça ciano e âmbar) ou redimensionar pelos cantos.</li>
                    <li><b>Censura / Blur</b>: Aplique desfoque óptico instantâneo sobre placas de veículos, documentos ou rostos de trabalhadores.</li>
                    <li><b>Setas, Círculos e Retângulos</b>: Destaque armaduras expostas, falhas de concretagem ou infiltrações em 5 cores técnicas.</li>
                `,
                sec3Title: "3. Emissão do Relatório Fotográfico em PDF",
                sec3Desc: "Na tela principal, toque no botão verde [PDF] ou acesse a Galeria para gerar o laudo técnico:",
                sec3List: `
                    <li>Diagramação profissional A4 com 2 fotos por página (detalhado) ou 4 fotos por página (compacto).</li>
                    <li>Cabeçalho com nome do projeto, empresa fiscalizadora, dados do perito/fiscal e registro CREA/CAU.</li>
                    <li>Quadro individual com foto carimbada em alta resolução, classificação de conformidade e coordenadas completas.</li>
                `,
                donateTitle: "<span>☕</span> <span>Apoie o Projeto FotoLaudo</span>",
                donateDesc: "O FotoLaudo é 100% gratuito e independente. Se este software otimiza seu trabalho de campo, considere fazer uma contribuição voluntária para mantermos o projeto ativo!",
                donateBtn: "Doar via PayPal",
                fLinkTutorial: "Tutorial & Guia",
                fLinkSupport: "Suporte & FAQ",
                fLinkPrivacy: "Privacidade & LGPD",
                fLinkTerms: "Termos de Uso",
                fCopyright: "© " + new Date().getFullYear() + " FotoLaudo — 4U.IA.BR Tecnologia para Engenharia & Infraestrutura."
            },
            en: {
                headerSubtitle: "Field Practice Guide & Inspection Reports",
                btnBack: "← Back to App",
                sec1Title: "1. Field Sensors & Real-Time Telemetry",
                sec1Desc: "FotoLaudo automatically records at the exact shutter trigger moment:",
                sec1GpsTitle: "📍 GPS & UTM Coordinates",
                sec1GpsDesc: "Real-time geodetic conversion to the corresponding UTM Zone (WGS84), orthometric elevation, and accuracy radius in meters.",
                sec1CompassTitle: "🧭 Compass & Virtual Level",
                sec1CompassDesc: "Magnetic azimuth with cardinal bearings (e.g. 335° NW) and dual-axis virtual bubble level (pitch/roll) to ensure plumb photography.",
                sec2Title: "2. CAD Markup Editor & Dimension Tool",
                sec2Desc: "After capturing the photo, tap \"✏️ Markup & Annotations\" to highlight technical elements and defects:",
                sec2List: `
                    <li><b>Dimension Tool (<--->)</b>: Drag over a crack or span. Release to pick a quick 1-tap measurement (from 0.5 mm to 2.0 m) or type freely. Renders CAD-standard witness lines, double arrows, and centered badge.</li>
                    <li><b>Resize Handles</b>: Select with <b>"👆 Move"</b> to pull or rotate from the dimension tips (cyan and amber handles) or resize from corners.</li>
                    <li><b>Blur / Censorship</b>: Instantly apply optical blur over vehicle license plates, private blueprints, or workers' faces.</li>
                    <li><b>Arrows, Circles & Rectangles</b>: Highlight exposed rebar, concrete honeycombs, or moisture in 5 technical contrast colors.</li>
                `,
                sec3Title: "3. PDF Inspection Report Generation",
                sec3Desc: "On the main screen, tap the green [PDF] button or enter the Gallery to generate technical reports:",
                sec3List: `
                    <li>Professional A4 layout with 2 photos per page (detailed) or 4 photos per page (compact).</li>
                    <li>Engineering header with project name, inspection firm, engineer/inspector credentials, and license ID.</li>
                    <li>Individual photo slots with high-resolution stamped imagery, compliance classification, and full telemetry.</li>
                `,
                donateTitle: "<span>☕</span> <span>Support the FotoLaudo Project</span>",
                donateDesc: "FotoLaudo is 100% free and independent. If this software streamlines your daily field inspections, please consider making a voluntary donation to support ongoing development!",
                donateBtn: "Donate with PayPal",
                fLinkTutorial: "Tutorial & Guide",
                fLinkSupport: "Support & FAQ",
                fLinkPrivacy: "Privacy & GDPR",
                fLinkTerms: "Terms of Use",
                fCopyright: "© " + new Date().getFullYear() + " FotoLaudo — 4U.IA.BR Engineering & Infrastructure Technology."
            }
        };

        function setPageLang(lang) {
            const data = i18n[lang] || i18n.pt;
            document.documentElement.lang = lang === 'en' ? 'en' : 'pt-BR';
            document.getElementById('headerSubtitle').textContent = data.headerSubtitle;
            document.getElementById('btnBack').textContent = data.btnBack;
            document.getElementById('sec1Title').textContent = data.sec1Title;
            document.getElementById('sec1Desc').textContent = data.sec1Desc;
            document.getElementById('sec1GpsTitle').textContent = data.sec1GpsTitle;
            document.getElementById('sec1GpsDesc').textContent = data.sec1GpsDesc;
            document.getElementById('sec1CompassTitle').textContent = data.sec1CompassTitle;
            document.getElementById('sec1CompassDesc').textContent = data.sec1CompassDesc;
            document.getElementById('sec2Title').textContent = data.sec2Title;
            document.getElementById('sec2Desc').textContent = data.sec2Desc;
            document.getElementById('sec2List').innerHTML = data.sec2List;
            document.getElementById('sec3Title').textContent = data.sec3Title;
            document.getElementById('sec3Desc').textContent = data.sec3Desc;
            document.getElementById('sec3List').innerHTML = data.sec3List;
            document.getElementById('donateTitle').innerHTML = data.donateTitle;
            document.getElementById('donateDesc').textContent = data.donateDesc;
            document.getElementById('donateBtn').textContent = data.donateBtn;
            document.getElementById('fLinkTutorial').textContent = data.fLinkTutorial;
            document.getElementById('fLinkSupport').textContent = data.fLinkSupport;
            document.getElementById('fLinkPrivacy').textContent = data.fLinkPrivacy;
            document.getElementById('fLinkTerms').textContent = data.fLinkTerms;
            document.getElementById('fCopyright').textContent = data.fCopyright;

            const btnPt = document.getElementById('btnPt');
            const btnEn = document.getElementById('btnEn');
            if (lang === 'pt') {
                btnPt.className = 'px-2.5 py-1 rounded-full font-bold transition-all bg-amber-500 text-slate-950';
                btnEn.className = 'px-2.5 py-1 rounded-full font-bold transition-all text-slate-400 hover:text-white';
            } else {
                btnEn.className = 'px-2.5 py-1 rounded-full font-bold transition-all bg-amber-500 text-slate-950';
                btnPt.className = 'px-2.5 py-1 rounded-full font-bold transition-all text-slate-400 hover:text-white';
            }
            try { localStorage.setItem('fotolaudo_lang', lang); } catch (e) {}
        }

        // Auto-detect initial language
        const savedLang = localStorage.getItem('fotolaudo_lang');
        const navLang = (navigator.language || '').toLowerCase();
        const initialLang = savedLang || (navLang.startsWith('pt') ? 'pt' : 'en');
        setPageLang(initialLang);
    </script>
</body>
</html>
