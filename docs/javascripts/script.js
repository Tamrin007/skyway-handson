/**
 * Created by yusuke on 2014/11/25.
 */

$(document).ready(function () {

    // 定数宣言
    var APIKEY = 'e7b397f6-f91a-42e9-ab48-57b1d990c862';

    // グローバル変数
    var callList = [];
    var myPeerid = '';
    var myStream = null;
    var peer = null;

    // getUserMediaのcompatibility
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    // Peerオブジェクトを生成
    peer = new Peer({key: APIKEY, debug: 3});

    // エラーハンドラ
    peer.on('error', function(err) {
        console.error(err);
    });

    // openイベントのハンドラ
    peer.on('open', function(id) {
        myPeerid = id;
        console.log('My Peer ID is: ' + id);

        navigator.getUserMedia({
            audio: true,
            video: true
        }, function(stream) {
            $('#myStream').prop('src', URL.createObjectURL(stream));
            myStream = stream;

            connectToPeers();
        }, function() {
            console.error('getUserMedia error');
        });
    });

    // callイベント用のハンドラを設置
    function functionName() {
        peer.on('call', function(call) {
            call.answer(myStream);
            setupCallEventHandlers(call);
            addCall(call);
        });
    }

    // callオブジェクトのイベントをセットする
    function setupCallEventHandlers(call) {
        call.on('stream', function(stream) {
            addVideo(call, stream);
        });

        call.on('close', function() {
            call.close();
            removeCall(call);
            removeVideo(call);
        });
    }

    // ユーザリストを取得して片っ端から繋ぐ
    function connectToPeers() {
        peer.listAllPeers(function(list) {
            for (var i = 0; i < list.length; i++) {
                if (myPeerid != list[i]) {
                    var call = peer.call(list[i], myStream);
                    setupCallEventHandlers(call);
                    addCall(call);
                }
            }
        });
    }

    // コールの追加
    function addCall(call) {
        callList.push(call);
    }

    // コールの削除
    function removeCall(call) {
        var position = callList.indexOf(call);
        if (position > 0) {
            callList.splice(position, 1);
        }
    }

    // VIDEO要素を追加する
    function addVideo(call, stream) {
        var videoDOM = $('<video autoplay>');
        videoDOM.attr('id', call.peer);
        videoDOM.prop('src', URL.createObjectURL(stream));

        $('.videosContainer').append(videoDOM);
    }

    // VIDEO要素を削除する
    function removeVideo(call) {
        $('#' + call.peer).remove();
    }

});
