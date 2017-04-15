var express = require('express');
var app=express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname));
app.get('/', function(req, res){
         res.sendFile(__dirname + '/index.html');
});

var room=[],latroom=[],i=0,user=0;
function setlat(socketId,lat,lng){
	for(var j=0;j<room.length;j++){
		if(room[j].socket==socketId){
			room[j].lat=lat;
			room[j].lng=lng;
		}
	}
	console.log("room length : ",room.length);
	console.log(room.length,"user : ",room[room.length-1].user," room :",room[room.length-1].room,"lat",room[room.length-1].lat,"lng",room[room.length-1].lng);
}

function disconnect(user,socket){
	console.log("in disconnect user :",user);
  	socket.leave(user);
  	console.log("user socket.leave : ",user);
  	var index,username,indx;
    index=findUser(user,socket);
    if(typeof index == 'undefined'){
    	index=findLatUser(user,socket);
    	username=findLatConnectedUser(user,socket);
    	indx=findLatUser(username,socket);
    	console.log("indx : ",indx)
	    latroom.splice(index,1);
	    console.log("after splice");
	    displayLatUser();
	    findLatUserRoom(username,indx);
	    console.log("after findLatUserRoom");
	    displayLatUser();
    }
    else{
        username=findConnectedUser(user,socket);
        indx=findUser(username,socket);
        console.log("indx : ",indx)
	    room.splice(index,1);
	    console.log("after splice");
	    displayUser();
	    findUserRoom(username,indx);
	    console.log("after findUserRoom");
	    displayUser();
    }
    
}

function findUser(user,socket){
    for(var i=0;i<room.length;i++){
    	if(user==room[i].user){
    		var index=i;
    		console.log("user found in findUser():",room[i].user,"at index : ",i);
    		return index;
    		break;
    	}
    }	
}
function findLatUser(user,socket){
    for(var i=0;i<latroom.length;i++){
    	if(user==latroom[i].user){
    		var index=i;
    		console.log("user found in findlatUser():",latroom[i].user,"at index : ",i);
    		return index;
    		break;
    	}
    }	
}

function findConnectedUser(user,socket){
	for(var i=0;i<=room.length-1;i++){
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
function findLatConnectedUser(user,socket){
	for(var i=0;i<=latroom.length-1;i++){
		console.log("in findLatConnectedUser() user : ",user,"room[i].user",latroom[i].user);
    	if(user==latroom[i].connectedto){
    		latroom[i].connectedto = "";
    		latroom[i].connected=0;
    		console.log("***user connection cleaned in findLatConnectedUser() for :",latroom[i].user);
    		io.in(latroom[i].user).emit('user disconnected',user);
    		displayUser();
    		return(latroom[i].user);
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
function findLatUserRoom(username,index){
	//find room for 2 users and connect them 
	console.log("finding room in lat user for :",username,"index:",index);
	if(typeof index == 'undefined' || index < 0 || isNaN(index)){
	}
	else{
	  for(i=0;i<=latroom.length-1;i++)
	  {
	     if(latroom[i].connected==0 && latroom[i].user != username)
	     {
	     	console.log("room found",latroom[i].user);
	        latroom[i].connected=1;
	        latroom[i].connectedto=latroom[index].user;
	        io.in(latroom[i].user).emit('joined to',latroom[index].user)  

	        latroom[index].connected=1;
	        latroom[index].connectedto=latroom[i].user;
	        io.in(latroom[index].user).emit('joined to',latroom[i].user)   
	        break;     
	     }
	  }
	 } 
}
function displayUser(){
	console.log("----------Active Users-----------------------------");
	for(i=0;i<room.length;i++){
	  console.log("user : ",room[i].user,"connected : ",room[i].connected,"connectedto: ",room[i].connectedto,"lat: ",room[i].lat," lng :",room[i].lng);
	}
	/*console.log(room);*/
	console.log("----------Active Users-----------------------------");

}
function displayLatUser(){
	console.log("----------Active Users-----------------------------");
	for(i=0;i<latroom.length;i++){
	  console.log("user : ",latroom[i].user,"connected : ",latroom[i].connected,"connectedto: ",latroom[i].connectedto,"lat: ",latroom[i].lat," lng :",latroom[i].lng);
	}
	/*console.log(room);*/
	console.log("----------Active Users-----------------------------");

}
function sortlat(){
	//sort in ascending order based on lat long first
	//then based on whether first 5 charcters of longitude are same
	latroom.sort(function(a, b){return a.lat-b.lat});
    /*console.log(latroom[0].lat.toString().substring(0,6));*/
	for(var k=0;k<latroom.length-1;k++){
		if(latroom[k].lng>latroom[k+1].lng &&
		 latroom[k].lat.toString().substring(0,6)==latroom[k+1].lat.toString().substring(0,6)){
			var temp=latroom[k].lng;
			latroom[k].lng=latroom[k+1].lng;
			latroom[k+1].lng=temp;
		}
	}
}
io.on('connection', function(socket){
  user++;
  var socketId = socket.id;
  var clientIp = socket.request.connection.remoteAddress;
  var username;  
  console.log("--------------------on connection request --------------------");
  //connect to anonymous users
  socket.on('connection',function(){
  	console.log("connected");
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
	  console.log('---- after finduser and connection if possible ------');
	  displayUser();	
  });
  socket.on('lat lng' , function(data){
  	username = socketId+clientIp;  //username is used to uniquely identify user
  //join user to room with name as username 
  socket.join(username);
      console.log('lat: ',data.lat,'long:',data.lng,'room.length : ',room.length);
	  //create room for user to store user data
	  console.log("user connected username : ",username);
	  latroom.push({user:username,connected:"0",connectedto:"",room:"",lat:data.lat,lng:data.lng,socket:socket});	  
	  sortlat();
	  /*console.log(room.length,"user : ",room[room.length-1].user," room :",room[room.length-1].room,"lat",room[room.length-1].lat,"lng",room[room.length-1].lng);*/
	  console.log("");
	  displayLatUser(); 	 
	  findLatUserRoom(username,latroom.length-1);
	  
	  //setlat(socket,data.lat,data.lng);
	  console.log('---- after setting lat long and connection if possible ------');
	  displayLatUser();	  	
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