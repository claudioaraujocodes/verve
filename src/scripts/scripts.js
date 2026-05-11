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


