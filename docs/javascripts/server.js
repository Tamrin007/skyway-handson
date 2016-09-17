/**
 * Created by yusuke on 2014/11/25.
 */

$(document).ready(function() {

    // 定数宣言
    var APIKEY = 'd248852b-f2c5-4153-8562-5422d08e000c';

    // グローバル変数
    var callList = [];
    var myPeerid = '';
    var myStream = null;
    var peer = null;
    var conn;

    // getUserMediaのcompatibility
    navigator.getUserMedia = navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia;

    // Peerオブジェクトを生成
    peer = new Peer({
        key: APIKEY,
        debug: 3
    });

    // エラーハンドラ
    peer.on('error', function(err) {
        console.error(err);
    });

    // openイベントのハンドラ
    peer.on('open', function(id) {
        myPeerid = id;
        $('#peerID').text('My peer ID is: ' + id);

        // カメラ映像を取得して表示する
        navigator.getUserMedia({
            audio: true,
            video: true
        }, function(stream) {
            $('#myStream').prop('src', URL.createObjectURL(stream));
            myStream = stream;
        }, function() {
            console.error('getUserMedia error');
        });
    });

    // callイベント用のハンドラを設置
    peer.on('call', function(call) {
        // 相手からcallイベントがきたらstreamを送り返す（応答する）
        call.answer(myStream);
        // callオブジェクトのイベントをセット
        setupCallEventHandlers(call);

        var img = '<img class="' + 'boy' + '" src="./images/boy03_smile.png" width="100px">'
        $(img).appendTo('.listeners');
    });

    // callオブジェクトのイベントをセットする
    function setupCallEventHandlers(call) {
        // 相手からcloseイベントがきたらコネクションを切断して保存した
        // callオブジェクトを削除、対応するVIDEOS要素も削除
        call.on('close', function() {
            call.close();
        });
    }

    // 相手からデータ通信の接続要求イベントが来た場合、このconnectionイベントが呼ばれる
    // - 渡されるconnectionオブジェクトを操作することで、データ通信が可能
    peer.on('connection', function(connection) {　
        // データ通信用に connectionオブジェクトを保存しておく
        conn = connection;

        $('.boy').prop('src', './images/boy01_laugh.png');
        // メッセージ受信イベントの設定
        conn.on('data', function(data) {
            alert("アラート");
            console.log(data);
        });
    });
});
