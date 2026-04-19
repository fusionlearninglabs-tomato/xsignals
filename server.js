//imports
const express= require('express');
const {createServer}=require('http');
const {Server} = require('socket.io');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

//game setup
const players={};
const signals={};
let sigCount=0;

//host webclient at->
app.use(express.static(__dirname + "/public"));

app.get('/',(req,res)=>{
	res.sendFile(__dirname + "/public/index.html");
});

io.on('connection',(socket)=>{
//console.log('We got a live one! @: ',socket.id);
//create player
const pColor=`hsl(${Math.random()*360},70%,50%)`;
players[socket.id]={
x:Math.floor(Math.random()*400),
y:Math.floor(Math.random()*400),
color:pColor,
	score:0,
goal:{
	x:Math.floor(Math.random()*400),
	y:Math.floor(Math.random()*400),
	size:10,

	color:pColor,
	borderColor:'#444'
}
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
	//console.log(msg);
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
//console.log('someone bounced yo.');
delete players[socket.id];
io.emit('updatePlayers',players);
});
});

//spawn logic:
setInterval (()=>{
const signalId = `sig_${sigCount++}`;
const playerIds=Object.keys(players);
if (playerIds.length === 0) return;

const randomPlayerId=playerIds[Math.floor(Math.random()*playerIds.length)];
const creator = players[randomPlayerId];

signals[signalId]={
	id:signalId,
	x:creator.x,
	y:creator.y,
	color:creator.color,
	targetId:randomPlayerId,
	speed:2 
};
io.emit('updateSignals',signals);
},3000);

//update logic:
setInterval(() =>{
let stateChanged=false;
for(const id in signals){
	const sig = signals[id];
	const targetPlayer = players[sig.targetId];
	
	if (targetPlayer) {
		const dx = targetPlayer.goal.x - sig.x;
		const dy = targetPlayer.goal.y - sig.y;
		const dist = Math.sqrt(dx * dx + dy * dy);
		if (dist > 5){
			sig.x += (dx / dist)  * sig.speed;
			sig.y += (dy / dist) * sig.speed;
			stateChanged=true
			
		
	
for (const pId in players){
	const p = players[pId];
	if (sig.targetId!==pId){
	const distToPlayer = Math.sqrt(Math.pow(p.x - sig.x,2) + Math.pow(p.y - sig.y,2));
	if (distToPlayer < 20 && sig.targetId !== pId) {
	sig.color=p.color;
	sig.targetId=pId;
	stateChanged=true;
	}
	}
}


}
 else {
	 if(players[sig.targetId]){
		 
			players[sig.targetId].score+=1;
 			//console.log (`Player${sig.targetId} now has ${players[sig.targetId].score}`);			
	 }		
		delete signals[id];
			
		
		stateChanged=true;
}
}else{
	delete signals[id];
	stateChanged=true;
} 
}
if (stateChanged){
	io.emit('updateSignals',signals);
}
},1000 / 60);


httpServer.listen(3000,() =>{
//console.log('Servers up at localhost 3k');

});