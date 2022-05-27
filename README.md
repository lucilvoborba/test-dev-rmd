# RMD - Sistema para Análise de dados

## API desenvolvida para simular de forma simplificada o backend da aplicação RMD.

Após a API ser iniciada, o servidor fica on-line até que seja interrompido.


## Execução

Para executar o projeto localmente, baixar (clonar) o projeto na máquina desejada.

Atenção para instalar os pacotes e dependências por meio do comando no terminal: npm install

Após instalar tudo o que é necessário, basta executar o comando no terminal: npm start


## Utilização

A rota "{{baseUrl}}/enviar/arquivo" (método POST) é utilizada para enviar os arquivos de extensão .dat.

Para enviar o(s) arquivo(s), como sugestão, utilizar Postman ou Insomnia, e pelo Body enviar o arquivo por "form-data". É possível enviar um ou mais arquivos.

A rota "{{baseUrl}}/relatorio/geral/atualizado" (método GET), é utilizada para obter um relatório dos dados obtidos com base nos arquivos presentes no servidor da API.

Resultados fornecidos pelo relatório:
- qtyClients: Quantidade de clientes
- qtyVendors: Quantidade de vendedores
- idMostExpensive: Vendedor com venda de valor mais alto
- worseVendor: Pior vendedor de todos os tempos

## Considerações

Considerando uma infraestrutura simplificada, considera-se como uma espécie de banco de dados o path ("data/in") que contém todos os arquivos enviados.

Toda vez que é necessário obter o relatório, todos os arquivos .dat são lidos e então os resultados são consolidados.

Como sugestão de continuação do projeto, os dados poderiam ser armazenados em um banco de dados (Sql ou NoSql) de forma que os arquivos enviados seriam descartados quando lidos pela aplicação. Também poderia ser desenvolvido o frontend, uma vez que, consideramos um desenvolvimento simplificado para este caso.