var http = require("http").createServer(function (req, res) {
    var pathname=__dirname+url.parse(req.url).pathname;
    if (path.extname(pathname)=="") {
        pathname+="/";
    }
    if (pathname.charAt(pathname.length-1)=="/"){
        pathname+="index.html";
    }

    fs.exists(pathname,function(exists){
        if(exists){
            switch(path.extname(pathname)){
                case ".html":
                    res.writeHead(200, {"Content-Type": "text/html"});
                    break;
                case ".js":
                    res.writeHead(200, {"Content-Type": "text/javascript"});
                    break;
                case ".css":
                    res.writeHead(200, {"Content-Type": "text/css"});
                    break;
                case ".gif":
                    res.writeHead(200, {"Content-Type": "image/gif"});
                    break;
                case ".jpg":
                    res.writeHead(200, {"Content-Type": "image/jpeg"});
                    break;
                case ".png":
                    res.writeHead(200, {"Content-Type": "image/png"});
                    break;
                default:
                    res.writeHead(200, {"Content-Type": "application/octet-stream"});
            }

            fs.readFile(pathname,function (err,data){
                res.end(data);
            });
        } else {
            res.writeHead(404, {"Content-Type": "text/html"});
            fs.readFile("error404.html",function (err,data){
                res.end(data);
            });
        }
    });

}),
    url  = require("url"),
    path = require("path"),
    port = process.env.PORT || 8080,
    fs   = require("fs");



var rooms={};
var io  =require("socket.io")(http);
io.on('connection',function(socket){
    var roomid=null;
    socket.emit('id',socket.id);
    console.log("new connection, id="+socket.id);
    socket.on("disconnect",function(){
        console.log(socket.id+" disconnected");
    });
    socket.on('joinRoom',function(id){
        socket.join(id);
        roomid=id;
    });
    socket.on('pushData',function(data){
        io.to(roomid).emit('dataSync',data);
    });

});


http.listen(port);
//console.log("Server running at http://127.0.0.1:8080/");