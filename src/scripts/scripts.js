const cards = document.querySelectorAll(".card");

cards.forEach(card => {
    const cardImage = card.querySelector(".card-image");

    card.addEventListener("click", () => {
        if (window.innerWidth < 1024) {
            cardImage.classList.toggle("scale-110");
            //alert("clicou mobile")
        };
    });
});

// Mensagem enviada
const msgSentAlert = document.getElementById('msgSentAlert');


function hideSentAlert() {
    if (!msgSentAlert) return;

    msgSentAlert.style.opacity = '0';
    msgSentAlert.classList.remove('opacity-100');
    msgSentAlert.classList.add('opacity-0');

    // Remove os ouvintes 
    document.removeEventListener('click', hideSentAlert);
    const formInputs = document.querySelectorAll('#verveForm input, #verveForm textarea');
    formInputs.forEach(input => {
        input.removeEventListener('focus', hideSentAlert);
        input.removeEventListener('input', hideSentAlert);
    });
}

// mensagem flutuante sobre o textarea
function showSentAlert() {
    if (!msgSentAlert) return;

    msgSentAlert.classList.remove('opacity-0');
    msgSentAlert.classList.add('opacity-100');
    msgSentAlert.style.opacity = '1';


    setTimeout(() => {
        // Desaparece ao clicar em qualquer parte do layout
        document.addEventListener('click', hideSentAlert, { once: true });

        // Desaparece se o usuário clicar ou digitar em qualquer input para voltar a digitar
        const formInputs = document.querySelectorAll('#verveForm input, #verveForm textarea');
        formInputs.forEach(input => {
            input.addEventListener('focus', hideSentAlert, { once: true });
            input.addEventListener('input', hideSentAlert, { once: true });
        });
    }, 100);
}

// Função assíncrona que processa o envio dos dados
async function handleSubmit(e) {
    e.preventDefault();

    const url = 'http://localhost:3000/users';

    const nome = document.getElementById('nome');
    const email = document.getElementById('email');
    const msg = document.getElementById('msg');

    const userData = {
        nome: nome.value,
        email: email.value,
        msg: msg.value
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const result = await response.json();

        if (response.ok) {
            // Limpa todos os campos do formulário
            e.target.reset();

            // Exibe a mensagem de sucesso sobre o input de mensagem
            showSentAlert();
        } else {
            console.log(`status: ${result.message}`);
        }
    } catch (error) {
        console.error('Erro na comunicação com a API:', error);
        alert('Não foi possível conectar ao servidor backend.');
    }
}

// Mapeia o formulário no DOM e adiciona o ouvinte de evento
const form = document.getElementById('verveForm');
if (form) {
    form.addEventListener('submit', handleSubmit);
}
