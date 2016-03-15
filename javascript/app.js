/**
 * Created by user on 2016/3/2.
 */
(function() {
    var app = angular.module('main', []);
    app.controller('mainCtrl',['$scope','$q','$timeout', function($scope,$q,$timeout){
        var a=this;
        this.encodeData=function(){
            var data={};

                data={
                    'stages':this.stages,
                    'stage':this.stage,
                    'sround':this.sround,
                    'time':this.time,
                    'groups':this.groups,
                    'roomid':this.roomid
                };

            return window.btoa(unescape(encodeURIComponent(JSON.stringify(data))));
        };
        this.decodeData=function(b64string,config){
            var data=JSON.parse(decodeURIComponent(escape(window.atob(b64string))));
            if(!config||config.indexOf('stages')!=-1)this.stages=data['stages'];
            if(!config||config.indexOf('groups')!=-1)this.groups=data['groups'];
            if(!config||config.indexOf('sround')!=-1)this.setsround(data['sround']);
            if(!config||config.indexOf('stage')!=-1)this.setStage(data['stage']);
            if(!config||config.indexOf('time')!=-1)this.time=data['time'];
            if (this.roomid==null){
                this.roomid=data['roomid'];
                this.joinRoom()
            }
        };
        this.hidemouse=false;
        this.onMoveTimer=null;
        //*******socket.io part*************
        this.socket=io();
        this.id=null;
        this.roomid=null;

        var ignoreNextDo=false;
        var ignoreNextSync=false;
        this.socket.on("id",function(id){
            a.id=id;
            console.log("get id=",id);
        });
        this.socket.on("dataSync",function(data){
            if(!ignoreNextSync) {
                console.log("data get: " + data);
                $timeout(function () {
                    a.decodeData(data['data'],data['config'])
                }, 0);
            }else ignoreNextSync=false;
        });
        this.socket.on('do',function(data){
            if (!ignoreNextDo){
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
                    case 'R':
                        $timeout(function(){
                            a.stopTiming(true);
                        },0);
                        break;
                    case '+P':
                        $timeout(function(){
                            a.setStage(a.stage+1);
                        },0);
                        break;
                    case '+S':
                    $timeout(function(){
                        a.setsround(a.sround+1);
                    },0);
                    break;
                    case '-P':
                    $timeout(function(){
                        a.setStage(a.stage-1);
                    },0);
                    break;
                    case '-S':
                    $timeout(function(){
                        a.setsround(a.sround-1);
                    },0);
                    break;
                }
            }else {
                ignoreNextDo=false;

            }
        });
        this.sendDo=function(data){
            ignoreNextDo=true;
            this.socket.emit('do',data);
        };
        this.joinRoom=function(){
            if (this.roomid!=null){
                this.socket.emit("joinRoom",this.roomid);
            }
        };
        this.pushData=function(config){

            a.socket.emit("pushData",{'data':a.encodeData(),'config':config});
        };
        this.pullData=function(){
            a.socket.emit("pullData",null);
        };
        //************socket.io part*********
        this.onMoveOnMain=function(){
            var a=this;
            //console.log('1')
            this.hidemouse=false;
            if(this.onMoveTimer)$timeout.cancel(this.onMoveTimer);
            this.onMoveTimer=$timeout(function(){
                a.hidemouse=true;
            },1000);
        };
        this.time=0;
        this.page=0;
        this.stage=0;
        this.sround=1;
        this.timing=false;
        this.formatTime=function(n){
            var mm=Math.floor(n/60);
            var ss=n % 60;
            return (mm<10?'0':'')+mm+':'+(ss<10?'0':'')+ss;
        };
        this.url=window.location.href.split('?')[0];
        this.data=window.location.href.split('?')[1];
        this.addStageAt=function(n){
            var nl=[];
            for (var i=0;i<this.stages.length;i++){
                if (i==n)nl.push(['new activity',1]);
                nl.push(this.stages[i]);
            }
            this.stages=nl;
        };
        this.rmvStageAt=function(n){
            var nl=[];
            for (var i=0;i<this.stages.length;i++){
                if (i!=n)nl.push(this.stages[i]);
            }
            this.stages=nl;
        };
        this.upStageAt=function(n){
            var nl=[];
            for (var i=0;i<this.stages.length;i++){
                if (i==n-1)nl.push(this.stages[i+1]);else
                if (i==n) nl.push(this.stages[i-1]);else
                    nl.push(this.stages[i]);
            }
            this.stages=nl;
        };

        this.getRangeArray=function(n){
            var ans=[];
            for (var i=0;i<n;i++){
                ans.push(i);
            }
            return ans;
        };

        this.setStage=function(n){
            if (n<0) {
                if (a.sround > 1) {
                    a.sround--;
                    a.stage=a.stages.length-1;
                    a.stopTiming(true);
                }
                return;
            }
            if (n>=a.stages.length) {
                if (a.sround < 3) {
                    a.sround++;
                    a.stage=0;
                    a.stopTiming(true);
                }
                return;
            }
            a.stage=n;
            a.stopTiming(true);
        };
        this.setsround=function(n){
            if(n<=0||n>=4)return;
            a.sround=n;
            a.stopTiming(true);
        };
        this.haha=function(a){
            //Todo play something

        };
        this.autoNext=function(){
            if (a.time==0) a.setStage(a.stage+1);
            else a.playButton();
        };

        this.playButton=function(){
            if (a.timing)
                a.stopTiming(false);
            else
                a.startTiming(a.haha);
        };
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
            };
            timers();
        };
        this.stopTiming=function(reset){
            this.timing=false;
            if(reset)this.time=this.stages[this.stage][1];
            $timeout.cancel(this.timerPromise);
        };
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
        var dataSyncTimer=null;

        $scope.$watch('mc.groups',function(newV,oldV){
            if ((newV!==oldV)){
                if (dataSyncTimer)$timeout.cancel(dataSyncTimer);
                dataSyncTimer=$timeout(function(){

                    a.pushData(['stages','groups']);
                },10);
            }
        },true);
        $scope.$watch('mc.stages',function(newV,oldV){
            if ((newV!==oldV)) {
                if (dataSyncTimer)$timeout.cancel(dataSyncTimer);
                dataSyncTimer=$timeout(function(){

                    a.pushData(['stages','groups']);
                },10);
            }
        },true);

    }])

})();