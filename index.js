let httpServer = require('http').createServer()
let io = require('socket.io')(httpServer)
let SessionManager = require("./SessionManager.js")


httpServer.listen(8080, function () {
    console.log('listening on *:8080')
})

let sessions = new SessionManager()


io.on('connection', function (socket) {
    console.log('Client has connected. Socket ID = ' + socket.id)
    // When the server receives a global_message
    // retransmits the message to all clients
    socket.on('global_message', (payload) => {
        switch (payload.destination) {
            case 'EM':
            case 'EC':
            case 'ED':
            case 'C':
                io.to(payload.destination).emit('global_message', payload)
                console.log(payload)
                break;
            default:
                io.emit('global_message', payload)
                break;
        }
    })
    socket.on('user_logged', (user) => {
        if (user) {
            sessions.addUserSession(user, socket.id)
            socket.join(user.type)
            console.log('User Logged: User= ' + user.id + " | " + user.name +
                ' Socket ID= ' + socket.id)
            console.log(' -> Total Sessions= ' + sessions.users.size)
            socket.broadcast.emit('user_logged')
        }
    })
    socket.on('user_logged_out', (user) => {
        if (user) {
            sessions.addUserSession(user, socket.id)
            socket.join(user.type)
            console.log('User Logged out: User= ' + user.id + " | " + user.name +
                ' Socket ID= ' + socket.id)
            console.log(' -> Total Sessions= ' + sessions.users.size)
            socket.broadcast.emit('user_logged_out')
        }
    })
    socket.on('user_list_updated', (user) => {
        socket.broadcast.emit('user_list_updated', user)
        console.log('User Updated: User= ' + user.id + " | " + user.name +
            ' Socket ID= ' + socket.id)
    })
})