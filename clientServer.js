//node clientServer.js 2 tcp://127.0.0.1 12345 true


var app = require('express')();
var bodyParser = require('body-parser');
var formidable = require('express-formidable');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(formidable());
var http = require('http').Server(app);
var zmq = require('zmq');


serverID = process.argv[2]
router_address = process.argv[3]
send_port_no = process.argv[4]
debug = (process.argv[5] == "true")

listen_socket = zmq.socket('pull');
listen_socket.connect(router_address+":5002")

sender_socket = zmq.socket('push')
sender_socket.connect(router_address+":"+send_port_no)

var writePending_dict = [],
readPending_dict = [];


listen_socket.on('message', function(){

  // Parsing Message

  var args = Array.apply(null, arguments);
  console.log(args[0].toString('utf8'));
  var message = JSON.parse(args[0].toString('utf8'))
  console.log(message);


  if (message['rpc'] == 'addEntryReply')
  	writePending_dict[message['requestId']] = message['status'];
  else if (message['rpc'] == 'readEntryReply'){
  	readPending_dict[message['requestId']] = message['data'];
  }

});


//For reading request, for now API contains fileName
app.post('/readData', function(req, res){
  var requestId = Math.random().toString(36).substring(7); //Assigning a randomID
  if (debug) console.log("Read RequestID assigned : " + requestId)
  readPending_dict[requestId] = 'failure';
  var data = req.fields;
  if (debug) console.log(data);
  var fileName = data['fileName'];
  msg = {'clientId' : serverID
  , 'dest' : 1
  , 'requestId': requestId
  , 'rpc' : 'readEntry'
  , 'fileName' : fileName
  };
  sender_socket.send(JSON.stringify(msg));
  if (debug) console.log(msg);
  var count = 20;
  var my_int = setInterval(function(){
    if (count == 0){
      res.send("Server Timeout!");
      if (debug) "Request id " + requestId + "didn't got serve\n"
      clearInterval(my_int);
      return;
    }
    count -= 1;
    if (readPending_dict[requestId] != "failure"){
      if (debug) console.log(readPending_dict[requestId]);
      res.send(readPending_dict[requestId]);
      clearInterval(my_int);
    }
  }, 100);
  return;
});


//For writing request
app.post('/pushData', function(req, res){
	var requestId = Math.random().toString(36).substring(7); //Assigning a randomID
	if (debug) console.log("Write RequestID assigned : " + requestId)
	writePending_dict[requestId] = 'failure';
  data = req.fields;
  if (debug) console.log(data)
  msg = {'clientId':serverID
  , 'dest': 1
  , 'requestId' : requestId
  , 'requestData' : {'fileData': str(new Date().getTime()) + data['data'] + "\n", 'fileName': data['fileName'] }
  , 'rpc':'addEntry'
  };
  sender_socket.send(JSON.stringify(msg));
  if (debug) console.log(msg)
  var count = 20;
  var my_int =   setInterval(function(){
    if (count == 0) {
    	res.send("Not added!");
    	clearInterval(my_int);
  	  return;
    }
    count -= 1;
    if (writePending_dict[requestId] == "Success"){
  	  if (debug) console.log("Log accepted");
  	  res.send("Log added!");
  	  clearInterval(my_int);
    }
  },100);
  return;
});


//Start http server
http.listen(3000, function(){
  console.log('listening on *:3000');
});


// data = {'dest':1}
// i = 5;
// function send_mess(){
//   console.log("here")
//   sender_socket.send(JSON.stringify(data));
//   if (i!=0)
//     setTimeout(send_mess, 500);
//   i--;
// }
// send_mess();

  // while (time_out && writePending_dict[request_id]<majority) time_out--;