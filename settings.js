
module.exports = [
    {
      title: 'Navigation',
      type: 'keyboard-shortcut',
      settings: [
        {
          name: 'movementStyle',
          value: 'flat',
          options: ['org', 'flat'],
          type: 'radio',
          description: 'style of moving items up and down. Org will jump past items of the same level'
        }, {
          name: 'goUp',
          value: 'up|ctrl E',
          description: 'select the previous item'
        }, {
          name: 'goDown',
          value: 'down|ctrl D',
          description: 'select the next item'
        }, {
          name: 'moveUp',
          value: 'alt up|alt W',
          description: 'move the current item up'
        }, {
          name: 'moveDown',
          value: 'alt down|alt S',
          description: 'move the current item down'
        }, {
          name: 'moveLeft',
          value: 'alt left|alt A',
          description: 'move the current item left'
        }, {
          name: 'moveRight',
          value: 'alt right|alt D',
          description: 'move the current item right'
        }, {
          name: 'editTags',
          value: 'ctrl space',
          description: 'edit the tags of the current item'
        }
      ]
    }
  ];
