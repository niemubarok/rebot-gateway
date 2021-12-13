// import { create, Client } from '@open-wa/wa-automate';
const wa = require('@open-wa/wa-automate');

const axios = require('axios')
// const fs = require('fs')
const app = require('express')()
const bodyParser = require('body-parser')

wa.create().then(client => start(client));

function start(client) {
    app.use(bodyParser.json())

    //Menerima request dari rebot untuk kirim pesan setelah pasien scan qrcode

    app.post('/send', async (req, res) => {

        let contact = await req.body.contact + '@c.us'
        let message = await req.body.message
        let source = await req.body.qrcode

        console.log(source);

        client.sendImage(contact, source, "filename", message)
        res.write("pesan terkirim")
        res.end()
    })

    app.listen('3000', '192.168.7.250', () => {
        console.log('running')
    })



    client.onMessage(async message => {
        let data = message.content
        let contactId = message.from
        let contact = contactId.replace('@c.us', '')

        axios.post('http://localhost:8000/api/ag', {

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
                let fileName = await res.fileName

                let getChat = await client.getChat(contactId)

                // console.log(getChat)
                console.log(res);

                // console.log(res)
                if (res != false) {
                    if (type == 'media') {
                        client.sendImage(contactId, source, fileName, caption)
                        setTimeout(() => {
                            client.sendText(contactId, "\n\n____Note______\n*Silahkan melakukan pendaftaran ulang dengan Scan Qrcode anda pada mesin yang telah disediakan di lobby utama*")
                        }, 2000)
                    } else if (Array.isArray(res)) {
                        client.sendText(contactId, res[0])
                        client.sendText(contactId, res[1])
                        client.sendText(contactId, res[2])
                        client.sendText(contactId, res[3])
                    } else {
                        console.log("tereksekusi");
                        client.sendText(contactId, res)
                    }
                }


            }).catch((error) => {
                console.log(error);
                client.sendText(contactId, "Mohon maaf sepertinya ada kendala, silahkan hubungi nomor berikut:")
                console.error('Error when sending: ', error); //return object error
            })
    });
}