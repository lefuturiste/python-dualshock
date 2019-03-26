const WebSocket = require('ws');
const Dualshock = require('dualshock')

const ws = new WebSocket('ws://localhost:8000');

ws.on('open', function open() {
    ws.send(JSON.stringify({t: 'init'}))
    console.log("> connection open")
    function connect() {
        let devicesList = Dualshock.getDevices();
        console.log(devicesList)
        if (devicesList.length != 0) {

            let device = devicesList[0]
            let gamepad = Dualshock.open(device, {
                smoothAnalog: 10,
                smoothMotion: 15,
                joyDeadband: 4,
                moveDeadband: 4
            })

            ws.send(JSON.stringify({
                t: 'detection',
                d: device
            }))

            gamepad.ondigital = function (button, value) {
                ws.send(JSON.stringify({
                    t: 'input',
                    d: [button, value]
                }))
            }
            gamepad.onanalog = function (axis, value) {
                ws.send(JSON.stringify({
                    t: 'input',
                    d: [axis, value]
                }))
            }
            gamepad.ondisconnect = function () {
                connect()
                ws.send(JSON.stringify({
                    t: 'disconnection'
                }))
            }
            return true
        } else {
            setTimeout(connect, 2000)
        }
    }
    connect()
});

ws.on('message', function incoming(data) {
    console.log('lel')
    console.log(data)
})

ws.on('close', function close() {
    console.log('> disconnected');
});
