/**
 * Created by yusuke on 2014/11/25.
 */
var peer = null;
var conn;
var peer_id;

$(document).ready(function() {

    // 定数宣言
    var APIKEY = 'd248852b-f2c5-4153-8562-5422d08e000c';

    // グローバル変数
    var myStream = null;

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
        console.log('My peer ID is: ' + id);

        // カメラ映像を取得して表示する
        navigator.getUserMedia({
            audio: true,
            video: true
        }, function(stream) {
            var url = URL.createObjectURL(stream);
            $('#listener').prop('src', url);
            localMediaStream = stream;
        }, function() {
            console.error('getUserMedia error');
        });
    });

    $('#watch').click(function() {
        // 接続先のIDをフォームから取得する
        peer_id = $('#targetId').val();

        // 相手と通話を開始して、自分のストリームを渡す
        var call = peer.call(peer_id, localMediaStream);
        setInterval(sendImg, 1000);

        // 相手のストリームが渡された場合、このstreamイベントが呼ばれる
        // - 渡されるstreamオブジェクトは相手の映像についてのストリームオブジェクト
        call.on('stream', function(stream) {
            // 映像ストリームオブジェクトをURLに変換する
            // - video要素に表示できる形にするため変換している
            var url = URL.createObjectURL(stream);

            // video要素のsrcに設定することで、映像を表示する
            $('#targetVideo').prop('src', url);
        });
    });
});

function getMax(object) {
    var max = 0;
    var key;
    for (var variable in object) {
        if (max < parseFloat(object[variable])) {
            max = parseFloat(object[variable]);
            key = variable;
        }
    }
    return key;
}

function sendImg() {
    var video = document.getElementById('listener');
    if (localMediaStream) {
        var canvas = document.getElementById('canvas');
        //canvasの描画モードを2dに
        var ctx = canvas.getContext('2d');
        var img = document.getElementById('img');

        //videoの縦幅横幅を取得
        var w = video.offsetWidth;
        var h = video.offsetHeight;

        //同じサイズをcanvasに指定
        canvas.setAttribute("width", w);
        canvas.setAttribute("height", h);

        //canvasにコピー
        ctx.drawImage(video, 0, 0, w, h);

        //ここから画像のバイナリ化
        var can = canvas.toDataURL();
        // Data URLからBase64のデータ部分のみを取得
        var base64Data = can.split(',')[1];
        // base64形式の文字列をデコード
        var data = window.atob(base64Data);
        var buff = new ArrayBuffer(data.length);
        var arr = new Uint8Array(buff);

        // blobの生成
        for (var i = 0, dataLen = data.length; i < dataLen; i++) {
            arr[i] = data.charCodeAt(i);
        }
        var blob = new Blob([arr], {
            type: 'image/png'
        });

        var formData = new FormData();
        formData.append('img', blob);
    }
    $.ajax({
            url: "https://api.projectoxford.ai/emotion/v1.0/recognize",
            beforeSend: function(xhrObj) {
                // Request headers
                xhrObj.setRequestHeader("Content-Type", "application/octet-stream");
                xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", "849f204323c941fda27ef4b09068a07e");
            },
            type: "POST",
            // Request body
            data: blob,
            dataType: 'json',
            contentType: false,
            processData: false,
        })
        .done(function(data) {
            var response = JSON.stringify(data, null, "    ");
            var scores = data[0].scores;
            var expression = getMax(scores);

            // 送信
            conn = peer.connect(peer_id);
            conn.send(expression);

            if (expression == 'happiness') {
                $('.boy').prop('src', './images/boy01_laugh.png');
            } else {
                $('.boy').prop('src', './images/boy03_smile.png');
            }
        })
        .fail(function() {
            alert("error");
        });
}
