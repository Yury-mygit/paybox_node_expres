const express = require('express')
const app = express()
const port = 3000

const axios = require('axios');
const crypto = require('crypto');
const qs = require('qs')

let pg_merchant_id = 550529;
let secret_key = 'YCsCfLaaNleQYDQx';

let request = {
    pg_order_id: "23",
    pg_merchant_id: pg_merchant_id,
    pg_amount:10,
    pg_description: 'Time reservation',
    pg_salt:'asdadas',
    pg_testing_mode: "1",
};

function makeFlatParamsArray(arrParams, parent_name = '') {
    let arrFlatParams = [];
    let i = 0;

    for (let key in arrParams) {
        i++;
        let name = parent_name + key + String(i).padStart(3, '0');

        if (typeof arrParams[key] === 'object' && arrParams[key] !== null) {
            arrFlatParams = arrFlatParams.concat(makeFlatParamsArray(arrParams[key], name));
            continue;
        }

        arrFlatParams.push({name: name, value: String(arrParams[key])});
    }

    return arrFlatParams;
}


let requestForSignature = makeFlatParamsArray(request);
requestForSignature.sort((a, b) => a.name.localeCompare(b.name));

requestForSignature.unshift({name: '', value: 'init_payment.php'});
requestForSignature.push({name: '', value: secret_key});

let stringForSignature = requestForSignature.map(item => item.value).join(';');
let signature = crypto.createHash('md5').update(stringForSignature).digest('hex');

request['pg_sig'] = signature;

let formData = qs.stringify(request);


console.log(request)

axios.post('https://api.freedompay.money/init_payment.php', formData, {
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
})
.then(response => {
    console.log(response.data);
})
.catch(error => {
    console.error(error);
});


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})