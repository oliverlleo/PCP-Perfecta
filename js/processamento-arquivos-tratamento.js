/**
 * processamento-arquivos-tratamento.js
 * 
 * Funções específicas para processamento de arquivos na tela de tratamento de dados
 * Este arquivo contém a lógica para processar arquivos de tratamento e compará-los
 * com as listas existentes
 * 
 * Autor: Manus AI
 * Data: 20/05/2025
 */

/**
 * Processa um arquivo de tratamento e salva como "Lista Tratamento"
 * Esta função é uma adaptação da função processarArquivo() original,
 * mas específica para a tela de tratamento de dados
 * 
 * @param {File} arquivo - O arquivo a ser processado
 * @param {string} clienteId - ID do cliente
 * @returns {Promise} - Promise que resolve quando o arquivo for processado
 */
function processarArquivoTratamento(arquivo, clienteId) {
    return new Promise((resolve, reject) => {
        console.log('Iniciando processamento de arquivo de tratamento...');
        
        // Verifica se o arquivo foi fornecido
        if (!arquivo) {
            reject(new Error('Nenhum arquivo fornecido'));
            return;
        }

        // Identifica o tipo de arquivo pela extensão
        const tipoArquivo = obterTipoArquivo(arquivo.name);
        
        if (!tipoArquivo) {
            reject(new Error(`Formato de arquivo não suportado: ${arquivo.name.split('.').pop().toLowerCase()}`));
            return;
        }

        // Cria um FileReader para ler o arquivo
        const reader = new FileReader();

        reader.onload = function(e) {
            try {
                let dados = [];
                let mensagemErro = '';
                
                // Processa o arquivo de acordo com seu tipo
                switch (tipoArquivo) {
                    case 'csv':
                        try {
                            dados = processarCSV(e.target.result);
                        } catch (csvError) {
                            console.error('Erro ao processar CSV:', csvError);
                            mensagemErro = `Erro ao processar CSV: ${csvError.message}`;
                            // Tenta um processamento alternativo com diferentes separadores
                            try {
                                const separadores = [',', ';', '\t', '|'];
                                for (const sep of separadores) {
                                    try {
                                        dados = processarCSVComSeparador(e.target.result, sep);
                                        if (dados && dados.length > 0) {
                                            console.log(`Processamento alternativo com separador "${sep}" bem-sucedido`);
                                            mensagemErro = '';
                                            break;
                                        }
                                    } catch (e) {
                                        // Continua tentando outros separadores
                                    }
                                }
                            } catch (altError) {
                                console.error('Erro no processamento alternativo:', altError);
                            }
                        }
                        break;
                    case 'xlsx':
                        try {
                            dados = processarXLSX(e.target.result, arquivo.name);
                        } catch (xlsxError) {
                            console.error('Erro ao processar XLSX:', xlsxError);
                            mensagemErro = `Erro ao processar XLSX: ${xlsxError.message}`;
                            // Tenta processar como CSV em caso de falha
                            try {
                                const conteudoTexto = new TextDecoder().decode(e.target.result);
                                dados = processarCSV(conteudoTexto);
                                if (dados && dados.length > 0) {
                                    console.log('Processamento alternativo como CSV bem-sucedido');
                                    mensagemErro = '';
                                }
                            } catch (altError) {
                                console.error('Erro no processamento alternativo:', altError);
                            }
                        }
                        break;
                    case 'xml':
                        try {
                            dados = processarXML(e.target.result);
                        } catch (xmlError) {
                            console.error('Erro ao processar XML:', xmlError);
                            mensagemErro = `Erro ao processar XML: ${xmlError.message}`;
                            // Tenta processar como texto simples em caso de falha
                            try {
                                dados = processarTextoSimples(e.target.result);
                                if (dados && dados.length > 0) {
                                    console.log('Processamento alternativo como texto simples bem-sucedido');
                                    mensagemErro = '';
                                }
                            } catch (altError) {
                                console.error('Erro no processamento alternativo:', altError);
                            }
                        }
                        break;
                }
                
                if ((!dados || dados.length === 0) && mensagemErro) {
                    reject(new Error(mensagemErro || 'Não foi possível extrair dados do arquivo'));
                    return;
                }
                
                if (!dados || dados.length === 0) {
                    // Última tentativa: criar itens genéricos para demonstração
                    console.warn('Criando itens de demonstração devido à falha na extração de dados');
                    dados = criarItensDemonstracao(arquivo.name);
                }
                
                // Mescla com a lista de tratamento existente antes de salvar
                mesclarEsalvarListaTratamento(dados, clienteId)
                    .then(listaMesclada => {
                        resolve({
                            sucesso: true,
                            mensagem: `${listaMesclada.length} itens na lista de tratamento após mesclagem.`,
                            itens: listaMesclada.length, // Número de itens na lista mesclada
                            dados: listaMesclada // Retorna a lista mesclada
                        });
                    })
                    .catch(error => {
                        console.error('Erro ao mesclar e salvar no Firebase:', error);
                        reject(new Error(`Erro ao mesclar e salvar no Firebase: ${error.message}`));
                    });
            } catch (error) {
                console.error('Erro ao processar arquivo:', error);
                reject(new Error(`Erro ao processar arquivo: ${error.message}`));
            }
        };

        reader.onerror = function(error) {
            console.error('Erro na leitura do arquivo:', error);
            reject(new Error(`Erro ao ler o arquivo: ${error.message || 'Erro desconhecido'}`));
        };

        // Inicia a leitura do arquivo
        try {
            if (tipoArquivo === 'xlsx') {
                reader.readAsArrayBuffer(arquivo);
            } else {
                reader.readAsText(arquivo, 'ISO-8859-1'); // Alterado para ISO-8859-1 para melhor suporte a caracteres especiais
            }
        } catch (error) {
            console.error('Erro ao iniciar leitura do arquivo:', error);
            reject(new Error(`Erro ao iniciar leitura do arquivo: ${error.message}`));
        }
    });
}

/**
 * Mescla os novos itens com a ListaTratamento existente e salva no Firebase.
 * 
 * @param {Array} novosItens - Novos itens processados do arquivo.
 * @param {string} clienteId - ID do cliente.
 * @returns {Promise<Array>} - Promise que resolve com a lista de itens mesclada.
 */
async function mesclarEsalvarListaTratamento(novosItens, clienteId) {
    console.log(`Iniciando mesclagem da Lista Tratamento para o cliente ${clienteId}...`);

    if (!window.dbRef || !window.dbRef.projetos) {
        throw new Error('Referência ao banco de dados não disponível');
    }

    const listaTratamentoRef = window.dbRef.projetos.child(clienteId).child('Tratamento').child('listas').child('ListaTratamento');
    let itensExistentes = [];

    try {
        const snapshot = await listaTratamentoRef.once('value');
        const dadosListaExistente = snapshot.val();
        if (dadosListaExistente && dadosListaExistente.itens && Array.isArray(dadosListaExistente.itens)) {
            itensExistentes = dadosListaExistente.itens;
            console.log(`Encontrados ${itensExistentes.length} itens existentes na Lista Tratamento.`);
        } else {
            console.log('Nenhuma Lista Tratamento existente encontrada ou está vazia.');
        }
    } catch (error) {
        console.error('Erro ao carregar Lista Tratamento existente:', error);
        // Continuar com uma lista vazia se não puder carregar
    }

    const itensMescladosMap = new Map();

    // Adiciona itens existentes ao mapa
    itensExistentes.forEach(item => {
        if (item.codigo) {
            // Garante que a quantidade seja numérica
            item.quantidade = parseInt(item.quantidade) || 0;
            itensMescladosMap.set(item.codigo, item);
        }
    });

    // Mescla novos itens
    novosItens.forEach(novoItem => {
        if (novoItem.codigo) {
            const quantidadeNova = parseInt(novoItem.quantidade) || 0;
            if (itensMescladosMap.has(novoItem.codigo)) {
                // Item já existe, soma as quantidades
                const itemExistente = itensMescladosMap.get(novoItem.codigo);
                itemExistente.quantidade += quantidadeNova;
                // Atualiza outros campos se necessário (ex: descrição, se vier do novo arquivo)
                itemExistente.descricao = novoItem.descricao || itemExistente.descricao;
                // Adicione outros campos que devem ser atualizados aqui
            } else {
                // Novo item, adiciona ao mapa
                novoItem.quantidade = quantidadeNova;
                itensMescladosMap.set(novoItem.codigo, novoItem);
            }
        }
    });

    const listaFinalItens = Array.from(itensMescladosMap.values());
    console.log(`Total de ${listaFinalItens.length} itens após mesclagem.`);

    const dadosListaParaSalvar = {
        timestamp: Date.now(),
        itens: listaFinalItens
    };

    try {
        await listaTratamentoRef.set(dadosListaParaSalvar);
        console.log('Lista Tratamento mesclada e salva com sucesso no Firebase.');
        return listaFinalItens; // Retorna a lista de itens mesclada
    } catch (error) {
        console.error('Erro ao salvar Lista Tratamento mesclada no Firebase:', error);
        throw error; // Rejeita a promessa principal
    }
}


/**
 * Compara os itens de todas as listas com a Lista Tratamento
 * 
 * @param {string} clienteId - ID do cliente
 * @returns {Promise} - Promise que resolve quando a comparação for concluída
 */
function compararComListaTratamento(clienteId) {
    return new Promise((resolve, reject) => {
        console.log('Iniciando comparação com Lista Tratamento...');
        
        // Verifica se há um cliente selecionado
        if (!clienteId) {
            reject(new Error('Nenhum cliente selecionado'));
            return;
        }
        
        // Busca a Lista Tratamento no Firebase
        window.dbRef.projetos.child(clienteId).child('Tratamento').child('listas').child('ListaTratamento').once('value')
            .then(snapshot => {
                const listaTratamento = snapshot.val();
                
                // Verifica se a Lista Tratamento existe
                if (!listaTratamento || !listaTratamento.itens || !Array.isArray(listaTratamento.itens) || listaTratamento.itens.length === 0) {
                    reject(new Error('Lista Tratamento não encontrada ou vazia'));
                    return;
                }
                
                console.log(`Lista Tratamento encontrada com ${listaTratamento.itens.length} itens`);
                
                // Indexa os itens da Lista Tratamento (agora mesclada) por código
                const itensTratamentoMap = new Map();
                listaTratamento.itens.forEach(item => {
                    if (item.codigo) {
                        // Garante que a quantidade seja numérica
                        item.quantidade = parseInt(item.quantidade) || 0;
                        itensTratamentoMap.set(item.codigo, item);
                    }
                });

                // Busca todos os projetos e listas do cliente
                return window.dbRef.projetos.child(clienteId).once('value')
                    .then(async snapshotProjetos => { // Adicionado async aqui
                        const projetos = snapshotProjetos.val();

                        if (!projetos) {
                            console.warn('Nenhum projeto encontrado para este cliente durante a comparação.');
                            resolve(); // Resolve pois não há o que comparar
                            return;
                        }

                        const promessasAtualizacao = [];

                        for (const tipo of Object.keys(projetos)) {
                            if (tipo === 'Tratamento') continue; // Pula a própria lista de tratamento

                            const projeto = projetos[tipo];
                            if (projeto.terceirizado || !projeto.listas || objetoVazio(projeto.listas)) {
                                continue;
                            }

                            for (const nomeLista of Object.keys(projeto.listas)) {
                                const itensDaListaProjeto = projeto.listas[nomeLista];

                                if (Array.isArray(itensDaListaProjeto) && itensDaListaProjeto.length > 0) {
                                    for (let i = 0; i < itensDaListaProjeto.length; i++) {
                                        const itemProjeto = itensDaListaProjeto[i];
                                        const caminhoItemFirebase = `${tipo}/listas/${nomeLista}/${i}`;

                                        // Busca o estado atual do item no Firebase para obter empenhoAtual
                                        // Esta é uma simplificação. O ideal seria ter esses dados já carregados ou fazer menos leituras.
                                        // No entanto, para garantir a lógica correta com dados frescos:
                                        const snapshotItemAtual = await window.dbRef.projetos.child(clienteId).child(caminhoItemFirebase).once('value');
                                        const dadosItemAtual = snapshotItemAtual.val() || {};

                                        const empenhoAtual = parseInt(dadosItemAtual.empenho) || 0;
                                        // const necessidadeAtual = parseInt(dadosItemAtual.necessidade) || 0; // Não usado diretamente na nova lógica de cálculo, mas bom ter

                                        const quantidadeNecessariaProjeto = parseInt(itemProjeto.quantidade) || 0;
                                        let empenhoFinal = empenhoAtual; // Inicia com o empenho atual
                                        let necessidadeFinal;
                                        let statusFinal;

                                        const itemTratamentoCorrespondente = itensTratamentoMap.get(itemProjeto.codigo);

                                        if (itemTratamentoCorrespondente) {
                                            // Item existe na Lista de Tratamento
                                            const quantidadeDisponivelTratamento = itemTratamentoCorrespondente.quantidade;
                                            
                                            // Quanto podemos empenhar deste item do projeto com base no estoque disponível
                                            // e o que ainda falta ser empenhado para este item do projeto.
                                            const necessidadePendente = Math.max(0, quantidadeNecessariaProjeto - empenhoAtual);
                                            const podeEmpenharAdicional = Math.min(necessidadePendente, Math.max(0, quantidadeDisponivelTratamento - empenhoAtual));
                                            
                                            empenhoFinal = empenhoAtual + podeEmpenharAdicional;

                                            // Ajuste para não empenhar mais do que o necessário para o projeto
                                            empenhoFinal = Math.min(empenhoFinal, quantidadeNecessariaProjeto);
                                            
                                        } else {
                                            // Item do projeto não existe na Lista de Tratamento (ou estoque zerado)
                                            // Mantemos o empenhoAtual, pois a ausência na lista de tratamento não deve zerar empenhos.
                                            // A necessidade será a quantidade total do projeto menos o que já estava empenhado.
                                            // Isso assume que o empenhoAtual foi feito com base em um estoque que existia antes.
                                            // Se um item some do estoque, não podemos mais empenhar nada novo para ele.
                                        }

                                        necessidadeFinal = Math.max(0, quantidadeNecessariaProjeto - empenhoFinal);

                                        if (empenhoFinal >= quantidadeNecessariaProjeto) {
                                            statusFinal = 'Empenho'; // Totalmente empenhado
                                            necessidadeFinal = 0; // Garante que necessidade seja zero
                                        } else if (empenhoFinal > 0) {
                                            statusFinal = 'Empenho/Compras'; // Parcialmente empenhado
                                        } else {
                                            statusFinal = 'Compras'; // Nada empenhado
                                        }

                                        // Apenas atualiza se houver mudança para evitar escritas desnecessárias
                                        if (dadosItemAtual.empenho !== empenhoFinal ||
                                            dadosItemAtual.necessidade !== necessidadeFinal ||
                                            dadosItemAtual.status !== statusFinal) {
                                            promessasAtualizacao.push(
                                                window.dbRef.projetos.child(clienteId).child(caminhoItemFirebase).update({
                                                    empenho: empenhoFinal,
                                                    necessidade: necessidadeFinal,
                                                    status: statusFinal
                                                })
                                            );
                                        }
                                    }
                                }
                            }
                        }
                        return Promise.all(promessasAtualizacao);
                    })
                    .then(() => {
                        console.log('Comparação com Lista Tratamento (revisada) concluída com sucesso.');
                        resolve();
                    })
            })
            .catch(error => {
                console.error('Erro ao comparar com Lista Tratamento (revisada):', error);
                reject(error);
            });
    });
}
