(function (ext) {
  var endpoint = 'http://localhost:8080/api';
  var apikey = 'ADMIN';
  var delayMs = 100;

  var headers = {
    'x-webapi-key': apikey,
    'Content-Type': 'application/json'
  };
  var worlds = [];
  var players = [];

  var getWorld = function (worldName) {
    return worlds.find(function (w) {
      return w.name === worldName;
    });
  };

  var getPlayer = function (playerName) {
    return players.find(function (p) {
      return p.name === playerName;
    });
  };

  var setPlayer = function (obj) {
    var player = obj.player;
    var idx = players.findIndex(function (p) {
      return p.uuid === player.uuid;
    });
    if (idx !== -1) {
      players[idx] = player;
    } else {
      players.push(player);
    }
  }

  ext._shutdown = function () {

  };

  ext._getStatus = function () {
    return {status: 2, msg: 'Ready'};
  };

  var delay = function (response) {
    return new Promise(function (resolve) {
      setTimeout(function () {
        resolve(response);
      }, delayMs);
    });
  };

  ext.getBlock = function (world, x, y, z, callback) {
    var worldObj = getWorld(world);
    if (!worldObj) {
      callback(null);
    }
    fetch(endpoint + '/block/' + worldObj.uuid + '/' + x + '/' + y + '/' + z, {
      headers: headers
    }).then(function (response) {
      return response.json();
    }).then(function (json) {
      return delay(json)
    }).then(function (json) {
      callback(json.block.type.id);
    });
  };

  ext.setBlock = function (world, x, y, z, blocktype, callback) {
    var worldObj = getWorld(world);
    if (!worldObj) {
      return;
    }

    fetch(endpoint + '/block/op', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        type: 'CHANGE',
        world: worldObj.uuid,
        min: {x: x, y: y, z: z},
        max: {x: x, y: y, z: z},
        block: {type: blocktype}
      })
    }).then(function (response) {
      return response.json();
    }).then(function (json) {
      return delay(json);
    }).then(function (json) {
      callback();
    });
  };

  ext.getPlayersInfo = function (callback) {
    fetch(endpoint + '/player', {
      method: 'GET',
      headers: headers
    }).then(function (response) {
      return response.json();
    }).then(function (json) {
      return delay(json);
    }).then(function (json) {
      players = json.players;
      callback();
    });
  };

  ext.getPlayerInfo = function (player, callback) {
    var playerObj = getPlayer(player);
    if (!playerObj) {
      callback(null);
    }

    fetch(endpoint + '/player/' + playerObj.uuid, {
      method: 'GET',
      headers: headers
    }).then(function (response) {
      console.log(response);
      return response.json();
    }).then(function (json) {
      return delay(json);
    }).then(function (json) {
      setPlayer(json);
      callback();
    });
  };

  ext.getPlayerWorld = function (player) {
    var playerObj = getPlayer(player);
    if (!playerObj) {
      return null;
    }

    return playerObj.location.world.name;
  };

  ext.getPlayerX = function (player) {
    var playerObj = getPlayer(player);
    if (!playerObj) {
      return null;
    }

    return playerObj.location.position.x;
  };

  ext.getPlayerY = function (player) {
    var playerObj = getPlayer(player);
    if (!playerObj) {
      return null;
    }

    return playerObj.location.position.y;
  };

  ext.getPlayerZ = function (player) {
    var playerObj = getPlayer(player);
    if (!playerObj) {
      return null;
    }

    return playerObj.location.position.z;
  };

  ext.getPlayerNum = function () {
    return players.length;
  };

  ext.getPlayerName = function (i) {
    if (i >= players.length) {
      return null;
    }

    return players[i].name;
  };

  ext.executeCommand = function (cmd, args, callback) {
    fetch(endpoint + '/cmd', {
      method: 'POST',
      body: JSON.stringify({name: 'Scratch', command: cmd + ' ' + args}),
      headers: headers
    }).then(function () {
      return delay(null);
    }).then(function () {
      callback();
    }).catch(function (e) {
      callback();
    });
  };

  ext.say = function (str, callback) {
    ext.executeCommand('say', str, callback);
  };

  ext.createExplosion = function (x, y, z, callback) {
    ext.executeCommand('summon', 'PrimedTnt ' + [x, y, z].join(' ') + ' {Fuse: 0}', callback);
  };

  ext.effect = function (player, effect, level, callback) {
    ext.executeCommand('effect', [player, effect, level].join(' '), callback);
  };

  ext.clearEffect = function (player, callback) {
    ext.executeCommand('effect', [player, 'clear'].join(' '), callback);
  };

  var desc = {
    blocks: [
      ['w', '%s というメッセージを送信', 'say', 'message'],
      ['w', '%m.world の x=%n, y=%n, z=%n にあるブロックを %s にする', 'setBlock', '', 0, 0, 0, 'minecraft:air'],
      ['R', '%m.world の x=%n, y=%n, z=%n にあるブロックを取得', 'getBlock', '', 0, 0, 0],
      ['w', '%m.world の x=%n, y=%n, z=%n から x=%n, y=%n, z=%n にあるブロックを %s にする', 'fillBlock', '', 0, 0, 0, 'minecraft:air'],
      ['w', 'プレイヤーの一覧を取得', 'getPlayersInfo'],
      ['w', 'プレイヤー %s の情報を更新', 'getPlayerInfo', ''],
      ['r', 'プレイヤー %s のWorld', 'getPlayerWorld', ''],
      ['r', 'プレイヤー %s のx座標', 'getPlayerX', ''],
      ['r', 'プレイヤー %s のy座標', 'getPlayerY', ''],
      ['r', 'プレイヤー %s のz座標', 'getPlayerZ', ''],
      ['r', 'プレイヤーの数', 'getPlayerNum'],
      ['r', '%n 番目のプレイヤーの名前', 'getPlayerName', 0],
      ['w', 'x=%n, y=%n, z=%n で爆発', 'createExplosion', 0, 0, 0],
      ['w', '%s に効果 %m.effect を lv=%n で与える', 'effect', '', 'minecraft:speed', 2],
      ['w', '%s の効果 を取り消し', 'clearEffect', ''],

      ['w', 'コマンド実行 %s %s', 'executeCommand', 'say', 'hello'],

    ],
    menus: {
      world: [],
      effect: [
        'minecraft:absorption',
        'minecraft:unluck',
        'minecraft:blindness',
        'minecraft:fire_resistance',
        'minecraft:growing',
        'minecraft:haste',
        'minecraft:health_boost',
        'minecraft:hunger',
        'minecraft:hunger',
        'minecraft:instant_damage',
        'minecraft:instant_health',
        'minecraft:invisibility',
        'minecraft:jump_boost',
        'minecraft:levitation',
        'minecraft:luck',
        'minecraft:mining_fatigue',
        'minecraft:nausea',
        'minecraft:night_vision',
        'minecraft:poison',
        'minecraft:regeneration',
        'minecraft:resistance',
        'minecraft:saturation',
        'minecraft:slowness',
        'minecraft:speed',
        'minecraft:strength',
        'minecraft:water_breathing',
        'minecraft:weakness',
        'minecraft:wither'
      ]
    }
  };

  fetch(endpoint + '/world', {
    method: 'GET',
    headers: {
      'x-webapi-key': apikey
    }
  }).then(function (response) {
    return response.json();
  }).then(function (json) {
    worlds = json.worlds;
    desc.menus.world = worlds.map(function (world) {
      return world.name;
    });
    ScratchExtensions.register('MineCraft Extension', desc, ext);
  });
})({});
