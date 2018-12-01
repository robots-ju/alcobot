let typeDeBoisson;
let numberCommande = 0;
let buttonBoisson;
let boissonCommandeTexte = document.getElementById('boissonCommande');
let imageSrc;

function choix (boisson){
    typeDeBoisson = boisson
    document.getElementById('send1').disabled=false;

    switch (typeDeBoisson){
        case 'theFroid': 
            boissonCommandeTexte.textContent='Thé Froid';
            imageSrc= 'iced-tea.png';
            break;

        case 'eauPlate':
            boissonCommandeTexte.textContent='Eau plate';
            imageSrc='eau.png';
            break;

        case 'eauGazeuse':
            boissonCommandeTexte.textContent='Eau gazeuse';
            imageSrc='eauGazeuse.png';
            break;

        case 'coca':
            boissonCommandeTexte.textContent='Coca';
            imageSrc='soda.png';
            break;

        case 'limonadeCitron':
            boissonCommandeTexte.textContent='Limonade citron';
            imageSrc='lemon-juice.png'
            break;
        
        }
    document.getElementById('boissonCommandeImage').src='src/images_sans_python/' + imageSrc;
} 

function convertBoissonToNumber (typeBoisson){
    switch (typeBoisson){
        case 'theFroid' :
        return 1;
        
        case 'eauPlate':
        return 2;

        case 'eauGazeuse':
        return 3;

        case 'coca':
        return 4;

        case 'limonadeCitron':
        return 5;
    }
};

function send () {
    if (typeDeBoisson == null) {
        return;
    }else {
        numberCommande++;
        document.getElementById('numeroCommande').textContent=numberCommande;
        fetch('commande.json?boisson=' + convertBoissonToNumber())
            .catch(erreur => {
                alert(erreur);
            })
            .then (reponse => {
                if(reponse.status === 403) {
                    console.log('Vous n\'avez pas l\'autorisation');
                }else if (reponse.status !== 200) {
                    alert('Code inconnue')
                }else {
                    $('#confirmation').modal();
                }
            }); 
    }

}

function reload () {
    typeDeBoisson = null;
    buttonBoisson.classList.remove('btn-success');
    eau.classList.remove('btn-success');
    boissonCommandeTexte.textContent = null;
    imageSrc = null;    
}
const buttons = document.querySelectorAll('[data-boisson]')
const eau = document.getElementById('eau');

buttons.forEach(button  => {
    button.addEventListener('click', event => {
        let boisson = event.target.dataset.boisson
        choix(boisson);

        buttons.forEach(button => {
            button.classList.remove('btn-success');
            button.classList.add('btn-light');
            eau.classList.remove('btn-success');
            eau.classList.add('btn-light')
        });
        button.classList.remove('btn-light');
        button.classList.add('btn-success');
        buttonBoisson = button;
        if(boisson === 'eauPlate' || boisson === 'eauGazeuse'){
            eau.classList.remove('btn-light');
            eau.classList.add('btn-success');
        }
    })
})

document.getElementById('send').addEventListener('click', () => {
    send();
})

document.getElementById('newCommand').addEventListener('click', () => {
    reload();
})