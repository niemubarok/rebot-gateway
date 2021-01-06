const venom = require('venom-bot')
const axios = require('axios')
const fs = require('fs')
const app = require('express')()
const bodyParser = require('body-parser')


venom
    .create(
        'sessionMarketing',
        (base64Qr, asciiQR) => {
            // To log the QR in the terminal
            console.log(asciiQR);

            // To write it somewhere else in a file
            exportQR(base64Qr, 'marketing-qr.png');
        })
    .then((client) => start(client))
    .catch((erro) => {
        console.log(erro);
    });

// Writes QR in specified path
function exportQR(qrCode, path) {
    qrCode = qrCode.replace('data:image/png;base64,', '');
    const imageBuffer = Buffer.from(qrCode, 'base64');

    // Creates 'marketing-qr.png' file
    fs.writeFileSync(path, imageBuffer);
}

function start(client) {

    app.use(bodyParser.json())
    app.get('/', async (req, res) => {

        let contact = await req.body.contact + '@c.us'
        let message = await req.body.message

        console.log(contact)
        console.log(message)

        client.sendText(contact, message)
        res.end()
    })

    app.listen('3000', () => {
        console.log('running')
    })




    client.onMessage
        ((message) => {

            let data = message.content
            let contactId = message.from
            let contact = contactId.replace('@c.us', '')

            // console.log(message.content)

            axios.post('http://localhost:9090/api/ag', {

                data: {
                    from: contact,
                    message: {
                        type: "chat",
                        pesan: data,
                        timestamp: message.t,
                    },

                }
            })
                .then(async (response) => {
                    let res = await response.data
                    let caption = await res.caption
                    let source = await res.source
                    let type = await res.type

                    // let getChat = await client.getChat(contactId)

                    // console.log(getChat)

                    console.log(res)
                    if (res != false) {
                        if (type == 'media') {
                            client.sendImage(contactId,source, caption)
                            client.sendText(contactId, caption + "\n\n____Note______\n*Silahkan melakukan pendaftaran ulang dengan Scan Qrcode anda pada mesin yang telah disediakan di lobby utama*")
                        }

                        if (Array.isArray(res)) {
                            client.sendText(contactId, res[0])
                            client.sendText(contactId, res[1])
                            client.sendText(contactId, res[2])
                            client.sendText(contactId, res[3])
                        } else {

                            client.reply(message.from, res)
                        }
                    }


                }).catch((erro) => {
                    console.error('Error when sending: ', erro); //return object error
                })
        })


}

// start()
