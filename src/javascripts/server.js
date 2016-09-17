$(function() {
    // 変数宣言
    const APIKEY = 'e7b397f6-f91a-42e9-ab48-57b1d990c862';
    var room;

    // getUserMediaのcompatibility
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    // Peerオブジェクトを生成
    peer = new Peer({
        key: APIKEY,
        debug: 3
    });

    // エラーハンドラ
    peer.on('error', function(err) {
        console.error(err);
    });

    // peer の　open ハンドラ
    peer.on('open', function() {
        $('.peerID').text('peerID: ' + peer.id);
    });

    // 各種クリックハンドラ
    $(function() {
        $('#startButton').click(function() {
            // ユーザストリームの取得を開始
            getCameraStream();
            // ルームネームの取得
            var roomName = $("#roomName").val();
            $('.roomName').text('roomName: ' + roomName);
            room = peer.joinRoom('sfu_video_' + roomName, {
                mode: 'sfu',
                stream: window.localStream
            });
        });
    });

    function getCameraStream() {
        navigator.getUserMedia({
            audio: true,
            video: true
        }, function(stream) {
            $('#myStream').prop('src', URL.createObjectURL(stream));
            myStream = stream;
            window.localStream = stream;
        }, function() {
            console.error('getUserMedia error');
        });
    }
});
