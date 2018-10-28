let typeDeBoisson;

function choix (boisson){
    typeDeBoisson = boisson
    document.getElementById('send').disabled=false;
} 

function send () {
    if(typeDeBoisson !=undefined){
        console.log('la boisson commandé est' + ' ' + typeDeBoisson);
        return;
    }
    
    console.log("Vous n'avez rien commandé !!");
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