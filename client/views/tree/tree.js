Tabs = {
    open: [],
    dummyTab: null,
    dep: new Tracker.Dependency(),
    addTab: function(docId) {
        if(docId == this.dummyTab) {
            this.dummyTab = null;
        }

        if (this.open.indexOf(docId)==-1)
            this.open.push(docId);

        this.dep.changed();
        return this.open;
    },
    removeTab: function(docId) {

        if(docId == this.dummyTab) {
            this.dummyTab = null;
        }

        var index = this.open.indexOf(docId.toString());
        
        if (index > -1) {
            this.open.splice(index, 1);
        }

        this.dep.changed();
        return this.open;
    },
    getTabs: function() {
        this.dep.depend();

        Meteor.setTimeout(function() {
            if(this.open.length) {
                reAdjust();
            }
        }, 200);

        var list = [];

        list = list.concat(this.open);

        if(this.dummyTab) {
            list.push(this.dummyTab);
        }

        return list;
    },
    setDummyTab: function(docId) {
        if (this.open.indexOf(docId)==-1) {
            this.dummyTab = docId;
        } else {
            this.dummyTab = null;
        }

        this.dep.changed();
        return this.dummyTab;
    },
    resetDummyTab: function() {
        this.dummyTab = null;

        this.dep.changed();
        return this.dummyTab;
    },
    reset: function() {
        this.open = [];
        this.dep.changed();
        return this.open;
    }
}

Template.Tree.helpers({
    treeItems: function() {
        return this.tree && Nodes.find({parent: this.tree._id}) || [];
    },
    hasChildren: function() {
        return this.tree && Nodes.find({parent: this.tree._id}).count() > 0;
    },
    documentTitle: function() {
        return this.tree && this.tree.title;
    }
});

Template.Tree.rendered = function () {
    
    var self = this;

    $('.tree li.node.root span').contextMenu('right-click-menu', {
        bindings: {
            'add-node': function(t) {
                var elData = UI.getData(t);

                if(elData) {
                    Nodes.insert({ parent: elData.tree._id, title: "Ingen tittel", level: 1, userId: elData.tree.userId }, function(error, nodeId) {
                        if(!error) {
                            Documents.update({_id: Session.get('mainDocument')}, { $addToSet: {children: nodeId} });
                            Meteor.subscribe('nodeById', nodeId);
                        }
                    });
                }
            },
            'delete-node': function(t) {
                alert('Kan ikke slette rotnoden.');
            },
            'edit-node': function(t) {
                Session.set('nodeInFocus', Session.get('mainDocument'));
            }
        }
    });
};

var getParent = function(node) {
    if(node && node._parent) {
        return node._parent;  
    } else {
        return null;
    }
}

var isPartOfSubTree = function(root, target) {

    node = target;

    console.log(getParent(node))
    while (node = getParent(node)) {

        if (node.guid === root.guid)
            return true;
    }
    return false;
}

var dragElement;


Template.Tree.events({

    // Do NOT remove this!! This snippet necessary 
    // for the drop event to work.
    'dragover li span.element': function(evt, tmpl) {
        if(evt.preventDefault) { evt.preventDefault(); }
    },

    // Do NOT remove this!! This snippet necessary 
    // for the drop event to work.
    'dragover div.slot.slot-top': function(evt, tmpl) {
        if(evt.preventDefault) { evt.preventDefault(); }
    },

    // Do NOT remove this!! This snippet necessary 
    // for the drop event to work.
    'dragover div.slot.slot-bottom': function(evt, tmpl) {
        if(evt.preventDefault) { evt.preventDefault(); }
    },

    'dragenter div.slot': function (evt, tmpl) {
        if(evt.preventDefault) { evt.preventDefault(); }
        if(evt.stopPropagation) { evt.stopPropagation(); }

        $(evt.currentTarget).addClass("slot-visible");
    },

    'dragleave div.slot': function (evt, tmpl) {
        if(evt.preventDefault) { evt.preventDefault(); }
        if(evt.stopPropagation) { evt.stopPropagation(); } 

        $(evt.currentTarget).removeClass("slot-visible");
    },

    'drop div.slot.slot-top': function (evt, tmpl) {
        if(evt.preventDefault) { evt.preventDefault(); }
        if(evt.stopPropagation) { evt.stopPropagation(); }

        $(evt.currentTarget).removeClass("slot-visible");

        var dataTarget = UI.getElementData(evt.currentTarget.parentNode.parentNode.parentNode);
        var data = UI.getElementData(dragElement.parentNode);
        var target = UI.getElementData(evt.currentTarget.parentNode);
        var dataParent = UI.getElementData(dragElement.parentNode.parentNode.parentNode);

        var inSameSubTree = false;

        for (var i = 0; i < dataTarget.children.length; i++) {
            if(dataTarget.children[i].guid === data.guid)
                inSameSubTree = true;
        }



        var c = target.level.split('.');

        // compute the new index position in the target array
        var index = parseInt(c[c.length - 1] - 1);
        
        // Tries to fetch a index in target array. If a number
        // other than -1, then the node is already in there and
        // we should 
        var oldIndex = dataTarget.children.indexOf(data);
        
        if(oldIndex > -1) {
            // Reposition the elements
            dataTarget.children.splice(oldIndex, 1);
            dataTarget.children.splice(index, 0, data);
        } else {
            dataTarget.children.splice(index, 0, data);
            dataParent.children = _.filter(dataParent.children, function(child){ return child.guid !== data.guid; });
        }

        // tell the listeners to this tree that the tree has changed.
        tree.updated();
    },

    'drop div.slot.slot-bottom': function (evt, tmpl) {
        if(evt.preventDefault) { evt.preventDefault(); }
        if(evt.stopPropagation) { evt.stopPropagation(); } 

        $(evt.currentTarget).removeClass("slot-visible");
    },
    
    'drop li span.element': function(evt, tmpl) {
        if(evt.preventDefault) { evt.preventDefault(); }
        if(evt.stopPropagation) { evt.stopPropagation(); }

        if ($(evt.currentTarget).hasClass('hover'))
            $(evt.currentTarget).removeClass('hover');

        var targetData = UI.getElementData(evt.currentTarget);
        var targetGUID = targetData.guid;
        
        var data = UI.getElementData(dragElement);
        var dataParent = UI.getElementData(dragElement.parentNode.parentNode.parentNode);
        
        var guidParent = dataParent.guid;
        var guid = data.guid;

        if(parseInt(targetGUID) && targetGUID >= 0) {


            var newHook;
            var oldHook;
            var filteredList;

            _.walk.preorder(tree.getTree(), function(value, key, parent) {
                console.log(value);
                console.log(dataParent)
                if(parent && parseInt(key) >= 0)
                    parent.children[key]._parent = parent;

                if(value.guid === targetGUID) {

                    // create a reference to the new target
                    newHook = value;

                    // if the target branch is the same as the current branch
                    // return an empty hook.
                    for (var i = 0; i < value.children.length; i++) {
                        if(value.children[i].guid === guid)
                            newHook = null;
                    }
                } else if (value.guid === guidParent) {
                    // reference to old branch
                    oldHook = value;
                    
                    // remove the selected node from the parents children list
                    filteredList = _.filter(value.children, function(child){ return child.guid !== guid; });

                }
            }, {},
            function(el) {
                return el.children;
            });


            console.log(tree.getTree());

            // if we have found our element that we want
            // to place our selected subtree in, push the
            // subtree onto this branch and set an updated value
            // to the previous branch. Also check whether the target 
            // node is inside our selected subtree, if so: don't move the
            // subtree. 
            if(newHook && oldHook && !isPartOfSubTree(data, targetData)) {
                oldHook.children = filteredList;
                newHook.children.push(data);
            }
        }

        // tell the listeners to this tree that the tree has changed.
        tree.updated();

        return false;
    },

    'dragenter li span.element': function(evt, tmpl) {
        if(evt.preventDefault) { evt.preventDefault(); }
        if(evt.stopPropagation) { evt.stopPropagation(); }

        // Add class '.hover' it not already present
        var target = $(evt.currentTarget);
        if (!target.hasClass('hover'))
            target.addClass('hover');
    },

    'dragleave li span.element': function(evt, tmpl) {
        if(evt.preventDefault) { evt.preventDefault(); }
        if(evt.stopPropagation) { evt.stopPropagation(); }

        // if the element being hovered has a class '.hover'
        // remove it.
        var target = $(evt.currentTarget);
        if (target.hasClass('hover'))
            target.removeClass('hover');
    },

    'dragstart li span.element': function(evt, tmpl) {

        if(evt.stopPropagation) { evt.stopPropagation(); }

        // Store the node that is being dragged for a
        // later reference.
        dragElement = evt.currentTarget;
        
        // Unselect all selected nodes
        $('li span').removeClass('selected');

        // Select the node that is being dragged.
        $(evt.currentTarget).addClass('selected');

    },

    // Opens a tab if double click on a node
    'dblclick li span.element': function(evt, tmpl) {
        //if(evt.stopPropagation) { evt.stopPropagation(); }

        var data = Blaze.getData(evt.currentTarget);

        // Adds a tab
        if(typeof data._id !== "undefined") {
            Tabs.addTab(data._id);
        }
    },

    'click .hide-node': function(evt, tmpl) {
        Nodes.update({_id: this._id}, { $set: { collapsed: true } });
    },

    'click .show-node': function(evt, tmpl) {
        Nodes.update({_id: this._id}, { $set: { collapsed: false } });
    },

    'click .hide-root': function(evt, tmpl) {
        Documents.update({_id: this.tree._id}, { $set: { collapsed: true } });
    },

    'click .show-root': function(evt, tmpl) {
        Documents.update({_id: this.tree._id}, { $set: { collapsed: false } });
    },

    // Selects a node on regular mouse click
    'click li.root li span.element': function(evt, tmpl) {
        //if(evt.stopPropagation) { evt.stopPropagation(); }

        // "Unselect" all selected nodes
        $('li span').removeClass('selected');

        // Style the current selected node.
        $(evt.currentTarget).addClass('selected');

        var elData = UI.getData(evt.currentTarget);

        if(elData && elData._id) {
            Tabs.setDummyTab(elData._id);
            Session.set('nodeInFocus', elData._id);
        }
    },

    // Selects a node on regular mouse click
    'click li.root span.element': function(evt, tmpl) {
        //if(evt.stopPropagation) { evt.stopPropagation(); }

        // "Unselect" all selected nodes
        $('li span').removeClass('selected');

        // Style the current selected node.
        $(evt.currentTarget).addClass('selected');
    },

    // On right click on node
    'mousedown li span.element': function(evt, tmpl) {
        //if(evt.stopPropagation) { evt.stopPropagation(); }

        if(evt.which == 3) {
            // "Unselect" all selected nodes
            $('li span').removeClass('selected');

            // Style the current selected node.
            $(evt.currentTarget).addClass('selected');
        }
    }
});