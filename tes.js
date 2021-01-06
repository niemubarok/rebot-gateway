const app = require('express')()
const bodyParser = require('body-parser')


function start(client) {

    app.use(bodyParser.json())
    app.get('/', async (req, res) => {

        let contact = await req.body.contact + '@c.us'
        // let message = await req.body.message
        let caption = await req.body.caption
        let source = await req.body.source
        let type = req.body.type

        console.log(type)
        console.log(source)
        console.log(caption)
        // client.sendText(contact, message)
        res.end()
    })

    app.listen('3000', () => {
        console.log('running')
    })

}

start()
