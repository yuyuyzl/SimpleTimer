/**
 * Created by user on 2016/3/2.
 */
(function() {
    var app = angular.module('main', []);
    app.controller('mainCtrl',['$scope','$q','$timeout', function($scope,$q,$timeout){
        this.encodeData=function(){
            var data=this.stages[0][0]+'|'+this.stages[0][1]
            for (var i=1;i<this.stages.length;i++)data+='|'+this.stages[i][0]+'|'+this.stages[i][1]
            return window.btoa(unescape(encodeURIComponent(data)))
        }
        this.decodeData=function(b64string){
            var data=decodeURIComponent(escape(window.atob(b64string))).split('|');
            this.stages=[]

            while (data.length>=2){
                this.stages.push([data.shift(),data.shift()]);

            }
            this.setStage(0);
        }
        this.hidemouse=false;
        this.onMoveTimer=null;
        this.onMoveOnMain=function(){
            var a=this;
            console.log('1')
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
            if (this.time==0)this.setStage(this.stage+1);
            else this.playButton();
        }

        this.playButton=function(){
            if (this.timing)
                this.stopTiming(false);
            else
                this.startTiming(this.haha);
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

        try {
            this.decodeData(this.data);
        }catch (e){
            this.stages=[['new activity',1]];
            this.setStage(0);
        }
        if (this.stages.length==0)this.stages=[['new activity',1]];
        this.groups=['组1','组2','组3']
    }])

})();