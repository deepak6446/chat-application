var express = require('express');
var app=express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname));
app.get('/', function(req, res){
         res.sendFile(__dirname + '/index.html');
});

var room = [],i=0;
function setlat(socketId,lat,lng){
	for(i=0;i<room.length;i++){
		if(room[i].socket==socketId){
			room[i].lat=lat;
			room[i].lng=lng;
		}
	}
	console.log("room length : ",room.length);
	console.log(room.length,"user : ",room[room.length-1].user," room :",room[room.length-1].room,"lat",room[room.length-1].lat,"lng",room[room.length-1].lng);
}

function disconnect(user,socket){
	console.log("in disconnect user :",user);
  	socket.leave(user);
  	console.log("user socket.leave : ",user);
    var index=findUser(user,socket);
    var username=findConnectedUser(user,socket);	
    var indx=findUser(username,socket);
    console.log("index : ",index)
    room.splice(index,1);
    console.log("after splice");
    displayUser();
    findUserRoom(username,indx-1);
    console.log("after findUserRoom");
    displayUser();
}

function findUser(user,socket){
    for(var i=0;i<room.length-1;i++){
    	if(user==room[i].user){
    		var index=i;
    		console.log("user found in findUser():",room[i].user);
    		return index;
    		break;
    	}
    }	
}

function findConnectedUser(user,socket){
	for(var i=0;i<room.length-1;i++){
		console.log("in findConnectedUser() user : ",user,"room[i].user",room[i].user);
    	if(user==room[i].connectedto){
    		room[i].connectedto = "";
    		room[i].connected=0;
    		console.log("***user connection cleaned in findConnectedUser() for :",room[i].user);
    		io.in(room[i].user).emit('user disconnected',user);
    		displayUser();
    		return(room[i].user);
    		break;
    	}
    }		
}
function findUserRoom(username,index){
	//find room for 2 users and connect them 
	console.log("finding room for :",username,"index:",index);
	if(typeof index == 'undefined' || index < 0 || isNaN(index)){
	}else{
	  for(i=0;i<=room.length-1;i++)
	  {
	     if(room[i].connected==0 && room[i].user != username)
	     {
	     	console.log("room found",room[i].user);
	        room[i].connected=1;
	        room[i].connectedto=room[index].user;
	        io.in(room[i].user).emit('joined to',room[index].user)  

	        room[index].connected=1;
	        room[index].connectedto=room[i].user;
	        io.in(room[index].user).emit('joined to',room[i].user)   
	        break;     
	     }
	  }
	 } 
}
function displayUser(){
	console.log("----------Active Users-----------------------------");
	for(i=0;i<room.length;i++){
	  console.log("user : ",room[i].user,"connected : ",room[i].connected,"connectedto: ",room[i].connectedto);
	}
	/*console.log(room);*/
	console.log("----------Active Users-----------------------------");

}
io.on('connection', function(socket){
  
  var socketId = socket.id;
  var clientIp = socket.request.connection.remoteAddress;
  var username;  
  console.log("--------------------new connection request --------------------");
  socket.on('lat lng' , function(data){
  	console.log('lat: ',data.lat,'long:',data.lng,'room.length : ',room.length);
  	  username = socketId+clientIp;  //username is used to uniquely identify user
	  //join user to room with name as username 
	  socket.join(username);
	  //create room for user to store user data
	  console.log("user connected username : ",username);
	  room.push({user:username,connected:"0",connectedto:"",room:"",lat:"",lng:"",socket:socket});
	  
	  /*console.log(room.length,"user : ",room[room.length-1].user," room :",room[room.length-1].room,"lat",room[room.length-1].lat,"lng",room[room.length-1].lng);*/
	  console.log("");
	  displayUser(); 	 
	  findUserRoom(username,room.length-1);
	  
	  	setlat(socket,data.lat,data.lng);
	  	console.log('---- after setting lat long and connection if possible ------');
	  	displayUser();
	  	//process.exit(0);
  });
  //on message received
  socket.on('chat message', function(data){
    console.log('message : ',data.msg,"to : ",data.to);
    //data.to has user name of user to whom data is to be send
    io.in(data.to).emit('messagefromserver',data.msg);
  });
  //disconnect socket 
  socket.on('disconnect',function(){
  	if(typeof username == 'undefined'){
  		console.log("usernot set");
  	}else{
  	console.log("In disconnected username : ",username);
  	disconnect(username,socket);
  	console.log("--------------------------------------------------------------");
    }  
  });
});

http.listen(3000, function(){
  console.log('listening on localhost:3000');
});