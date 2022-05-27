const express = require('express');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'data/in')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname)
    }
});

const upload = multer({ storage: storage })

const manidata = require('./functions/manidata');

const app = express();
const port = 3000

app.get('/', function (_, res) {
    res.send('Olá, seja bem vindo(a) a API do RMD!')
})

app.post('/enviar/arquivo', upload.array('file'), async function (_, res) {
    try {
        // caso seja necessário alguma tratativa, inserir aqui.
        const result = await manidata.compileDataResults();
        return res.status(200).json({ message: "Arquivo enviado com sucesso. Relatório atualizado/gerado.", data: result })
    } catch (error) {
        return res.send({ err: error, message: 'Não foi possível completar sua solicitação. Tente novamente mais tarde.' })
    };
});

app.get('/relatorio/geral/atualizado', async function (_, res) {
    try {
        const result = await manidata.compileDataResults();
        if(result.err){
            return res.send({ message: result.err })
        };
        return res.status(200).json({ message: "Relatório gerado/atualizado com sucesso. Os relatórios gerados estão disponíveis no diretório 'data/out'", data: result })
    } catch (error) {
        return res.send({ err: error, message: 'Não foi possível completar sua solicitação. Tente novamente mais tarde.' })
    };
});

app.listen(port, () => {
    console.log(`App listening on http://localhost:${port}. Welcome to the jungle.`)
});