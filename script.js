const game = (function () {
  var events = {
    events: {},
    on: function (eventName, fn) {
      this.events[eventName] = this.events[eventName] || [];
      this.events[eventName].push(fn);
    },
    off: function (eventName, fn) {
      if (this.events[eventName]) {
        for (var i = 0; i < this.events[eventName].length; i++) {
          if (this.events[eventName][i] === fn) {
            this.events[eventName].splice(i, 1);
            break;
          }
        }
      }
    },
    emit: function (eventName, data) {
      if (this.events[eventName]) {
        this.events[eventName].forEach(function (fn) {
          fn(data);
        });
      }
    },
  };

  const Fields = {
    fields: [],
    spans: [],
    line:document.querySelector("#line"),
    btnRestart:document.querySelector("#btnRestart"),
    init: function () {
      Fields.fields = [];
      for (let i = 0; i < 9; i++) {
        Fields.fields.push(document.querySelector("#index" + i));
        Fields.spans.push(document.querySelector("#index" + i + " span"));
        Fields.fields[i].addEventListener("click", Fields.clickOnDiv);
      }
      Fields.btnRestart.addEventListener('click',restart);
    },
    clickOnDiv: function (e) {
      play(parseInt(e.target.id[5]));
    },
    restart: function () {
      for (let i = 0; i < 9; i++) {
        Fields.spans[i].textContent = "";
        Fields.spans[i].style.color = "black";
      }
      Fields.init();
      Fields.line.removeAttribute('class');
    },
    displayMove: function (position) {
      Fields.spans[position].textContent = Gameboard.gameboard[position];
    },
    displayWin: function (winSituation) {
      if (winSituation.position === "row") {
        Fields.spans[winSituation.index * 3].style.color = "green";
        Fields.spans[winSituation.index * 3 + 1].style.color = "green";
        Fields.spans[winSituation.index * 3 + 2].style.color = "green";
      } else if (winSituation.position === "column") {
        Fields.spans[winSituation.index].style.color = "green";
        Fields.spans[winSituation.index + 3].style.color = "green";
        Fields.spans[winSituation.index + 6].style.color = "green";
      } else if (winSituation.position === "diagonal") {
        if (winSituation.index === 1) {
          Fields.spans[0].style.color = "green";
          Fields.spans[4].style.color = "green";
          Fields.spans[8].style.color = "green";
        } else {
          Fields.spans[2].style.color = "green";
          Fields.spans[4].style.color = "green";
          Fields.spans[6].style.color = "green";
        }
      }
      Fields.line.classList.add((winSituation.position+winSituation.index));
      Fields.disablePlay();
    },
    disablePlay: function () {
      for (let i = 0; i < 9; i++) {
        Fields.fields[i].removeEventListener("click", Fields.clickOnDiv);
      }
    },
    displayDraw: function(){
        Fields.disablePlay();
    }
  };

  const Gameboard = {
    gameboard: [],
    setSimbol: function (position, symbol) {
      if (this.gameboard[position] === null) {
        this.gameboard[position] = symbol;
        events.emit("moveMade", position);
      }
    },
    checkState: function () {
        let win = Gameboard.checkWin()
        if(win===1)
            return;

        let draw = Gameboard.checkDraw();            
        if(draw)
            events.emit("draw");
    },
    checkDraw:function(){
        for(let i=0; i<9;i++){
            if(Gameboard.gameboard[i]===null)
                return false;
        }
        return true;
    },
    checkWin: function () {
      // 0 1 2
      // 3 4 5
      // 6 7 8
      //check rows
      for (i = 0; i < 9; i += 3) {
        if (
          Gameboard.gameboard[i] === Gameboard.gameboard[i + 1] &&
          Gameboard.gameboard[i] === Gameboard.gameboard[i + 2] &&
          Gameboard.gameboard[i] !== null
        ) {
          console.log("win in row:" + i / 3 + " by " + Gameboard.gameboard[i]);
          events.emit("win", { position: "row", index: i / 3 });
          return 1;
        }
      }
      //check columns
      for (i = 0; i < 3; i++) {
        if (
          Gameboard.gameboard[i] === Gameboard.gameboard[i + 3] &&
          Gameboard.gameboard[i] === Gameboard.gameboard[i + 6] &&
          Gameboard.gameboard[i] !== null
        ) {
          console.log("win in column:" + i + " by " + Gameboard.gameboard[i]);
          events.emit("win", { position: "column", index: i });
          return 1;
        }
      }
      //check diagonals
      if (
        Gameboard.gameboard[0] === Gameboard.gameboard[4] &&
        Gameboard.gameboard[0] === Gameboard.gameboard[8] &&
        Gameboard.gameboard[0] !== null
      ) {
        console.log("win in first diagonal by " + Gameboard.gameboard[0]);
          events.emit("win", { position: "diagonal", index: 1 });
          return 1;
      }
      if (
        Gameboard.gameboard[2] === Gameboard.gameboard[4] &&
        Gameboard.gameboard[2] === Gameboard.gameboard[6] &&
        Gameboard.gameboard[2] !== null
      ) {
        console.log("win in seccond diagonal by " + Gameboard.gameboard[2]);
        events.emit("win", { position: "diagonal", index: 2 });
        return 1;
      }
    },
    init: function () {
      for (i = 0; i < 9; i++) this.gameboard[i] = null;
    },
    print: function () {
      console.log("Gameboard:");
      for (i = 0; i < 9; i += 3) {
        console.log(
          Gameboard.gameboard[i] +
            " " +
            Gameboard.gameboard[i + 1] +
            " " +
            Gameboard.gameboard[i + 2]
        );
      }
    },
  };

  const Player = function (symbol) {
    this.symbol = symbol;
  };

  function setNextPlayer() {
    nextPlayer = nextPlayer === PlayerX ? PlayerO : PlayerX;
  }

  function play(position) {
    Gameboard.setSimbol(position, nextPlayer.symbol);
  }

  function restart() {
    Gameboard.init();
    Fields.restart();
    nextPlayer = PlayerX;
  }
  events.on("moveMade", setNextPlayer);
  events.on("moveMade", Gameboard.print);
  events.on("moveMade", Gameboard.checkState);
  events.on("moveMade", Fields.displayMove);
  events.on("win", Fields.displayWin);
  events.on("draw",Fields.displayDraw);

  const PlayerX = new Player("x");
  const PlayerO = new Player("o");
  let nextPlayer = PlayerX;

  Gameboard.init();
  Fields.init();
  
  return {
    play,
    restart,
  };
})();
