const Gpio = require('onoff').Gpio;
const WebSocket = require('ws');

// ボタン:GPIO 17, LED:GPIO 27
const button = new Gpio(17, 'in', 'both', { debounceTimeout: 50 });
const led = new Gpio(27, 'out');

const wss = new WebSocket.Server({ port: 8765 });

console.log("WebSocketサーバー起動中 (port: 8765)");

wss.on('connection', (ws) => {
    console.log("ブラウザと接続されました");

    button.watch((err, value) => {
        if (err) throw err;

        if (value === 1) { // 押した時
            led.writeSync(1);
            ws.send(JSON.stringify({ command: 'START' }));
            console.log("録音開始信号 送信");
        } else { // 離した時
            led.writeSync(0);
            ws.send(JSON.stringify({ command: 'STOP' }));
            console.log("録音終了信号 送信");
        }
    });

    ws.on('close', () => {
        console.log("切断されました");
    });
});

process.on('SIGINT', () => {
    led.unexport();
    button.unexport();
    process.exit();
});