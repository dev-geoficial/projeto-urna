let selectedCandidate = null;

if (!sessionStorage.getItem('votes')) {
    sessionStorage.setItem("votes", JSON.stringify({
        1: 0,    // Candidato 1
        2: 0,    // Votos Negativos
        branco: 0, // Voto em Branco
        nulo: 0   // Voto Nulo
    }));
}

function handleKeyPress(event) {
    event.preventDefault();
    if (event.key === '1') {
        confirmVote(1);
    } else if (event.key === '2') {
        confirmVote(2);
    } else if (event.key === '5') {
        confirmVote('branco');
    } else if (event.key === '6') {
        confirmVote('nulo');
    }
}

function confirmVote(candidateId) {
    selectedCandidate = candidateId;
    const confirmMessage = `Você escolheu: ${
        candidateId === 'branco' ? "Voto em Branco" :
        candidateId === 'nulo' ? "Voto Nulo" :
        candidateId === 1 ? "Chapa única: Adriana de Fátima Dias" :
        "Não desejo este Diretor"
    }. Pressione Enter para confirmar.`;
    document.getElementById('click-confirm-message').textContent = confirmMessage;
    document.getElementById('click-confirm-modal').style.display = 'block';
    document.addEventListener('keydown', handleEnter);
}

function handleEnter(event) {
    if (event.key === 'Enter' && selectedCandidate !== null) {
        registerVote();
        document.removeEventListener('keydown', handleEnter);
    }
}

function registerVote() {
    if (selectedCandidate !== null) {
        let votes = JSON.parse(sessionStorage.getItem('votes')) || {};
        votes[selectedCandidate] = (votes[selectedCandidate] || 0) + 1;
        sessionStorage.setItem('votes', JSON.stringify(votes));
        selectedCandidate = null;
        document.getElementById('click-confirm-modal').style.display = 'none';
        alert("Seu voto foi registrado com sucesso! Obrigado por votar.");
    }
}

function requestPassword() {
    const modal = document.getElementById('result-modal');
    const passwordInput = document.getElementById('admin-password');

    modal.style.display = 'block';
    passwordInput.value = '';
    passwordInput.focus();
    document.removeEventListener('keydown', handleKeyPress);
}

function checkPassword() {
    const password = document.getElementById('admin-password').value;
    const adminPassword = "admin";

    if (password === adminPassword) {
        generateReport();
    } else {
        alert("Senha incorreta!");
        document.getElementById('admin-password').focus();
    }

    document.getElementById('result-modal').style.display = 'none';
    document.addEventListener('keydown', handleKeyPress);
}

function generateReport() {
    let votes = JSON.parse(sessionStorage.getItem('votes')) || {};

    // Capturar os nomes dos candidatos a partir do HTML
    const candidate1Name = document.querySelector('[data-id="1"] h2').textContent.split(': ')[1];
    const candidate2Name = "Votos Negativos";

    let resultText = "";
    let totalVotes = votes[1] + votes[2] + (votes.branco || 0) + (votes.nulo || 0);
    let majorityThreshold = Math.ceil(totalVotes / 2);

    if (votes[2] > majorityThreshold) {
        resultText = `Foram computados ${votes[2]} votos negativos. O diretor não foi eleito.`;
    } else if (votes[1] > votes[2]) {
        resultText = `Parabéns, o candidato eleito é ${candidate1Name} com ${votes[1]} votos.`;
    } else if (votes[1] === votes[2]) {
        resultText = `Empate! Foram computados ${votes[1]} votos para ${candidate1Name} e ${votes[2]} votos negativos.`;
    } else {
        resultText = `Nenhum vencedor. O diretor não foi eleito devido a maioria de votos negativos.`;
    }

    // Gerar o PDF com os nomes dos candidatos
    generatePDF(votes, resultText, candidate1Name, candidate2Name);
}

function generatePDF(votes, resultText, candidate1Name, candidate2Name) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Dimensões e margens
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    const lineHeight = 10;

    // Adicionar o brasão no cabeçalho
    const image = new Image();
    image.src = 'img/brasao.png';
    const imageWidth = 90;
    const imageHeight = 40;
    const imageX = (pageWidth - imageWidth) / 2;
    const imageY = margin;
    doc.addImage(image, 'PNG', imageX, imageY, imageWidth, imageHeight);

    // Adicionar o título abaixo da imagem
    const title = "Resultado da Eleição da E.M. Melchor Del Blanco Miguel";
    doc.setFontSize(18);
    const titleX = (pageWidth - doc.getTextWidth(title)) / 2;
    const titleY = imageY + imageHeight + 10;
    doc.text(title, titleX, titleY);

    // Adicionar os totais de votos no corpo do documento
    doc.setFontSize(14);
    let currentY = titleY + 20;
    doc.text(`Totais de votos:`, margin, currentY);
    currentY += lineHeight;

    // Dados de votos
    const voteData = [
        `${candidate1Name}: ${votes[1] || 0} votos`,
        `${candidate2Name}: ${votes[2] || 0} votos`,
        `Votos em Branco: ${votes.branco || 0} votos`,
        `Votos Nulos: ${votes.nulo || 0} votos`,
    ];

    voteData.forEach(line => {
        doc.text(line, margin, currentY);
        currentY += lineHeight;
    });

    // Adicionar a mensagem final
    currentY += 10;
    doc.setFontSize(16);
    const textLines = doc.splitTextToSize(resultText, contentWidth);
    textLines.forEach(line => {
        doc.text(line, margin, currentY);
        currentY += lineHeight;
    });

    // Salvar o PDF
    doc.save('RESULTADOS_DA_ELEICAO.pdf');
}


document.addEventListener('keydown', handleKeyPress);
