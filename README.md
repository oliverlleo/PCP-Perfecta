# Sistema de Controle de Compras e Recebimento

## Instruções para Execução Local

Para evitar problemas de CORS ao acessar o Firebase Storage, você deve executar a aplicação através de um servidor web local em vez de abrir o arquivo HTML diretamente no navegador.

### Opção 1: Usando o servidor Node.js incluído

1. Certifique-se de ter o Node.js instalado em seu computador
2. Abra um terminal/prompt de comando na pasta do sistema
3. Execute o comando:
   ```
   node server.js
   ```
4. Acesse a aplicação em seu navegador através do endereço:
   ```
   http://localhost:8080
   ```

### Opção 2: Usando um servidor web de sua preferência

Você pode usar qualquer servidor web local de sua preferência, como:
- Live Server (extensão do VS Code)
- XAMPP/WAMP/MAMP
- Python SimpleHTTPServer
- http-server do Node.js

## Configuração de CORS no Firebase Storage

Se você precisar acessar o Firebase Storage de diferentes origens (como em ambiente de desenvolvimento e produção), siga estas etapas para configurar o CORS:

1. Instale a Firebase CLI:
   ```
   npm install -g firebase-tools
   ```

2. Faça login na sua conta Firebase:
   ```
   firebase login
   ```

3. Crie um arquivo `cors.json` com o seguinte conteúdo:
   ```json
   [
     {
       "origin": ["*"],
       "method": ["GET", "POST", "PUT", "DELETE"],
       "maxAgeSeconds": 3600
     }
   ]
   ```
   
   Nota: Para produção, substitua `"*"` pelos domínios específicos que você deseja permitir.

4. Configure o CORS para o seu bucket do Firebase Storage:
   ```
   gsutil cors set cors.json gs://pcp-2e388.firebasestorage.app
   ```

## Funcionalidades Implementadas

- Cadastro de clientes com múltiplos tipos de projeto
- Upload de listas em formatos CSV, XLSX, XML e TXT
- Tratamento de caracteres especiais nos arquivos importados
- Correspondência flexível de colunas nos arquivos
- Salvamento estruturado no Firebase
- Interface responsiva e moderna

## Solução de Problemas

Se encontrar problemas ao executar a aplicação:

1. **Erro de CORS**: Certifique-se de estar executando a aplicação através de um servidor web e não diretamente do sistema de arquivos.

2. **Problemas com caracteres especiais**: Verifique se os arquivos CSV estão salvos em formato UTF-8.

3. **Listas não aparecem ao selecionar tipo de projeto**: Verifique se o JavaScript está habilitado no navegador e se não há erros no console.

4. **Problemas de conexão com Firebase**: Verifique sua conexão com a internet e se as credenciais do Firebase estão corretas no arquivo `config.js`.

Para qualquer outro problema, verifique o console do navegador (F12) para mensagens de erro detalhadas.
