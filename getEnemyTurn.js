const getEnemyTurn = function() {
    let enemyIndex = 0; // 行動する敵イベントのインデックス

    const reset = function() {
        let nextStatus = 2; // // 次の状態（この関数が返す値）
        const events = $gameMap.events(); // マップのイベントの配列を取得

        // マップにイベントが無かったときはプレイヤーターンへ遷移
        if (events.length === 0) {
            nextStatus = 0;
            return nextStatus;
        }

        enemyIndex = 0;

        while (events[enemyIndex].enemyId() === 0 || events[enemyIndex].hp() <= 0) {
            enemyIndex++;
            // 敵キャラクターがいなかったときはプレイヤーターンへ遷移
            if (enemyIndex >= events.length) {
                nextStatus = 0;
                return nextStatus;
            }
        }

        return nextStatus;
    };

    const update = function(that) {
        let nextStatus = 2; // // 次の状態（この関数が返す値）
        const events = $gameMap.events(); // マップのイベントの配列を取得
        const eventId = events[enemyIndex].eventId(); // イベントIDを取得

        const enemyId = that.character(eventId).enemyId(); // 敵IDを取得

        // プレイヤーとの距離を計算
        const distanceX = Math.abs(that.character(eventId).x - that.character(-1).x);
        const distanceY = Math.abs(that.character(eventId).y - that.character(-1).y);

        // プレイヤーと隣り合っているか
        const isByPlayer = distanceX <= 1 && distanceY <= 1;

        switch (Number($dataEnemies[enemyId].meta.ai)) {
        case 1:
            if (isByPlayer) {
                // 通常攻撃
                that.pluginCommand("ATTACK", ["-1", `${eventId}`, "1"]);
            } else {
                // プレイヤーに近づく
                that._character = that.character(eventId);
                that._character.forceMoveRoute({
                    "list": [{"code":10}, {"code":0}],
                    "repeat":false, "skippable":true
                });
                that.setWaitMode('route');
            }
            break;
        default:
            break;
        }

        enemyIndex++;
        if (enemyIndex >= events.length) {
            nextStatus = 0;
            return nextStatus;
        }

        while (events[enemyIndex].enemyId() === 0 || events[enemyIndex].hp() <= 0) {
            enemyIndex++;
            // 敵キャラクターがいなかったときはプレイヤーターンへ遷移
            if (enemyIndex >= events.length) {
                nextStatus = 0;
                return nextStatus;
            }
        }

        return nextStatus;
    };

    const enemyTurn = {
        "reset": reset,
        "update": update,
    };

    Object.freeze(enemyTurn); // enemyTurnオブジェクトを保護する
    return enemyTurn;
};
