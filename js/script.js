$(document).ready(function() {
    $("#configurar").hide();

    //Mascara para money
    $("#valor").maskMoney({
        prefix: 'U$ ',
        allowNegative: true,
        thousands: '.',
        decimal: ',',
        affixesStay: true
    });

    $("#valor_local,#taxa").maskMoney({
        prefix: '',
        allowNegative: true,
        thousands: '.',
        decimal: ',',
        affixesStay: false
    });

    $("#valor").keypress(function() {
        var dolar = $('#valor_local').maskMoney('unmasked')[0];
        ;
        var taxa = ($('#taxa').maskMoney('unmasked')[0] / 100);
        ;
        var valor = $('#valor').maskMoney('unmasked')[0];
        valor = dolar * (valor + (valor * taxa));
        valor = parseFloat(valor.toFixed(2));
        ;
        $("#valor_brl").val(valor);
        $("#total").html("R$ " + valor.toLocaleString("pt-BR"));
    });

    $("#add").click(function() {
        onCreate();
    });
    $("#config").click(function() {
        onCreateCfg();
    });

    $("#btn_configurar").click(function() {
        $("#configurar").toggle();
        $("#main").hide();
    });

    $("#home").click(function() {
        $("#main").toggle();
        $("#configurar").hide();
    });
    
    $("#sair").click(function(){
    	navigator.app.exitApp();
    });

});

//1. Inicialização

var localDB = null;

function onInit() {
    try {
        if (!window.openDatabase) {
            updateStatus("Erro: Seu navegador não permite banco de dados.");
        }
        else {
            initDB();
            createTables();
            queryAndUpdateOverview();
            onSelectCfg();
        }
    }
    catch (e) {
        if (e == 2) {
            updateStatus("Erro: Versão de banco de dados inválida.");
        }
        else {
            updateStatus("Erro: Erro desconhecido: " + e + ".");
        }
        return;
    }
}

function initDB() {
    var shortName = 'stuffDB';
    var version = '1.0';
    var displayName = 'MyStuffDB';
    var maxSize = 65536; // Em bytes
    localDB = window.openDatabase(shortName, version, displayName, maxSize);
}

function createTables() {
    var query = 'CREATE TABLE IF NOT EXISTS calculo_spi(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, produto VARCHAR NOT NULL, valor REAL NOT NULL);';
    var query2 = 'CREATE TABLE IF NOT EXISTS calculo_spi_cfg(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, porcentagem REAL NOT NULL, valor REAL NOT NULL);';
    try {
        localDB.transaction(function(transaction) {
            transaction.executeSql(query, [], nullDataHandler, errorHandler);
            transaction.executeSql(query2, [], nullDataHandler, errorHandler);
            //updateStatus("Tabela 'calculo_spi' status: OK.");
        });
    }
    catch (e) {
        updateStatus("Erro: Data base 'calculo_spi' não criada " + e + ".");
        return;
    }
    
    
}




//2. Query e visualização de Update


function onUpdate() {
    var id = document.itemForm.id.value;
    var nome = document.itemForm.nome.value;
    var idade = document.itemForm.idade.value;
    if (nome == "" || idade == "") {
        updateStatus("'Produto' e 'Valor' são campos obrigatórios!");
    }
    else {
        var query = "update calculo_spi set produto=?, valor=? where id=?;";
        try {
            localDB.transaction(function(transaction) {
                transaction.executeSql(query, [nome, idade, id], function(transaction, results) {
                    if (!results.rowsAffected) {
                        updateStatus("Erro: Update não realizado.");
                    }
                    else {
                        updateForm("", "", "");
                        updateStatus("Update realizado:" + results.rowsAffected);
                        queryAndUpdateOverview();
                    }
                }, errorHandler);
            });
        }
        catch (e) {
            updateStatus("Erro: UPDATE não realizado " + e + ".");
        }
    }
}

function onDelete(id) {

    var query = "delete from calculo_spi where id=?;";
    try {
        localDB.transaction(function(transaction) {

            transaction.executeSql(query, [id], function(transaction, results) {
                if (!results.rowsAffected) {
                    updateStatus("Erro: Delete não realizado.");
                }
                else {
                    updateForm("", "", "");
                    updateStatus("Produto deletado : " + results.rowsAffected);
                    queryAndUpdateOverview();
                }
            }, errorHandler);
        });
    }
    catch (e) {
        updateStatus("Erro: DELETE não realizado " + e + ".");
    }

}

function onCreate() {
    var valor = $('#valor_brl').val();
    var produto = $('#produto').val();

    if (produto == "" || valor == "") {
        updateStatus("Erro: 'Produto' e 'Valor' são campos obrigatórios!");
    }
    else {
        var query = "delete from calculo_spi_cfg ;";
        try {
            localDB.transaction(function(transaction) {

                transaction.executeSql(query, [id], function(transaction, results) {
                    if (!results.rowsAffected) {
                        updateStatus("Erro: Delete não realizado.");
                    }
                    else {
                        updateStatus("Cfg deletado : " + results.rowsAffected);
                    }
                }, errorHandler);
            });
        }
        catch (e) {
            updateStatus("Erro: DELETE não realizado " + e + ".");
        }

        var query = "insert into calculo_spi (produto, valor) VALUES (?, ?);";
        try {
            localDB.transaction(function(transaction) {
                transaction.executeSql(query, [produto, valor], function(transaction, results) {
                    if (!results.rowsAffected) {
                        updateStatus("Erro: Inserção não realizada");
                    }
                    else {

                        updateForm("", "", "");
                        updateStatus("Produto inserido! ");

                        queryAndUpdateOverview();
                    }
                }, errorHandler);
            });
        }
        catch (e) {
            updateStatus("Erro: Inserção não realizada " + e + ".");
        }
    }
}

function onCreateCfg() {
    var valor = $('#valor_local').maskMoney('unmasked')[0];
    var taxa = $('#taxa').maskMoney('unmasked')[0];

    if (taxa == "" || valor == "") {
        updateStatus("Erro: 'Taxa' e 'Valor' são campos obrigatórios!");
    }
    else {
        var query = "insert into calculo_spi_cfg (porcentagem, valor) VALUES (?, ?);";
        try {
            localDB.transaction(function(transaction) {
                transaction.executeSql(query, [taxa, valor], function(transaction, results) {
                    if (!results.rowsAffected) {
                        updateStatus("Erro: Inserção não realizada");
                    }
                    else {

                        updateStatus("Configuração salva! ");

                        queryAndUpdateOverview();
                    }
                }, errorHandler);
            });
        }
        catch (e) {
            updateStatus("Erro: Inserção não realizada " + e + ".");
        }
    }
}

function onSelect(id) {

    query = "SELECT * FROM calculo_spi where id=?;";
    try {
        localDB.transaction(function(transaction) {

            transaction.executeSql(query, [id], function(transaction, results) {

                var row = results.rows.item(0);

                updateForm(row['id'], row['produto'], row['valor']);

            }, function(transaction, error) {
                updateStatus("Erro: " + error.code + "<br>Mensagem calculo spi: " + error.message);
            });
        });
    }
    catch (e) {
        updateStatus("Error: SELECT não realizado " + e + ".");
    }

}

function onSelectCfg() {

    query = "SELECT * FROM calculo_spi_cfg Order by id desc;";
    try {
        localDB.transaction(function(transaction) {

            transaction.executeSql(query, [], function(transaction, results) {
                var row = results.rows.item(0);

                updateFormCfg(row['id'], row['porcentagem'], row['valor']);

            }, function(transaction, error) {
                updateStatus("Erro: " + error.code + "<br>Mensagem cfg: " + error.message);
            });
        });
    }
    catch (e) {
        updateStatus("Erro:  " + e + ".");

    }

}

function queryAndUpdateOverview() {

    //Remove as linhas existentes para inserção das novas
    $("#itemData").html('');

    //Realiza a leitura no banco e cria novas linhas na tabela.
    var query = "SELECT * FROM calculo_spi;";
    try {
        localDB.transaction(function(transaction) {
            transaction.executeSql(query, [], function(transaction, results) {
                var valor_total = 0;
                
                for (var i = 0; i < results.rows.length; i++) {

                    var row = results.rows.item(i);
                    $("#itemData").append('<tr>');
                    $("#itemData").append('<td>' + row['id'] + '</td>');
                    $("#itemData").append('<td>' + row['produto'] + '</td>');
                    $("#itemData").append('<td>' + number_format(row['valor'], 2, ',', '.') + '</td>');
                    $("#itemData").append('<td ><button type="button" class="btn btn-danger" onclick="onDelete(' + row['id'] + ')" >Delete</button></td>');
                    //li.setAttribute("onclick", "onSelect(this)");
                    valor_total = valor_total + row['valor'];
                    //var liText = document.createTextNode(row['produto'] + " x "+ row['valor']);
                    //li.appendChild(liText);

                    //document.getElementById("itemData").appendChild(td);
                    $("#itemData").append('</tr>');
                }
                $("#itemData").append('<tr>');
                $("#itemData").append('<td colspan="2">Total</td>');
                $("#itemData").append('<td > R$ ' + valor_total.toLocaleString("pt-BR") + '</td>');

                $("#itemData").append('</tr>');
            }, function(transaction, error) {
                updateStatus("Erro: " + error.code + "<br>Mensagem select calculo spi: " + error.message);
            });
        });
    }
    catch (e) {
        updateStatus("Error: SELECT não realizado " + e + ".");
    }
}

// 3. Funções de tratamento e status.

// Tratando erros

errorHandler = function(transaction, error) {
    updateStatus("Erro: " + error.message);
    return true;
}

nullDataHandler = function(transaction, results) {
}

// Funções de update

function updateForm(id, produto, valor) {
    $("#id").val(id);
    $("#produto").val(produto);
    $("#valor").val(valor);
}

function updateFormCfg(id, produto, valor) {
    $("#id_cfg").val(id);
    produto = parseFloat(produto.toFixed(2));
    valor = parseFloat(valor.toFixed(2));
    $("#taxa").val(number_format(produto, 2, ',', '.'));
    $("#valor_local").val(number_format(valor, 2, ',', '.'));
}

function updateStatus(status) {
    $('.status').html('<span class="label label-info">' + status + '</span>');
    $(".status").delay(2500).fadeOut("slow");
}

function number_format(number, decimals, dec_point, thousands_sep) {
    // %        nota 1: Para 1000.55 retorna com precisão 1 no FF/Opera é 1,000.5, mas no IE é 1,000.6
    // *     exemplo 1: number_format(1234.56);
    // *     retorno 1: '1,235'
    // *     exemplo 2: number_format(1234.56, 2, ',', ' ');
    // *     retorno 2: '1 234,56'
    // *     exemplo 3: number_format(1234.5678, 2, '.', '');
    // *     retorno 3: '1234.57'
    // *     exemplo 4: number_format(67, 2, ',', '.');
    // *     retorno 4: '67,00'
    // *     exemplo 5: number_format(1000);
    // *     retorno 5: '1,000'
    // *     exemplo 6: number_format(67.311, 2);
    // *     retorno 6: '67.31'

    var n = number, prec = decimals;
    n = !isFinite(+n) ? 0 : +n;
    prec = !isFinite(+prec) ? 0 : Math.abs(prec);
    var sep = (typeof thousands_sep == "undefined") ? ',' : thousands_sep;
    var dec = (typeof dec_point == "undefined") ? '.' : dec_point;

    var s = (prec > 0) ? n.toFixed(prec) : Math.round(n).toFixed(prec); //fix for IE parseFloat(0.55).toFixed(0) = 0;

    var abs = Math.abs(n).toFixed(prec);
    var _, i;

    if (abs >= 1000) {
        _ = abs.split(/\D/);
        i = _[0].length % 3 || 3;

        _[0] = s.slice(0, i + (n < 0)) +
                _[0].slice(i).replace(/(\d{3})/g, sep + '$1');

        s = _.join(dec);
    } else {
        s = s.replace('.', dec);
    }

    return s;
}
