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



var roomdata={};
var roomuser={};
var roomdatatimer={};
var io  =require("socket.io")(http);
Date.prototype.Format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};
io.on('connection',function(socket){
    function log(text){
        var d=new Date();
        console.log(d.Format('[yyyy-MM-dd hh:mm:ss]')+' '+socket.id+' '+text);
    }
    var roomid=null;
    socket.emit('id',socket.id);
    log("new connection");
    socket.on("disconnect",function(){
        log("disconnected");
        if (roomid!=null){
            roomuser[roomid]--;
            if(roomuser[roomid]<=0){
                if(roomdatatimer[roomid])clearTimeout(roomdatatimer[roomid]);
                var deletedataid=roomid;
                roomdatatimer[roomid]=setTimeout(function(){
                    console.log('deleting data in '+deletedataid);
                    roomdata[deletedataid]=null;
                },3600000);
            }

        }
    });
    socket.on('joinRoom',function(id){
        if (roomid!=null){
            socket.leave(roomid);
            roomuser[roomid]--;
            //log(roomid+','+roomuser[roomid]);
            if(roomuser[roomid]<=0){
                if(roomdatatimer[roomid])clearTimeout(roomdatatimer[roomid]);
                var deletedataid=roomid;
                roomdatatimer[roomid]=setTimeout(function(){
                    console.log('deleting data in '+deletedataid);
                    roomdata[deletedataid]=null;
                },3600000);
            }
        }
        log('joining room '+id);
        socket.join(id);
        roomid=id;
        if(roomuser[roomid])roomuser[roomid]++;else roomuser[roomid]=1;
        //console.log(roomid+','+roomuser[roomid]);
        if(roomdatatimer[roomid])clearTimeout(roomdatatimer[roomid]);
        if (roomdata!=null)socket.emit('dataSync',{'data':roomdata[roomid]});
    });
    socket.on('pushData',function(data){
        if(roomdata[roomid]!=data['data']) {
            roomdata[roomid] = data['data'];
            log('pushing data');
            io.to(roomid).emit('dataSync', data);
        }
    });
    socket.on('pullData',function(){
        log('pulling data');
        if(roomdata[roomid]!=null)socket.emit('dataSync',roomdata[roomid]);
    });
    socket.on('do',function(data){
        log('doing '+data);
        io.to(roomid).emit('do',data);
    })

});


http.listen(port);
console.log("Server running at http://127.0.0.1:8080/");