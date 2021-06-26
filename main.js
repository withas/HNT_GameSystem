let status = 0; // ゲームの状態
let numOfTurns = 0; // ターン数
const playerTurn = getPlayerTurn();
const enemyTurn = getEnemyTurn();

const init = function(that) {
    playerTurn.init(that);
};

const update = function(that) {
    while (true) {
        switch (status) {
        // プレイヤーのコマンド待ち状態
        case 0:
            // 次の状態によって場合分け
            switch (status = playerTurn.update(that)) {
            case 2:
                // 敵ターンの準備。敵イベントが存在しないときはこのフレーム内にプレイヤーターンへ戻る
                if ((status = enemyTurn.reset()) === 0) {
                    numOfTurns++;
                    continue;
                }
                break;
            default:
                break;
            }
            break;
        // 敵ターンの準備。敵イベントが存在しないときはこのフレーム内にプレイヤーターンへ戻る
        case 1:
            // 次の状態によって場合分け
            switch (status = enemyTurn.reset()) {
            case 0:
                numOfTurns++;
                continue;
            case 2:
                continue;
            }
        // 敵の行動ターン
        case 2:
            if ((status = enemyTurn.update(that)) === 0) numOfTurns++;
            break;
        case 3:
            console.log("Z key pressed.");
            status = 0;
            break;
        default:
            throw new Error(`status = ${status}は無効`);
        }
        break;
    }

    // ターン数を更新
    $gameVariables.setValue(variableIdOfTurns, numOfTurns);
};

const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);
    
    if (command === "GAME") {
        switch (args[0]) {
        case "INIT":
            init(this);
            break;
        case "UPDATE":
            update(this);
            break;
        default:
            throw new Error(`プラグインコマンド${command}にパラメータ${args[0]}は無効`);
        }
    }
};
