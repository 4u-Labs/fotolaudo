<?php
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
$v = time();
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Termos de Uso — FotoLaudo</title>
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
                <a href="index.php" class="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xl hover:scale-105 transition-all">
                    📜
                </a>
                <div>
                    <h1 class="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                        <span>FotoLaudo</span>
                        <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">TERMOS</span>
                    </h1>
                    <p class="text-xs text-slate-400" id="headerSubtitle">Termos e Condições Gerais de Uso da Ferramenta de Fiscalização</p>
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

        <!-- Conteúdo dos Termos -->
        <main class="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <section class="bg-slate-900/70 border border-white/10 rounded-2xl p-5 sm:p-6 space-y-2">
                <h2 class="text-sm sm:text-base font-bold text-amber-400" id="t1Title">1. Finalidade do Software</h2>
                <p id="t1Desc">
                    O <b>FotoLaudo</b> é uma aplicação web progressiva (PWA) desenvolvida para auxiliar engenheiros, peritos, arquitetos e técnicos na captura fotográfica georreferenciada, aposição de carimbos técnicos e emissão de relatórios fotográficos de fiscalização e inspeção predial/rodoviária.
                </p>
            </section>

            <section class="bg-slate-900/70 border border-white/10 rounded-2xl p-5 sm:p-6 space-y-2">
                <h2 class="text-sm sm:text-base font-bold text-amber-400" id="t2Title">2. Responsabilidade Técnica Profissional</h2>
                <p id="t2Desc">
                    O usuário reconhece que as anotações, medições (cotas), descrições de não conformidade e classificações técnicas atribuídas aos registros são de exclusiva responsabilidade do profissional habilitado emitente (CREA / CAU). O software atua como ferramenta instrumental de registro e não substitui a perícia, Anotação de Responsabilidade Técnica (ART/RRT) ou parecer do engenheiro responsável.
                </p>
            </section>

            <section class="bg-slate-900/70 border border-white/10 rounded-2xl p-5 sm:p-6 space-y-2">
                <h2 class="text-sm sm:text-base font-bold text-amber-400" id="t3Title">3. Precisão dos Sensores de Hardware</h2>
                <p id="t3Desc">
                    A exatidão das coordenadas geodésicas, fuso UTM, azimute de bússola e nível de bolha virtual depende intrinsecamente da calibração do hardware do smartphone e das condições ambientais de recepção dos sinais de satélite (GPS) no momento da captura. O aplicativo exibe a margem de erro estimada (ex: ±3m) informada pelo sistema operacional.
                </p>
            </section>

            <section class="bg-slate-900/70 border border-white/10 rounded-2xl p-5 sm:p-6 space-y-2">
                <h2 class="text-sm sm:text-base font-bold text-amber-400" id="t4Title">4. Gratuidade e Contribuição Voluntária</h2>
                <p id="t4Desc">
                    O FotoLaudo é disponibilizado gratuitamente para peritos e engenheiros de campo. Os usuários que desejarem apoiar os custos de infraestrutura e evolução técnica do projeto podem realizar doações voluntárias espontâneas através do canal oficial via PayPal.
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
                <a href="privacidade.php" class="hover:text-white" id="fLinkPrivacy">Privacidade & LGPD</a>
                <span class="text-slate-600">•</span>
                <a href="termos.php" class="text-amber-400 hover:underline" id="fLinkTerms">Termos de Uso</a>
            </div>
            <p id="fCopyright">© <?php echo date('Y'); ?> FotoLaudo — 4U.IA.BR Tecnologia para Engenharia & Infraestrutura.</p>
        </footer>
    </div>

    <script>
        const i18n = {
            pt: {
                headerSubtitle: "Termos e Condições Gerais de Uso da Ferramenta de Fiscalização",
                btnBack: "← Voltar ao App",
                t1Title: "1. Finalidade do Software",
                t1Desc: "O <b>FotoLaudo</b> é uma aplicação web progressiva (PWA) desenvolvida para auxiliar engenheiros, peritos, arquitetos e técnicos na captura fotográfica georreferenciada, aposição de carimbos técnicos e emissão de relatórios fotográficos de fiscalização e inspeção predial/rodoviária.",
                t2Title: "2. Responsabilidade Técnica Profissional",
                t2Desc: "O usuário reconhece que as anotações, medições (cotas), descrições de não conformidade e classificações técnicas atribuídas aos registros são de exclusiva responsabilidade do profissional habilitado emitente (CREA / CAU). O software atua como ferramenta instrumental de registro e não substitui a perícia, Anotação de Responsabilidade Técnica (ART/RRT) ou parecer do engenheiro responsável.",
                t3Title: "3. Precisão dos Sensores de Hardware",
                t3Desc: "A exatidão das coordenadas geodésicas, fuso UTM, azimute de bússola e nível de bolha virtual depende intrinsecamente da calibração do hardware do smartphone e das condições ambientais de recepção dos sinais de satélite (GPS) no momento da captura. O aplicativo exibe a margem de erro estimada (ex: ±3m) informada pelo sistema operacional.",
                t4Title: "4. Gratuidade e Contribuição Voluntária",
                t4Desc: "O FotoLaudo é disponibilizado gratuitamente para peritos e engenheiros de campo. Os usuários que desejarem apoiar os custos de infraestrutura e evolução técnica do projeto podem realizar doações voluntárias espontâneas através do canal oficial via PayPal.",
                fLinkTutorial: "Tutorial & Guia",
                fLinkSupport: "Suporte & FAQ",
                fLinkPrivacy: "Privacidade & LGPD",
                fLinkTerms: "Termos de Uso",
                fCopyright: "© " + new Date().getFullYear() + " FotoLaudo — 4U.IA.BR Tecnologia para Engenharia & Infraestrutura."
            },
            en: {
                headerSubtitle: "Terms & Conditions of Technical Inspection Platform",
                btnBack: "← Back to App",
                t1Title: "1. Software Purpose",
                t1Desc: "<b>FotoLaudo</b> is a Progressive Web App (PWA) engineered to assist civil engineers, forensic inspectors, architects, and field surveyors with georeferenced photographic capture, technical canvas stamping, and automated A4 inspection report authoring.",
                t2Title: "2. Professional Engineering Responsibility",
                t2Desc: "The user acknowledges that technical markups, dimension measurements, defect classifications, and notes are the sole professional responsibility of the licensed engineer/inspector. FotoLaudo functions as an instrumental logging tool and does not substitute formal engineering responsibility (ART/RRT) or certified expert testimony.",
                t3Title: "3. Device Sensor Precision",
                t3Desc: "The accuracy of satellite positioning, UTM zone projections, magnetic azimuth, and virtual bubble level relies on the smartphone internal sensor calibration and line-of-sight satellite reception conditions during shutter trigger.",
                t4Title: "4. Free Access & Voluntary Sponsorship",
                t4Desc: "FotoLaudo is provided free of charge to field professionals. Users who wish to support ongoing cloud infrastructure, updates, and engineering features may make voluntary contributions via our official PayPal channel.",
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
            document.getElementById('t1Title').textContent = data.t1Title;
            document.getElementById('t1Desc').innerHTML = data.t1Desc;
            document.getElementById('t2Title').textContent = data.t2Title;
            document.getElementById('t2Desc').innerHTML = data.t2Desc;
            document.getElementById('t3Title').textContent = data.t3Title;
            document.getElementById('t3Desc').innerHTML = data.t3Desc;
            document.getElementById('t4Title').textContent = data.t4Title;
            document.getElementById('t4Desc').innerHTML = data.t4Desc;
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
