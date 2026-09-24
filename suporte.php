<?php
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
$v = time();
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Suporte Técnico & FAQ — FotoLaudo</title>
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
                <a href="index.php" class="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-xl hover:scale-105 transition-all">
                    💬
                </a>
                <div>
                    <h1 class="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                        <span>FotoLaudo</span>
                        <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">FAQ</span>
                    </h1>
                    <p class="text-xs text-slate-400" id="headerSubtitle">Central de Ajuda, Suporte Técnico & Perguntas Frequentes</p>
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

        <!-- Perguntas Frequentes -->
        <main class="space-y-4">
            <div class="bg-slate-900/70 border border-white/10 rounded-2xl p-5 sm:p-6 space-y-2">
                <h2 class="text-sm sm:text-base font-bold text-amber-400" id="faq1Q">❓ O app funciona offline sem sinal de internet na obra?</h2>
                <p class="text-xs sm:text-sm text-slate-300 leading-relaxed" id="faq1A">
                    <b>Sim, 100%!</b> O FotoLaudo foi projetado especificamente para rodovias, túneis e obras remotas. Os sensores de GPS do celular, a conversão para Fuso UTM, o carimbo na foto, a edição de anotações e a geração de PDFs são processados matematicamente no próprio dispositivo via Service Worker e IndexedDB.
                </p>
            </div>

            <div class="bg-slate-900/70 border border-white/10 rounded-2xl p-5 sm:p-6 space-y-2">
                <h2 class="text-sm sm:text-base font-bold text-amber-400" id="faq2Q">❓ Como o GPS e as coordenadas UTM são calculados?</h2>
                <p class="text-xs sm:text-sm text-slate-300 leading-relaxed" id="faq2A">
                    O aplicativo utiliza a API Geolocation com opção de <i>highAccuracy</i> ativada, obtendo dados diretamente dos satélites GPS/GLONASS/Galileo do smartphone. As coordenadas geodésicas (Latitude/Longitude WGS84) são projetadas em tempo real na projeção cartográfica Transversa Universal de Mercator (UTM) com identificação do Fuso (ex: Fuso 22S / 23S) e coordenadas métricas Easting e Northing.
                </p>
            </div>

            <div class="bg-slate-900/70 border border-white/10 rounded-2xl p-5 sm:p-6 space-y-2">
                <h2 class="text-sm sm:text-base font-bold text-amber-400" id="faq3Q">❓ Por que o botão de flash me orienta a ligar a lanterna nativa?</h2>
                <p class="text-xs sm:text-sm text-slate-300 leading-relaxed" id="faq3A">
                    Por restrições de segurança estritas dos sistemas operacionais móveis (Google Android e Apple iOS), navegadores web muitas vezes impedem o acionamento elétrico contínuo do LED da lanterna. Para garantir 100% de confiabilidade e evitar que você fique no escuro em inspeções noturnas, o app instrui a acionar a lanterna nativa na barra superior do celular, mantendo o ambiente iluminado sem falhas.
                </p>
            </div>

            <div class="bg-slate-900/70 border border-white/10 rounded-2xl p-5 sm:p-6 space-y-2">
                <h2 class="text-sm sm:text-base font-bold text-amber-400" id="faq4Q">❓ As fotos tiradas são salvas na nuvem ou enviadas a servidores?</h2>
                <p class="text-xs sm:text-sm text-slate-300 leading-relaxed" id="faq4A">
                    <b>Não!</b> Para total conformidade pericial e proteção contra vazamentos de dados de infraestrutura crítica, as fotos e dados de fiscalização ficam armazenados <b>exclusivamente no banco de dados local do seu navegador (IndexedDB)</b>. Nada é enviado para servidores externos.
                </p>
            </div>

            <!-- Contato Direto -->
            <div class="bg-slate-900/70 border border-cyan-500/30 rounded-2xl p-5 sm:p-6 space-y-2">
                <h2 class="text-sm sm:text-base font-bold text-cyan-400" id="contactTitle">✉️ Precisa de Suporte Técnico ou Customização Corporativa?</h2>
                <p class="text-xs sm:text-sm text-slate-300 leading-relaxed" id="contactDesc">
                    Desenvolvemos soluções e carimbos personalizados para construtoras, concessionárias de rodovias e órgãos de fiscalização:
                </p>
                <div class="pt-2 text-xs font-mono text-cyan-300">
                    E-mail: <a href="mailto:contato@4u.ia.br" class="underline font-bold text-white hover:text-cyan-300">contato@4u.ia.br</a>
                </div>
            </div>

            <!-- Apoio PayPal -->
            <section class="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div class="space-y-1 text-center sm:text-left">
                    <h3 class="text-sm font-bold text-amber-400 flex items-center justify-center sm:justify-start gap-1.5" id="donateTitle">
                        <span>☕</span> <span>Apoie o Projeto FotoLaudo</span>
                    </h3>
                    <p class="text-xs text-slate-300 max-w-xl leading-relaxed" id="donateDesc">
                        O FotoLaudo é 100% gratuito e independente. Se este app te ajuda no dia a dia, considere fazer uma doação voluntária para mantermos o projeto ativo e em evolução!
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
                <a href="tutorial.php" class="hover:text-white" id="fLinkTutorial">Tutorial & Guia</a>
                <span class="text-slate-600">•</span>
                <a href="suporte.php" class="text-cyan-400 hover:underline" id="fLinkSupport">Suporte & FAQ</a>
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
                headerSubtitle: "Central de Ajuda, Suporte Técnico & Perguntas Frequentes",
                btnBack: "← Voltar ao App",
                faq1Q: "❓ O app funciona offline sem sinal de internet na obra?",
                faq1A: "<b>Sim, 100%!</b> O FotoLaudo foi projetado especificamente para rodovias, túneis e obras remotas. Os sensores de GPS do celular, a conversão para Fuso UTM, o carimbo na foto, a edição de anotações e a geração de PDFs são processados matematicamente no próprio dispositivo via Service Worker e IndexedDB.",
                faq2Q: "❓ Como o GPS e as coordenadas UTM são calculados?",
                faq2A: "O aplicativo utiliza a API Geolocation com opção de <i>highAccuracy</i> ativada, obtendo dados diretamente dos satélites GPS/GLONASS/Galileo do smartphone. As coordenadas geodésicas (Latitude/Longitude WGS84) são projetadas em tempo real na projeção cartográfica Transversa Universal de Mercator (UTM) com identificação do Fuso (ex: Fuso 22S / 23S) e coordenadas métricas Easting e Northing.",
                faq3Q: "❓ Por que o botão de flash me orienta a ligar a lanterna nativa?",
                faq3A: "Por restrições de segurança estritas dos sistemas operacionais móveis (Google Android e Apple iOS), navegadores web muitas vezes impedem o acionamento elétrico contínuo do LED da lanterna. Para garantir 100% de confiabilidade e evitar que você fique no escuro em inspeções noturnas, o app instrui a acionar a lanterna nativa na barra superior do celular, mantendo o ambiente iluminado sem falhas.",
                faq4Q: "❓ As fotos tiradas são salvas na nuvem ou enviadas a servidores?",
                faq4A: "<b>Não!</b> Para total conformidade pericial e proteção contra vazamentos de dados de infraestrutura crítica, as fotos e dados de fiscalização ficam armazenados <b>exclusivamente no banco de dados local do seu navegador (IndexedDB)</b>. Nada é enviado para servidores externos.",
                contactTitle: "✉️ Precisa de Suporte Técnico ou Customização Corporativa?",
                contactDesc: "Desenvolvemos soluções e carimbos personalizados para construtoras, concessionárias de rodovias e órgãos de fiscalização:",
                donateTitle: "<span>☕</span> <span>Apoie o Projeto FotoLaudo</span>",
                donateDesc: "O FotoLaudo é 100% gratuito e independente. Se este app te ajuda no dia a dia, considere fazer uma doação voluntária para mantermos o projeto ativo e em evolução!",
                donateBtn: "Doar via PayPal",
                fLinkTutorial: "Tutorial & Guia",
                fLinkSupport: "Suporte & FAQ",
                fLinkPrivacy: "Privacidade & LGPD",
                fLinkTerms: "Termos de Uso",
                fCopyright: "© " + new Date().getFullYear() + " FotoLaudo — 4U.IA.BR Tecnologia para Engenharia & Infraestrutura."
            },
            en: {
                headerSubtitle: "Help Center, Technical Support & Frequently Asked Questions",
                btnBack: "← Back to App",
                faq1Q: "❓ Does the app work offline without internet on the job site?",
                faq1A: "<b>Yes, 100%!</b> FotoLaudo was built specifically for highways, tunnels, and remote job sites. Device GPS sensors, UTM Zone conversion, photo stamping, technical markups, and PDF generation run entirely client-side using Service Workers and IndexedDB.",
                faq2Q: "❓ How are GPS and UTM coordinates computed?",
                faq2A: "The app leverages the browser Geolocation API with high-accuracy GPS/GLONASS/Galileo satellite acquisition. Geodetic coordinates (WGS84 Lat/Lon) are converted on the fly to Universal Transverse Mercator (UTM) coordinates with zone designation (e.g. Zone 22S / 23S) and metric Easting and Northing values.",
                faq3Q: "❓ Why does the flash button prompt to turn on the native flashlight?",
                faq3A: "Due to strict mobile OS security policies (Android and iOS Safari), web browsers often restrict persistent direct hardware control over the camera LED torch. To provide 100% reliability and prevent inspectors from working in the dark, the app clearly advises toggling the device's native flashlight from the quick settings bar.",
                faq4Q: "❓ Are inspection photos stored in the cloud or sent to external servers?",
                faq4A: "<b>No!</b> For complete forensic integrity and defense of critical infrastructure data, photos and inspection records are stored <b>strictly within your local browser database (IndexedDB)</b> on your smartphone. Nothing is uploaded to remote servers.",
                contactTitle: "✉️ Need Technical Support or Enterprise Customization?",
                contactDesc: "We craft custom inspection stamping and workflow integration for construction firms, highway operators, and public audit agencies:",
                donateTitle: "<span>☕</span> <span>Support the FotoLaudo Project</span>",
                donateDesc: "FotoLaudo is 100% free and independent. If this tool helps your daily engineering tasks, please consider making a voluntary donation to support ongoing development!",
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
            document.getElementById('faq1Q').textContent = data.faq1Q;
            document.getElementById('faq1A').innerHTML = data.faq1A;
            document.getElementById('faq2Q').textContent = data.faq2Q;
            document.getElementById('faq2A').innerHTML = data.faq2A;
            document.getElementById('faq3Q').textContent = data.faq3Q;
            document.getElementById('faq3A').innerHTML = data.faq3A;
            document.getElementById('faq4Q').textContent = data.faq4Q;
            document.getElementById('faq4A').innerHTML = data.faq4A;
            document.getElementById('contactTitle').textContent = data.contactTitle;
            document.getElementById('contactDesc').textContent = data.contactDesc;
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

        const savedLang = localStorage.getItem('fotolaudo_lang');
        const navLang = (navigator.language || '').toLowerCase();
        const initialLang = savedLang || (navLang.startsWith('pt') ? 'pt' : 'en');
        setPageLang(initialLang);
    </script>
</body>
</html>
