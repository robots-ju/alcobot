//Connection au serveur
socket.on('listeCommandes', function (commandes) {
  console.log(commandes);
  $('#comAttente, #comPreparation, #comRecuperer').html('');
  commandes.forEach(commande => {
    let li = $('<li>').text('#' + commande.number);
    switch (commande.etat) {
      case 'wait':
      $('#comAttente').append(li);
      break;
      case 'progress':
      $('#comPreparation').append(li);
      break;
      case 'ready':
      $('#comRecuperer').append(li);
      break;
    }
  });
});
