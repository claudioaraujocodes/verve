# Verve — Botânica Urbana, Curadoria & Paisagismo

> Plataforma web full-stack desenvolvida para a marca de cuidados botânicos, curadoria artística e paisagismo **Verve**, com atuação em ambientes urbanos (Salvador, Recife e São Paulo). Projetada com arquitetura híbrida de alto desempenho, unindo uma Landing Page interativa com estética *Glassmorphism* em **Tailwind CSS v4**, API RESTful assíncrona em **Node.js/Express**, persistência relacional com **MySQL & Sequelize ORM**, e um painel administrativo seguro em **SSR (Handlebars)** com autenticação **JWT em cookies HttpOnly** e exportação de relatórios para **Excel (.xlsx)**.

---

## 🎯 Engenharia & Decisões Arquiteturais

Este projeto foi concebido seguindo princípios modernos de engenharia de software, separação de responsabilidades e foco em segurança:

- **Arquitetura Híbrida & Desacoplamento:**
  - **Frontend Leve e Imersivo:** Landing page desenvolvida em Vanilla JavaScript e Tailwind CSS v4, garantindo máxima fidelidade visual, tempo de carregamento instantâneo e zero sobrecarga de frameworks client-side pesados.
  - **Backend Dual (API REST + SSR):** Servidor Node.js com Express v5 atuando de forma híbrida: provê endpoints REST para ingestão assíncrona de dados e rotas com Server-Side Rendering (SSR) via Express-Handlebars para a área administrativa.
- **Segurança, Autenticação & Prevenção XSS:**
  - **Hashing Criptográfico com Bcrypt:** Validação de credenciais administrativas protegidas por hash com `bcryptjs`, garantindo integridade no fluxo de autenticação.
  - **Sessão Segura com Tokens JWT:** Emissão de tokens de acesso assinados com chave simétrica (`jsonwebtoken`) e tempo de expiração determinado (1 hora).
  - **Cookies HttpOnly:** O token JWT é transmitido e persistido exclusivamente via cookie seguro com flag `HttpOnly`, mitigando vulnerabilidades críticas de roubo de credenciais via ataques *Cross-Site Scripting* (XSS).
  - **Proteção de Rotas com Middleware:** Middleware dedicado (`checkAuth`) para interceptação, decodificação e validação contínua de rotas e operações administrativas sensíveis.
- **Modelagem Relacional & Validações com Sequelize ORM:**
  - Estruturação relacional de entidades em banco de dados MySQL com Sequelize ORM.
  - Validações em nível de modelo garantindo conformidade de dados: e-mails com verificação de sintaxe (`isEmail`), garantia de unicidade (`unique`) e obrigatoriedade de campos (`allowNull: false`).
  - Sincronização automatizada de esquemas e rastreabilidade temporal nativa via *timestamps* (`createdAt` e `updatedAt`).
- **Geração e Streaming de Relatórios em Memória (ExcelJS):**
  - Compilação dinâmica de dados tabulares diretamente em arquivos de planilhas Microsoft Excel (`.xlsx`).
  - Processamento e streaming executados em memória *buffer*, eliminando a necessidade de I/O em disco ou acúmulo de arquivos temporários no servidor.
  - Formatação corporativa automatizada com cabeçalhos personalizados na identidade visual da marca (`#74634D`), largura preditiva de colunas e quebra de linha contextual (`wrapText`).
- **Design System, Glassmorphism & UX Responsiva:**
  - Interface construída com utilitários avançados do **Tailwind CSS v4**, empregando *Glassmorphism* (`backdrop-blur-sm`, fundos translúcidos e bordas sutis).
  - Animações de entrada coordenadas via **AOS (Animate On Scroll)** em múltiplos eixos com *delays* escalonados.
  - Tratamento responsivo para eventos de toque em dispositivos móveis, adaptando interações de escala/zoom que tradicionalmente dependem de eventos de mouse *hover*.

---

## 🚀 Funcionalidades da Aplicação

- **🌿 Landing Page Institucional & Experiência Imersiva:**
  - **Navegação Inteligente (Sticky Navbar):** Fixação suave no topo com rolagem direcionada para âncoras e logotipo adaptativo (versão completa com slogan para mobile e versão compacta/minimalista para desktop).
  - **Seção Hero Cenográfica:** Imagem botânica em alta resolução com camada de gradiente escuro translúcido para otimização de contraste e tipografia de alto impacto com CTA convidativo.
  - **Cards Interativos de Serviços:** Apresentação dos pilares (*Plant Care & Sitting*, *Poda Ornamental*, *Paisagismo* e *Curadoria*) com transição de zoom (`scale-110`) no desktop e ativação tátil sob toque no mobile via script dedicado.
  - **Animações Coordenadas (AOS):** Efeitos de *zoom-out* suave na logomarca, transições escalonadas para as cidades de atendimento (Salvador: 1s, Recife: 2s, São Paulo: 3s) e entradas laterais alternadas nos blocos de conteúdo.
- **📬 Captura Assíncrona de Contatos & Leads:**
  - Formulário com estética *Glassmorphism* integrado à imagem de fundo com campos translúcidos e desfoque nativo.
  - Submissão assíncrona desacoplada via **Fetch API** com cancelamento de recarga (`e.preventDefault()`).
  - Feedback visual imediato com limpeza de campos (`reset()`) em caso de sucesso e mensagens de erro amigáveis caso ocorram falhas de conexão.
- **🛡️ Painel Administrativo Completo (Dashboard SSR):**
  - **Fluxo de Autenticação (`/admin/login` & `/admin/logout`):** Interface administrativa elegante e autenticação segura com expiração de sessão.
  - **Gestão de Mensagens (`/admin/dashboard`):**
    - Contador dinâmico com métricas consolidadas de contatos recebidos.
    - Grade responsiva de cards apresentando remetente, e-mail destacado, data/hora formatada e preservação de quebras de linha (`whitespace-pre-line`).
    - *Empty state* contextual caso não haja contatos pendentes.
  - **Operações Administrativas:**
    - **Exclusão de Registros:** Ação direta com remoção física no banco de dados e atualização imediata da listagem.
    - **Exportação para Excel (`/admin/exportar-excel`):** Download instantâneo de relatório consolidado em `.xlsx` formatado e pronto para análise de negócios.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologias Utilizadas |
| :--- | :--- |
| **Frontend & UI** | HTML5 Semântico, Tailwind CSS v4, JavaScript Vanilla (ES6+), AOS (Animate On Scroll v2.3), Lucide Icons |
| **Backend & API** | Node.js, Express.js v5, Express-Handlebars v8 (SSR), CORS |
| **Banco de Dados & ORM** | MySQL (Porta 3306), Sequelize ORM v6, MySQL2 Driver v3 |
| **Segurança & Autenticação** | JSON Web Token (jsonwebtoken v9), BcryptJS v3, Cookie-Parser, Cookies HttpOnly |
| **Processamento de Dados** | ExcelJS v4 (geração de planilhas `.xlsx` em memória e streaming) |
| **Tipografia & Design** | Google Fonts (Playfair Display, Montserrat) |
| **Configuração de Ambiente** | Dotenv v17 |

---

## 📂 Estrutura do Projeto

```text
verve/
├── backend/                       # Núcleo da API REST, Dashboard SSR e Conexão de Dados
│   ├── db/
│   │   └── conn.js                # Conexão e configuração do Sequelize para MySQL
│   ├── models/
│   │   └── User.js                # Modelo de dados da tabela 'users' (mensagens/leads)
│   ├── public/                    # Assets estáticos servidos pelo servidor Express
│   ├── views/                     # Templates de renderização dinâmica (Handlebars)
│   │   ├── layouts/
│   │   │   └── main.handlebars    # Layout base compartilhado (estrutura HTML)
│   │   ├── dashboard.handlebars   # Painel de controle, listagem de leads e exportação
│   │   └── login.handlebars       # Tela de autenticação do administrador
│   ├── .env                       # Configurações de ambiente locais do backend
│   └── index.js                   # Entrypoint do Express, rotas da API, regras de negócio e auth
├── src/                           # Frontend institucional (Landing Page)
│   ├── Image/                     # Identidade visual, logotipos e fotografias botânicas
│   ├── scripts/
│   │   └── scripts.js             # Lógica de envio assíncrono (Fetch) e interações mobile
│   ├── index.html                 # Página principal da landing page institucional
│   ├── input.css                  # Folha de estilos base com diretivas do Tailwind CSS v4
│   └── output.css                 # Folha de estilos compilada para produção
├── .env.example                   # Modelo das variáveis de ambiente necessárias
├── .gitignore                     # Controle de exclusão de artefatos e dependências sensíveis
├── DESCRICAO_PROJETO.txt          # Especificação funcional e técnica detalhada
├── package.json                   # Dependências do projeto e scripts de execução
└── README.md                      # Documentação técnica do repositório
```

---

## ⚡ Como Executar Localmente

### Pré-requisitos
- **Node.js** (v18.x ou superior recomendado)
- **MySQL Server** (em execução localmente na porta padrão `3306`)
- Gerenciador de pacotes **npm**

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/verve.git
   cd verve
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   Duplique o arquivo de exemplo e ajuste os parâmetros conforme seu ambiente local:
   ```bash
   cp .env.example .env
   ```
   *Certifique-se de configurar as credenciais do MySQL (`DB_USER`, `DB_PASS`, `DB_NAME`) e as chaves de acesso administrativo (`ADMIN_USER`, `ADMIN_PASS`, `JWT_SECRET`).*

4. **Crie a base de dados no MySQL:**
   Acesse seu cliente MySQL e crie o banco de dados correspondente:
   ```sql
   CREATE DATABASE verve_db;
   ```
   > **Nota:** As tabelas e esquemas necessários serão criados e sincronizados automaticamente pelo Sequelize na primeira inicialização do servidor (`conn.sync()`).

5. **Inicie o servidor da aplicação:**
   ```bash
   npm run server
   ```

6. **Acesse a aplicação no navegador:**
   - **Landing Page (Frontend):** Abra o arquivo [src/index.html](file:///c:/Users/Cláudio%20Araujo/Documents/CODE%202025/code_partes/PROJETOS/verve/src/index.html) diretamente no navegador ou via extensão como *Live Server*.
   - **Painel Administrativo (Backend SSR):** [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
   - **API Endpoint:** [http://localhost:3000/users](http://localhost:3000/users)

---

## 📄 Licença

Este projeto é desenvolvido para fins de demonstração técnica e portfólio.

Desenvolvido por Cláudio Araujo.

