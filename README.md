Reabastece Aí 

Aplicação web para registro e controle de abastecimentos de veículos, com cálculo automático de consumo e custos. O projeto utiliza React (via Vite), TypeScript e Tailwind CSS no front‑end, além do Supabase para autenticação, banco de dados e funções serverless.

Funcionalidades
Cadastro de veículos, abastecimentos e registros de uso.

Cálculo de litros, custo total e consumo por quilômetro.

Integração com Supabase para autenticação e armazenamento dos dados.

Função serverless daily-activity (Supabase Functions) para registrar atividades automatizadas.

Testes unitários com Vitest.

Pré-requisitos
Node.js (versão 18 ou superior)

npm

Instalação e execução
# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
A aplicação será servida em http://localhost:8080.

Scripts úteis
npm run build – Compila o projeto para produção.

npm run preview – Pré-visualiza o build de produção.

npm run lint – Executa o ESLint.

npm test – Executa os testes com Vitest.

Estrutura do projeto
├─ src/
│  ├─ components/     # Componentes React (formularios, rotas protegidas etc.)
│  ├─ hooks/          # Hooks personalizados (auth, veículos, abastecimentos)
│  ├─ integrations/   # Integração com Supabase (client e tipos)
│  ├─ pages/          # Páginas da aplicação (Dashboard, Auth, etc.)
│  └─ main.tsx        # Ponto de entrada do React
├─ public/            # Arquivos estáticos
├─ supabase/          # Configurações e funções serverless
└─ package.json       # Dependências e scripts

Testes
Os testes utilizam Vitest. Para executá-los:

npm test
