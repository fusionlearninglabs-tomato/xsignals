//imports
const express= require('express');
const {createServer}=require('http');
const {Server} = require('socket.io');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

//game setup
const players={};

//host webclient at->
app.get('/',(req,res)=>{
	res.sendFile(__dirname+'/index.html')
});

io.on('connection',(socket)=>{
console.log('We got a live one! @: ',socket.id);
//create player
players[socket.id]={
x:Math.floor(Math.random()*400),
y:Math.floor(Math.random()*400),
color:`hsl(${Math.random()*360},70%,50%)`
};

//Send Player list
io.emit('updatePlayers', players);
//Handle Movement
socket.on('move',(movementData)=>{
	if (players[socket.id]){
		players[socket.id].x += movementData.x;
		players[socket.id].y += movementData.y;
		
		//Broadcast pos
		io.emit('updatePlayers',players);
	}
});
socket.on('chat message',(msg)=>{
	console.log(msg);
	if (players[socket.id]){
		players[socket.id].message=msg;
		io.emit('updatePlayers',players);

setTimeout(() =>{
	if (players[socket.id]){
		players[socket.id].message="";
		io.emit('updatePlayers',players);
}
},5000);
	}
});
socket.on('disconnect',()=>{
console.log('someone bounced yo.');
delete players[socket.id];
io.emit('updatePlayers',players);
});
});

httpServer.listen(3000,() =>{
console.log('Servers up at localhost 3k');

});