/**
 * Created by user on 2016/3/2.
 */
(function() {
    var app = angular.module('main', []);
    app.controller('mainCtrl',['$scope','$q','$timeout', function($scope,$q,$timeout){
        this.encodeData=function(){
            var data={};

            data={
                'roomid':this.roomid,
                'RO':this.RO,
                'passwd':this.passwd
            };

            return window.btoa(unescape(encodeURIComponent(JSON.stringify(data))));
        };
        this.url=window.location.href.split('?')[0];
        this.RO=false;
        this.Join=function () {
            window.open(this.url+'a?'+this.encodeData())
        };



    }])

})();