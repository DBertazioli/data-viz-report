//inspired by this tic tac toe ai tutorial: https://mostafa-samir.github.io/Tic-Tac-Toe-AI/, much thanks to the author!

var symb;
var ai_symb;

var game;

window.onload = function() {
  start_it();

  $('#prompt button').click(function() {
    if ($(this).hasClass("button-x")) {
      symb = "X";
      ai_symb = "O";
    } else if ($(this).hasClass("button-o")) {
      symb = "O";
      ai_symb = "X";
    }
    $('#prompt').removeClass('loaded');
    setTimeout(function() { $('#prompt').addClass('hidden'); }, 500);
  });

  $('#container div').click(function() {
    if (symb !== "") {
      for (var i = 0; i < 9; i++) {
        if ($(this).hasClass("field" + i) && game.currentState.board[i] === "E") {
          $(this).html("<h3>" + symb + "</h3>");
          var next = new State(game.currentState);
          next.board[i] = symb;
          next.advanceTurn();
          
          next.turn = ai_symb;
          game.advanceTo(next);
        }
      }
    }
  });

  $('#gameoverScreen button').click(function() {
    $("#gameoverScreen").removeClass("loaded");
    setTimeout(function() {
      $("#gameoverScreen").addClass("hidden")
    }, 500);
    start_it();
  });
}

var start_it = function() {
  for (var i = 0; i < 9; i++) {
    $(".field" + i).html("");
  }
  setTimeout(function() { $('#prompt').addClass('loaded'); }, 300);

  game = new Game();
}

var ai_mv = function(pos) {

  this.mv_pos = pos;
  this.minimaxVal = 0;

  this.applyTo = function(state) {
    var next = new State(state);

    next.board[this.mv_pos] = state.turn;

    if (state.turn === ai_symb)
      next.ai_n_mv++;

    next.advanceTurn();

    return next;
  }
};

function minimaxValue(state) {
    if (state.isTerminal()) {
      
      return Game.score(state);
    } else {
      var stateScore;

      if (state.turn === symb) {
        stateScore = -100;
      }
      else {
        stateScore = 100;
      }
      
      var availableNextStates = state.emptyCells().map(function(pos) {
        var action = new ai_mv(pos);

        var nextState = action.applyTo(state);

        return nextState;
      });

      availableNextStates.forEach(function(nextState) {
        var nextScore = minimaxValue(nextState);
        if (state.turn === symb) {
          if (nextScore > stateScore)
            stateScore = nextScore;
        } else {
          if (nextScore < stateScore)
            stateScore = nextScore;
        }
      });

      return stateScore;
    }
  }

  function mv(turn) {
   
    var availableActions = game.currentState.emptyCells().map(function(pos) {
      var action = new ai_mv(pos);
      var next = action.applyTo(game.currentState);

      action.minimaxVal = minimaxValue(next);

      return action;
    });

     var chosenAction = availableActions.sort(function(a, b) {
      if (a.minimaxVal < b.minimaxVal) {
        return -1; 
      }
      else if (a.minimaxVal > b.minimaxVal) {
        return 1;
      }
      else {
        return 0;
      }
    })[0];

    var nextAction = chosenAction.applyTo(game.currentState);

    $(".field" + chosenAction.mv_pos).html("<h3>" + ai_symb + "</h3>");

    game.advanceTo(nextAction);
  }

var State = function(old) {
  this.turn = "";

  this.ai_n_mv = 0;

  this.board = [];

  
  if (typeof old !== "undefined") {
   
    var len = old.board.length;
    this.board = new Array(len);
    for (var i = 0; i < len; i++) {
      this.board[i] = old.board[i];
    }

    this.ai_n_mv = old.ai_n_mv;
    this.result = old.result;
    this.turn = old.turn;
  }
 
  this.advanceTurn = function() {
    this.turn = (this.turn === symb) ? ai_symb : symb;
  }

  this.emptyCells = function() {
    var indxs = [];
    for (var itr = 0; itr < 9; itr++) {
      if (this.board[itr] === "E") {
        indxs.push(itr);
      }
    }
    return indxs;
  }

  this.isTerminal = function() {
  
    var board = this.board.map(function(value) {
      if(value === ai_symb) {
        return 1;
      } else if(value === symb) {
        return -1;
      } else {
        return 0;
      } 
    });
    
    var board2D = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    
    
    for(var i = 0; i < 9; i++) {
      board2D[i % 3][Math.floor(i / 3)] = board[i];
    }
    
    var counts = [0, 0, 0, 0, 0, 0, 0, 0];
    
    for(var i = 0; i < 3; i++) {
      for(var j = 0; j < 3; j++) {
         counts[i] += board2D[i][j];
         counts[3 + i] += board2D[j][i];
      }
    }
    
    counts[6] = board2D[0][0] + board2D[1][1] + board2D[2][2];
    counts[7] = board2D[2][0] + board2D[1][1] + board2D[0][2];
    
    if(counts.indexOf(3) !== -1) {
      this.result = ai_symb;
      return true;
    } else if(counts.indexOf(-3) !== -1) {
      this.result = symb;
      return true;
    }
    
    if (this.emptyCells().length === 0) {
      this.result = "draw";
      return true;
    } else {
      return false;
    }
  };

};

var Game = function() {
  
  this.currentState = new State();
  
  this.currentState.board = 
    ["E", "E", "E",
    "E", "E", "E",
    "E", "E", "E"
  ];

  this.currentState.turn = "";

  this.advanceTo = function(_state) {
    this.currentState = _state;
    if (_state.isTerminal()) {
      $("#gameoverScreen").removeClass("hidden");
      setTimeout(function() {
        $("#gameoverScreen").addClass("loaded");
      }, 10);

      var text = "";

      if (_state.result === symb) {
        text = "You won.";
      } else if (_state.result === ai_symb) {
        text = "You lost.";
      } else {
        text = "Its a draw.";
      }
      $(".informationText").text(text);
    } else if(_state.turn === ai_symb) {    
      mv(ai_symb);
    }
  };

  
  this.start = function() {
    this.advanceTo(this.currentState);
  }

};

Game.score = function(_state) {
  if (_state.result === symb) {
    return 10 - _state.ai_n_mv;
  } else if (_state.result === ai_symb) {
    return -10 + _state.ai_n_mv;
  } else {
    return 0;
  }
}
