'use babel';

import { CompositeDisposable } from 'atom';

export default {

  subscriptions: null,

  config: {
      "autosort": {
        "title": "Autosort Directories",
        "type": "array",
        "default": [],
        "items": {
          "type": "string"
        }
      }
    },

  activate(state) {
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.workspace.observeTextEditors((function(_this){
      return function(editor){
        buffer = editor.getBuffer();
        if((editor.getGrammar()).name == "YAML"){
          buffer.onWillSave(function(){
            _this.validate_buffer(false)
            path = buffer.getPath();
            var config_paths = atom.config.get("yaml-sortkey.autosort");
            for(var i=0; i < config_paths.length; i++){
              if (path.indexOf(config_paths[i]) > -1){
                  _this.sort_keys();
              }
            }
          })
        }
      }
    })(this)));

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'yaml-sortkey:sort_keys': () => this.sort_keys()
    }));

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'yaml-sortkey:validate': () => this.validate_buffer(true)
    }));
  },

  destroy(){
    this.subscriptions.dispose();
  },

  validate_buffer(show_notification){
    editor = atom.workspace.getActiveTextEditor();
    yaml_parser = require('js-yaml')

    try {
      var doc = yaml_parser.safeLoad(editor.getText());
      if(show_notification){
        atom.notifications.addSuccess("YAML is valid.")
      }
    } catch (e) {
      atom.notifications.addError("YAML is invalid", {detail: e.message, dismissable: true})
      console.log(e);
    }
  },

  sort_keys() {
    yaml_parser = require('js-yaml')
    editor = atom.workspace.getActiveTextEditor();

    try {
      var doc = yaml_parser.safeLoad(editor.getText());
      editor.setText(yaml_parser.safeDump(doc, {sortKeys: true, lineWidth: 500}));
      atom.notifications.addSuccess("Keys resorted successfully")
    } catch (e) {
      atom.notifications.addError("Keys could not be resorted", {detail: e.message, dismissable: true})
      console.log(e);
    }
  },
};
