/* global $ */
//"A"=Adição; "E"=Edição
var operacao = "A"; 
var indice_selecionado = -1;
// Recupera os dados armazenados
var tbLista = localStorage.getItem("tbLista");

 // Converte string para objeto
tbLista = JSON.parse(tbLista);

// Caso não haja conteúdo, iniciamos um vetor vazio
if (tbLista == null) 
    tbLista = [];

//código executado quando a página estiver totalmente carregada.
$(document).ready(function () {
    //setando as propriedades do plugin de validação JQUERY
    $("#frmCadastro").validate({
        rules: {
            codigo: "required",
            nome: "required",
            valorEstim: { required: true, minlength: 4 },
            startDate: { required: true }             
        },
        messages: {
            codigo: "Informe o id da conta",
            nome: "Por favor insira um nome para o projeto",
            valorEstim: { required: "Insira o valor estimado", minlength: "O valor mínimo deve ser de 4 digitos" },
        }
    });
    
    //listando em tela os contatos existentes
    Listar();
    
    //setando a label de operação como "Novo"
    $("#operation").html("Novo");

    //função acionada no clique do botão salvar
    $("#frmCadastro").on("submit", function () {
        if ($('#frmCadastro').valid()) {
             if (operacao == "A")
                return Adicionar();
             else
                return Editar();    
        } else {
            $.growl.error({ title: "Crud de Construções", message: "Preenchimento incompleto.", size: "large", location: "br" });
        }
    });
    
    //função acionada quando o usuário clicar no icone de editar da grid.
    $("#tblListar").on("click", ".btnEditar", function () {
        operacao = "E";
        indice_selecionado = parseInt($(this).attr("data-id"));

        var cli = JSON.parse(tbLista[indice_selecionado]);

        $("#codigo").val(cli.Codigo);
        $("#nome").val(cli.Nome);
        $("#valorEstim").val(cli.ValorEstimado);
        $("#startDate").val(cli.StartDate);
        // -----
        $("#stts").val(cli.Status);
       
        // ----
        $("#codigo").attr("readonly", "readonly");
        $("#nome").focus();
        $("#operation").html("Editar");
    });

    //função acionada quando o usuário clicar no botão de Limpar do formulário
    $("#btnClear").click(function () {
        $("#codigo").val('');
        $("#nome").val('');
        $("#valorEstim").val('');
        // -----
        $("#stts").val('');
        
        // ----
        $("#startDate").val('');
        $("#codigo").attr("readonly", false);
        $("#operation").html("Novo");
    });
    
    //configuração do plugin dataTables.
    $('#tblListar').dataTable({
        "aoColumnDefs": [
            { 'bSortable': false, 'aTargets': [5] }
        ],
        "language": {
            "url": "js/Portuguese-Brasil.json"
        }
    });
    
    //função que permite apenas a digitação de números no textbox
    $('.onlyNumbers').keypress(function (event) {
        return OnlyNumbers(event);
    });
});

function Adicionar() {
    var cli = GetContato("Codigo", $("#codigo").val());

    if (cli != null) {
         $.growl.warning({ title: "Construção", message: "já cadastrada." , size: "large", location: "br" });
        return;
    }

    var cliente = JSON.stringify({
        Codigo: $("#codigo").val(),
        Nome: $("#nome").val(),
        Status : $("#stts").val(),
        ValorEstimado: $("#valorEstim").val(),
        StartDate: $("#startDate").val()
    });

    tbLista.push(cliente);
    localStorage.setItem("tbLista", JSON.stringify(tbLista));
    $.growl.notice({ title: "Lista de Construções", message: "Registro adicionado.", size: "large", location: "br" });

    return true;
}

function Editar() {
    tbLista[indice_selecionado] = JSON.stringify({
        Codigo: $("#codigo").val(),
        Nome: $("#nome").val(),
        // ----
        //Status : $("#stts1","#stts2", "#stts3").val(),
        Status : $("#stts").val(),
        // ----
        ValorEstimado: $("#valorEstim").val(),
        StartDate: $("#startDate").val()
    });
    localStorage.setItem("tbLista", JSON.stringify(tbLista));
    $.growl.notice({ title: "Lista de Construçõe", message: "Registro editado com sucesso.", size: "large", location: "br" });

    operacao = "A";
    return true;
}

//função responsável por listar os itens do localStorage
function Listar() {
    //limpo o html da tabela.
    $("#tblListar").html("");
    
    //criando a estrutura inicial da tabela
    $("#tblListar").html(
        "<thead>" +
        "	<tr class=\"info\">" +
        "	<th>ID</th>" +
        "	<th>Nome da Construção</th>" +
        "	<th>Valor Estimado</th>" +
        "	<th>Data de Início</th>" +
        "	<th>Status</th>" +
        "   <th></th>" +
        "	</tr>" +
        "</thead>" +
        "<tbody>" +
        "</tbody>"
        );

    //populando o conteudo da tabela com os itens do localStorage
    for (var i in tbLista) {
        var cli = JSON.parse(tbLista[i]);
        $("#tblListar tbody").append("<tr>" +
            "	<td>" + cli.Codigo + "</td>" +
            "	<td>" + cli.Nome + "</td>" +
            "	<td>" + cli.ValorEstimado + "</td>" +
            "	<td>" + cli.StartDate + "</td>" +
            "	<td>" + cli.Status + "</td>" +
            "	<td><button class='btn btn-primary btn-xs btnEditar' data-title='Edit' data-id='" + i + "'><span class='glyphicon glyphicon-pencil'></span></button>&nbsp;<button class='btn btn-danger btn-xs btnExcluir' data-title='Delete' onclick='Excluir("+ i +")'><span class='glyphicon glyphicon-trash'></span></button></td>" +
            "</tr>");
    }
}

//função responsável por excluir um item da lista.
function Excluir(indice) {
    tbLista.splice(indice, 1);
    localStorage.setItem("tbLista", JSON.stringify(tbLista));
    $.growl.error({ title: "Lista Telefônica", message: "Registro excluido.", size: "large", location: "br" });
    
    //reload na pagina para listar novamente e configurar o datatables.
    location.reload();
}

//seleciona um contato pelo id
function GetContato(propriedade, valor) {
    var cli = null;
    for (var item in tbLista) {
        var i = JSON.parse(tbLista[item]);
        if (i[propriedade] == valor)
            cli = i;
    }
    return cli;
}

//função para permitir apenas a digitação de números
function OnlyNumbers(event) {
    var key = window.event ? event.keyCode : event.which;
    if (event.keyCode == 8 || event.keyCode == 46
        || event.keyCode == 37 || event.keyCode == 39) {
        return true;
    }
    else if (key < 48 || key > 57) {
        return false;
    }
    else return true;
};

function ClearLocalStorage(){
    localStorage.removeItem("tbLista");
    location.reload();
}

function GetContentLocalStorage(){
    var retrievedObject = localStorage.getItem('tbLista'); 
    console.log('retrievedObject: ', JSON.parse(retrievedObject));
}