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

app.use(express.static('./backend/public')); //pasta com imagens

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
// BUSCANDO DADOS PARA EXIBIR NO DASHBOARD

app.get('/admin/dashboard', checkAuth, async (req, res) => {
    try {
        const messages = await User.findAll({ raw: true });
        res.render('dashboard', { messages });
    } catch (error) {
        console.error("Erro ao carregar o painel:", error);
        res.status(500).send("Erro interno ao carregar o painel.");
    }
});



// 4. rota DELETE - EXClUINDO DADOS DO BANCO

app.post('/admin/dashboard/delete/:id', checkAuth, async(req, res) => {
    const id = req.params.id;

    User.destroy({where: {id: id} })
    res.redirect('/admin/dashboard');
})


// 5. Rota GET Protegida: Exportar mensagens para Excel (.xlsx)
app.get('/admin/exportar-excel', checkAuth, async (req, res) => {
    try {
        const ExcelJS = require('exceljs');
        
        // Busca todas as mensagens do banco de dados via Sequelize
        const messages = await User.findAll({ raw: true });

        // Cria a estrutura da planilha na memória do servidor
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Mensagens de Contato');

        // Configura as colunas com identificadores e larguras iniciais coerentes
        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Nome Completo', key: 'nome', width: 30 },
            { header: 'E-mail', key: 'email', width: 35 },
            { header: 'Mensagem / Feedback', key: 'msg', width: 60 }
        ];

        // Estilização da linha de cabeçalho (Row 1) com a identidade Verve
        const headerRow = worksheet.getRow(1);
        headerRow.height = 25;
        
        headerRow.eachCell((cell) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF74634D' } // Marrom terra oficial do projeto
            };
            cell.font = {
                name: 'Arial',
                size: 11,
                bold: true,
                color: { argb: 'FFFFFFFF' } // Texto branco para alto contraste
            };
            cell.alignment = { vertical: 'middle', horizontal: 'left' };
        });

        // Loop para injetar os dados do banco na planilha
        messages.forEach((user) => {
            const row = worksheet.addRow({
                id: user.id,
                nome: user.nome,
                email: user.email,
                msg: user.msg
            });
            
            row.height = 20;
            row.eachCell((cell) => {
                cell.font = { name: 'Arial', size: 10 };
                cell.alignment = { vertical: 'top', wrapText: true }; // Permite quebra de linha em mensagens longas
            });
        });

        // Define os cabeçalhos HTTP necessários para fazer o navegador entender o download
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=relatorio_mensagens_verve.xlsx'
        );

        // Transmite os dados binários da planilha direto para a resposta do cliente
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error("Erro ao exportar planilha:", error);
        res.status(500).send("Erro interno ao gerar o arquivo de exportação.");
    }
});





// 5. Rota de Logout (Opcional, mas muito profissional)
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