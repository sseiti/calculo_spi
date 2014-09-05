$(document).ready(function(){


    //Mascara para money
	$("#valor").maskMoney({
		prefix:'R$ ', 
		allowNegative: true, 
		thousands:'.', 
		decimal:',', 
		affixesStay: true
	});

	$("#valor").change(function(){
		var dolar = 2.36;
		var taxa = 0.06;
		var valor = $('#valor').maskMoney('unmasked')[0];
		valor = dolar*valor+(valor*taxa);
		valor = parseFloat(valor.toFixed(2));;
		$("#total").html("R$ "+valor.toLocaleString("pt-BR"));
	});
});