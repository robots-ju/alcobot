let typeDeBoisson;

function choix (boisson){
    typeDeBoisson = boisson
    document.getElementById('send').disabled=false;
} 

function send () {
    fetch('commande.json?boisson=' + typeDeBoisson)
        .catch(erreur => {
            alert(erreur);
        })
        .then (reponse => {
            if(reponse.status === 403) {
                console.log('Vous n\'avez pas l\'autorisation');
            }else if (reponse.status !== 200) {
                alert('Code inconnue')
            }
        }); 
}
const buttons = document.querySelectorAll('.boissons button')

buttons.forEach(button  => {
    button.addEventListener('click', event => {
        choix(event.target.dataset.boisson);

        buttons.forEach(button => {
            button.classList.remove('btn-success');
            button.classList.add('btn-light');
        });
        button.classList.remove('btn-light');
        button.classList.add('btn-success');
    })
})

document.getElementById('send').addEventListener('click', () => {
    send();
})