# Documentação do Sistema de Controle de Compras e Recebimento

## Visão Geral

Este documento fornece instruções detalhadas sobre o Sistema de Controle de Compras e Recebimento desenvolvido para a Perfecta. O sistema permite o cadastro de clientes, tipos de projetos, listas de materiais e gerenciamento de terceirização, com integração completa ao Firebase.

## Estrutura do Sistema

O sistema foi desenvolvido utilizando HTML, CSS e JavaScript, com as seguintes tecnologias:

- **Frontend**: HTML5, CSS3, JavaScript
- **Frameworks/Bibliotecas**: Bootstrap 5, Font Awesome, Animate.css
- **Banco de Dados**: Firebase Realtime Database
- **Armazenamento**: Firebase Storage
- **Processamento de Arquivos**: SheetJS (Excel), PapaParse (CSV)

## Arquivos do Sistema

- **index.html**: Página principal do sistema
- **css/styles.css**: Estilos personalizados
- **js/config.js**: Configuração do Firebase
- **js/app.js**: Lógica principal da aplicação
- **img/logo.png**: Logo da Perfecta

## Funcionalidades Principais

### 1. Cadastro de Clientes e Projetos

- Cadastro de nome do cliente
- Seleção múltipla de tipos de projeto (PVC, Alumínio, Brise, ACM, Trilho, Outros)
- Interface em popup ocupando quase toda a janela
- Botões de Salvar e Cancelar

### 2. Lógica Condicional por Tipo de Projeto

#### 2.1 Projeto PVC
- Listas obrigatórias: PVC, Reforço, Ferragens, Vidros
- Listas opcionais: Esteira, Motor, Acabamento, Tela Retrátil, Aço, Outros

#### 2.2 Projeto Alumínio
- Opção de terceirização (Sim/Não)
- Se terceirizado: campos para empresa, data de solicitação e prazo
- Se não terceirizado: listas obrigatórias e opcionais específicas

#### 2.3 Projeto Brise
- Opção de terceirização (Sim/Não)
- Se terceirizado: campos para empresa, data de solicitação e prazo
- Se não terceirizado: listas obrigatórias e opcionais específicas

#### 2.4 Projeto ACM
- Opção de terceirização (Sim/Não)
- Se terceirizado: campos para empresa, data de solicitação e prazo
- Se não terceirizado: listas obrigatórias e opcionais específicas

#### 2.5 Projeto Trilho
- Lista obrigatória: Perfil
- Lista opcional: Outros

#### 2.6 Projeto Outros
- Opção de terceirização (Sim/Não)
- Se terceirizado: campos para empresa, data de solicitação e prazo
- Se não terceirizado: apenas listas opcionais

### 3. Gerenciamento de Listas e Anexos

- Upload de arquivos nos formatos CSV, XLSX, XML, TXT
- Processamento automático de colunas obrigatórias (Código, Descrição, Qtde)
- Tratamento para colunas opcionais (Medida, Altura, Largura, Cor)
- Tolerância a erros de escrita nos nomes das colunas
- Adição de múltiplas listas em campos "Outros" com nomeação livre

### 4. Listagem e Filtros

- Listagem de clientes cadastrados
- Filtros por nome do cliente, tipo de projeto, lista de projeto
- Visualização detalhada de registros
- Popups para visualização de tabelas tratadas
- Edição de registros existentes

## Instruções de Uso

### Instalação e Configuração

1. Faça o upload de todos os arquivos para seu servidor web
2. Não é necessária configuração adicional, pois o Firebase já está configurado

### Cadastro de Clientes

1. Clique no botão "Novo Cadastro"
2. Preencha o nome do cliente
3. Selecione um ou mais tipos de projeto
4. Para cada tipo de projeto selecionado:
   - Responda se é terceirizado (quando aplicável)
   - Faça upload dos arquivos de lista necessários
   - Adicione listas adicionais conforme necessário
5. Clique em "Salvar" para concluir o cadastro

### Filtros e Visualização

1. Use os filtros na parte superior para localizar registros específicos
2. Clique no ícone de olho para visualizar detalhes de um cliente
3. Clique no ícone de edição para modificar um registro existente

### Upload de Arquivos

O sistema aceita os seguintes formatos de arquivo:
- CSV (valores separados por vírgula)
- XLSX/XLS (Excel)
- XML (formato estruturado)
- TXT (valores separados por tabulação)

Os arquivos devem conter pelo menos as colunas:
- Código
- Descrição
- Quantidade

Colunas opcionais:
- Medida
- Altura
- Largura
- Cor

## Estrutura de Dados no Firebase

- **clientes**: Informações básicas dos clientes
  - ID do cliente
    - nome
    - tipos (array)
    - dataCadastro
    - status
  
- **projetos**: Detalhes dos projetos por cliente
  - ID do cliente
    - tipo de projeto (pvc, aluminio, brise, acm, trilho, outros)
      - terceirizado (boolean)
      - empresa (se terceirizado)
      - dataSolicitacao (se terceirizado)
      - prazoEntrega (se terceirizado)
      - listas
        - nome da lista (pvc, reforco, ferragens, etc.)
          - array de itens

## Suporte e Manutenção

Para suporte técnico ou dúvidas sobre o sistema, entre em contato com a equipe de desenvolvimento.

---

© 2025 Perfecta - Todos os direitos reservados
