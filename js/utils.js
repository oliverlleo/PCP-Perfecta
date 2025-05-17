/**
 * Utilitários para processamento de arquivos e normalização de dados
 */

/**
 * Detecta e converte o encoding de um texto
 * @param {string} text - Texto a ser convertido
 * @returns {string} - Texto convertido para UTF-8
 */
function detectAndConvertEncoding(text) {
    if (!text) return '';
    
    // Verificar se o texto já está em UTF-8
    const isUtf8 = /^[\x00-\x7F]*$|^([\xC0-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}|[\xF0-\xF7][\x80-\xBF]{3})*$/.test(text);
    
    if (!isUtf8) {
        // Tentar converter de ISO-8859-1 para UTF-8
        try {
            // Solução para converter Latin-1/ISO-8859-1 para UTF-8
            const decoded = decodeURIComponent(escape(text));
            return decoded;
        } catch (e) {
            // Se falhar, tentar outra abordagem
            try {
                // Abordagem alternativa para caracteres especiais
                const decoded = text.split('').map(function(char) {
                    const code = char.charCodeAt(0);
                    // Tratar caracteres especiais do português
                    if (code >= 128 && code <= 255) {
                        return String.fromCharCode(0xC0 + (code - 128));
                    }
                    return char;
                }).join('');
                return decoded;
            } catch (e2) {
                console.warn("Erro ao converter encoding:", e2);
                return text;
            }
        }
    }
    
    return text;
}

/**
 * Normaliza um nome de coluna para facilitar correspondência
 * @param {string} columnName - Nome da coluna a ser normalizado
 * @returns {string} - Nome normalizado (sem acentos, espaços, em minúsculas)
 */
function normalizeColumnName(columnName) {
    if (!columnName) return '';
    
    // Converter para string, caso não seja
    const colStr = String(columnName);
    
    // Remover acentos
    const withoutAccents = colStr.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    // Converter para minúsculas e remover espaços extras
    return withoutAccents.toLowerCase().trim();
}

/**
 * Verifica se um nome de coluna corresponde a um tipo específico
 * @param {string} columnName - Nome da coluna a verificar
 * @param {string} type - Tipo de coluna ('codigo', 'descricao', 'quantidade', etc)
 * @returns {boolean} - Verdadeiro se corresponder
 */
function matchesColumnType(columnName, type) {
    if (!columnName) return false;
    
    const normalized = normalizeColumnName(columnName);
    
    // Mapeamento expandido de sinônimos para cada tipo de coluna
    const synonyms = {
        'codigo': ['codigo', 'cod', 'cd', 'code', 'codg', 'cdg', 'reference', 'ref', 'referencia', 'id', 'item', 'sku', 'numero', 'num', 'n°', 'nº', 'nr', 'c.', 'c/', 'c-', 'c:', 'c='],
        'descricao': ['descricao', 'desc', 'dsc', 'description', 'nome', 'name', 'produto', 'product', 'item', 'denominacao', 'especificacao', 'espec', 'especif', 'material', 'mat', 'texto', 'text', 'detalhe', 'det', 'perfil', 'peca', 'peça'],
        'quantidade': ['quantidade', 'qtd', 'qtde', 'quant', 'qnt', 'qntd', 'qty', 'quantity', 'amount', 'qtdade', 'qtidade', 'qtd.', 'qt', 'q.', 'q', 'numero', 'num', 'n°', 'nº', 'qtd:', 'qtd=', 'qtd-'],
        'medida': ['medida', 'med', 'measure', 'unit', 'unidade', 'un', 'und', 'unid', 'un.', 'un:', 'un=', 'un-', 'medida:', 'medida=', 'medida-', 'dimensao', 'dimensão', 'dim', 'tamanho', 'tam'],
        'altura': ['altura', 'alt', 'height', 'h', 'hgt', 'h.', 'h:', 'h=', 'h-', 'alt.', 'alt:', 'alt=', 'alt-', 'a', 'a.', 'a:', 'a=', 'a-'],
        'largura': ['largura', 'larg', 'width', 'w', 'lrg', 'l', 'l.', 'l:', 'l=', 'l-', 'larg.', 'larg:', 'larg=', 'larg-', 'comprimento', 'comp', 'compr'],
        'cor': ['cor', 'color', 'colour', 'coloracao', 'coloração', 'c', 'c.', 'c:', 'c=', 'c-', 'tonalidade', 'tom', 'acabamento', 'acab', 'visual', 'vis']
    };
    
    // Verificar correspondência exata ou parcial com maior flexibilidade
    if (type in synonyms) {
        // Correspondência exata com qualquer sinônimo
        if (synonyms[type].includes(normalized)) {
            return true;
        }
        
        // Correspondência parcial (contém o termo)
        for (const synonym of synonyms[type]) {
            if (normalized.includes(synonym)) {
                return true;
            }
            // Verificar se o sinônimo contém o nome normalizado (para casos como "c" em "código")
            if (synonym.length <= 3 && normalized.length <= 5 && synonym === normalized.substring(0, synonym.length)) {
                return true;
            }
        }
        
        // Verificar correspondência por similaridade para casos especiais
        if (type === 'codigo' && /^c[0-9]+$/.test(normalized)) {
            return true; // Padrões como c1, c2, c01, etc.
        }
        if (type === 'quantidade' && /^q[0-9]+$/.test(normalized)) {
            return true; // Padrões como q1, q2, q01, etc.
        }
    }
    
    return false;
}

/**
 * Detecta o delimitador em um texto CSV
 * @param {string} text - Texto CSV a analisar
 * @returns {string} - Delimitador detectado (';', ',', ou '\t')
 */
function detectDelimiter(text) {
    if (!text) return ';';
    
    const firstLine = text.split('\n')[0];
    
    // Contar ocorrências de cada delimitador
    const delimiters = {
        ';': (firstLine.match(/;/g) || []).length,
        ',': (firstLine.match(/,/g) || []).length,
        '\t': (firstLine.match(/\t/g) || []).length
    };
    
    // Encontrar o delimitador com mais ocorrências
    let maxCount = 0;
    let detectedDelimiter = ';'; // padrão
    
    for (const [delimiter, count] of Object.entries(delimiters)) {
        if (count > maxCount) {
            maxCount = count;
            detectedDelimiter = delimiter;
        }
    }
    
    return detectedDelimiter;
}

/**
 * Normaliza dados de diferentes formatos para um formato padrão
 * @param {Array} dados - Dados a serem normalizados
 * @returns {Array} - Dados normalizados
 */
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
        
        // Procurar por colunas com variações de nome
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
