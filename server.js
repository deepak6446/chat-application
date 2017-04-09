var express = require('express');
var app=express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname));
app.get('/', function(req, res){
         res.sendFile(__dirname + '/index.html');
});

var room = [],i=0;
io.on('connection', function(socket){
  var socketId = socket.id;
  var clientIp = socket.request.connection.remoteAddress;
  var username = socketId+clientIp;  //username is used to uniquely identify user
  console.log("user connected username : ",username);  
  //create room for user to store user data
  room.push({user:username,connected:"0",connectedto:"",room:""});
  //join user to room with name as username 
  socket.join(username);
  console.log(room.length,"user : ",room[room.length-1].user," room :",room[room.length-1].room);
  console.log("");

  //find room for 2 users and connect them 
  for(i=0;i<room.length-1;i++)
  {
     if(room[i].connected==0 && room[i].user != username)
     {
     	console.log("room found");
        room[i].connected=1;
        room[i].connectedto=room[room.length-1].user;
        io.in(room[i].user).emit('joined to',room[room.length-1].user)  

        room[room.length-1].connected=1;
        room[room.length-1].connectedto=room[i].user;
        io.in(room[room.length-1].user).emit('joined to',room[i].user)        
     	//process.exit(0);
     }
  }
  //console.log(room);
  /*for(j=0;j<room.le)*/
  //setInterval(function(){console.log("room length",room.length)},5000);
  //console.log("user1 in room :",room[i].user1);
  socket.on('chat message', function(data){
    console.log('message : ',data.msg,"to : ",data.to);
    //io.emit('messagefromserver',msg);
    io.in(data.to).emit('messagefromserver',data.msg)
  });
  
  /*socket.on('join',function(data){
  	console.log("user connected to room :",data.email);
  	socket.join(data.email);
  })*/
  
  socket.on('disconnect',function(){
  	console.log("user disconnected username : ",username);
  	socket.leave(username);
    for(i=0;i<room.length-1;i++)
    {
    	if(room[i].user==username){
    		index=i;
    		break;
    	}
    }
    console.log("user disconnected : ",room.pop(room[index]));
  });
});

http.listen(3000, function(){
  console.log('listening on localhost:3000');
});