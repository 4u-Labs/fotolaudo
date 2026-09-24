<?php
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
$v = time();
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Política de Privacidade & LGPD — FotoLaudo</title>
    <link rel="icon" type="image/x-icon" href="favicon.ico?v=<?php echo $v; ?>">
    <link rel="apple-touch-icon" href="assets/apple-touch-icon.png?v=<?php echo $v; ?>">
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>body { font-family: 'Inter', sans-serif; }</style>
</head>
<body class="bg-[#060a12] text-slate-200 min-h-screen p-4 sm:p-8">
    <div class="max-w-4xl mx-auto space-y-6">
        <!-- Topo com Navegação e Seletor de Idioma -->
        <header class="bg-slate-900/80 border border-white/10 rounded-2xl p-4 sm:p-6 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-3">
                <a href="index.php" class="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-xl hover:scale-105 transition-all">
                    🔒
                </a>
                <div>
                    <h1 class="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                        <span>FotoLaudo</span>
                        <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">LGPD</span>
                    </h1>
                    <p class="text-xs text-slate-400" id="headerSubtitle">Segurança Pericial, Privacidade e Conformidade com a Lei Geral de Proteção de Dados</p>
                </div>
            </div>

            <div class="flex items-center gap-3">
                <div class="rounded-full p-0.5 flex items-center border border-white/15 bg-black/40 text-xs">
                    <button id="btnPt" onclick="setPageLang('pt')" class="px-2.5 py-1 rounded-full font-bold transition-all bg-amber-500 text-slate-950">PT</button>
                    <button id="btnEn" onclick="setPageLang('en')" class="px-2.5 py-1 rounded-full font-bold transition-all text-slate-400 hover:text-white">EN</button>
                </div>
                <a href="index.php" class="px-3.5 py-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-all" id="btnBack">
                    ← Voltar ao App
                </a>
            </div>
        </header>

        <!-- Conteúdo de Privacidade -->
        <main class="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <section class="bg-slate-900/70 border border-white/10 rounded-2xl p-5 sm:p-6 space-y-2">
                <h2 class="text-sm sm:text-base font-bold text-emerald-400" id="p1Title">1. Arquitetura com Retenção Zero de Dados em Servidores (Zero-Knowledge)</h2>
                <p id="p1Desc">
                    O <b>FotoLaudo</b> foi projetado sob o princípio da privacidade por concepção (<i>Privacy by Design</i>). Todas as fotos capturadas, coordenadas geográficas, anotações de campo e relatórios técnicos em PDF são gerados e processados <b>estritamente no lado do cliente (navegador/smartphone do usuário)</b>. Não há upload de imagens para servidores remotos, garantindo total sigilo corporativo para perícias, auditorias e infraestrutura crítica.
                </p>
            </section>

            <section class="bg-slate-900/70 border border-white/10 rounded-2xl p-5 sm:p-6 space-y-2">
                <h2 class="text-sm sm:text-base font-bold text-emerald-400" id="p2Title">2. Permissão de Acesso à Câmera e Sensores</h2>
                <p id="p2Desc">
                    O acesso à câmera e aos sensores de giroscópio, acelerômetro e magnetômetro (bússola) é utilizado unicamente para renderizar a imagem em tempo real, calcular o nível de bolha virtual e o azimute no visor. Nenhum fluxo de vídeo é transmitido ou gravado fora do seu consentimento explícito através do botão de disparo.
                </p>
            </section>

            <section class="bg-slate-900/70 border border-white/10 rounded-2xl p-5 sm:p-6 space-y-2">
                <h2 class="text-sm sm:text-base font-bold text-emerald-400" id="p3Title">3. Armazenamento Local (IndexedDB & LocalStorage)</h2>
                <p id="p3Desc">
                    As fotos registradas permanecem guardadas no banco de dados local do seu navegador (IndexedDB) para que você possa revisá-las, exportá-las em lote ou gerar relatórios em PDF sem conexão à internet. Você tem autonomia total para apagar as fotos individualmente ou limpar os dados a qualquer momento diretamente no app.
                </p>
            </section>

            <section class="bg-slate-900/70 border border-white/10 rounded-2xl p-5 sm:p-6 space-y-2">
                <h2 class="text-sm sm:text-base font-bold text-emerald-400" id="p4Title">4. Ferramenta de Censura / Blur para Anonimização de Terceiros</h2>
                <p id="p4Desc">
                    Em conformidade com a LGPD (Lei nº 13.709/2018), o FotoLaudo disponibiliza no editor técnico a ferramenta <b>Censura (Blur)</b>, permitindo ao perito desfocar e anonimizar previamente placas de veículos automotores, documentos com dados pessoais e feições de trabalhadores que apareçam acidentalmente no enquadramento da vistoria.
                </p>
            </section>
        </main>

        <!-- Rodapé Oficial com Links -->
        <footer class="pt-6 border-t border-white/10 text-center text-xs text-slate-400 space-y-3">
            <div class="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold">
                <a href="tutorial.php" class="hover:text-white" id="fLinkTutorial">Tutorial & Guia</a>
                <span class="text-slate-600">•</span>
                <a href="suporte.php" class="hover:text-white" id="fLinkSupport">Suporte & FAQ</a>
                <span class="text-slate-600">•</span>
                <a href="privacidade.php" class="text-emerald-400 hover:underline" id="fLinkPrivacy">Privacidade & LGPD</a>
                <span class="text-slate-600">•</span>
                <a href="termos.php" class="hover:text-white" id="fLinkTerms">Termos de Uso</a>
            </div>
            <p id="fCopyright">© <?php echo date('Y'); ?> FotoLaudo — 4U.IA.BR Tecnologia para Engenharia & Infraestrutura.</p>
        </footer>
    </div>

    <script>
        const i18n = {
            pt: {
                headerSubtitle: "Segurança Pericial, Privacidade e Conformidade com a Lei Geral de Proteção de Dados",
                btnBack: "← Voltar ao App",
                p1Title: "1. Arquitetura com Retenção Zero de Dados em Servidores (Zero-Knowledge)",
                p1Desc: "O <b>FotoLaudo</b> foi projetado sob o princípio da privacidade por concepção (<i>Privacy by Design</i>). Todas as fotos capturadas, coordenadas geográficas, anotações de campo e relatórios técnicos em PDF são gerados e processados <b>estritamente no lado do cliente (navegador/smartphone do usuário)</b>. Não há upload de imagens para servidores remotos, garantindo total sigilo corporativo para perícias, auditorias e infraestrutura crítica.",
                p2Title: "2. Permissão de Acesso à Câmera e Sensores",
                p2Desc: "O acesso à câmera e aos sensores de giroscópio, acelerômetro e magnetômetro (bússola) é utilizado unicamente para renderizar a imagem em tempo real, calcular o nível de bolha virtual e o azimute no visor. Nenhum fluxo de vídeo é transmitido ou gravado fora do seu consentimento explícito através do botão de disparo.",
                p3Title: "3. Armazenamento Local (IndexedDB & LocalStorage)",
                p3Desc: "As fotos registradas permanecem guardadas no banco de dados local do seu navegador (IndexedDB) para que você possa revisá-las, exportá-las em lote ou gerar relatórios em PDF sem conexão à internet. Você tem autonomia total para apagar as fotos individualmente ou limpar os dados a qualquer momento diretamente no app.",
                p4Title: "4. Ferramenta de Censura / Blur para Anonimização de Terceiros",
                p4Desc: "Em conformidade com a LGPD (Lei nº 13.709/2018), o FotoLaudo disponibiliza no editor técnico a ferramenta <b>Censura (Blur)</b>, permitindo ao perito desfocar e anonimizar previamente placas de veículos automotores, documentos com dados pessoais e feições de trabalhadores que apareçam acidentalmente no enquadramento da vistoria.",
                fLinkTutorial: "Tutorial & Guia",
                fLinkSupport: "Suporte & FAQ",
                fLinkPrivacy: "Privacidade & LGPD",
                fLinkTerms: "Termos de Uso",
                fCopyright: "© " + new Date().getFullYear() + " FotoLaudo — 4U.IA.BR Tecnologia para Engenharia & Infraestrutura."
            },
            en: {
                headerSubtitle: "Forensic Integrity, Privacy & Full Compliance with Data Protection Standards (GDPR / LGPD)",
                btnBack: "← Back to App",
                p1Title: "1. Zero Server-Side Retention Architecture (Zero-Knowledge Client-Side)",
                p1Desc: "<b>FotoLaudo</b> operates under strict <i>Privacy by Design</i> standards. All captured photos, geospatial coordinates, engineering markups, and PDF inspection reports are rendered and processed <b>exclusively on your local device (browser/smartphone)</b>. No photo data is sent to external servers, providing full confidentiality for forensic inspections and infrastructure audits.",
                p2Title: "2. Camera & Sensor Permissions",
                p2Desc: "Access to the camera video stream, gyroscope, accelerometer, and magnetometer (compass) is requested solely to render the live viewfinder, compute the virtual bubble level, and compute heading azimuth. No raw video feed is recorded without explicit user action on the shutter trigger.",
                p3Title: "3. Local Storage (IndexedDB & LocalStorage)",
                p3Desc: "Inspection photos remain stored within your smartphone browser's local sandbox (IndexedDB) to allow offline review, batch ZIP exports, and PDF generation without cellular connectivity. You retain full control to remove records at any time.",
                p4Title: "4. Blur / Censorship Tool for Third-Party Anonymization",
                p4Desc: "In accordance with GDPR and data privacy laws, FotoLaudo includes a dedicated <b>Blur tool</b> in the technical markup toolbox, enabling engineers to instantly blur and anonymize vehicle license plates, private blueprints, or personnel faces prior to exporting inspection reports.",
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
            document.getElementById('p1Title').textContent = data.p1Title;
            document.getElementById('p1Desc').innerHTML = data.p1Desc;
            document.getElementById('p2Title').textContent = data.p2Title;
            document.getElementById('p2Desc').innerHTML = data.p2Desc;
            document.getElementById('p3Title').textContent = data.p3Title;
            document.getElementById('p3Desc').innerHTML = data.p3Desc;
            document.getElementById('p4Title').textContent = data.p4Title;
            document.getElementById('p4Desc').innerHTML = data.p4Desc;
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

        const savedLang = localStorage.getItem('fotolaudo_lang');
        const navLang = (navigator.language || '').toLowerCase();
        const initialLang = savedLang || (navLang.startsWith('pt') ? 'pt' : 'en');
        setPageLang(initialLang);
    </script>
</body>
</html>
