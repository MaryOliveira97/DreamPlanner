let saldo = 0;
let totalEntradas = 0;
let totalSaidas = 0;
let valorMeta = 0;
let nomeMetaAtual = "";
let movimentacoes = [];
let tarefas = [];

function formatarMoeda(valor) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}
function salvarDados() {
    let dados = {
        saldo: saldo,
        totalEntradas: totalEntradas,
        totalSaidas: totalSaidas,
        movimentacoes: movimentacoes,
        valorMeta: valorMeta,
        nomeMetaAtual: nomeMetaAtual,
        tarefas: tarefas
    };

    localStorage.setItem("dreamplanner_financas", JSON.stringify(dados));
}

function carregarDados() {
    let dadosSalvos = localStorage.getItem("dreamplanner_financas");

    if (dadosSalvos) {
        let dados = JSON.parse(dadosSalvos);

        saldo = dados.saldo || 0;
        totalEntradas = dados.totalEntradas || 0;
        totalSaidas = dados.totalSaidas || 0;
        movimentacoes = dados.movimentacoes || [];
        valorMeta = dados.valorMeta || 0;
        nomeMetaAtual = dados.nomeMetaAtual || "";
        tarefas = dados.tarefas || [];

        renderizarTarefas();

        document.getElementById("saldoDashboard").innerHTML = formatarMoeda(saldo);
        document.getElementById("entradasDashboard").innerHTML = formatarMoeda(totalEntradas);
        document.getElementById("saidasDashboard").innerHTML = formatarMoeda(totalSaidas);

        let listaMovimentacoes = "";

      movimentacoes.forEach(function(item, index) {

    listaMovimentacoes += `
        <p>
            ${item.icone} ${item.descricao}
            ${item.sinal}
            ${formatarMoeda(Number(item.valor))}
            <button onclick="excluirMovimentacao(${index})">
                🗑️
            </button>
        </p>
    `;

});

        document.getElementById("movimentacoes").innerHTML = listaMovimentacoes;

       
        renderizarMovimentacoes();
    }
}
function mostrarAba(aba) {
    document.getElementById("dashboard").style.display = "none";
    document.getElementById("objetivos").style.display = "none";
    document.getElementById("planejamento").style.display = "none";

    document.getElementById(aba).style.display = "block";
}

function adicionarEntrada() {
    let descricao = document.getElementById("descricao").value;
let valor = document.getElementById("valor").value;

    if (descricao === "" || valor <= 0) {
        alert("Preencha a descrição e um valor válido para a entrada.");
        return;
    }

    saldo += Number(valor);
    totalEntradas += Number(valor);

    document.getElementById("saldoDashboard").innerHTML = formatarMoeda(saldo);
    document.getElementById("entradasDashboard").innerHTML = formatarMoeda(totalEntradas);
    document.getElementById("saidasDashboard").innerHTML = formatarMoeda(totalSaidas);

    movimentacoes.push({
        tipo: "entrada",
        descricao: descricao,
        valor: valor,
        icone: "🟢",
        sinal: "+"
    });

    renderizarMovimentacoes();

    document.getElementById("descricao").value = "";
    document.getElementById("valor").value = "";

    atualizarMeta();
    atualizarBarras();
    salvarDados();
    carregarDashboard();
}

function adicionarSaida() {
    let descricao = document.getElementById("descricao").value.trim();
    let valor = Number(document.getElementById("valor").value);

    if (descricao === "" || valor <= 0) {
        alert("Preencha a descrição e um valor válido para a saída.");
        return;
    }

    saldo -= Number(valor);
    totalSaidas += Number(valor);

    document.getElementById("saldoDashboard").innerHTML = formatarMoeda(saldo);
    document.getElementById("saidasDashboard").innerHTML = formatarMoeda(totalSaidas);
    document.getElementById("saldoAtual").innerHTML = formatarMoeda(saldo);

    movimentacoes.push({
        tipo: "saida",
        descricao: descricao,
        valor: valor,
        icone: "🔴",
        sinal: "-"
    });

    renderizarMovimentacoes();

    document.getElementById("descricao").value = "";
    document.getElementById("valor").value = "";

    atualizarMeta();
    atualizarBarras();
    salvarDados();
    carregarDashboard();
}

function criarMeta() {
    let nome = document.getElementById("nomeMeta").value.trim();
    let valorDigitado = Number(document.getElementById("valorMeta").value);

    if (nome === "" || valorDigitado <= 0) {
        alert("Digite o nome da meta e um valor válido.");
        return;
    }

    nomeMetaAtual = nome;
    valorMeta = valorDigitado;

    atualizarMeta();
    salvarDados();
}

function atualizarMeta() {
    if (valorMeta <= 0) {
        return;
    }

    let porcentagem = (Math.max(saldo, 0) / valorMeta) * 100;

    if (porcentagem > 100) {
        porcentagem = 100;
    }

    document.getElementById("progressoMeta").style.width = porcentagem + "%";

    let mensagem = "";

    if (porcentagem === 0) {
        mensagem = "Seu sonho começou agora. O primeiro passo já foi dado ✨";
    } else if (porcentagem < 30) {
        mensagem = "Você já começou. Continua, porque cada valor guardado importa 🤍";
    } else if (porcentagem < 70) {
        mensagem = "Você está avançando de verdade. Seu sonho já está mais perto do que antes 💪";
    } else if (porcentagem < 100) {
        mensagem = "Olha isso... seu sonho já está logo ali. Não desista agora 🥹🇵🇹";
    } else {
        mensagem = "Meta alcançada! Você conseguiu realizar esse sonho 🎉🤍";
    }

    document.getElementById("meta").innerHTML =
        "<h3>🎯 " + nomeMetaAtual + "</h3>" +
        "<p><strong>Objetivo:</strong> " + formatarMoeda(valorMeta) + "</p>" +
        "<p><strong>Progresso atual:</strong> " + porcentagem.toFixed(1) + "%</p>" +
        "<p>" + mensagem + "</p>";
}


function calcularForecast() {
    let economiaMensal = Number(document.getElementById("economiaMensal").value);

    if (valorMeta <= 0) {
        alert("Crie uma meta antes de calcular sua jornada.");
        return;
    }

    if (economiaMensal <= 0) {
        alert("Digite quanto consegue guardar por mês.");
        return;
    }

    let seisMeses = economiaMensal * 6;
    let umAno = economiaMensal * 12;
    let doisAnos = economiaMensal * 24;

    let faltam = valorMeta - Math.max(saldo, 0);

    if (faltam < 0) {
        faltam = 0;
    }

    let mesesParaMeta = 0;

    if (faltam > 0) {
        mesesParaMeta = Math.ceil(faltam / economiaMensal);
    }

    let anos = Math.floor(mesesParaMeta / 12);
    let meses = mesesParaMeta % 12;

    let porcentagem = ((Math.max(saldo, 0) + doisAnos) / valorMeta) * 100;

    if (porcentagem > 100) {
        porcentagem = 100;
    }

    document.getElementById("forecast").innerHTML =
        "<h3>📈 Sua Jornada</h3>" +
        "<p><strong>6 meses:</strong> " + formatarMoeda(seisMeses) + "</p>" +
        "<p><strong>1 ano:</strong> " + formatarMoeda(umAno) + "</p>" +
        "<p><strong>2 anos:</strong> " + formatarMoeda(doisAnos) + "</p>" +
        "<br>" +
        "<p><strong>Progresso previsto:</strong> " + porcentagem.toFixed(1) + "%</p>" +
        "<p><strong>Faltam:</strong> " + formatarMoeda(faltam) + "</p>" +
        "<p><strong>Tempo previsto:</strong> " + anos + " ano(s) e " + meses + " mês(es)</p>" +
        "<p>✨ Cada depósito aproxima você do seu sonho.</p>";
}


function atualizarBarras() {
    let total = totalEntradas + totalSaidas;

    if (total <= 0) {
        document.getElementById("progressoEntradas").style.width = "0%";
        document.getElementById("progressoSaidas").style.width = "0%";
        return;
    }

    let porcentagemEntradas = (totalEntradas / total) * 100;
    let porcentagemSaidas = (totalSaidas / total) * 100;

    document.getElementById("progressoEntradas").style.width = porcentagemEntradas + "%";
    document.getElementById("progressoSaidas").style.width = porcentagemSaidas + "%";
}


function adicionarTarefa() {
    let tarefa = document.getElementById("tarefa").value.trim();
    let prioridade = document.getElementById("prioridadeTarefa").value;
    let data = document.getElementById ("dataTarefa").value;

    if (tarefa === "") {
        alert("Digite uma tarefa antes de adicionar.");
        return;
    }

    
    

    let novaTarefa = {
        texto: tarefa,
        prioridade: prioridade,
        data: data,
        concluida: false
    };

    tarefas.push(novaTarefa);
    
    salvarDados();
    renderizarTarefas();

    document.getElementById("tarefa").value = "";
    document.getElementById("prioridadeTarefa").value = "Baixa";
    document.getElementById("dataTarefa").value = "";

}


function renderizarTarefas() {
    let listaHTML = "";

    tarefas.forEach(function(item, index) {
        let iconePrioridade = "";

        if (item.prioridade === "Baixa") {
            iconePrioridade = "🟢";
        } else if (item.prioridade === "Média") {
            iconePrioridade = "🟡";
        } else if (item.prioridade === "Alta") {
            iconePrioridade = "🔴";
        }

        let textoTarefa = item.texto;
  
        if (item.concluida) {
            textoTarefa = "<s>" + item.texto + "</s> ✅";
        }

        let dataFormatada = "";

        if (item.data){


            let partes = item.data.split("-");
            dataFormatada = partes[2] + "/" + partes[1] + "/" + partes[0];
            } else {
                dataFormatada = "Sem data";    
        }

        listaHTML += `
            <div class="item-tarefa">
                <p><strong>${iconePrioridade} ${item.prioridade}</strong> — ${textoTarefa}</p>
                <p>📆 ${dataFormatada}</p>
                <button onclick="marcarTarefa(${index})">Concluir</button>
                <button onclick="removerTarefa(${index})">Excluir</button>
            </div>
        `;
    });

    document.getElementById("listaTarefas").innerHTML = listaHTML;
}

function marcarTarefa(index) {
    tarefas[index].concluida = !tarefas[index].concluida;
    salvarDados();
    renderizarTarefas();
}

function removerTarefa(index) {
    tarefas.splice(index, 1);
    salvarDados();
    renderizarTarefas();
}

function toggleTarefa(index) {
tarefas[index].concluida = !tarefas[index].concluida;
renderizarTarefas();
salvarDados();
}

function excluirTarefa(index) {
tarefas.splice(index, 1);
renderizarTarefas();
salvarDados();
}


function carregarDashboard(){

    let hoje = new Date();
    let dia = hoje.getDate();
    let mes = hoje.getMonth() + 1;
    let ano = hoje.getFullYear();
    let dataAtual = dia + "/" + mes + "/" + ano;
    document.getElementById("dataAtual").innerHTML = dataAtual;
    let hora = hoje.getHours();
    let saudacao = "";
    if (hora < 12){

    saudacao = "☀️ Bom dia!";

    }

    else if (hora < 18){

        saudacao = "⛅ Boa tarde!";
    }

    else {

        saudacao = "🌙 Boa noite!";
    }

    document.getElementById("saudacao").innerHTML = saudacao;

    let frases = [


        "Cada pequeno passo aproxima você do seu sonho. 🤍",
        "O futuro pertece a quem começa hoje!",
        "Você está construindo algo incrivel",
        "Seu esforço de hoje será sua liberdade amanhã",
        "Nunca subestime o poder da constância."
    ];
    
    let numeroAleatorio = Math.floor(Math.random() *
    frases.length);

    document.getElementById("fraseMotivacional").innerHTML =
    frases[numeroAleatorio];


    document.getElementById("saldoAtual").innerHTML = formatarMoeda(saldo);
    document.getElementById("saldoDashboard").innerHTML = formatarMoeda(saldo);


}


function renderizarMovimentacoes() {

    let html = "";

    movimentacoes.forEach(function(item, index){

        html += `
        <p>
            ${item.icone}
            ${item.descricao}
            ${item.sinal}
            ${formatarMoeda(Number(item.valor))}
            <button onclick="excluirMovimentacao(${index})">🗑️</button>
        </p>
        `;

    });

    document.getElementById("movimentacoes").innerHTML = html;
}

function excluirMovimentacao(index){

    let item = movimentacoes[index];

    if(item.tipo === "entrada"){
        saldo -= Number(item.valor);
        totalEntradas -= Number(item.valor);
    }else{
        saldo += Number(item.valor);
        totalSaidas -= Number(item.valor);
    }

    movimentacoes.splice(index,1);

    document.getElementById("saldoDashboard").innerHTML = formatarMoeda(saldo);
    document.getElementById("entradasDashboard").innerHTML = formatarMoeda(totalEntradas);
    document.getElementById("saidasDashboard").innerHTML = formatarMoeda(totalSaidas);

    atualizarBarras();
    atualizarMeta();
    salvarDados();
    renderizarMovimentacoes();
}
mostrarAba("dashboard");
carregarDados();
carregarDashboard();
