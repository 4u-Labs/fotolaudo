# 📷 FotoLaudo — Câmera Técnica & Relatórios Fotográficos de Engenharia

<div align="center">

[![Demonstração Online](https://img.shields.io/badge/🚀_Acessar-fotolaudo_Online-amber?style=for-the-badge&logo=googlechrome&logoColor=black)](https://4u.ia.br/app/fotolaudo/)
[![PWA](https://img.shields.io/badge/PWA-Pronto_para_Instalar-blue?style=for-the-badge&logo=pwa&logoColor=white)](https://4u.ia.br/app/fotolaudo/)
[![Bilingual](https://img.shields.io/badge/Language-PT--BR_%7C_EN-emerald?style=for-the-badge)](https://4u.ia.br/app/fotolaudo/)
[![Zero-Server](https://img.shields.io/badge/Privacidade-100%25_Local_(Edge)-indigo?style=for-the-badge&logo=shield)](https://4u.ia.br/app/fotolaudo/)

<p align="center">
  <b>Aplicativo progressivo (PWA) de câmera técnica, telemetria pericial em tempo real e geração automatizada de relatórios fotográficos de fiscalização de obras e infraestrutura.</b>
</p>

</div>

---

## 🏗️ Visão Geral

O **FotoLaudo** é uma solução profissional desenvolvida para engenheiros civis, fiscais de obras, peritos judiciais, arquitetos e concessionárias de infraestrutura (rodovias, ferrovias, saneamento e energia). 

O sistema transforma qualquer smartphone ou tablet em uma **estação fotogramétrica de campo**, carimbando dados geotécnicos e telemetria imutável diretamente na imagem e compilando evidências técnicas em relatórios PDF padronizados no padrão ABNT com apenas um toque.

---

## ⚡ Principais Funcionalidades

### 1. 📡 Telemetria de Campo em Tempo Real
- **Coordenadas Geográficas:** Latitude e Longitude (WGS84) com alta precisão e indicação de precisão em metros.
- **Projeção Cartográfica UTM Automática:** Cálculo matemático instantâneo do fuso UTM, hemisfério, coordenadas Este (*Easting*) e Norte (*Northing*).
- **Altitude Topográfica:** Altitude ortométrica em relação ao nível do mar (m).
- **Azimute & Bússola Digital:** Orientação angular precisa do vetor de visada fotográfica (0° a 360°).
- **Estaqueamento & Quilometragem:** Rastreamento contínuo de estacas e km para obras lineares e rodovias.

### 2. 🫧 Nível de Bolha Virtual 3D & Grade de Enquadramento
- **Inclinômetro com Giroscópio:** Indicador visual de prumo e nivelamento nos eixos *Pitch* e *Roll*, garantindo fotos perfeitamente alinhadas para laudos.
- **Grade Técnica de Composição:** Linhas guia de proporção áurea e terços para enquadramento técnico.

### 3. 🏷️ Carimbo Pericial de Alto Contraste
- **Modelos de Carimbo:**
  - *Rodovias & Concessão:* Faixa preta com tipografia de alto contraste para leitura rápida em auditorias.
  - *Laudo Duplo com Mini-Mapa Geográfico:* Painel duplo contendo dados da obra e radar geográfico.
  - *Minimalista de Engenharia:* Carimbo discreto nos cantos para fotos de detalhes.
- **Logotipo Corporativo:** Inclusão automática do brasão ou logotipo da empresa/concessionária no carimbo e nos relatórios.

### 4. ✏️ Editor de Anotações Técnicas & Privatização (Blur)
- **Ferramenta "Mover" (`select`):** Arraste suave, seleção individual e exclusão de itens desenhados.
- **Alças de Redimensionamento Estilo CAD:**
  - 4 alças quadradas nos cantos para aumento/diminuição proporcional.
  - Alças circulares dedicadas para **ponta (ciano)** e **base (âmbar)** de setas e cotas, permitindo mira em 360° e ajuste de extensão milimétrico.
- **Ferramenta de Cota Técnica CAD (`<--->`):**
  - Linhas limitadoras perpendiculares (*witness lines*), setas invertidas e valor numérico destacado.
  - **12 Atalhos Rápidos de Medição com 1 Toque:** `0.5 mm`, `1.0 mm`, `2.0 mm`, `5.0 mm` (fissuras/trincas), `10 cm`, `15 cm`, `20 cm`, `25 cm`, `50 cm` (armaduras/vãos) e `1.0 m`, `1.5 m`, `2.0 m` (distâncias/desaprumos).
- **Ferramenta Blur (Desfoque de Privacidade):** Censura rápida de placas de veículos, documentos e rostos para conformidade rigorosa com a LGPD e GDPR.
- **Textos Técnicos Rápidos:** Inserção ágil de rótulos periciais (`Fissura / Trinca`, `Armadura Exposta`, `Infiltração / Umidade`, `Desaprumo`, `Falha Concretagem`, `Medição / Cota`, `RNC / Falha Crítica`).

### 5. 📁 Acervo & Galeria Offline (IndexedDB)
- Armazenamento 100% no dispositivo via IndexedDB local.
- Funciona em campo remoto, túneis e rodovias **sem necessidade de conexão com a internet**.
- Gestão de lotes: seleção múltipla, exclusão em massa e download avulso em alta definição.

### 6. 📄 Emissão Automatizada de Laudos em PDF
- Compilação instantânea no navegador com **jsPDF**.
- Layout A4 estruturado com cabeçalho de engenharia, dados do fiscal/CREA, data/hora e numeração de pranchas.
- Modos de visualização: **2 fotos por página** (detalhado com tabela técnica completa) ou **4 fotos por página** (vistoria rápida).
- Inclusão automática do logotipo corporativo no cabeçalho do documento.

### 7. 🌐 Internacionalização Dinâmica (Bilingual PT / EN)
- **Detecção Inteligente:** Se o navegador do usuário estiver em qualquer idioma diferente do português, a interface abre automaticamente em **Inglês (`en`)**.
- **Alternador Rápido `[PT | EN]`:** No topo da tela, permitindo alternância instantânea de interface, modais, tooltips e laudos PDF sem recarregar a página.

---

## 🔒 Arquitetura & Privacidade (100% Client-Side)

- **Zero-Server Storage:** Nenhuma foto, vídeo ou coordenada é transmitida para bancos de dados em nuvem de terceiros.
- **Processamento Edge:** Todas as operações de câmera, renderização em canvas, blur pericial e compilação de PDFs ocorrem exclusivamente na CPU/GPU do aparelho do usuário.
- **Conformidade Legal:** Desenvolvido em conformidade com as diretrizes da **LGPD (Lei nº 13.709/2018)** e **GDPR**.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
| :--- | :--- |
| **Interface & PWA** | HTML5, Tailwind CSS, Service Workers (Cache Offline v2.3) |
| **Lógica & Telemetria** | JavaScript ES6+ Vanilla (Sem frameworks pesados) |
| **Canvas & Imagem** | HTML5 Canvas 2D API, WebRTC MediaStream |
| **Áudio Sintético** | Web Audio API (Som mecânico de obturador sem arquivos externos) |
| **Banco Local** | IndexedDB Nativo |
| **Relatórios Técnicos** | jsPDF UMD |
| **Servidor / Hosting** | PHP 8.3 / Apache / Hostinger Edge CDN |

---

## ☕ Apoie o Projeto

O **FotoLaudo** é um projeto independente disponibilizado gratuitamente para a comunidade técnica. Se esta ferramenta otimizou sua rotina pericial ou de fiscalização, você pode apoiar sua manutenção contínua:

[![Doar via PayPal](https://img.shields.io/badge/Doar_via_PayPal-0070ba?style=for-the-badge&logo=paypal&logoColor=white)](https://www.paypal.com/ncp/payment/L7YRCS984T33N)

---

## 📄 Licença

Distribuído sob a licença proprietária de uso livre para fins profissionais e educacionais por **4U.IA.BR**. Consulte os [Termos de Uso](https://4u.ia.br/app/fotolaudo/termos.php) e a [Política de Privacidade](https://4u.ia.br/app/fotolaudo/privacidade.php) para mais detalhes.
