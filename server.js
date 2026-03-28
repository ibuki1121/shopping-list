const Gpio = require('onoff').Gpio;
const WebSocket = require('ws');

// ボタン:GPIO 17 (入力、チャタリング防止50ms)
// LED:GPIO 27 (出力)
const button = new Gpio(17, 'in', 'both', { debounceTimeout: 50 });
const led = new Gpio(27, 'out');

const wss = new WebSocket.Server({ port: 8765 });

console.log("WebSocketサーバー起動中 (port: 8765)");

wss.on('connection', (ws) => {
    console.log("ブラウザと接続されました");

    // ボタンの状態を監視
    button.watch((err, value) => {
        if (err) throw err;

        // value 1: 押された, 0: 離された
        if (value === 1) {
            led.writeSync(1); // 点灯
            ws.send(JSON.stringify({ command: 'START' }));
            console.log("録音開始信号を送りました");
        } else {
            led.writeSync(0); // 消灯
            ws.send(JSON.stringify({ command: 'STOP' }));
            console.log("録音終了信号を送りました");
        }
    });

    ws.on('close', () => {
        console.log("切断されました");
    });
});

// 終了処理
process.on('SIGINT', () => {
    led.unexport();
    button.unexport();
    process.exit();
});