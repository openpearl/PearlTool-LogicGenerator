(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// JQuery.
// Allow draggable windows.
$.fn.attachDragger = function(){
  var attachment = false, lastPosition, position, difference;
  $( $(this).selector ).on("mousedown mouseup mousemove",function(e){
    if( e.type == "mousedown" ) attachment = true, lastPosition = [e.clientX, e.clientY];
    if( e.type == "mouseup" ) attachment = false;
    if( e.type == "mousemove" && attachment == true ){
      position = [e.clientX, e.clientY];
      difference = [ (position[0]-lastPosition[0]), (position[1]-lastPosition[1]) ];
      $(this).scrollLeft( $(this).scrollLeft() - difference[0] );
      $(this).scrollTop( $(this).scrollTop() - difference[1] );
      lastPosition = [e.clientX, e.clientY];
    }
  });

  $(window).on("mouseup", function(){
    attachment = false;
  });
}

// ReactJS ====================================================================

var Router = window.ReactRouter;
var Route = window.ReactRouter.Route;
var RouteHandler = window.ReactRouter.RouteHandler;
GlobalEvents = {};
ProcessedTree = {};

var App = React.createClass({displayName: "App",
  render: function() {
    return (
      React.createElement(RouteHandler, null)
    );
  }
});

var Editor = require('../jsx/Editor/Editor.jsx');

var routes = (
  React.createElement(Route, {handler: App}, 
    React.createElement(Route, {handler: Editor})
  )
);

Router.run(routes, function (Handler) {
  React.render(React.createElement(Handler, null), document.getElementById('content'));
});

},{"../jsx/Editor/Editor.jsx":2}],2:[function(require,module,exports){
var MessageBank = require("./MessageBank/MessageBank.jsx");
var Tree = require("./Tree/Tree.jsx");

var Editor = React.createClass({displayName: "Editor",

  render: function() {
    return (
      React.createElement("div", {id: "editor-page"}, 
        React.createElement(MessageBank, null), 
        React.createElement(Tree, null)
      )
    );
  }

});

module.exports = Editor;

},{"./MessageBank/MessageBank.jsx":3,"./Tree/Tree.jsx":6}],3:[function(require,module,exports){
var MessageCard = require('./MessageCard.jsx');

var MessageBank = React.createClass({displayName: "MessageBank",

  getInitialState: function () {
    return {
      messageBank: {}
    };
  },

  componentDidMount: function() {
    var _this = this;

    $.ajax({
      type: "GET",
      url: "files/messages.json",
      dataType: "json",
      success: function(data) {
        console.log("messages.json loaded.");

        _this.setState({
          messageBank: data
        })
        _this.bindSearch();
      },
      error: function() {
        $.ajax({
          type: "GET",
          url: "files/messages.csv",
          dataType: "text",
          success: function(data) {
            console.log("messages.csv loaded.");
            _this.getRandomIDs(data);
          }
        });
      }
    });
  },

  bindSearch: function() {

    $messages = $(".message-card");

    $('#searchbar').keyup(function() {
      var val = $.trim($(this).val()).replace(/ +/g, ' ').toLowerCase();
      
      $messages.show().filter(function() {
        var text = $(this).text().replace(/\s+/g, ' ').toLowerCase();
        return !~text.indexOf(val);
      }).hide();
    });
  },

  getRandomIDs: function(allText) {
    console.log("Getting random IDs.");

    var _this = this;
    var allTextLines = allText.split(/\r\n|\n/);
    var allTextLinesLength = allTextLines.length;

    if (allTextLines.length === 0) { return; }

    var randomOrgRequest = {
      "jsonrpc": "2.0",
      "method": "generateStrings",
      "params": {
        "apiKey": "5b278ac6-92aa-429e-8fda-37bd41245594",
        "n": allTextLinesLength,
        "length": 7,
        "characters": "abcdefghijklmnopqrstuvwxyz",
        "replacement": false
      },
      "id": 18197
    }

    var randomOrgUrl = "https://api.random.org/json-rpc/1/invoke";
    $.post(randomOrgUrl, JSON.stringify(randomOrgRequest), function (data) {

      console.log("Bits used: " + data.result.bitsUsed);
      console.log("Bits left: " + data.result.bitsLeft);
      console.log("Requests left: " +data.result.requestsLeft);

      var randomIDs = data.result.random.data;
      var messagesJson = {};

      for (var i = 0; i < randomIDs.length; i++) {
        messagesJson[ randomIDs[i] ] = allTextLines[i];
      }

      console.log(messagesJson)
      _this.setDownloadLink(messagesJson);
    });
  },

  setDownloadLink: function(messagesJson) {
    var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(messagesJson));

    $('<a href="data:' + data + '" download="messages.json">Save and input converted file.</a>').appendTo('#tree-display');
  },

  triggerSaveTree: function() {
    $(GlobalEvents).trigger('tree:save');
  },

  render: function() {
    var _this = this;

    var messageCards = [];
    for (var id in _this.state.messageBank) {
      messageCards.push(
        React.createElement(MessageCard, {key: id, cardId: id, 
          message: _this.state.messageBank[id]})
      );
    }

    return (
      React.createElement("div", {id: "message-bank"}, 
        React.createElement("button", {onClick: _this.triggerSaveTree}, "Hello!"), 
        React.createElement("input", {type: "text", id: "searchbar", placeholder: "Search: "}), 
        React.createElement("div", null, messageCards)
      )
    );
  }
  
});

module.exports = MessageBank;

},{"./MessageCard.jsx":4}],4:[function(require,module,exports){
var MessageCard = React.createClass({displayName: "MessageCard",

  componentDidMount: function() {
    // console.log(this.props.cardId);    
  },

  dragStart: function(ev) {
    var _this = this;

    var data = {
      bankCardId: _this.props.cardId,
      message: _this.props.message
    }

    ev.dataTransfer.setData('text', JSON.stringify(data));
  },

  render: function() {
    var _this = this;
    return (
      React.createElement("div", {className: "message-card", draggable: "true", 
        onDragStart: _this.dragStart}, 
        React.createElement("i", null, _this.props.cardId), 
        React.createElement("div", null, _this.props.message)
      )
    );
  }
});

module.exports = MessageCard;

},{}],5:[function(require,module,exports){
var LogicCard = React.createClass({displayName: "LogicCard",

  getInitialState: function() {
    var _this = this;

    return {
      visible: true,
      cardId: "",
      parentCardId: _this.props.parentCardId,
      childrenCards: {},
      speaker: "",
      message: ""
    };
  },

  componentDidMount: function() {
    var _this = this;
    $(GlobalEvents).on('tree:save', function(ev) {
      console.log("Event triggered.");
      _this.saveTree();
    });
  },

  componentWillReceiveProps: function(nextProps) {
    var _this = this;    

    if (nextProps.parentCardId) {
      _this.state.parentCardId = nextProps.parentCardId;
    }
  },

  componentWillUpdate: function(nextProps, nextState) {
    var _this = this;

    // Update children to have parentCardId.
    for (cardIndex in _this.state.childrenCards) {
      _this.state.childrenCards[cardIndex].parentCardId = nextState.cardId;
    }

    // Update parent to have childId.
    _this.props.onChildCreate(_this);
  },

  componentWillUnmount: function() {
    $(GlobalEvents).off('tree:save');
  },

  preventDefault: function(ev) {
    ev.preventDefault();
  },

  handleAdd: function() {
    var _this = this;
    var uniqueDateKey = Date.now();

    _this.state.childrenCards[uniqueDateKey] = {
      key: uniqueDateKey,
      cardId: "",
      parentCardId: _this.state.cardId
    };

    _this.setState(_this.state);
  },

  handleChildCreate: function(childContext) {
    var _this = this;
    console.log("Handle child create: ");
    console.log(childContext);

    console.log(childContext.props.cardKey);
    console.log(childContext.state.cardId);

    var childCardKey = childContext.props.cardKey;
    var childContextId = childContext.state.cardId;

    if (_this.state.childrenCards[childCardKey].cardId !== childContextId) {
      _this.state.childrenCards[childCardKey].cardId = childContextId;
      _this.setState(_this.state);
    }
  },

  hideChildren: function() {
    var _this = this;

    _this.state.visible = !_this.state.visible;
    _this.setState(_this.state);
  },

  // Pass the context back to the parent.
  deleteCard: function() {
    this.props.deleteCard(this);
  },

  deleteChildCard: function(childCard) {
    var _this = this;
    delete _this.state.childrenCards[childCard.props.cardKey]; 
    _this.setState(_this.state);
  },

  handleDrop: function(ev) {
    ev.preventDefault();
    var _this = this;
    var data;

    try { data = JSON.parse(ev.dataTransfer.getData('text')); }
    catch (e) { return; }
    _this.state.cardId = data.bankCardId;
    _this.state.message = data.message;
    _this.setState(_this.state);
  },

  saveTree: function(ev) {
    var _this = this;

    ProcessedTree[_this.state.cardId] = {
      cardId: _this.state.cardId,
      parentCardId: _this.state.parentCardId,
      speaker: _this.state.speaker,
      message: _this.state.message
    }
  },

  render: function() {
    var _this = this;

    var newOrAddButton;
    var hideButton;
    var deleteButton;

    var childrenTreeStyle;
    var hideButtonStyle;

    var childrenCardViews = {};
    var childrenCardIds = [];

    for (childIndex in _this.state.childrenCards) {
      childrenCardViews[childIndex] = (
        React.createElement(LogicCard, {
          key: _this.state.childrenCards[childIndex].key, 
          ref: _this.state.childrenCards[childIndex].key, 
          cardKey: _this.state.childrenCards[childIndex].key, 
          parentCardId: _this.state.cardId, 
          deleteCard: _this.deleteChildCard, 
          onChildCreate: _this.handleChildCreate}
        )
      );

      // Display the list of child IDs.
      childrenCardIds.push(_this.state.childrenCards[childIndex].cardId);
    }

    // Toggle depending on visibility.
    if (_this.state.visible === true) {
      childrenTreeStyle = classNames({
        'tree-new-level': true,
        'hide': false
      });
      hideButtonStyle = classNames({
        'fa': true,
        'fa-bookmark': true,
        'fa-bookmark-o': false
      });
    } else {
      childrenTreeStyle = classNames({
        'tree-new-level': true,
        'hide': true
      });
      hideButtonStyle = classNames({
        'fa': true,
        'fa-bookmark': false,
        'fa-bookmark-o': true
      });
    }

    // Toggle if there are any child logic cards.
    if ($.isEmptyObject(_this.state.childrenCards)) {
      newOrAddButton = React.createElement("i", {className: "fa fa-arrow-right"});
      hideButton = React.createElement("div", null);
    } else {
      newOrAddButton = React.createElement("i", {className: "fa fa-plus"});
      hideButton = (
        React.createElement("div", {className: "hide-card-button", onClick: _this.hideChildren}, 
          React.createElement("i", {className: hideButtonStyle})
        )
      );
    }

    return (
      React.createElement("div", {className: "logic-card-block", id: "testing"}, 
        React.createElement("div", {className: "logic-card"}, 
          React.createElement("div", {className: "logic-card-content", 
            onDragOver: _this.preventDefault, 
            onDrop: _this.handleDrop}, 
            React.createElement("span", null, "Parent ID: "), 
            React.createElement("div", {contentEditable: "true"}, _this.state.parentCardId), 
            React.createElement("span", null, "ID: "), 
            React.createElement("div", {contentEditable: "true"}, _this.state.cardId), 
            React.createElement("span", null, "Children IDs: "), 
            React.createElement("div", {contentEditable: "true"}, childrenCardIds), 
            React.createElement("span", null, "Speaker: "), 
            React.createElement("div", {contentEditable: "true"}, _this.state.speaker), 
            React.createElement("span", null, "Message: "), 
            React.createElement("div", {contentEditable: "true"}, _this.state.message), 

            React.createElement("div", {className: "card-buttons-container"}, 
              React.createElement("div", {className: "add-card-button", onClick: _this.handleAdd}, 
                newOrAddButton
              ), 

              hideButton, 

              React.createElement("div", {className: "delete-card-button", 
                onClick: _this.deleteCard}, 
                React.createElement("i", {className: "fa fa-times"})
              )

            )
          )
        ), 

        React.createElement("div", {className: childrenTreeStyle}, 
          childrenCardViews
        )

      )
    );
  }
});

module.exports = LogicCard;

},{}],6:[function(require,module,exports){
var LogicCard = require('./LogicCard.jsx');

var Tree = React.createClass({displayName: "Tree",

  getInitialState: function() {
    return {
    };
  },

  render: function() {
    var _this = this;
    var uniqueDateKey = Date.now();

    return (
      React.createElement("div", {id: "tree-display"}, 
        React.createElement(LogicCard, {
          deleteCard: function() {return;}, 
          onChildCreate: function() {return;}, 
          ref: uniqueDateKey})
      )
    );
  }

});

module.exports = Tree;

},{"./LogicCard.jsx":5}]},{},[1]);
