const fsN = require('fs');
const fs = require('fs').promises;
const { readFile, writeFile,readdir } = fs;
const path = require('path');

// General Variables
const dirIn = 'data/in';
const dirOut = 'data/out';
const fileInExt = 'dat';

function onlyUnique(value, index, self){
    return self.indexOf(value) === index;
};

function getIdArqDate(){
    function numFormatTwo(mesIndex){
        if(mesIndex < 10){
            return `0${mesIndex}`
        }
        return `${mesIndex}`
    };
    const dateNow = new Date();
    const result = {};
    result.year = dateNow.getFullYear();
    result.month = numFormatTwo(dateNow.getMonth() + 1);
    result.day= numFormatTwo(dateNow.getDate());
    result.hour = numFormatTwo(dateNow.getHours());
    result.minutes = numFormatTwo(dateNow.getMinutes());
    result.seconds = numFormatTwo(dateNow.getSeconds());
    return `${result.year}${result.month}${result.day}${result.hour}${result.minutes}${result.seconds}`
};

async function filesNameIn(ext){
    let result = [];
    try {
        const allFilesName = fsN.readdirSync(dirIn);
        allFilesName.map((fileName)=>{
            if (fileName.split('.').pop() == ext) {
                result.push(fileName);
            };
        });
        return result;
    } catch (err) {
        console.log("Algo inesperado aconteceu: ", err);
    };
};

async function readFilesData(path,filesName){
    let result = '';
    try {
        for (const fileName of filesName) {
            const res = await readFile(`${path}/${fileName}`,'utf8');
            const resString = res.toString();
            result += result.length == 0 ? resString :`\n${resString}`;
        };
        return result;
    } catch (err) {
        console.log('err: ',err);
        return err;
    };
}

async function writeFileData(data,pathFull){
    try {
        const dataExport = `${data.qtyClients}çQuantidade de clientes\n${data.qtyVendors}çQuantidade de vendedores\n${data.idMostExpensive}çVendedor com venda de valor mais alto\n${data.worseVendor}çPior vendedor de todos os tempos`;
        await writeFile(pathFull,dataExport);
    } catch (err) {
        console.log('err: ',err);
        return err;
    };
};

function maniData(db){
    // 001 - vendedor
    let vendors = [];
    // 002 - cliente
    let clients = [];
    // 003 - vendas
    let sales = [];

    // sem classificacao
    let errLost = [];

    const dataFSplit = db.split('\n');
    let a = [];
    dataFSplit.map((item)=>{
        const aux = item.split('ç')

        switch (aux[0]) {
            case '001':
                vendors.push({
                    cpf:aux[1],
                    name:aux[2],
                    salary:aux[3]
                })
                break;
            case '002':
                clients.push({
                    cnpj:aux[1],
                    name:aux[2],
                    activity:aux[3]
                })
                break;
            case '003':
                sales.push({
                    idVendor:aux[1],
                    items:aux[2],
                    nameVendor:aux[3].trim()
                })
                break;
            default:
                errLost.push(item)
                break;
        }
    });

    sales = sales.map((item)=>{
        const auxSplit = item.items.split(',');
        const itemsMani = auxSplit.map((itemS)=>{
            const auxClean = itemS.replace('[','').replace(']','').replace(/\s/g, '');
            const auxSplit = auxClean.split('-');
            return{
                id:auxSplit[0],
                qty:Number(auxSplit[1]),
                price:Number(auxSplit[2])
            }
        });
        const valueTotalSale = itemsMani.reduce((acc,curr)=>{
            return acc + curr.price * curr.qty;
        },0);
        const qtyTotalItemsSale = itemsMani.reduce((acc,curr)=>{
            return acc + curr.qty;
        },0);
        return{
            ...item,
            items:itemsMani,
            valueTotalSale: valueTotalSale,
            qtyTotalItemsSale: qtyTotalItemsSale
        }
    });
    const result = {
        vendors,
        clients,
        sales
    };
    return result;
};

function aggregateSalesByVendor(data){
    const vendorsIdArr = data.map(item=>item.idVendor).filter(onlyUnique);
    let result = [];

    for (const id of vendorsIdArr) {
        const salesFilter = data.filter(item=>item.idVendor == id);
        const valueTotalSaleVendor = salesFilter.reduce((acc,curr)=>{
            return acc + curr.valueTotalSale;
        },0);
        result.push({
            idVendor: id,
            nameVendor: salesFilter[0].nameVendor,
            salesFullVendor: salesFilter,
            valueTotalSaleVendor: valueTotalSaleVendor
        })
    };
    return result.sort((a,b)=>b.valueTotalSaleVendor - a.valueTotalSaleVendor);
};

function summaryResult(data){
    const result = {
        qtyClients: null,
        qtyVendors: null,
        idMostExpensive: null,
        worseVendor: null,
    };

    result.qtyClients = data.clients.length;
    result.qtyVendors = data.vendors.length;

    const salesOrdered = data.sales.sort((a,b)=>b.valueTotalSale - a.valueTotalSale);
    result.idMostExpensive = salesOrdered[0].idVendor; //considerou-se o vendedor que teve a venda de valor mais alto
    
    const resAggVendors = aggregateSalesByVendor(data.sales);
    result.worseVendor = resAggVendors[resAggVendors.length - 1].nameVendor;

    return result;
};

exports.compileDataResults = async function (){
    try {
        const resFilesIn = await filesNameIn(fileInExt);
        if (resFilesIn.length == 0) {
            throw new Error(`Não foram localizados arquivos de extensão ".${fileInExt}" no diretório "${dirIn}"`);
        };
        
        const resReadFilesData = await readFilesData(dirIn,resFilesIn);
        
        const organizedData = maniData(resReadFilesData);
        const result = summaryResult(organizedData);

        await writeFileData(result,`data/out/${getIdArqDate()}.done.dat`);
        
        return result;
    } catch (error) {
        return {err: error.message};
    };
};

exports.helloTest = function(){
    return 'Hello!'
};