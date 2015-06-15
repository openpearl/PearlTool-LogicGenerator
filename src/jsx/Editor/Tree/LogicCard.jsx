var LogicCard = React.createClass({

  getInitialState: function() {
    return {
      visible: true,
      cardId: "",
      parentCardId: "",
      speaker: "",
      message: "",
      childLogicCards: {}
    };
  },

  componentWillReceiveProps: function(nextProps) {
    var _this = this;

    console.log("Next props:");
    console.log(nextProps);
  },

  componentDidMount: function() {
    var _this = this;
    $(GlobalEvents).on('tree:save', function(ev) {
      console.log("Event triggered.");
      _this.saveTree();
    });
  },

  componentWillUnmount: function() {
    $(GlobalEvents).off('tree:save');
  },

  preventDefault: function (ev) {
    ev.preventDefault();
  },

  handleAdd: function() {
    var _this = this;
    var uniqueDateKey = Date.now();

    console.log(_this.state.childLogicCards);

    // Add a new logic child to the start of the list.

    // This part needs to be refactored.
    _this.state.childLogicCards[uniqueDateKey] = (
      <LogicCard card={{}}
        key={uniqueDateKey}
        parentCardId={_this.state.cardId} 
        childCardId={uniqueDateKey}
        deleteCard={_this.deleteChildCard}
        ref={uniqueDateKey} />
    );

    _this.setState(_this.state);
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

    delete _this.state.childLogicCards[childCard.props.childCardId]; 
    _this.setState(_this.state);
  },

  handleDrop: function(ev) {
    var _this = this;
    ev.preventDefault();

    var data;

    try {
      data = JSON.parse(ev.dataTransfer.getData('text'));
    } catch (e) {
      return;
    }
    _this.state.cardId = data.bankCardId;
    _this.state.message = data.message;
    // _this.setState(_this.state);
    this.setState(_this.state);
  },

  saveTree: function(ev) {
    var _this = this;

    console.log(_this.state.childLogicCards);

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

    // for ()

    // Toggle if there are any child logic cards.
    if ($.isEmptyObject(_this.state.childLogicCards)) {
      newOrAddButton = <i className="fa fa-arrow-right"></i>;
      hideButton = <div></div>;
    } else {
      newOrAddButton = <i className="fa fa-plus"></i>;
      hideButton = (
        <div className="hide-card-button" onClick={_this.hideChildren}>
          <i className={hideButtonStyle}></i>
        </div>
      );
    }

    return (
      <div className="logic-card-block" id="testing" >
        <div className="logic-card">
          <div className="logic-card-content" 
            onDragOver={_this.preventDefault}
            onDrop={_this.handleDrop}>
            <span>Parent ID: </span>
            <div contentEditable='true'>{_this.state.parentCardId}</div>
            <span>ID: </span>
            <div contentEditable='true'>{_this.state.cardId}</div>
            <span>Speaker: </span>
            <div contentEditable='true'>{_this.state.speaker}</div>
            <span>Message: </span>
            <div contentEditable='true'>{_this.state.message}</div>

            <div className="card-buttons-container">
              <div className="add-card-button" onClick={_this.handleAdd}>
                {newOrAddButton}
              </div>

              {hideButton}

              <div className="delete-card-button" 
                onClick={_this.deleteCard}>
                <i className="fa fa-times"></i>
              </div>

            </div>
          </div>
        </div>

        <div className={childrenTreeStyle}>
          {_this.state.childLogicCards}
        </div>

      </div>
    );
  }
});

module.exports = LogicCard;
