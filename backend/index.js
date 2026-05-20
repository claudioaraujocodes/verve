const express = require('express');
const cors = require('cors');
const { exphbs, engine } = require('express-handlebars'); // 1. Importa o motor
const basicAuth = require('express-basic-auth'); // 1. Importe o pacote Auth
const conn = require('./db/conn');
const User = require('./models/User');

// Garante que o dotenv seja carregado no início do servidor
require('dotenv').config({ path: './.env' });

const app = express();
// Usa a porta do arquivo .env ou assume a 3000 como segurança
const PORT = process.env.PORT || 3000;

// --- CONFIGURAÇÃO DO HANDLEBARS ---
// Define o 'main' como o layout padrão e configura a extensão dos arquivos
app.engine('handlebars', engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.set('views', './backend/views'); // Aponta para a pasta views dentro do backend

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Importante para ler dados de formulários do admin se precisar


// --- CONFIGURAÇÃO DE SEGURANÇA (BASIC AUTH) ---

const adminAuth = basicAuth({

    // Chaves dinâmicas baseadas no .env
    users: { [process.env.ADMIN_USER]: process.env.ADMIN_PASS }, 
    challenge: true, // Força o navegador a exibir o pop-up nativo de login
    
    unauthorizedResponse: (req) => {
        // Acessa o objeto de resposta através do atalho nativo do Express no 'req'
        if (req.res) {
            req.res.setHeader('Content-Type', 'text/html; charset=utf-8');
        }

        // Em vez de retornar apenas texto, retornamos um HTML estruturado com JS integrado

        return `
        <!DOCTYPE html>
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <title>Acesso Negado</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-900 flex items-center justify-center min-h-screen text-white font-sans">
            
           <script>
                  // O setTimeout joga o alert para o final da fila de execução,
                  // dando tempo para o navegador renderizar todo o HTML e Tailwind primeiro.
                 
                  setTimeout(() => {
                     alert("Credenciais inválidas para o Painel Verve! Verifique seus dados.");
        
                     // Redireciona após o clique no OK
                     window.location.href = "http://127.0.0.1:5500/code_partes/PROJETOS/verve/src/index.html";
                 }, 100); // 100 milissegundos de espera são suficientes

            </script>

            <div class="text-center p-8 bg-gray-800 rounded-lg shadow-lg border border-gray-700 max-w-sm">
                <h1 class="text-2xl font-bold text-red-500 mb-2">Acesso Restrito</h1>
                <p class="text-gray-400 text-sm">Esta é uma área administrativa protegida do projeto Verve.</p>
                <p class="text-xs text-gray-500 mt-4">Para tentar novamente, recarregue a página (F5).</p>
            </div>
        </body>
        </html>
        `;

    }
});


// Rota POST para receber os dados do formulário e salvar no banco

app.post('/users', async (req, res) => {
    const { nome, email, msg } = req.body;

    /* const objCreate = {
         nome: "Claudio",
         email: "mail@teste.com",
         msg: "testetestetstetst estetetetstetstertstsdterte tetetgsted ifhojshfouhf"
     };
     */

    try {

        // Criando o registro no MySQL via Sequelize
        const newUser = await User.create({ nome, email, msg });

        // Retorna uma resposta em JSON com status 201 (Created)
        return res.status(201).json({
            message: "Usuário cadastrado com sucesso!",
            user: newUser
        })

    } catch (error) {
        console.log("Erro ao salvar", error);

        return res.status(500).json({ message: "Erro interno ao salvar no banco de dados." })

    };
});


// Rota do Painel Administrativo (Server-Side Rendering)

// AUTH - Injetamos o middleware 'adminAuth' como segundo argumento para proteger ESTA rota

app.get('/admin/dashboard', adminAuth, async (req, res) => {
    try {
        // Busca todos os usuários/mensagens do MySQL Global na porta 3306
        // Usamos { raw: true } para o Handlebars conseguir ler o array de objetos limpo
        const messages = await User.findAll({ raw: true });

        // Renderiza o arquivo dashboard.handlebars passando os dados do banco

        res.render('dashboard', { messages });
    } catch (error) {
        console.error("Erro ao carregar o painel:", error);
        res.status(500).send("Erro interno ao carregar o painel administrativo.");
    }
});






// --- SINCRONIZAÇÃO E INICIALIZAÇÃO ---
// Sincroniza os Models com o banco e depois liga o servidor Express

conn.sync()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Verve rodando na porta ${PORT}`)
        });
    })
    .catch((err) => {
        console.log("Erro ao conectar o MySQO Global: ".err)
    });


