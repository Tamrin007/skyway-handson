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
            getCameraStream()
                // ルームネームの取得
            var roomName = $("#roomName").val();
            $('.roomName').text('roomName: ' + roomName);
            // room = peer.joinRoom('sfu_video_' + roomName, {
            //     mode: 'sfu'
            // });
            call = peer.joinRoom($('#roomName').val(), {
                mode: 'sfu',
                stream: window.localStream
            });
            call.on('stream', function(stream) {
                alert("stream started");
            });
        });
    });
});

// room のハンドラ
// function getLive(room) {
//     room.on('stream', function(stream){
//         console.log("stream start");
//         $('#live').prop('src', URL.createObjectURL(stream));
//     });
// }

function getCameraStream() {
    navigator.getUserMedia({
        audio: true,
        video: true
    }, function(stream) {
        window.localStream = stream;
    }, function() {
        console.error('getUserMedia error');
    });
}
