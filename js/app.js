document.addEventListener('DOMContentLoaded', function() {
    // Usar as instâncias do Firebase já inicializadas em config.js
    // Não inicializar novamente para evitar erro de app duplicado
    
    // Elementos do DOM - verificando cada um individualmente
    const btnNovoCadastro = document.getElementById('btnNovoCadastro');
    const modalCadastroElement = document.getElementById('modalCadastro');
    const formCadastro = document.getElementById('formCadastro');
    const accordionTipos = document.getElementById('accordionTipos');
    const tabelaClientes = document.getElementById('tabelaClientes');
    const btnFiltrar = document.getElementById('btnFiltrar');
    const btnLimparFiltros = document.getElementById('btnLimparFiltros');
    const btnSalvar = document.getElementById('btnSalvar');
    
    // Inicializar modal apenas se o elemento existir
    const modalCadastro = modalCadastroElement ? new bootstrap.Modal(modalCadastroElement) : null;
    
    // Verificar elementos críticos individualmente e registrar quais estão faltando
    const elementosFaltantes = [];
    
    if (!btnNovoCadastro) elementosFaltantes.push('btnNovoCadastro');
    if (!modalCadastroElement) elementosFaltantes.push('modalCadastro');
    if (!formCadastro) elementosFaltantes.push('formCadastro');
    if (!accordionTipos) elementosFaltantes.push('accordionTipos');
    if (!tabelaClientes) elementosFaltantes.push('tabelaClientes');
    if (!btnSalvar) elementosFaltantes.push('btnSalvar');
    
    // Se houver elementos críticos faltando, registrar erro mas continuar com o que for possível
    if (elementosFaltantes.length > 0) {
        console.error('Elementos DOM faltantes:', elementosFaltantes.join(', '));
    }
    
    // Contadores para listas adicionais
    const contadoresListas = {
        PVC: 0,
        Aluminio: 0,
        Brise: 0,
        ACM: 0,
        Trilho: 0,
        Outros: 0
    };
    
    // Inicializar
    carregarClientes();
    carregarFiltroClientes();
    
    // Event Listeners
    btnNovoCadastro.addEventListener('click', abrirModalCadastro);
    
    if (formCadastro) {
        formCadastro.addEventListener('submit', function(e) {
            e.preventDefault();
            salvarCadastro();
        });
    }
    
    // Adicionar classe tipo-projeto aos checkboxes de tipo de projeto
    document.querySelectorAll('input[type="checkbox"][id^="tipo"]').forEach(checkbox => {
        checkbox.classList.add('tipo-projeto');
        checkbox.addEventListener('change', function() {
            atualizarProjetosVisiveis();
        });
    });
    
    if (btnFiltrar) btnFiltrar.addEventListener('click', filtrarClientes);
    if (btnLimparFiltros) btnLimparFiltros.addEventListener('click', limparFiltros);
    
    // Funções
    function abrirModalCadastro() {
        // Verificar se o modal existe
        const modalElement = document.getElementById('modalCadastro');
        if (!modalElement) {
            console.error('Modal de cadastro não encontrado');
            return;
        }
        
        // Limpar formulário
        if (formCadastro) {
            formCadastro.reset();
        }
        
        // Limpar accordion de tipos
        if (accordionTipos) {
            accordionTipos.innerHTML = '';
        }
        
        // Resetar contadores
        for (const tipo in contadoresListas) {
            contadoresListas[tipo] = 0;
        }
        
        if (modalCadastro) {
            modalCadastro.show();
        }
    }
    
    function atualizarProjetosVisiveis() {
        if (!accordionTipos) return;
        
        accordionTipos.innerHTML = '';
        
        document.querySelectorAll('.tipo-projeto:checked').forEach(checkbox => {
            const tipo = checkbox.value;
            
            const projetoDiv = document.createElement('div');
            projetoDiv.className = 'projeto-container mb-4';
            projetoDiv.innerHTML = `<h4 class="projeto-titulo">${tipo}</h4>`;
            
            // Adicionar conteúdo específico para cada tipo de projeto
            if (tipo === 'PVC') {
                projetoDiv.innerHTML += criarConteudoPVC();
            } else if (tipo === 'Alumínio') {
                projetoDiv.innerHTML += criarConteudoAluminio();
            } else if (tipo === 'Brise') {
                projetoDiv.innerHTML += criarConteudoBrise();
            } else if (tipo === 'ACM') {
                projetoDiv.innerHTML += criarConteudoACM();
            } else if (tipo === 'Trilho') {
                projetoDiv.innerHTML += criarConteudoTrilho();
            } else if (tipo === 'Outros') {
                projetoDiv.innerHTML += criarConteudoOutros();
            }
            
            accordionTipos.appendChild(projetoDiv);
        });
        
        // Adicionar event listeners para radios de terceirização
        document.querySelectorAll('input[name^="terceirizado"]').forEach(radio => {
            radio.addEventListener('change', function() {
                const tipo = this.name.replace('terceirizado', '');
                const terceirizadoContainer = document.getElementById(`terceirizado${tipo}Container`);
                const listasContainer = document.getElementById(`listas${tipo}Container`);
                
                if (terceirizadoContainer && listasContainer) {
                    if (this.value === 'sim') {
                        terceirizadoContainer.style.display = 'block';
                        listasContainer.style.display = 'none';
                    } else {
                        terceirizadoContainer.style.display = 'none';
                        listasContainer.style.display = 'block';
                    }
                }
            });
        });
        
        // Adicionar event listeners para botões de adicionar lista
        document.querySelectorAll('.btn-adicionar-lista').forEach(btn => {
            btn.addEventListener('click', function() {
                const tipo = this.dataset.tipo;
                adicionarLista(tipo);
            });
        });
    }
    
    function criarConteudoPVC() {
        return `
            <div class="listas-container" id="listasPVCContainer">
                <h5>Listas Obrigatórias</h5>
                <div class="mb-3">
                    <label class="form-label">PVC</label>
                    <input type="file" class="form-control" id="listaPVCPVC" accept=".csv,.xlsx,.xml,.txt">
                </div>
                <div class="mb-3">
                    <label class="form-label">Reforço</label>
                    <input type="file" class="form-control" id="listaReforcoPVC" accept=".csv,.xlsx,.xml,.txt">
                </div>
                <div class="mb-3">
                    <label class="form-label">Ferragens</label>
                    <input type="file" class="form-control" id="listaFerragensPVC" accept=".csv,.xlsx,.xml,.txt">
                </div>
                <div class="mb-3">
                    <label class="form-label">Vidros</label>
                    <input type="file" class="form-control" id="listaVidrosPVC" accept=".csv,.xlsx,.xml,.txt">
                </div>
                
                <h5>Listas Opcionais</h5>
                <div class="mb-3">
                    <label class="form-label">Esteira</label>
                    <input type="file" class="form-control" id="listaEsteiraPVC" accept=".csv,.xlsx,.xml,.txt">
                </div>
                <div class="mb-3">
                    <label class="form-label">Motor</label>
                    <input type="file" class="form-control" id="listaMotorPVC" accept=".csv,.xlsx,.xml,.txt">
                </div>
                <div class="mb-3">
                    <label class="form-label">Acabamento</label>
                    <input type="file" class="form-control" id="listaAcabamentoPVC" accept=".csv,.xlsx,.xml,.txt">
                </div>
                <div class="mb-3">
                    <label class="form-label">Tela Retrátil</label>
                    <input type="file" class="form-control" id="listaTelaRetratilPVC" accept=".csv,.xlsx,.xml,.txt">
                </div>
                <div class="mb-3">
                    <label class="form-label">Aço</label>
                    <input type="file" class="form-control" id="listaAcoPVC" accept=".csv,.xlsx,.xml,.txt">
                </div>
                
                <h5>Listas Adicionais</h5>
                <div id="listasOutrosPVC"></div>
                <button type="button" class="btn btn-sm btn-secondary btn-adicionar-lista" data-tipo="PVC">
                    <i class="fas fa-plus"></i> Adicionar Lista
                </button>
            </div>
        `;
    }
    
    function criarConteudoAluminio() {
        return `
            <div class="terceirizado-container mb-3">
                <label class="form-label">Serviço é terceirizado?</label>
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="terceirizadoAlumínio" id="terceirizadoAlumínioSim" value="sim">
                    <label class="form-check-label" for="terceirizadoAlumínioSim">Sim</label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="terceirizadoAlumínio" id="terceirizadoAlumínioNao" value="nao" checked>
                    <label class="form-check-label" for="terceirizadoAlumínioNao">Não</label>
                </div>
            </div>
            
            <div class="terceirizado-sim-container" id="terceirizadoAlumínioContainer" style="display: none;">
                <div class="mb-3">
                    <label class="form-label">Nome da empresa contratada</label>
                    <input type="text" class="form-control" id="empresaAlumínio">
                </div>
                <div class="mb-3">
                    <label class="form-label">Data da solicitação</label>
                    <input type="date" class="form-control" id="dataSolicitacaoAlumínio">
                </div>
                <div class="mb-3">
                    <label class="form-label">Prazo de entrega</label>
                    <input type="date" class="form-control" id="prazoEntregaAlumínio">
                </div>
            </div>
            
            <div class="listas-container" id="listasAlumínioContainer">
                <h5>Listas Obrigatórias</h5>
                <div class="mb-3">
                    <label class="form-label">Perfil</label>
                    <input type="file" class="form-control" id="listaPerfilAlumínio" accept=".csv,.xlsx,.xml,.txt">
                </div>
                <div class="mb-3">
                    <label class="form-label">Contra Marco</label>
                    <input type="file" class="form-control" id="listaContraMarcoAlumínio" accept=".csv,.xlsx,.xml,.txt">
                </div>
                <div class="mb-3">
                    <label class="form-label">Ferragens</label>
                    <input type="file" class="form-control" id="listaFerragensAlumínio" accept=".csv,.xlsx,.xml,.txt">
                </div>
                <div class="mb-3">
                    <label class="form-label">Vidro</label>
                    <input type="file" class="form-control" id="listaVidroAlumínio" accept=".csv,.xlsx,.xml,.txt">
                </div>
                
                <h5>Listas Opcionais</h5>
                <div class="mb-3">
                    <label class="form-label">Motor</label>
                    <input type="file" class="form-control" id="listaMotorAlumínio" accept=".csv,.xlsx,.xml,.txt">
                </div>
                <div class="mb-3">
                    <label class="form-label">Esteira</label>
                    <input type="file" class="form-control" id="listaEsteiraAlumínio" accept=".csv,.xlsx,.xml,.txt">
                </div>
                <div class="mb-3">
                    <label class="form-label">Acabamento</label>
                    <input type="file" class="form-control" id="listaAcabamentoAlumínio" accept=".csv,.xlsx,.xml,.txt">
                </div>
                <div class="mb-3">
                    <label class="form-label">Tela Retrátil</label>
                    <input type="file" class="form-control" id="listaTelaRetratilAlumínio" accept=".csv,.xlsx,.xml,.txt">
                </div>
                
                <h5>Listas Adicionais</h5>
                <div id="listasOutrosAluminio"></div>
                <button type="button" class="btn btn-sm btn-secondary btn-adicionar-lista" data-tipo="Aluminio">
                    <i class="fas fa-plus"></i> Adicionar Lista
                </button>
            </div>
        `;
    }
    
    function criarConteudoBrise() {
        return `
            <div class="terceirizado-container mb-3">
                <label class="form-label">Terceirizado?</label>
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="terceirizadoBrise" id="terceirizadoBriseSim" value="sim">
                    <label class="form-check-label" for="terceirizadoBriseSim">Sim</label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="terceirizadoBrise" id="terceirizadoBriseNao" value="nao" checked>
                    <label class="form-check-label" for="terceirizadoBriseNao">Não</label>
                </div>
            </div>
            
            <div class="terceirizado-sim-container" id="terceirizadoBriseContainer" style="display: none;">
                <div class="mb-3">
                    <label class="form-label">Nome da empresa contratada</label>
                    <input type="text" class="form-control" id="empresaBrise">
                </div>
                <div class="mb-3">
                    <label class="form-label">Data da solicitação</label>
                    <input type="date" class="form-control" id="dataSolicitacaoBrise">
                </div>
                <div class="mb-3">
                    <label class="form-label">Prazo de entrega</label>
                    <input type="date" class="form-control" id="prazoEntregaBrise">
                </div>
            </div>
            
            <div class="listas-container" id="listasBriseContainer">
                <h5>Listas Obrigatórias</h5>
                <div class="mb-3">
                    <label class="form-label">Perfil</label>
                    <input type="file" class="form-control" id="listaPerfilBrise" accept=".csv,.xlsx,.xml,.txt">
                </div>
                <div class="mb-3">
                    <label class="form-label">Conexão</label>
                    <input type="file" class="form-control" id="listaConexaoBrise" accept=".csv,.xlsx,.xml,.txt">
                </div>
                <div class="mb-3">
                    <label class="form-label">Ferragens</label>
                    <input type="file" class="form-control" id="listaFerragensBrise" accept=".csv,.xlsx,.xml,.txt">
                </div>
                
                <h5>Listas Opcionais</h5>
                <div class="mb-3">
                    <label class="form-label">Fechadura</label>
                    <input type="file" class="form-control" id="listaFechaduraBrise" accept=".csv,.xlsx,.xml,.txt">
                </div>
                
                <h5>Listas Adicionais</h5>
                <div id="listasOutrosBrise"></div>
                <button type="button" class="btn btn-sm btn-secondary btn-adicionar-lista" data-tipo="Brise">
                    <i class="fas fa-plus"></i> Adicionar Lista
                </button>
            </div>
        `;
    }
    
    function criarConteudoACM() {
        return `
            <div class="terceirizado-container mb-3">
                <label class="form-label">Terceirizado?</label>
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="terceirizadoACM" id="terceirizadoACMSim" value="sim">
                    <label class="form-check-label" for="terceirizadoACMSim">Sim</label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="terceirizadoACM" id="terceirizadoACMNao" value="nao" checked>
                    <label class="form-check-label" for="terceirizadoACMNao">Não</label>
                </div>
            </div>
            
            <div class="terceirizado-sim-container" id="terceirizadoACMContainer" style="display: none;">
                <div class="mb-3">
                    <label class="form-label">Nome da empresa contratada</label>
                    <input type="text" class="form-control" id="empresaACM">
                </div>
                <div class="mb-3">
                    <label class="form-label">Data da solicitação</label>
                    <input type="date" class="form-control" id="dataSolicitacaoACM">
                </div>
                <div class="mb-3">
                    <label class="form-label">Prazo de entrega</label>
                    <input type="date" class="form-control" id="prazoEntregaACM">
                </div>
            </div>
            
            <div class="listas-container" id="listasACMContainer">
                <h5>Listas Obrigatórias</h5>
                <div class="mb-3">
                    <label class="form-label">Perfil</label>
                    <input type="file" class="form-control" id="listaPerfilACM" accept=".csv,.xlsx,.xml,.txt">
                </div>
                <div class="mb-3">
                    <label class="form-label">Conexão</label>
                    <input type="file" class="form-control" id="listaConexaoACM" accept=".csv,.xlsx,.xml,.txt">
                </div>
                <div class="mb-3">
                    <label class="form-label">Ferragens</label>
                    <input type="file" class="form-control" id="listaFerragensACM" accept=".csv,.xlsx,.xml,.txt">
                </div>
                <div class="mb-3">
                    <label class="form-label">ACM</label>
                    <input type="file" class="form-control" id="listaACMACM" accept=".csv,.xlsx,.xml,.txt">
                </div>
                
                <h5>Listas Opcionais</h5>
                <div class="mb-3">
                    <label class="form-label">Fechadura</label>
                    <input type="file" class="form-control" id="listaFechaduraACM" accept=".csv,.xlsx,.xml,.txt">
                </div>
                
                <h5>Listas Adicionais</h5>
                <div id="listasOutrosACM"></div>
                <button type="button" class="btn btn-sm btn-secondary btn-adicionar-lista" data-tipo="ACM">
                    <i class="fas fa-plus"></i> Adicionar Lista
                </button>
            </div>
        `;
    }
    
    function criarConteudoTrilho() {
        return `
            <div class="listas-container" id="listasTrilhoContainer">
                <h5>Listas Obrigatórias</h5>
                <div class="mb-3">
                    <label class="form-label">Perfil</label>
                    <input type="file" class="form-control" id="listaPerfilTrilho" accept=".csv,.xlsx,.xml,.txt">
                </div>
                
                <h5>Listas Adicionais</h5>
                <div id="listasOutrosTrilho"></div>
                <button type="button" class="btn btn-sm btn-secondary btn-adicionar-lista" data-tipo="Trilho">
                    <i class="fas fa-plus"></i> Adicionar Lista
                </button>
            </div>
        `;
    }
    
    function criarConteudoOutros() {
        return `
            <div class="terceirizado-container mb-3">
                <label class="form-label">Terceirizado?</label>
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="terceirizadoOutros" id="terceirizadoOutrosSim" value="sim">
                    <label class="form-check-label" for="terceirizadoOutrosSim">Sim</label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="terceirizadoOutros" id="terceirizadoOutrosNao" value="nao" checked>
                    <label class="form-check-label" for="terceirizadoOutrosNao">Não</label>
                </div>
            </div>
            
            <div class="terceirizado-sim-container" id="terceirizadoOutrosContainer" style="display: none;">
                <div class="mb-3">
                    <label class="form-label">Nome da empresa contratada</label>
                    <input type="text" class="form-control" id="empresaOutros">
                </div>
                <div class="mb-3">
                    <label class="form-label">Data da solicitação</label>
                    <input type="date" class="form-control" id="dataSolicitacaoOutros">
                </div>
                <div class="mb-3">
                    <label class="form-label">Prazo de entrega</label>
                    <input type="date" class="form-control" id="prazoEntregaOutros">
                </div>
            </div>
            
            <div class="listas-container" id="listasOutrosContainer">
                <h5>Listas Adicionais</h5>
                <div id="listasOutrosOutros"></div>
                <button type="button" class="btn btn-sm btn-secondary btn-adicionar-lista" data-tipo="Outros">
                    <i class="fas fa-plus"></i> Adicionar Lista
                </button>
            </div>
        `;
    }
    
    function adicionarLista(tipo) {
        const container = document.getElementById(`listasOutros${tipo}`);
        if (!container) return;
        
        const contador = ++contadoresListas[tipo];
        
        const listaDiv = document.createElement('div');
        listaDiv.className = 'lista-adicional';
        listaDiv.id = `listaOutros${tipo}${contador}`;
        
        listaDiv.innerHTML = `
            <div class="mb-3">
                <label class="form-label">
                    <input type="text" class="form-control form-control-sm d-inline-block" 
                           style="width: auto;" placeholder="Nome da lista" 
                           id="nomeListaOutros${tipo}${contador}">
                    <button type="button" class="btn-remover-lista" 
                            onclick="removerLista('${tipo}', ${contador})">
                        <i class="fas fa-times"></i>
                    </button>
                </label>
                <input type="file" class="form-control" 
                       id="arquivoListaOutros${tipo}${contador}" 
                       accept=".csv,.xlsx,.xml,.txt">
            </div>
        `;
        
        container.appendChild(listaDiv);
    }
    
    // Função global para remover lista
    window.removerLista = function(tipo, contador) {
        const listaDiv = document.getElementById(`listaOutros${tipo}${contador}`);
        if (listaDiv) {
            listaDiv.remove();
        }
    }
    
    // Adicionar event listener para o botão salvar
    if (btnSalvar) {
        btnSalvar.addEventListener('click', function() {
            salvarCadastro();
        });
    }
    
    async function salvarCadastro() {
        try {
            const nomeClienteElement = document.getElementById('nomeCliente');
            
            if (!nomeClienteElement) {
                console.error('Elemento nomeCliente não encontrado');
                return;          }
            
            const nomeCliente = nomeClienteElement.value.trim();
            
            if (!nomeCliente) {
                alert('Por favor, informe o nome do cliente.');
                return;
            }
            
            const tiposSelecionados = [];
            document.querySelectorAll('.tipo-projeto:checked').forEach(checkbox => {
                tiposSelecionados.push(checkbox.value);
            });
            
            if (tiposSelecionados.length === 0) {
                alert('Por favor, selecione pelo menos um tipo de projeto.');
                return;
            }
            
            // Gerar ID único para o cliente
            const clienteId = database.ref().child('clientes').push().key;
            const dataCadastro = new Date().toISOString();
            
            // Objeto para armazenar dados do cliente
            const clienteData = {
                id: clienteId,
                nome: nomeCliente,
                tipos: tiposSelecionados,
                dataCadastro: dataCadastro,
                status: 'Pendente'
            };
            
            // Salvar dados básicos do cliente
            await database.ref(`clientes/${clienteId}`).set(clienteData);
            
            // Processar cada tipo de projeto selecionado
            for (const tipo of tiposSelecionados) {
                // Verificar se é terceirizado
                if (tipo !== 'PVC' && tipo !== 'Trilho') {
                    const terceirizadoRadio = document.querySelector(`input[name="terceirizado${tipo}"]:checked`);
                    
                    if (terceirizadoRadio && terceirizadoRadio.value === 'sim') {
                        const empresaElement = document.getElementById(`empresa${tipo}`);
                        const dataSolicitacaoElement = document.getElementById(`dataSolicitacao${tipo}`);
                        const prazoEntregaElement = document.getElementById(`prazoEntrega${tipo}`);
                        
                        const empresa = empresaElement ? empresaElement.value : '';
                        const dataSolicitacao = dataSolicitacaoElement ? dataSolicitacaoElement.value : '';
                        const prazoEntrega = prazoEntregaElement ? prazoEntregaElement.value : '';
                        
                        // Salvar dados de terceirização diretamente na estrutura correta
                        await database.ref(`clientes/${clienteId}/tipos/${tipo.toLowerCase()}`).set({
                            terceirizado: true,
                            empresa: empresa,
                            dataSolicitacao: dataSolicitacao,
                            prazoEntrega: prazoEntrega
                        });
                        
                        continue; // Pular para o próximo tipo
                    }
                }
                
                // Se não for terceirizado, processar listas
                await database.ref(`clientes/${clienteId}/tipos/${tipo.toLowerCase()}`).set({
                    terceirizado: false
                });
                
                // Processar listas para este tipo
                await processarListasPorTipo(tipo, clienteId);
            }
            
            alert('Cadastro salvo com sucesso!');
            modalCadastro.hide();
            carregarClientes();
            carregarFiltroClientes();
            
        } catch (error) {
            console.error('Erro ao salvar cadastro:', error);
            alert('Erro ao salvar cadastro. Por favor, tente novamente.');
        }
    }
    
    async function processarListasPorTipo(tipo, clienteId) {
        // Definir listas obrigatórias e opcionais por tipo
        const listasConfig = {
            PVC: {
                obrigatorias: ['PVC', 'Reforco', 'Ferragens', 'Vidros'],
                opcionais: ['Esteira', 'Motor', 'Acabamento', 'TelaRetratil', 'Aco']
            },
            Alumínio: {
                obrigatorias: ['Perfil', 'ContraMarco', 'Ferragens', 'Vidro'],
                opcionais: ['Motor', 'Esteira', 'Acabamento', 'TelaRetratil']
            },
            Brise: {
                obrigatorias: ['Perfil', 'Conexao', 'Ferragens'],
                opcionais: ['Fechadura']
            },
            ACM: {
                obrigatorias: ['Perfil', 'Conexao', 'Ferragens', 'ACM'],
                opcionais: ['Fechadura']
            },
            Trilho: {
                obrigatorias: ['Perfil'],
                opcionais: []
            },
            Outros: {
                obrigatorias: [],
                opcionais: []
            }
        };
        
        const config = listasConfig[tipo];
        
        if (!config) return;
        
        // Processar listas obrigatórias
        for (const lista of config.obrigatorias) {
            const fileInput = document.getElementById(`lista${lista}${tipo}`);
            if (fileInput && fileInput.files.length > 0) {
                const file = fileInput.files[0];
                const dadosLista = await processarArquivo(file);
                
                if (dadosLista && dadosLista.length > 0) {
                    // Criar referência para a lista específica
                    const listaRef = database.ref(`clientes/${clienteId}/tipos/${tipo.toLowerCase()}/listas/${lista.toLowerCase()}`);
                    
                    // Salvar metadados da lista
                    await listaRef.update({
                        nomeArquivo: file.name,
                        conteudoProcessado: "Arquivo " + file.name + " será processado.",
                        nomeLista: lista,
                        tipoLista: "obrigatoria"
                    });
                    
                    // Salvar cada item individualmente no Firebase
                    const promises = [];
                    for (let i = 0; i < dadosLista.length; i++) {
                        const item = dadosLista[i];
                        promises.push(listaRef.child(`itens/item_${i}`).set({
                            codigo: item.codigo || '',
                            descricao: item.descricao || '',
                            quantidade: item.quantidade || '',
                            medida: item.medida || '',
                            altura: item.altura || '',
                            largura: item.largura || '',
                            cor: item.cor || ''
                        }));
                    }
                    
                    // Aguardar todas as operações de escrita
                    await Promise.all(promises);
                    
                    // Upload do arquivo para o Storage
                    const storageRef = storage.ref(`clientes/${clienteId}/${tipo.toLowerCase()}/${lista.toLowerCase()}/${file.name}`);
                    await storageRef.put(file);
                    
                    console.log(`Lista ${lista} do tipo ${tipo} processada com ${dadosLista.length} itens`);
                }
            }
        }
        
        // Processar listas opcionais
        for (const lista of config.opcionais) {
            const fileInput = document.getElementById(`lista${lista}${tipo}`);
            if (fileInput && fileInput.files.length > 0) {
                const file = fileInput.files[0];
                const dadosLista = await processarArquivo(file);
                
                if (dadosLista && dadosLista.length > 0) {
                    // Criar referência para a lista específica
                    const listaRef = database.ref(`clientes/${clienteId}/tipos/${tipo.toLowerCase()}/listas/${lista.toLowerCase()}`);
                    
                    // Salvar metadados da lista
                    await listaRef.update({
                        nomeArquivo: file.name,
                        conteudoProcessado: "Arquivo " + file.name + " será processado.",
                        nomeLista: lista,
                        tipoLista: "opcional"
                    });
                    
                    // Salvar cada item individualmente no Firebase
                    const promises = [];
                    for (let i = 0; i < dadosLista.length; i++) {
                        const item = dadosLista[i];
                        promises.push(listaRef.child(`itens/item_${i}`).set({
                            codigo: item.codigo || '',
                            descricao: item.descricao || '',
                            quantidade: item.quantidade || '',
                            medida: item.medida || '',
                            altura: item.altura || '',
                            largura: item.largura || '',
                            cor: item.cor || ''
                        }));
                    }
                    
                    // Aguardar todas as operações de escrita
                    await Promise.all(promises);
                    
                    // Upload do arquivo para o Storage
                    const storageRef = storage.ref(`clientes/${clienteId}/${tipo.toLowerCase()}/${lista.toLowerCase()}/${file.name}`);
                    await storageRef.put(file);
                    
                    console.log(`Lista opcional ${lista} do tipo ${tipo} processada com ${dadosLista.length} itens`);
                }
            }
        }
        
        // Processar listas adicionais (Outros)
        const tipoNormalizado = tipo.replace('í', 'i');
        const contador = contadoresListas[tipoNormalizado];
        for (let i = 1; i <= contador; i++) {
            const nomeInput = document.getElementById(`nomeListaOutros${tipoNormalizado}${i}`);
            const fileInput = document.getElementById(`arquivoListaOutros${tipoNormalizado}${i}`);
            
            if (nomeInput && fileInput && fileInput.files.length > 0) {
                const nomeLista = nomeInput.value.trim() || `Outros${i}`;
                const file = fileInput.files[0];
                const dadosLista = await processarArquivo(file);
                
                if (dadosLista && dadosLista.length > 0) {
                    // Criar referência para a lista específica
                    const listaKey = `outros_${nomeLista.toLowerCase().replace(/\s+/g, '_')}`;
                    const listaRef = database.ref(`clientes/${clienteId}/tipos/${tipo.toLowerCase()}/listas/${listaKey}`);
                    
                    // Salvar metadados da lista
                    await listaRef.update({
                        nomeArquivo: file.name,
                        conteudoProcessado: "Arquivo " + file.name + " será processado.",
                        nomeLista: nomeLista,
                        tipoLista: "adicional"
                    });
                    
                    // Salvar cada item individualmente no Firebase
                    const promises = [];
                    for (let j = 0; j < dadosLista.length; j++) {
                        const item = dadosLista[j];
                        promises.push(listaRef.child(`itens/item_${j}`).set({
                            codigo: item.codigo || '',
                            descricao: item.descricao || '',
                            quantidade: item.quantidade || '',
                            medida: item.medida || '',
                            altura: item.altura || '',
                            largura: item.largura || '',
                            cor: item.cor || ''
                        }));
                    }
                    
                    // Aguardar todas as operações de escrita
                    await Promise.all(promises);
                    
                    // Upload do arquivo para o Storage
                    const storageRef = storage.ref(`clientes/${clienteId}/${tipo.toLowerCase()}/outros/${listaKey}/${file.name}`);
                    await storageRef.put(file);
                    
                    console.log(`Lista adicional ${nomeLista} do tipo ${tipo} processada com ${dadosLista.length} itens`);
                }
            }
        }
    }
    
    async function processarArquivo(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    const extension = file.name.split('.').pop().toLowerCase();
                    let dados = [];
                    let conteudo = e.target.result;
                    
                    // Detectar e converter encoding se necessário
                    if (extension === 'csv' || extension === 'txt' || extension === 'xml') {
                        conteudo = detectAndConvertEncoding(conteudo);
                    }
                    
                    if (extension === 'csv') {
                        // Detectar delimitador automaticamente
                        const delimiter = detectDelimiter(conteudo);
                        
                        // Processar CSV usando PapaParse com delimitador detectado
                        Papa.parse(conteudo, {
                            delimiter: delimiter,
                            header: true,
                            skipEmptyLines: true,
                            complete: function(results) {
                                dados = normalizarDados(results.data);
                                resolve(dados);
                            },
                            error: function(error) {
                                console.error('Erro ao processar CSV:', error);
                                reject(error);
                            }
                        });
                    } else if (extension === 'xlsx' || extension === 'xls') {
                        // Processar Excel usando SheetJS
                        const workbook = XLSX.read(e.target.result, {type: 'binary'});
                        const sheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[sheetName];
                        const jsonData = XLSX.utils.sheet_to_json(worksheet, {raw: false});
                        dados = normalizarDados(jsonData);
                        resolve(dados);
                    } else if (extension === 'xml') {
                        // Processar XML
                        const parser = new DOMParser();
                        const xmlDoc = parser.parseFromString(conteudo, "text/xml");
                        const items = xmlDoc.getElementsByTagName("item");
                        
                        for (let i = 0; i < items.length; i++) {
                            const item = items[i];
                            const obj = {};
                            
                            for (let j = 0; j < item.children.length; j++) {
                                const child = item.children[j];
                                obj[child.tagName.toLowerCase()] = child.textContent;
                            }
                            
                            dados.push(obj);
                        }
                        
                        dados = normalizarDados(dados);
                        resolve(dados);
                    } else if (extension === 'txt') {
                        // Processar TXT (suportando tanto tabulação quanto ponto e vírgula)
                        const lines = e.target.result.split('\n');
                        
                        // Detectar o delimitador (tab ou ponto e vírgula)
                        let delimiter = '\t';
                        if (lines[0].includes(';')) {
                            delimiter = ';';
                        }
                        
                        const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase());
                        
                        for (let i = 1; i < lines.length; i++) {
                            if (lines[i].trim() === '') continue;
                            
                            const values = lines[i].split(delimiter);
                            const obj = {};
                            
                            for (let j = 0; j < headers.length; j++) {
                                obj[headers[j]] = values[j] ? values[j].trim() : '';
                            }
                            
                            dados.push(obj);
                        }
                        
                        dados = normalizarDados(dados);
                        resolve(dados);
                    } else {
                        reject(new Error('Formato de arquivo não suportado'));
                    }
                } catch (error) {
                    console.error('Erro ao processar arquivo:', error);
                    reject(error);
                }
            };
            
            reader.onerror = function(error) {
                console.error('Erro ao ler arquivo:', error);
                reject(error);
            };
            
            // Tentar diferentes encodings se necessário
            if (file.name.endsWith('.csv') || file.name.endsWith('.txt') || file.name.endsWith('.xml')) {
                reader.readAsText(file, 'UTF-8');
            } else {
                reader.readAsBinaryString(file);
            }
        });
    }
    
    function normalizarDados(dados) {
        // Array para armazenar os itens normalizados
        const itensNormalizados = [];
        
        // Processar cada item do arquivo
        dados.forEach(item => {
            const normalizado = {
                codigo: '',
                descricao: '',
                quantidade: '',
                medida: '',
                altura: '',
                largura: '',
                cor: ''
            };
            
            // Procurar por colunas com variações de nome usando a função de correspondência flexível
            for (const key in item) {
                // Ignorar propriedades vazias ou undefined
                if (!item[key] && item[key] !== 0) continue;
                
                // Verificar correspondência para cada tipo de coluna
                if (matchesColumnType(key, 'codigo')) {
                    normalizado.codigo = item[key];
                } 
                else if (matchesColumnType(key, 'descricao')) {
                    normalizado.descricao = item[key];
                } 
                else if (matchesColumnType(key, 'quantidade')) {
                    normalizado.quantidade = item[key];
                } 
                else if (matchesColumnType(key, 'medida')) {
                    normalizado.medida = item[key];
                } 
                else if (matchesColumnType(key, 'altura')) {
                    normalizado.altura = item[key];
                } 
                else if (matchesColumnType(key, 'largura')) {
                    normalizado.largura = item[key];
                } 
                else if (matchesColumnType(key, 'cor')) {
                    normalizado.cor = item[key];
                }
                // Outras colunas são ignoradas
            }
            
            // Adicionar ao array de itens normalizados
            itensNormalizados.push(normalizado);
        });
        
        return itensNormalizados;
    }
    
    function carregarClientes() {
        const tabelaClientes = document.getElementById('tabelaClientes');
        if (!tabelaClientes) {
            console.error('Elemento tabelaClientes não encontrado');
            return;
        }
        
        database.ref('clientes').once('value')
            .then(snapshot => {
                tabelaClientes.innerHTML = '';
                
                if (!snapshot.exists()) {
                    tabelaClientes.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum cliente cadastrado</td></tr>';
                    return;
                }
                
                snapshot.forEach(childSnapshot => {
                    const cliente = childSnapshot.val();
                    if (!cliente) return;
                    
                    // Garantir que cliente.id existe
                    const clienteId = cliente.id || childSnapshot.key;
                    
                    // Garantir que cliente.tipos seja tratado corretamente
                    let tiposTexto = '';
                    if (cliente.tipos) {
                        if (Array.isArray(cliente.tipos)) {
                            tiposTexto = cliente.tipos.join(', ');
                        } else if (typeof cliente.tipos === 'object') {
                            // Se for um objeto, extrair as chaves
                            tiposTexto = Object.keys(cliente.tipos).join(', ');
                        } else {
                            tiposTexto = String(cliente.tipos);
                        }
                    }
                    
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${cliente.nome || ''}</td>
                        <td>${tiposTexto}</td>
                        <td>${formatarData(cliente.dataCadastro)}</td>
                        <td><span class="badge bg-warning">${cliente.status || 'Pendente'}</span></td>
                        <td>
                            <button class="btn btn-sm btn-info btn-action" onclick="visualizarCliente('${clienteId}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-primary btn-action" onclick="editarCliente('${clienteId}')">
                                <i class="fas fa-edit"></i>
                            </button>
                        </td>
                    `;
                    
                    tabelaClientes.appendChild(tr);
                });
            })
            .catch(error => {
                console.error('Erro ao carregar clientes:', error);
                alert('Erro ao carregar clientes. Por favor, recarregue a página.');
            });
    }
    
    function carregarFiltroClientes() {
        const filtroCliente = document.getElementById('filtroCliente');
        if (!filtroCliente) {
            console.error('Elemento filtroCliente não encontrado');
            return;
        }
        
        database.ref('clientes').once('value')
            .then(snapshot => {
                // Limpar opções existentes, mantendo a primeira
                while (filtroCliente.options.length > 1) {
                    filtroCliente.remove(1);
                }
                
                if (!snapshot.exists()) return;
                
                snapshot.forEach(childSnapshot => {
                    const cliente = childSnapshot.val();
                    const option = document.createElement('option');
                    option.value = cliente.id;
                    option.textContent = cliente.nome || '';
                    filtroCliente.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Erro ao carregar filtro de clientes:', error);
            });
    }
    
    function filtrarClientes() {
        const filtroClienteElement = document.getElementById('filtroCliente');
        const filtroDataElement = document.getElementById('filtroData');
        const filtroTipoElement = document.getElementById('filtroTipo');
        const filtroStatusElement = document.getElementById('filtroStatus');
        
        if (!filtroClienteElement || !filtroDataElement || !filtroTipoElement || !filtroStatusElement || !tabelaClientes) {
            console.error('Elementos de filtro não encontrados');
            return;
        }
        
        const filtroCliente = filtroClienteElement.value;
        const filtroData = filtroDataElement.value;
        const filtroTipo = filtroTipoElement.value;
        const filtroStatus = filtroStatusElement.value;
        
        let query = database.ref('clientes');
        
        // Aplicar filtros
        query.once('value')
            .then(snapshot => {
                tabelaClientes.innerHTML = '';
                
                if (!snapshot.exists()) {
                    tabelaClientes.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum cliente encontrado</td></tr>';
                    return;
                }
                
                let clientesFiltrados = [];
                
                snapshot.forEach(childSnapshot => {
                    const cliente = childSnapshot.val();
                    let incluir = true;
                    
                    // Filtrar por cliente
                    if (filtroCliente && cliente.id !== filtroCliente) {
                        incluir = false;
                    }
                    
                    // Filtrar por data
                    if (filtroData && cliente.dataCadastro && !cliente.dataCadastro.startsWith(filtroData)) {
                        incluir = false;
                    }
                    
                    // Filtrar por tipo
                    if (filtroTipo && Array.isArray(cliente.tipos) && !cliente.tipos.includes(filtroTipo)) {
                        incluir = false;
                    }
                    
                    // Filtrar por status
                    if (filtroStatus && filtroStatus !== 'Todos' && cliente.status !== filtroStatus) {
                        incluir = false;
                    }
                    
                    if (incluir) {
                        clientesFiltrados.push(cliente);
                    }
                });
                
                if (clientesFiltrados.length === 0) {
                    tabelaClientes.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum cliente encontrado com os filtros aplicados</td></tr>';
                    return;
                }
                
                clientesFiltrados.forEach(cliente => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${cliente.nome || ''}</td>
                        <td>${Array.isArray(cliente.tipos) ? cliente.tipos.join(', ') : ''}</td>
                        <td>${formatarData(cliente.dataCadastro)}</td>
                        <td><span class="badge bg-warning">${cliente.status || 'Pendente'}</span></td>
                        <td>
                            <button class="btn btn-sm btn-info btn-action" onclick="visualizarCliente('${cliente.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-primary btn-action" onclick="editarCliente('${cliente.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                        </td>
                    `;
                    
                    tabelaClientes.appendChild(tr);
                });
            })
            .catch(error => {
                console.error('Erro ao filtrar clientes:', error);
                alert('Erro ao filtrar clientes. Por favor, tente novamente.');
            });
    }
    
    function limparFiltros() {
        const filtroClienteElement = document.getElementById('filtroCliente');
        const filtroDataElement = document.getElementById('filtroData');
        const filtroTipoElement = document.getElementById('filtroTipo');
        const filtroStatusElement = document.getElementById('filtroStatus');
        
        if (filtroClienteElement) filtroClienteElement.value = '';
        if (filtroDataElement) filtroDataElement.value = '';
        if (filtroTipoElement) filtroTipoElement.value = '';
        if (filtroStatusElement) filtroStatusElement.value = 'Todos';
    }
    
    function formatarData(dataString) {
        if (!dataString) return '';
        
        try {
            const data = new Date(dataString);
            return data.toLocaleDateString('pt-BR');
        } catch (error) {
            console.error('Erro ao formatar data:', error);
            return dataString;
        }
    }
    
    // Funções globais para visualização e edição
    window.visualizarCliente = function(clienteId) {
        database.ref(`clientes/${clienteId}`).once('value')
            .then(snapshot => {
                const cliente = snapshot.val();
                if (!cliente) {
                    alert('Cliente não encontrado.');
                    return;
                }
                
                const modalVisualizacaoElement = document.getElementById('modalVisualizacao');
                if (!modalVisualizacaoElement) {
                    console.error('Modal de visualização não encontrado');
                    return;
                }
                
                const modalVisualizacao = new bootstrap.Modal(modalVisualizacaoElement);
                const modalConteudo = document.getElementById('modalVisualizacaoConteudo');
                
                if (!modalConteudo) {
                    console.error('Conteúdo do modal de visualização não encontrado');
                    return;
                }
                
                let conteudo = `
                    <h3>Cliente: ${cliente.nome || ''}</h3>
                    <p><strong>Data de Cadastro:</strong> ${formatarData(cliente.dataCadastro)}</p>
                    <p><strong>Status:</strong> ${cliente.status || 'Pendente'}</p>
                    <p><strong>Tipos de Projeto:</strong> ${Array.isArray(cliente.tipos) ? cliente.tipos.join(', ') : ''}</p>
                    <hr>
                `;
                
                // Carregar detalhes dos tipos de projeto
                database.ref(`clientes/${clienteId}/tipos`).once('value')
                    .then(tiposSnapshot => {
                        if (!tiposSnapshot.exists()) {
                            modalConteudo.innerHTML = conteudo + '<p>Nenhum detalhe de projeto encontrado.</p>';
                            modalVisualizacao.show();
                            return;
                        }
                        
                        const tiposPromises = [];
                        
                        tiposSnapshot.forEach(tipoSnapshot => {
                            const tipo = tipoSnapshot.key;
                            const tipoData = tipoSnapshot.val();
                            
                            conteudo += `<h4>Projeto: ${tipo}</h4>`;
                            
                            if (tipoData.terceirizado) {
                                conteudo += `
                                    <p><strong>Terceirizado:</strong> Sim</p>
                                    <p><strong>Empresa:</strong> ${tipoData.empresa || 'Não informada'}</p>
                                    <p><strong>Data de Solicitação:</strong> ${formatarData(tipoData.dataSolicitacao) || 'Não informada'}</p>
                                    <p><strong>Prazo de Entrega:</strong> ${formatarData(tipoData.prazoEntrega) || 'Não informado'}</p>
                                `;
                            } else {
                                conteudo += `<p><strong>Terceirizado:</strong> Não</p>`;
                                
                                // Carregar listas
                                const listasPromise = database.ref(`clientes/${clienteId}/tipos/${tipo}/listas`).once('value')
                                    .then(listasSnapshot => {
                                        if (!listasSnapshot.exists()) {
                                            return `<p>Nenhuma lista encontrada para este tipo de projeto.</p>`;
                                        }
                                        
                                        let listasHtml = '<h5>Listas:</h5><ul>';
                                        
                                        listasSnapshot.forEach(listaSnapshot => {
                                            const listaKey = listaSnapshot.key;
                                            const listaData = listaSnapshot.val();
                                            
                                            listasHtml += `
                                                <li>
                                                    <strong>${listaData.nomeLista || listaKey}</strong>
                                                    <button class="btn btn-sm btn-info ms-2" onclick="visualizarLista('${clienteId}', '${tipo}', '${listaKey}')">
                                                        Ver Itens
                                                    </button>
                                                </li>
                                            `;
                                        });
                                        
                                        listasHtml += '</ul>';
                                        return listasHtml;
                                    });
                                
                                tiposPromises.push(listasPromise);
                            }
                            
                            conteudo += '<hr>';
                        });
                        
                        Promise.all(tiposPromises)
                            .then(listasHtmlArray => {
                                listasHtmlArray.forEach(listasHtml => {
                                    conteudo += listasHtml;
                                });
                                
                                modalConteudo.innerHTML = conteudo;
                                modalVisualizacao.show();
                            });
                    });
            })
            .catch(error => {
                console.error('Erro ao visualizar cliente:', error);
                alert('Erro ao visualizar cliente. Por favor, tente novamente.');
            });
    };
    
    window.visualizarLista = function(clienteId, tipo, listaKey) {
        database.ref(`clientes/${clienteId}/tipos/${tipo}/listas/${listaKey}/itens`).once('value')
            .then(snapshot => {
                const modalListaElement = document.getElementById('modalLista');
                if (!modalListaElement) {
                    console.error('Modal de lista não encontrado');
                    return;
                }
                
                const modalLista = new bootstrap.Modal(modalListaElement);
                const modalListaTitulo = document.getElementById('modalListaTitulo');
                const modalListaConteudo = document.getElementById('modalListaConteudo');
                
                if (!modalListaTitulo || !modalListaConteudo) {
                    console.error('Elementos do modal de lista não encontrados');
                    return;
                }
                
                database.ref(`clientes/${clienteId}/tipos/${tipo}/listas/${listaKey}`).once('value')
                    .then(listaSnapshot => {
                        const listaData = listaSnapshot.val();
                        modalListaTitulo.textContent = `Lista: ${listaData && listaData.nomeLista ? listaData.nomeLista : listaKey}`;
                        
                        if (!snapshot.exists()) {
                            modalListaConteudo.innerHTML = '<p>Nenhum item encontrado nesta lista.</p>';
                            modalLista.show();
                            return;
                        }
                        
                        let tabela = `
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Código</th>
                                        <th>Descrição</th>
                                        <th>Quantidade</th>
                                        <th>Medida</th>
                                        <th>Altura</th>
                                        <th>Largura</th>
                                        <th>Cor</th>
                                    </tr>
                                </thead>
                                <tbody>
                        `;
                        
                        snapshot.forEach(itemSnapshot => {
                            const item = itemSnapshot.val();
                            tabela += `
                                <tr>
                                    <td>${item.codigo || ''}</td>
                                    <td>${item.descricao || ''}</td>
                                    <td>${item.quantidade || ''}</td>
                                    <td>${item.medida || ''}</td>
                                    <td>${item.altura || ''}</td>
                                    <td>${item.largura || ''}</td>
                                    <td>${item.cor || ''}</td>
                                </tr>
                            `;
                        });
                        
                        tabela += '</tbody></table>';
                        modalListaConteudo.innerHTML = tabela;
                        modalLista.show();
                    });
            })
            .catch(error => {
                console.error('Erro ao visualizar lista:', error);
                alert('Erro ao visualizar lista. Por favor, tente novamente.');
            });
    };
    
    window.editarCliente = function(clienteId) {
        // Implementação da edição de cliente
        alert('Funcionalidade de edição em desenvolvimento.');
    };
});
