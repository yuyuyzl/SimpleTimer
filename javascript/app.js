/**
 * Created by user on 2016/3/2.
 */
(function() {
    var app = angular.module('main', []);
    app.controller('mainCtrl',['$scope','$q','$timeout', function($scope,$q,$timeout){
        var a=this;
        this.encodeData=function(){
            var data={
                'stages':this.stages,
                'stage':this.stage,
                'sround':this.sround,
                'time':this.time,
                'groups':this.groups
            }
            return window.btoa(unescape(encodeURIComponent(JSON.stringify(data))));
        }
        this.decodeData=function(b64string){
            var data=JSON.parse(decodeURIComponent(escape(window.atob(b64string))));
            this.stages=data['stages'];
            this.groups=data['groups'];
            this.setsround(data['sround']);
            this.setStage(data['stage']);
            this.time=data['time'];
        }
        this.hidemouse=false;
        this.onMoveTimer=null;
        //*******socket.io part*************
        this.socket=io();
        this.id=null;
        this.roomid=null;

        this.ignoreNextDo=false;
        this.socket.on("id",function(id){
            a.id=id;
            console.log("get id=",id);
        });
        this.socket.on("dataSync",function(data){
            console.log("data get: "+data);
            $timeout(function(){a.decodeData(data)},0);
        })
        this.socket.on('do',function(data){
            if (!a.ignoreNextDo){
                switch (data){
                    case 'P':
                        $timeout(a.playButton,0);
                        break;
                    case 'A':
                        $timeout(a.autoNext,0);
                        break;
                    case '+':
                        $timeout(function(){
                            a.time=a.inc(a.time);
                        },0);
                        break;
                }
            }else {
                a.ignoreNextDo=false;

            }
        })
        this.sendDo=function(data){
            this.ignoreNextDo=true;
            this.socket.emit('do',data);
        }
        this.joinRoom=function(){
            if (this.roomid!=null){
                this.socket.emit("joinRoom",this.roomid);
            }
        }
        this.pushData=function(){
            this.socket.emit("pushData",this.encodeData());
        }
        //************socket.io part*********
        this.onMoveOnMain=function(){
            var a=this;
            //console.log('1')
            this.hidemouse=false;
            if(this.onMoveTimer)$timeout.cancel(this.onMoveTimer);
            this.onMoveTimer=$timeout(function(){
                a.hidemouse=true;
            },1000);
        }
        this.time=0;
        this.page=0;
        this.stage=0;
        this.sround=1;
        this.timing=false;
        this.formatTime=function(n){
            var mm=Math.floor(n/60);
            var ss=n % 60;
            return (mm<10?'0':'')+mm+':'+(ss<10?'0':'')+ss;
        }
        this.url=window.location.href.split('?')[0];
        this.data=window.location.href.split('?')[1];
        this.addStageAt=function(n){
            var nl=[]
            for (var i=0;i<this.stages.length;i++){
                if (i==n)nl.push(['new activity',1])
                nl.push(this.stages[i]);
            }
            this.stages=nl;
        }
        this.rmvStageAt=function(n){
            var nl=[]
            for (var i=0;i<this.stages.length;i++){
                if (i!=n)nl.push(this.stages[i]);
            }
            this.stages=nl;
        }
        this.upStageAt=function(n){
            var nl=[]
            for (var i=0;i<this.stages.length;i++){
                if (i==n-1)nl.push(this.stages[i+1]);else
                if (i==n) nl.push(this.stages[i-1]);else
                    nl.push(this.stages[i]);
            }
            this.stages=nl;
        }

        this.getRangeArray=function(n){
            var ans=[];
            for (var i=0;i<n;i++){
                ans.push(i);
            }
            return ans;
        };

        this.setStage=function(n){
            if (n<0) {
                if (this.sround > 1) {
                    this.sround--;
                    this.stage=this.stages.length-1;
                    this.stopTiming(true);
                }
                return;
            }
            if (n>=this.stages.length) {
                if (this.sround < 3) {
                    this.sround++;
                    this.stage=0;
                    this.stopTiming(true);
                }
                return;
            }
            this.stage=n;
            this.stopTiming(true);
        }
        this.setsround=function(n){
            if(n<=0||n>=4)return;
            this.sround=n;
            this.stopTiming(true);
        }
        this.haha=function(a){
            //Todo play something

        };
        this.autoNext=function(){
            if (a.time==0) a.setStage(a.stage+1);
            else a.playButton();
        }

        this.playButton=function(){
            if (a.timing)
                a.stopTiming(false);
            else
                a.startTiming(a.haha);
        }
        this.startTiming=function(cb){
            var a=this;
            this.timing=true;
            this.time++;
            var timers=function(){
                a.time--;
                console.log(a.time);
                a.timerPromise=$timeout(function(){
                    if (a.time>0) timers();else {
                        a.timing=false;
                        cb(a);
                    }
                },1000);
            }
            timers();
        }
        this.stopTiming=function(reset){
            this.timing=false;
            if(reset)this.time=this.stages[this.stage][1];
            $timeout.cancel(this.timerPromise);
        }
        this.inc=function(n){
            if (typeof(n)=="number")n++;
            else n=Number(n)+1;
            return n;
        };
        try {
            this.decodeData(this.data);
        }catch (e){
            this.stages=[['new activity',1]];
            this.groups=['组1','组2','组3'];
            this.setStage(0);
        }
        if (this.stages.length==0)this.stages=[['new activity',1]];



    }])

})();