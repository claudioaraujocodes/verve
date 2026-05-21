const express = require('express');
const cors = require('cors');
const { engine } = require('express-handlebars');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser'); // Importante para ler cookies
const conn = require('./db/conn');
const User = require('./models/User');

require('dotenv').config({ path: './.env' });

const app = express();
const PORT = process.env.PORT || 3000;

// --- CONFIGURAÇÃO DO HANDLEBARS ---
app.engine('handlebars', engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.set('views', './backend/views');

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Ativa a leitura de cookies no servidor

// --- MIDDLEWARE DE PROTEÇÃO DE ROTAS (JWT) ---
const checkAuth = (req, res, next) => {
    const token = req.cookies.verve_token; // Tenta ler o cookie gerado no login

    if (!token) {
        // Se não houver token, barra o acesso e joga para a página de login
        return res.redirect('/admin/login');
    }

    try {
        // Verifica se o token é legítimo usando a nossa chave secreta do .env
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = verified; // Injeta os dados do admin validado na requisição
        next(); // Permite o acesso à rota protegida
    } catch (error) {
        // Se o token estiver corrompido ou expirado, limpa o cookie e joga pro login
        res.clearCookie('verve_token');
        return res.redirect('/admin/login');
    }
};

// --- ROTAS PÚBLICAS DA API ---
app.post('/users', async (req, res) => {
    try {
        const { nome, email, msg } = req.body;
        const newUser = await User.create({ nome, email, msg });
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: "Erro ao salvar mensagem." });
    }
});

// --- ROTAS DO ADMINISTRADOR (SSR) ---

// 1. Rota GET: Renderiza a página de login
app.get('/admin/login', (req, res) => {
    // Se o admin já estiver logado, joga ele direto para o dashboard
    if (req.cookies.verve_token) return res.redirect('/admin/dashboard');
    res.render('login');
});

// 2. Rota POST: Processa os dados do formulário de login
app.post('/admin/login', async (req, res) => {
    const { username, password } = req.body;

    // Pegamos os valores reais e seguros direto do arquivo .env
    const envUser = process.env.ADMIN_USER;
    const envPassword = process.env.ADMIN_PASS; 

    // Criamos o hash baseado na variável protegida do .env de forma dinâmica
    const envPasswordHash = bcrypt.hashSync(envPassword, 10); 

    // Validação do usuário e checagem da senha criptografada usando Bcrypt
    if (username === envUser && bcrypt.compareSync(password, envPasswordHash)) {
        
        // Cria o token JWT carregando o nome do admin no payload (válido por 1 hora)
        const token = jwt.sign({ user: username }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Salva o JWT dentro de um cookie HttpOnly super seguro
        res.cookie('verve_token', token, {
            httpOnly: true,
            secure: false,  // Mude para true quando fizer o deploy em HTTPS (Railway)
            maxAge: 3600000 
        });

        return res.redirect('/admin/dashboard');
    } else {
        return res.render('login', { error: "Usuário ou senha inválidos." });
    }
});

// 3. Rota GET Protegida: O Dashboard (Agora usando o middleware checkAuth)
app.get('/admin/dashboard', checkAuth, async (req, res) => {
    try {
        const messages = await User.findAll({ raw: true });
        res.render('dashboard', { messages });
    } catch (error) {
        console.error("Erro ao carregar o painel:", error);
        res.status(500).send("Erro interno ao carregar o painel.");
    }
});

// 4. Rota de Logout (Opcional, mas muito profissional)
app.get('/admin/logout', (req, res) => {
    res.clearCookie('verve_token');
    res.redirect('/admin/login');
});

// --- INICIALIZAÇÃO DO SERVIDOR ---
conn.sync().then(() => {
    app.listen(PORT, () => {
        console.log(`Servidor rodando http://localhost:${PORT}`);
    });
}).catch(err => console.log(err));