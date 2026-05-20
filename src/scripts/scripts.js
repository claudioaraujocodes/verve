const cards = document.querySelectorAll(".card");

cards.forEach(card => {
    const cardImage = card.querySelector(".card-image")

    card.addEventListener("click", () => {
        if (window.innerWidth < 1024){
            cardImage.classList.toggle("scale-110");
            //alert("clicou mobile")
        };
    });
});


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
        })

        const result = await response.json();

        if (response.ok) {
            alert(result.message)

            // e.target é o próprio formulário. Usamos o .reset() para limpar os campos
            e.target.reset();

        }else {
            alert(`Erro: ${result.message}`)
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