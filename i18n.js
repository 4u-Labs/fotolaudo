/**
 * FotoLaudo — Internationalization (i18n) Engine
 * Full bilingual support: Portuguese (PT) & English (EN)
 * Auto-detection: if browser is not Portuguese, defaults to English
 */

(function (window) {
    'use strict';

    const translations = {
        pt: {
            app_title: "FotoLaudo — Câmera Técnica & Laudos de Engenharia",
            top_project_title: "Selecionar ou Configurar Obra",
            top_torch_title: "Lanterna / Flash",
            top_grid_title: "Alternar Grade",
            top_level_title: "Nível de Bolha Virtual",
            top_flip_title: "Trocar Câmera",
            top_settings_title: "Configurações",
            top_lang_title: "Mudar Idioma / Switch Language",

            // HUD
            hud_gps_waiting: "Aguardando sinal...",
            hud_alt: "Alt:",
            hud_utm: "Fuso",
            hud_az: "Az:",
            hud_station_default: "Km --+---",
            hud_element_default: "Geral",

            // Torch Toast
            torch_toast_msg: "🔦 <strong>Iluminação para Fotos:</strong><br>Deslize o topo da tela do seu celular para baixo e ative a <strong>Lanterna nativa</strong> do aparelho!",

            // Camera Fallback
            cam_fallback_title: "Acesso à Câmera",
            cam_fallback_desc: "Permita o acesso à câmera para ver o visor técnico em tempo real ou use a câmera nativa do aparelho.",
            cam_fallback_btn_webrtc: "Ativar Câmera WebRTC",
            cam_fallback_btn_native: "Usar Câmera do Sistema",

            // Review Modal
            review_title: "Revisão do Registro Técnico",
            review_btn_discard: "✕ Descartar",
            review_btn_markup: "✏️ Ferramentas de Desenho & Blur (Seta, Texto, Círculo...)",
            review_btn_stamp: "🏷️ Estilo do Carimbo",
            review_data_title: "Dados do Registro",
            review_data_subtitle: "Preencha ou confirme",
            review_field_element: "Elemento / Estrutura",
            review_field_station: "Local / Estaca / Km",
            review_field_status: "Classificação Técnica",
            status_conforme: "Conforme",
            status_observacao: "Atenção",
            status_rnc: "RNC",
            review_field_notes: "Observações Técnicas",
            review_notes_placeholder: "Ex: Armadura conforme projeto estrutural NBR 6118, recobrimento validado em 35mm.",
            review_btn_reapply: "🔄 Recarimbar com Novos Dados",
            review_btn_save: "💾 Salvar Registro na Galeria",
            review_btn_download: "⬇️ Baixar JPG",
            review_btn_share: "📤 WhatsApp",

            // Markup Editor
            markup_title: "Desenho",
            markup_btn_delete: "Excluir",
            markup_btn_undo: "Desfazer",
            markup_btn_clear: "Limpar",
            markup_btn_apply: "✓ Concluir",
            tool_select: "Mover",
            tool_arrow: "Seta",
            tool_dimension: "Cota",
            tool_pen: "Traço",
            tool_blur: "Blur",
            tool_text: "Texto",
            tool_circle: "Círculo",
            tool_rect: "Quadrado",
            markup_label_color: "Cor:",
            size_fine: "Fino",
            size_medium: "Médio",
            size_thick: "Grosso",
            canvas_drag_hint: "👆 ARRASTE O ITEM OU PUXE AS ALÇAS ↔",

            // Dimension Modal
            dim_modal_title: "Cota Técnica / Medição",
            dim_modal_label: "Valor da Medida (com unidade):",
            dim_modal_placeholder: "Ex: 25 cm, 1.50 m, 2 mm",
            dim_modal_shortcuts: "Atalhos Rápidos de Medição:",
            dim_btn_cancel: "Cancelar",
            dim_btn_apply: "✓ Aplicar Cota",

            // Text Modal
            text_modal_title: "Rótulo Técnico de Campo",
            text_modal_label: "Texto do Destaque:",
            text_modal_placeholder: "Ex: FISSURA 0.3mm",
            text_modal_shortcuts: "Atalhos Frequentes de Obras & Infraestrutura:",
            chip_fissura: "Fissura / Trinca",
            chip_armadura: "Armadura Exposta",
            chip_infiltracao: "Infiltração / Umidade",
            chip_desaprumo: "Desaprumo",
            chip_concretagem: "Falha Concretagem",
            chip_medicao: "Medição / Cota",
            chip_rnc: "RNC / Falha Crítica",
            text_btn_cancel: "Cancelar",
            text_btn_apply: "✓ Inserir & Mover",

            // Settings Modal
            settings_title: "Configurações do FotoLaudo",
            cfg_obra_label: "Nome da Obra Ativa",
            cfg_empresa_label: "Contratante / Concessionária",
            cfg_fiscal_label: "Responsável Técnico (Fiscal)",
            cfg_stamp_style_label: "Estilo do Carimbo Técnico",
            opt_concessao: "Rodovias & Concessão (Faixa Preta Alto Contraste)",
            opt_laudo: "Laudo Duplo com Mini-Mapa Geográfico",
            opt_minimalista: "Minimalista de Engenharia (Cantos)",
            cfg_logo_label: "Logotipo da Empresa (Aparece no carimbo)",
            cfg_no_logo: "Sem logo",
            cfg_upload_logo: "Carregar Logo",
            cfg_remove_logo: "Remover",
            cfg_tags_label: "Tags Rápidas (separadas por vírgula)",
            cfg_donate_title: "Apoie o FotoLaudo",
            cfg_donate_badge: "Voluntário",
            cfg_donate_desc: "O FotoLaudo é 100% gratuito e independente. Se este app te ajuda ou economizou seu dia em vistorias, considere fazer uma contribuição voluntária para mantermos o projeto ativo!",
            cfg_donate_btn: "Doar via PayPal",
            cfg_official_links: "Páginas Oficiais:",
            link_tutorial: "Tutorial & Guia",
            link_support: "Suporte & FAQ",
            link_privacy: "Privacidade & LGPD",
            link_terms: "Termos de Uso",
            cfg_btn_save: "Salvar Configurações",

            // Gallery Modal
            gallery_title: "Galeria de Evidências Técnicas",
            gallery_select_all: "Selecionar Todas",
            gallery_deselect: "Desmarcar",
            gallery_empty_title: "Nenhum registro ainda",
            gallery_empty_desc: "Dispare fotos com a câmera técnica para montar seu acervo de laudos.",
            gallery_selected_label: "fotos selecionadas",
            gallery_delete_selected: "Excluir",
            gallery_export_pdf: "Exportar Relatório PDF",

            // PDF Modal
            pdf_modal_title: "Gerar Relatório Fotográfico (PDF)",
            pdf_field_title: "Título do Relatório / Laudo",
            pdf_title_default: "Relatório Fotográfico de Fiscalização de Obra",
            pdf_field_obra: "Obra / Concessionária",
            pdf_field_fiscal: "Engenheiro / Fiscal",
            pdf_field_crea: "CREA / CAU",
            pdf_field_per_page: "Layout da Página",
            pdf_opt_2_photos: "2 Fotos por Página (Laudo Detalhado)",
            pdf_opt_4_photos: "4 Fotos por Página (Vistoria Rápida)",
            pdf_field_obs: "Observações Gerais do Laudo",
            pdf_obs_placeholder: "Vistoria técnica de rotina e acompanhamento das etapas executivas.",
            pdf_btn_cancel: "Cancelar",
            pdf_btn_generate: "Gerar e Baixar PDF",

            // PDF Document
            pdf_doc_header: "RELATÓRIO FOTOGRÁFICO DE FISCALIZAÇÃO",
            pdf_doc_project: "OBRA",
            pdf_doc_inspector: "FISCAL",
            pdf_doc_date: "DATA DE EMISSÃO",
            pdf_doc_page: "Página",
            pdf_doc_record: "REGISTRO FOTOGRÁFICO",
            pdf_doc_element: "Elemento:",
            pdf_doc_station: "Local/Estaca:",
            pdf_doc_status: "Status:",
            pdf_doc_telemetry: "Telemetria de Campo:",
            pdf_doc_footer: "Relatório emitido via FotoLaudo — 4U.IA.BR Tecnologia para Engenharia",

            // Default Quick Tags
            default_tags: ['Cabine Manual', 'Cabine Automática', 'Pavimento Rígido', 'Armadura', 'Barreira New Jersey', 'Drenagem', 'Subestação', 'Cobertura']
        },
        en: {
            app_title: "FotoLaudo — Technical Camera & Inspection Reports",
            top_project_title: "Select or Configure Project",
            top_torch_title: "Flashlight / Torch",
            top_grid_title: "Toggle Grid",
            top_level_title: "Virtual Bubble Level",
            top_flip_title: "Flip Camera",
            top_settings_title: "Settings",
            top_lang_title: "Switch Language / Mudar Idioma",

            // HUD
            hud_gps_waiting: "Waiting for GPS...",
            hud_alt: "Alt:",
            hud_utm: "Zone",
            hud_az: "Az:",
            hud_station_default: "Km --+---",
            hud_element_default: "General",

            // Torch Toast
            torch_toast_msg: "🔦 <strong>Photo Lighting:</strong><br>Swipe down from the top of your screen and turn on your device's <strong>native Flashlight</strong>!",

            // Camera Fallback
            cam_fallback_title: "Camera Access",
            cam_fallback_desc: "Allow camera access to view the technical viewfinder live or use your device's native camera.",
            cam_fallback_btn_webrtc: "Enable WebRTC Camera",
            cam_fallback_btn_native: "Use System Camera",

            // Review Modal
            review_title: "Technical Record Review",
            review_btn_discard: "✕ Discard",
            review_btn_markup: "✏️ Drawing Tools & Blur (Arrow, Text, Circle...)",
            review_btn_stamp: "🏷️ Stamp Style",
            review_data_title: "Record Data",
            review_data_subtitle: "Fill or confirm",
            review_field_element: "Element / Structure",
            review_field_station: "Location / Station / MP",
            review_field_status: "Technical Classification",
            status_conforme: "Compliant",
            status_observacao: "Warning",
            status_rnc: "NCR",
            review_field_notes: "Technical Remarks",
            review_notes_placeholder: "E.g.: Rebar according to structural drawings, cover verified at 35mm.",
            review_btn_reapply: "🔄 Re-stamp with New Data",
            review_btn_save: "💾 Save Record to Gallery",
            review_btn_download: "⬇️ Download JPG",
            review_btn_share: "📤 WhatsApp",

            // Markup Editor
            markup_title: "Drawing",
            markup_btn_delete: "Delete",
            markup_btn_undo: "Undo",
            markup_btn_clear: "Clear",
            markup_btn_apply: "✓ Done",
            tool_select: "Move",
            tool_arrow: "Arrow",
            tool_dimension: "Dimension",
            tool_pen: "Pen",
            tool_blur: "Blur",
            tool_text: "Text",
            tool_circle: "Circle",
            tool_rect: "Square",
            markup_label_color: "Color:",
            size_fine: "Fine",
            size_medium: "Medium",
            size_thick: "Thick",
            canvas_drag_hint: "👆 DRAG ITEM OR PULL HANDLES ↔",

            // Dimension Modal
            dim_modal_title: "Technical Dimension / Measurement",
            dim_modal_label: "Measurement Value (with unit):",
            dim_modal_placeholder: "E.g.: 25 cm, 1.50 m, 2 mm",
            dim_modal_shortcuts: "Quick Measurement Shortcuts:",
            dim_btn_cancel: "Cancel",
            dim_btn_apply: "✓ Apply Dimension",

            // Text Modal
            text_modal_title: "Field Technical Label",
            text_modal_label: "Highlight Text:",
            text_modal_placeholder: "E.g.: CRACK 0.3mm",
            text_modal_shortcuts: "Common Engineering Shortcuts:",
            chip_fissura: "Crack / Fissure",
            chip_armadura: "Exposed Rebar",
            chip_infiltracao: "Infiltration / Moisture",
            chip_desaprumo: "Out of Plumb",
            chip_concretagem: "Honeycomb / Void",
            chip_medicao: "Measurement",
            chip_rnc: "Critical Defect / NCR",
            text_btn_cancel: "Cancel",
            text_btn_apply: "✓ Insert & Move",

            // Settings Modal
            settings_title: "FotoLaudo Settings",
            cfg_obra_label: "Active Project Name",
            cfg_empresa_label: "Client / Concessionaire",
            cfg_fiscal_label: "Technical Lead (Inspector)",
            cfg_stamp_style_label: "Technical Stamp Style",
            opt_concessao: "Highways & Concession (High Contrast Black Banner)",
            opt_laudo: "Dual Banner with Geographic Mini-Map",
            opt_minimalista: "Engineering Minimalist (Corners)",
            cfg_logo_label: "Company Logo (Appears on stamp)",
            cfg_no_logo: "No logo",
            cfg_upload_logo: "Upload Logo",
            cfg_remove_logo: "Remove",
            cfg_tags_label: "Quick Tags (comma separated)",
            cfg_donate_title: "Support FotoLaudo",
            cfg_donate_badge: "Voluntary",
            cfg_donate_desc: "FotoLaudo is 100% free and independent. If this tool helps your daily engineering inspections, consider making a voluntary donation to support ongoing development!",
            cfg_donate_btn: "Donate with PayPal",
            cfg_official_links: "Official Pages:",
            link_tutorial: "Tutorial & Guide",
            link_support: "Support & FAQ",
            link_privacy: "Privacy & GDPR",
            link_terms: "Terms of Use",
            cfg_btn_save: "Save Settings",

            // Gallery Modal
            gallery_title: "Technical Evidence Gallery",
            gallery_select_all: "Select All",
            gallery_deselect: "Deselect",
            gallery_empty_title: "No records yet",
            gallery_empty_desc: "Capture photos with the technical camera to build your inspection repository.",
            gallery_selected_label: "photos selected",
            gallery_delete_selected: "Delete",
            gallery_export_pdf: "Export PDF Report",

            // PDF Modal
            pdf_modal_title: "Generate Photographic Report (PDF)",
            pdf_field_title: "Report / Inspection Title",
            pdf_title_default: "Photographic Inspection Report",
            pdf_field_obra: "Project / Concessionaire",
            pdf_field_fiscal: "Engineer / Inspector",
            pdf_field_crea: "PE / Reg. Number",
            pdf_field_per_page: "Page Layout",
            pdf_opt_2_photos: "2 Photos per Page (Detailed Report)",
            pdf_opt_4_photos: "4 Photos per Page (Quick Survey)",
            pdf_field_obs: "General Report Remarks",
            pdf_obs_placeholder: "Routine technical inspection and tracking of construction stages.",
            pdf_btn_cancel: "Cancel",
            pdf_btn_generate: "Generate & Download PDF",

            // PDF Document
            pdf_doc_header: "PHOTOGRAPHIC INSPECTION REPORT",
            pdf_doc_project: "PROJECT",
            pdf_doc_inspector: "INSPECTOR",
            pdf_doc_date: "DATE OF ISSUE",
            pdf_doc_page: "Page",
            pdf_doc_record: "PHOTOGRAPHIC RECORD",
            pdf_doc_element: "Element:",
            pdf_doc_station: "Location/Station:",
            pdf_doc_status: "Status:",
            pdf_doc_telemetry: "Field Telemetry:",
            pdf_doc_footer: "Report issued via FotoLaudo — 4U.IA.BR Engineering Technology",

            // Default Quick Tags
            default_tags: ['Manual Booth', 'Automatic Booth', 'Rigid Pavement', 'Rebar / Structure', 'Jersey Barrier', 'Drainage', 'Substation', 'Canopy']
        }
    };

    let currentLang = 'pt';

    function detectInitialLang() {
        const saved = localStorage.getItem('fotolaudo_lang');
        if (saved === 'pt' || saved === 'en') {
            return saved;
        }
        // Se o navegador do usuário estiver em qualquer idioma DIFERENTE de português, abre em inglês!
        const nav = (navigator.language || (navigator.languages && navigator.languages[0]) || 'pt').toLowerCase();
        if (!nav.startsWith('pt')) {
            return 'en';
        }
        return 'pt';
    }

    function t(key, fallback = '') {
        const dict = translations[currentLang] || translations.pt;
        return dict[key] !== undefined ? dict[key] : (translations.pt[key] || fallback || key);
    }

    function applyTranslations() {
        document.documentElement.lang = currentLang === 'en' ? 'en' : 'pt-BR';

        // Atualizar textos com data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            const trans = t(key);
            if (trans) {
                el.innerHTML = trans;
            }
        });

        // Atualizar títulos/tooltips com data-i18n-title
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.dataset.i18nTitle;
            const trans = t(key);
            if (trans) {
                el.title = trans;
            }
        });

        // Atualizar placeholders com data-i18n-placeholder
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.dataset.i18nPlaceholder;
            const trans = t(key);
            if (trans) {
                el.placeholder = trans;
            }
        });

        // Atualizar botões de alternância PT / EN
        const btnPt = document.getElementById('btnLangPt');
        const btnEn = document.getElementById('btnLangEn');

        if (btnPt && btnEn) {
            if (currentLang === 'pt') {
                btnPt.className = 'lang-toggle-btn px-1.5 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer bg-amber-500 text-slate-950 shadow-sm';
                btnEn.className = 'lang-toggle-btn px-1.5 py-0.5 rounded-full text-[10px] font-bold text-slate-400 hover:text-white transition-all cursor-pointer';
            } else {
                btnEn.className = 'lang-toggle-btn px-1.5 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer bg-amber-500 text-slate-950 shadow-sm';
                btnPt.className = 'lang-toggle-btn px-1.5 py-0.5 rounded-full text-[10px] font-bold text-slate-400 hover:text-white transition-all cursor-pointer';
            }
        }
    }

    function setLanguage(lang) {
        if (lang !== 'pt' && lang !== 'en') lang = 'pt';
        currentLang = lang;
        try {
            localStorage.setItem('fotolaudo_lang', lang);
        } catch (e) {}
        applyTranslations();
        // Notificar listeners se houver (para atualizar tags rápidas e carimbo no app.js)
        window.dispatchEvent(new CustomEvent('fotolaudo:langchange', { detail: { lang: currentLang } }));
    }

    function initI18n() {
        currentLang = detectInitialLang();
        applyTranslations();

        document.getElementById('btnLangPt')?.addEventListener('click', () => setLanguage('pt'));
        document.getElementById('btnLangEn')?.addEventListener('click', () => setLanguage('en'));
    }

    window.FotoLaudoI18n = {
        t,
        setLanguage,
        getCurrentLang: () => currentLang,
        initI18n,
        translations
    };

})(window);
