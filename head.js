/*:
 * @plugindesc ゲームシステム用プラグイン
 * @author 陽向隼人
 * 
 * @help ゲームシステム用のプラグイン。
 * 他のプラグインに依存しまくっているため汎用性は皆無。
 * 
 * 必要なプラグイン:
 *   MessageSystem.js
 * 
 * ピクチャ番号7を方向表示用に使用する。
 * 
 * @param isDebug
 * @text デバッグモード
 * @desc ONにするとデバッグモードになる
 * @type boolean
 * @on ON
 * @off OFF
 * @default true
 * 
 * @param variableOfTurns
 * @text ターン数変数
 * @desc ターン数の変数番号を指定する。(デフォルト:1)
 * @type variable
 * @default 1
 */

(function() {
    'use strict';
    
    const PN = "HNT_GameSystem"; // プラグインの名前

    const parameters = PluginManager.parameters(PN); // プラグインパラメータを取得
    const isDebug = parameters.isDebug === "true"; // デバッグフラグを取得
    const variableIdOfTurns = Number(parameters.variableOfTurns);
