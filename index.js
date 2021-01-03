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
    socket.on('disconnect', (reason) => {
        let l = sessions.removeSocketIDSession(socket.id)
        console.log('Disconnect Socket ID= ' + socket.id)
        console.log(' -> Total Sessions= ' + sessions.users.size)
        socket.broadcast.emit('user_disconnect',l.user)
    })
    socket.on('user_logged', (user) => {
        if (user) {
            sessions.addUserSession(user, socket.id)
            socket.join(user.type)
            console.log('User Logged: User= ' + user.id + " | " + user.name +
                ' Socket ID= ' + socket.id)
            console.log(' -> Total Sessions= ' + sessions.users.size)
            socket.broadcast.emit('user_logged',user)
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
        console.log('User= ' + user.id + " | " + user.name +
            ' Socket ID= ' + socket.id)
    })
    socket.on('user_blocked', (user) => {
        socket.broadcast.emit('user_blocked', user)
        console.log('User Blocked = ' + user.id + " | " + user.name + ")")
    })
    socket.on('user_available', (user) => {
        socket.broadcast.emit('user_available', user)
        console.log('User Available = ' + user.id + " | " + user.name + ")")
    })
    socket.on('products_list_updated', (product) => {
        socket.broadcast.emit('products_list_updated', product)
        console.log('Product= ' + product.id + " | " + product.name+ ")")
    })
    socket.on('order_created', (order) => {
        socket.broadcast.emit('order_created', order)
        console.log('Order= ' + order.id )
    })
    socket.on('order_cooked', (order) => {
        socket.broadcast.emit('order_cooked', order)
        console.log('Order ' + order.id + "has been cooked. Ready to deliver")
    })
    socket.on('order_assign_cook', (user) => {
        socket.broadcast.emit('order_assign_cook', user)
        console.log('User ' + user.id + "has an order assign")
    })
    socket.on('order_taken_delivery', (user) => {
        socket.broadcast.emit('order_taken_delivery', user)
        console.log('User ' + user.id + " has taken an order to delivery")
    })
    socket.on('notification', (payload) => {
        let session = sessions.getUserSession(payload.destinationUser.id)
        if (session) {
            socket.to(session.socketID).emit('notification', payload)
        }
    })
})