const getPlayerTurn = function() {
    let prePlayer = {};     // プレイヤーの座標を保存する
    let isCtrlMode = false; // 斜め移動モードか
    let preTargetId = 0;    // 移動先目標のイベントIDを保存する

    // デバッグ中はCtrlをTabに置き換える
    const ctrl = isDebug ? 'tab' : 'control';

    // 各マップの最初に実行する
    const init = function(that) {
        prePlayer.x = that.character(-1).x;
        prePlayer.y = that.character(-1).y;
    }

    // 次のフレームのstatusを返す
    const update = function(that) {
        let nextStatus = 0; // 次の状態（この関数が返す値）

        // 実行開始時のプレイヤーの座標
        const player = {
            "x": that.character(-1).x,
            "y": that.character(-1).y,
        };

        // プレイヤーが移動しているかのフラグ
        const isPlayerMoved = player.x !== prePlayer.x || player.y !== prePlayer.y

        // プレイヤーの座標を保存
        prePlayer.x = player.x;
        prePlayer.y = player.y;

        // 動いていたらプレイヤーのターンを終了
        if (isPlayerMoved) {
            // console.log("Player moved.");
            nextStatus = 2;
            return nextStatus;
        }

        // キャンセルキーが押された瞬間
        if (Input.isTriggered('cancel')) {
            SoundManager.playOk();
            SceneManager.push(Scene_Menu);
            Window_MenuCommand.initCommandPosition();
            return 0;
        }

        // 決定キーが押された瞬間
        if (Input.isPressed('ok')) {
            
            return 3;
        }

        let moveCode = 0; // 移動コード
        const target = {  // 移動先目標の座標
            "x": player.x,
            "y": player.y,
        };

        // コントロールキーが押されているとき
        if (Input.isPressed(ctrl)) {
            // 斜め移動モードがOFFのとき
            if (!isCtrlMode) {
                // 三角形ピクチャを表示する座標を計算
                const x = $gamePlayer.screenX() - 48 * 1.5;
                const y = $gamePlayer.screenY() - (48 + 42);

                // 4方向三角形ピクチャを表示
                $gameScreen.showPicture(7, "four_triangles", 0, x, y, 100, 100, 128, 0);

                isCtrlMode = true; // 斜め移動モードをオン
            }
        }
        // コントロールキーが押されていないとき
        else {
            // 斜め移動モードがONのとき
            if (isCtrlMode) {
                $gameScreen.erasePicture(7);
                isCtrlMode = false;
            }
        }

        // 上キーと下キーが押されている、もしくは右キーと左キーが押されているとき
        if (Input.isPressed('up') && Input.isPressed('down') || Input.isPressed('left') && Input.isPressed('right')) {
            return nextStatus; // なにもせずに終了
        }

        // 上キーと右キーが押されているとき
        else if (Input.isPressed('up') && Input.isPressed('right')) {
            // console.log("Up and Right pressed.");
            target.x++; target.y--;
            moveCode = 8;
        }

        // 上キーと左キーが押されているとき
        else if (Input.isPressed('up') && Input.isPressed('left')) {
            // console.log("Up and Left pressed.");
            target.x--; target.y--;
            moveCode = 7;
        }

        // 下キーと右キーが押されているとき
        else if (Input.isPressed('down') && Input.isPressed('right')) {
            // console.log("Down and Right pressed.");
            target.x++; target.y++;
            moveCode = 6;
        }

        // 下キーと左キーが押されているとき
        else if (Input.isPressed('down') && Input.isPressed('left')) {
            // console.log("Down and Left pressed.");
            target.x--; target.y++;
            moveCode = 5;
        }

        // 上までの条件に当てはまらず斜め移動モードでない場合
        else if (!isCtrlMode) {
            // 上キーのみ押されているとき
            if (Input.isPressed('up')) {
                // console.log("Up pressed.");
                target.y--;
                moveCode = 4;
            }

            // 右キーのみ押されているとき
            else if (Input.isPressed('right')) {
                // console.log("Right pressed.");
                target.x++;
                moveCode = 3;
            }

            // 左キーのみ押されているとき
            else if (Input.isPressed('left')) {
                // console.log("Left pressed.");
                target.x--;
                moveCode = 2;
            }

            // 下キーのみ押されているとき
            else if (Input.isPressed('down')) {
                // console.log("Down pressed.");
                target.y++;
                moveCode = 1;
            }
        }

        // 移動先目標座標のイベントIDを取得
        target.id = $gameMap.eventIdXy(target.x, target.y);

        // 前回の実行時の目標イベントIDと違い、実行可能なイベントかつ敵ではないならば実行
        const isExe = target.id !== 0 && target.id !== preTargetId && $gameMap.event(target.id).event().meta.exe
                      && that.character(target.id).enemyId() === 0;
        if (isExe) that.character(target.id).start();

        // この実行の目標先イベントIDを保存
        preTargetId = target.id;

        // 対象イベントが生きている敵のとき
        if (target.id !== 0 && that.character(target.id).enemyId() !== 0 && that.character(target.id).hp() > 0) {
            // 通常攻撃
            that.pluginCommand("ATTACK", [`${target.id}`, "-1", "6"]);

            // プレイヤーのターンを終了
            nextStatus = 1;
        }

        // キーが押されていたとき
        if (moveCode !== 0) {
            // 斜め移動モードを解除する
            if (isCtrlMode) {
                $gameScreen.erasePicture(7);
                isCtrlMode = false;
            }
            // プレイヤーを動かす
            that._character = that.character(-1);
            that._character.forceMoveRoute({
                "list": [{"code": moveCode}, {"code": 0}],
                "repeat": false, "skippable": true
            });
            if (!isExe) that.setWaitMode('route');

            return nextStatus;
        }

        return nextStatus;
    };

    const playerTurn = {
        "init": init,
        "update": update,
    };

    Object.freeze(playerTurn); // playerTurnオブジェクトを保護する
    return playerTurn;
};
