/**
 * @license Olives
 *
 * The MIT License (MIT)
 * 
 * Copyright(c) 2012 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated 
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, 
 * and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial 
 * portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 *//**
 * Olives
 * Copyright(c) 2012 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>
 * MIT Licensed
 */

define("Olives/DomUtils", ["Tools"], function (Tools) {

	return {
		/**
		 * Returns a NodeList including the given dom node,
		 * its childNodes and its siblingNodes
		 * @param {HTMLElement} dom the dom node to start with
		 * @param {String} query an optional CSS selector to narrow down the query
		 * @returns the list of nodes
		 */
		getNodes: function getNodes(dom, query) {
			if (dom instanceof HTMLElement) {
				if (!dom.parentNode) {
					document.createDocumentFragment().appendChild(dom);
				}

				return dom.parentNode.querySelectorAll(query || "*");
			} else {
				return false;
			}
		}
	
	};

});/**
 * Olives
 * Copyright(c) 2012 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>
 * MIT Licensed
 */

define("Olives/Event-plugin", function () {
	
	return function EventPluginConstructor(parent) {

		this.listen = function(node, event, listener, useCapture) {
			node.addEventListener(event, function(e) { 
				parent[listener].call(parent,e, node);
			}, (useCapture == "true"));
		};	
	};
	
});/**
 * Olives
 * Copyright(c) 2012 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>
 * MIT Licensed
 */

define("Olives/LocalStore", 
		
["Store", "Tools"],
		
/**
 * @class
 * LocalStore is an Emily's Store that can be synchronized with localStorage
 * Synchronize the store, reload your page/browser and resynchronize it with the same value
 * and it gets restored.
 * Only valid JSON data will be stored
 */
function LocalStore(Store, Tools) {
	
	function LocalStoreConstructor() {
		
		/**
		 * The name of the property in which to store the data 
		 * @private
		 */
		var _name = null,
		
		/**
		 * Saves the current values in localStorage
		 * @private
		 */
		setLocalStorage = function () {
			localStorage.setItem(_name, this.toJSON());
		};
		
		/**
		 * Synchronize the store with localStorage
		 * @param {String} name the name in which to save the data
		 * @returns {Boolean} true if the param is a string
		 */
		this.sync = function sync(name) {
			var json;
			if (typeof name == "string") {
				_name = name;
				json = JSON.parse(localStorage.getItem(name));
				
				Tools.loop(json, function (value, idx) {
					if (!this.has(idx)) {
						this.set(idx, value);
					}
				}, this);
				setLocalStorage.call(this);
				return true;
			} else {
				return false;
			}
		};
		
		// Watch for modifications to update localStorage
		this.watch("added", setLocalStorage, this);
		this.watch("updated", setLocalStorage, this);
		this.watch("deleted", setLocalStorage, this);
		
	}
	
	return function LocalStoreFactory(init) {
		LocalStoreConstructor.prototype = new Store(init);
		return new LocalStoreConstructor;
	};
	
});/**
 * Olives
 * Copyright(c) 2012 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>
 * MIT Licensed
 */

define("Olives/Model-plugin", 
		
["Store", "Observable", "Tools", "Olives/DomUtils"],
		
/**
 * @class
 * This plugin links dom nodes to a model
 * @requires Store, Observable
 */
function ModelPlugin(Store, Observable, Tools, DomUtils) {
	
	return function ModelPluginConstructor($model, $bindings) {
		
		/**
		 * The model to watch
		 * @private
		 */
		var _model = null,
		
		/**
		 * The list of custom bindings
		 * @private
		 */
		_bindings = {},
		
		/**
		 * The list of itemRenderers
		 * each foreach has its itemRenderer
		 * @private
		 */
		_itemRenderers = {};
		
		/**
		 * The observers handlers
		 * for debugging only
		 * @private
		 */
		this.observers = {};
		
		/**
		 * Define the model to watch for
		 * @param {Store} model the model to watch for changes
		 * @returns {Boolean} true if the model was set
		 */
		this.setModel = function setModel(model) {
			if (model instanceof Store) {
				// Set the model
				_model = model;
				return true;
			} else {
				return false;
			}
		};
		
		/**
		 * Get the store that is watched for
		 * for debugging only
		 * @private
		 * @returns the Store
		 */
		this.getModel = function getModel() {
			return _model;
		};
		
		/**
		 * The item renderer defines a dom node that can be duplicated
		 * It is made available for debugging purpose, don't use it
		 * @private
		 */
		this.ItemRenderer = function ItemRenderer($plugins, $rootNode) {
			
			/**
			 * The node that will be cloned
			 * @private
			 */
			var _node = null,
			
			/**
			 * The object that contains plugins.name and plugins.apply
			 * @private
			 */
			_plugins = null,
			
			/**
			 * The _rootNode where to append the created items
			 * @private
			 */
			_rootNode = null,
			
			/**
			 * The lower boundary
			 * @private
			 */
			_start = null,
			
			/**
			 * The number of item to display
			 * @private
			 */
			_nb = null;
			
			/**
			 * Set the duplicated node
			 * @private
			 */
			this.setRenderer = function setRenderer(node) {
				_node = node;
				return true;
			};
			
			/**
			 * Returns the node that is going to be used for rendering
			 * @private
			 * @returns the node that is duplicated
			 */
			this.getRenderer = function getRenderer() {
				return _node;
			};
			
			/**
			 * Sets the rootNode and gets the node to copy
			 * @private
			 * @param {HTMLElement} rootNode
			 * @returns
			 */
			this.setRootNode = function setRootNode(rootNode) {
				var renderer;
				if (rootNode instanceof HTMLElement) {
					_rootNode = rootNode;
					renderer = _rootNode.querySelector("*");
					this.setRenderer(renderer);
					renderer && _rootNode.removeChild(renderer);
					return true;
				} else {
					return false;
				}
			};
			
			/**
			 * Gets the rootNode
			 * @private
			 * @returns _rootNode
			 */
			this.getRootNode = function getRootNode() {
				return _rootNode;
			};
			
			/**
			 * Set the plugins objet that contains the name and the apply function
			 * @private
			 * @param plugins
			 * @returns true
			 */
			this.setPlugins = function setPlugins(plugins) {
				_plugins = plugins;
				return true;
			};
			
			/**
			 * Get the plugins object
			 * @private
			 * @returns the plugins object
			 */
			this.getPlugins = function getPlugins() {
				return _plugins;
			};
			
			/**
			 * The nodes created from the items are stored here
			 * @private
			 */
			this.items = new Store([]);
			
			/**
			 * Set the start limit
			 * @private
			 * @param {Number} start the value to start rendering the items from
			 * @returns the value
			 */
			this.setStart = function setStart(start) {
				return _start = parseInt(start, 10);
			};
			
			/**
			 * Get the start value
			 * @private
			 * @returns the start value
			 */
			this.getStart = function getStart() {
				return _start;
			};
			
			/**
			 * Set the number of item to display
			 * @private
			 * @param {Number/String} nb the number of item to display or "*" for all
			 * @returns the value
			 */
			this.setNb = function setNb(nb) {
				return _nb = nb == "*" ? nb : parseInt(nb, 10);
			};
			
			/**
			 * Get the number of item to display
			 * @private
			 * @returns the value
			 */
			this.getNb = function getNb() {
				return _nb;
			};
			
			/**
			 * Adds a new item and adds it in the items list
			 * @private
			 * @param {Number} id the id of the item
			 * @returns
			 */
			this.addItem = function addItem(id) {
				var node;
				if (typeof id == "number" && !this.items.get(id)) {
					node = this.create(id);
					if (node) {
						_rootNode.insertBefore(node, this.getNextItem(id));
						return true;
					} else {
						return false;
					}
				} else {
					return false;
				}
			};
			
			/**
			 * Get the next item in the item store given an id.
			 * @private
			 * @param {Number} id the id to start from
			 * @returns
			 */
			this.getNextItem = function getNextItem(id) {
				return this.items.alter("slice", id+1).filter(function (value) {
					if (value instanceof HTMLElement) {
						return true;
					}
				})[0];
			};
			
			/**
			 * Remove an item from the dom and the items list
			 * @private
			 * @param {Number} id the id of the item to remove
			 * @returns
			 */
			this.removeItem = function removeItem(id) {
				var item = this.items.get(id);
				if (item) {
					_rootNode.removeChild(item);
					this.items.set(id);
					return true;
				} else {
					return false;
				}
			};
			
			/**
			 * create a new node. Actually makes a clone of the initial one
			 * and adds pluginname_id to each node, then calls plugins.apply to apply all plugins
			 * @private
			 * @param id
			 * @param pluginName
			 * @returns the associated node
			 */
			this.create = function create(id) {
				if (_model.has(id)) {
					var newNode = _node.cloneNode(true),
					nodes = DomUtils.getNodes(newNode);

					Tools.toArray(nodes).forEach(function (child) {
	            		child.dataset[_plugins.name+"_id"] = id;
					});
					
					this.items.set(id, newNode);
					_plugins.apply(newNode);
					return newNode;
				}
			};
			
			/**
			 * Renders the dom tree, adds nodes that are in the boundaries
			 * and removes the others
			 * @private
			 * @returns true boundaries are set
			 */
			this.render = function render() {
				// If the number of items to render is all (*)
				// Then get the number of items
				var _tmpNb = _nb == "*" ? _model.getNbItems() : _nb;
				
				// This will store the items to remove
				var marked = [];
				
				// Render only if boundaries have been set
				if (_nb !== null && _start !== null) {
					
					// Loop through the existing items
					this.items.loop(function (value, idx) {
						// If an item is out of the boundary
						if (idx < _start || idx >= (_start + _tmpNb) || !_model.has(idx)) {
							// Mark it
							marked.push(idx);
						}
					}, this);
					
					// Remove the marked item from the highest id to the lowest
					// Doing this will avoid the id change during removal
					// (removing id 2 will make id 3 becoming 2)
					marked.sort(Tools.compareNumbers).reverse().forEach(this.removeItem, this);
					
					// Now that we have removed the old nodes
					// Add the missing one 
					for (var i=_start, l=_tmpNb+_start; i<l; i++) {
						this.addItem(i);
					}
					return true;
				} else {
					return false;
				}
			};
			
			this.setPlugins($plugins);
			this.setRootNode($rootNode);
		};
		
		/**
		 * Save an itemRenderer according to its id
		 * @private
		 * @param {String} id the id of the itemRenderer
		 * @param {ItemRenderer} itemRenderer an itemRenderer object
		 */
		this.setItemRenderer = function setItemRenderer(id, itemRenderer) {
			id = id || "default";
			_itemRenderers[id] = itemRenderer;
		};
		
		/**
		 * Get an itemRenderer
		 * @private
		 * @param {String} id the name of the itemRenderer
		 * @returns the itemRenderer
		 */
		this.getItemRenderer = function getItemRenderer(id) {
			return _itemRenderers[id];
		};
		
		/**
		 * Expands the inner dom nodes of a given dom node, filling it with model's values
		 * @param {HTMLElement} node the dom node to apply foreach to
		 */
		this.foreach = function foreach(node, idItemRenderer, start, nb) {
			var itemRenderer = new this.ItemRenderer(this.plugins, node);

			itemRenderer.setStart(start || 0);
			itemRenderer.setNb(nb || "*");
			
			itemRenderer.render();

			// Add the newly created item
            _model.watch("added", itemRenderer.render, itemRenderer);
            
			// If an item is deleted
            _model.watch("deleted", function (idx) {
            	itemRenderer.render();
                // Also remove all observers
                this.observers[idx] && this.observers[idx].forEach(function (handler) {
                	_model.unwatchValue(handler);
                }, this);
                delete this.observers[idx];
            },this);
            
            this.setItemRenderer(idItemRenderer, itemRenderer);
         };
         
         /**
          * Update the lower boundary of a foreach
          * @param {String} id the id of the foreach to update
          * @param {Number} start the new value
          * @returns true if the foreach exists
          */
         this.updateStart = function updateStart(id, start) {
        	 var itemRenderer = this.getItemRenderer(id);
        	 if (itemRenderer) {
        		 itemRenderer.setStart(start);
        		 return true;
        	 } else {
        		 return false;
        	 }
         };
         
         /**
          * Update the number of item to display in a foreach
          * @param {String} id the id of the foreach to update
          * @param {Number} nb the number of items to display
          * @returns true if the foreach exists
          */
         this.updateNb = function updateNb(id, nb) {
        	 var itemRenderer = this.getItemRenderer(id);
        	 if (itemRenderer) {
        		 itemRenderer.setNb(nb);
        		 return true;
        	 } else {
        		 return false;
        	 }
         };
		
         /**
          * Refresh a foreach after having modified its limits
          * @param {String} id the id of the foreach to refresh
          * @returns true if the foreach exists
          */
         this.refresh = function refresh(id) {
        	var itemRenderer = this.getItemRenderer(id);
    	 	if (itemRenderer) {
    	 		itemRenderer.render();
    	 		return true;
    	 	} else {
    	 		return false;
    	 	}
         };
         
		/**
		 * Both ways binding between a dom node attributes and the model
		 * @param {HTMLElement} node the dom node to apply the plugin to
		 * @param {String} name the name of the property to look for in the model's value
		 * @returns
		 */
		this.bind = function bind(node, property, name) {

			// Name can be unset if the value of a row is plain text
			name = name || "";

			// In case of an array-like model the id is the index of the model's item to look for.
			// The _id is added by the foreach function
			var id = node.dataset[this.plugins.name+"_id"],
		
			// Else, it is the first element of the following
			split = name.split("."),
			
			// So the index of the model is either id or the first element of split
			modelIdx = id || split.shift(),
			
			// And the name of the property to look for in the value is
			prop = id ? name : split.join("."),
			
			// Get the model's value
			get =  Tools.getNestedProperty(_model.get(modelIdx), prop),
			
			// When calling bind like bind:newBinding,param1, param2... we need to get them
			extraParam = Tools.toArray(arguments).slice(3);

			// 0 and false are acceptable falsy values
			if (get || get === 0 || get === false) {
				// If the binding hasn't been overriden
				if (!this.execBinding.apply(this, 
						[node, property, get]
					// Extra params are passed to the new binding too
						.concat(extraParam))) {
					// Execute the default one which is a simple assignation
					node[property] = get;
				}
			}
			
			// Only watch for changes (double way data binding) if the binding
			// has not been redefined
			if (!this.hasBinding(property)) {
				node.addEventListener("change", function (event) {
					if (prop) {
						var temp = _model.get(modelIdx);
						Tools.setNestedProperty(temp, name, node[property]);
						_model.set(modelIdx, temp);	
					} else {
						_model.set(modelIdx, node[property]);
					}
				}, true);

			}
			
			// Watch for changes
			this.observers[modelIdx] = this.observers[modelIdx] || [];
			this.observers[modelIdx].push(_model.watchValue(modelIdx, function (value) {
				if (!this.execBinding.apply(this, 
						[node, property, Tools.getNestedProperty(value, prop)]
						// passing extra params too
						.concat(extraParam))) {
					node[property] = Tools.getNestedProperty(value, prop);
				}
			}, this));

		};
		
		/**
		 * Set the node's value into the model, the name is the model's property
		 * @private
		 * @param {HTMLElement} node
		 * @returns true if the property is added
		 */
		this.set = function set(node) {
			if (node instanceof HTMLElement && node.name) {
				_model.set(node.name, node.value);
				return true;
			} else {
				return false;
			}
		};
		
		/**
		 * Prevents the submit and set the model with all form's inputs
		 * @param {HTMLFormElement} form
		 * @returns true if valid form
		 */
		this.form = function form(form) {
			if (form && form.nodeName == "FORM") {
				var that = this;
				form.addEventListener("submit", function (event) {
					Tools.toArray(form.querySelectorAll("[name]")).forEach(that.set, that);
					event.preventDefault();
				}, true);
				return true;
			} else {
				return false;
			}
		};
		
		/**
		 * Add a new way to handle a binding
		 * @param {String} name of the binding
		 * @param {Function} binding the function to handle the binding
		 * @returns
		 */
		this.addBinding = function addBinding(name, binding) {
			if (name && typeof name == "string" && typeof binding == "function") {
				_bindings[name] = binding;
				return true;
			} else {
				return false;
			}
		};
		
		/**
		 * Execute a binding
		 * Only used by the plugin
		 * @private
		 * @param {HTMLElement} node the dom node on which to execute the binding
		 * @param {String} name the name of the binding
		 * @param {Any type} value the value to pass to the function
		 * @returns
		 */
		this.execBinding = function execBinding(node, name) {
			if (this.hasBinding(name)) {
				_bindings[name].apply(node, Array.prototype.slice.call(arguments, 2));
				return true;
			} else {
				return false;
			}
		};
		
		/**
		 * Check if the binding exists
		 * @private
		 * @param {String} name the name of the binding
		 * @returns
		 */
		this.hasBinding = function hasBinding(name) {
			return _bindings.hasOwnProperty(name);
		};
		
		/**
		 * Get a binding
		 * For debugging only
		 * @private
		 * @param {String} name the name of the binding
		 * @returns
		 */
		this.getBinding = function getBinding(name) {
			return _bindings[name];
		};
		
		/**
		 * Add multiple binding at once
		 * @param {Object} list the list of bindings to add
		 * @returns
		 */
		this.addBindings = function addBindings(list) {
			return Tools.loop(list, function (binding, name) {
				this.addBinding(name, binding);
			}, this);
		};
	
		// Inits the model
		this.setModel($model);
		// Inits bindings
		this.addBindings($bindings);
		
		
	};
	
});/**
 * Olives
 * Copyright(c) 2012 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>
 * MIT Licensed
 */

define("Olives/OObject", ["StateMachine", "Store", "Olives/Plugins", "Olives/DomUtils", "Tools"],
/** 
* @class 
* OObject is an abstract class that any UI can inherit from.
* It should provide code that is easy to reuse
* @requires StateMachine
*/
function OObject(StateMachine, Store, Plugins, DomUtils, Tools) {
	
	return function OObjectConstructor(otherStore) {
		
		/**
		 * This function creates the dom of the UI from it's template
		 * It then queries the dom for data-model to list them into this.connects
		 * It can't be executed if the template is not set
		 * @private
		 */
		var render = function render(UI) {
			
			// The place where the template will be created
			// is either the currentPlace where the node is placed
			// or a temporary div
			var baseNode = _currentPlace || document.createElement("div");
			
			// If the template is set
			if (UI.template) {
				// In this function, the thisObject is the UI's prototype
				// UI is the UI that has OObject as prototype
				if (typeof UI.template == "string") {
					// Let the browser do the parsing, can't be faster & easier.
					baseNode.innerHTML = UI.template.trim();
				} else if (UI.template instanceof HTMLElement) {
					// If it's already an HTML element
					baseNode.appendChild(UI.template);
				}
				
				// The UI must be placed in a unique dom node
				// If not, there can't be multiple UIs placed in the same parentNode
				// as it wouldn't be possible to know which node would belong to which UI
				// This is probably a DOM limitation.
				if (baseNode.childNodes.length > 1) {
					throw Error("UI.template should have only one parent node");
				} else {
					UI.dom = baseNode.childNodes[0];
				}
				
				UI.alive(UI.dom);

			} else {
				// An explicit message I hope
				throw Error("UI.template must be set prior to render");
			}
		},
		
		/**
		 * This function appends the dom tree to the given dom node.
		 * This dom node should be somewhere in the dom of the application
		 * @private
		 */
		place = function place(UI, place) {
			if (place) {
				place.appendChild(UI.dom);
				// Also save the new place, so next renderings
				// will be made inside it
				_currentPlace = place;
			}
		},
		
		/**
		 * Does rendering & placing in one function
		 * @private
		 */
		renderNPlace = function renderNPlace(UI, dom) {
			render(UI);
			place(UI, dom);
		},
		
		/**
		 * This stores the current place
		 * If this is set, this is the place where new templates
		 * will be appended
		 * @private
		 */
		_currentPlace = null, 
		
		/**
		 * The UI's stateMachine.
		 * Much better than if(stuff) do(stuff) else if (!stuff and stuff but not stouff) do (otherstuff)
		 * Please open an issue if you want to propose a better one
		 * @private
		 */
		_stateMachine = new StateMachine("Init", {
			"Init": [["render", render, this, "Rendered"],
			         ["place", renderNPlace, this, "Rendered"]],
			"Rendered": [["place", place, this],
			             ["render", render, this]]
		});
		
		/**
		 * The UI's Store
		 * It has set/get/del/has/watch/unwatch methods
		 * @see Emily's doc for more info on how it works.
		 */
		this.model = otherStore instanceof Store ? otherStore : new Store;
		
		/**
		 * The module that will manage the plugins for this UI
		 * @see Olives/Plugins' doc for more info on how it works.
		 */
		this.plugins = new Plugins();
		
		/**
		 * Describes the template, can either be like "&lt;p&gt;&lt;/p&gt;" or HTMLElements
		 * @type string or HTMLElement
		 */
		this.template = null;
		
		/**
		 * This will hold the dom nodes built from the template.
		 */
		this.dom = null;
		
		/**
		 * Place the UI in a given dom node
		 * @param {HTMLElement} node the node on which to append the UI
		 */
		this.place = function place(node) {
			_stateMachine.event("place", this, node);
		};
		
		/**
		 * Renders the template to dom nodes and applies the plugins on it
		 * It requires the template to be set first
		 */
		this.render = function render() {
			_stateMachine.event("render", this);
		};
		
		/**
		 * Applies this UI's plugins to the given dom node,
		 * kind of making it 'alive'
		 * @param {HTMLElement} node the dom to apply the plugins to
		 * @returns false if wrong param
		 */
		this.alive = function alive(dom) {
			if (dom instanceof HTMLElement) {
				this.plugins.apply(dom);
				return true;
			} else {
				return false;
			}
			
		};
		
	};
	
});/**
 * Olives
 * Copyright(c) 2012 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>
 * MIT Licensed
 */

define("Olives/Plugins", ["Tools", "Olives/DomUtils"],
		
/**
 * @class
 * Plugins is the link between the UI and your plugins.
 * You can design your own plugin, declare them in your UI, and call them
 * from the template, like :
 * <tag data-yourPlugin="method: param"></tag>
 * @see Model-Plugin for instance
 * @requires Tools
 */
function Plugins(Tools, DomUtils) {
	
	return function PluginsConstructor() {
		
		/**
		 * The list of plugins
		 * @private
		 */
		var _plugins = {},

		/**
		 * Just a "functionalification" of trim
		 * for code readability
		 * @private
		 */
		trim = function trim(string) {
			return string.trim();
		},
			
		/**
		 * Call the plugins methods, passing them the dom node
		 * A phrase can be :
		 * <tag data-plugin='method: param, param; method:param...'/>
		 * the function has to call every method of the plugin
		 * passing it the node, and the given params
		 * @private
		 */
		applyPlugin = function applyPlugin(node, phrase, plugin) {
			// Split the methods
			phrase.split(";")
			.forEach(function (couple) {
				// Split the result between method and params
				var split = couple.split(":"),
				// Trim the name
				method = split[0].trim(),
				// And the params, if any
				params = split[1] ? split[1].split(",").map(trim) : [];
				
				// The first param must be the dom node
				params.unshift(node);

				if (_plugins[plugin] && _plugins[plugin][method]) {
					// Call the method with the following params for instance :
					// [node, "param1", "param2" .. ]
					_plugins[plugin][method].apply(_plugins[plugin], params);
				}

			});
		};
		
		/**
		 * Add a plugin
		 * 
		 * Note that once added, the function adds a "plugins" property to the plugin.
		 * It's an object that holds a name property, with the registered name of the plugin
		 * and an apply function, to use on new nodes that the plugin would generate
		 * 
		 * @param {String} name the name of the data that the plugin should look for
		 * @param {Object} plugin the plugin that has the functions to execute
		 * @returns true if plugin successfully added.
		 */
		this.add = function add(name, plugin) {
			var that = this,
				propertyName = "plugins";
			
			if (typeof name == "string" && typeof plugin == "object" && plugin) {
				_plugins[name] = plugin;
				
				plugin[propertyName] = {
						name: name,
						apply: function apply() {
							return that.apply.apply(that, arguments);
						}
				};
				return true;
			} else {
				return false;
			}
		};
		
		/**
		 * Add multiple plugins at once
		 * @param {Object} list key is the plugin name and value is the plugin
		 * @returns true if correct param
		 */
		this.addAll = function addAll(list) {
			return Tools.loop(list, function (plugin, name) {
				this.add(name, plugin); 
			}, this);
		};
		
		/**
		 * Get a previously added plugin
		 * @param {String} name the name of the plugin
		 * @returns {Object} the plugin
		 */
		this.get = function get(name) {
			return _plugins[name];
		};
		
		/**
		 * Delete a plugin from the list
		 * @param {String} name the name of the plugin
		 * @returns {Boolean} true if success
		 */
		this.del = function del(name) {
			return delete _plugins[name];
		};
		
		/**
		 * Apply the plugins to a NodeList
		 * @param {HTMLElement} dom the dom nodes on which to apply the plugins
		 * @returns {Boolean} true if the param is a dom node
		 */
		this.apply = function apply(dom) {
			
			var nodes;
			
			if (dom instanceof HTMLElement) {
				
				nodes = DomUtils.getNodes(dom);
				Tools.loop(Tools.toArray(nodes), function (node) {
					Tools.loop(node.dataset, function (phrase, plugin) {
						applyPlugin(node, phrase, plugin);
					});
				});
				
				return dom;
				
			} else {
				return false;
			}
		};
		
	};
});/**
 * Olives
 * Copyright(c) 2012 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>
 * MIT Licensed
 */

define("Olives/Transport",
		
["Observable"],
/** 
 * @class
 * Transport allows for client-server eventing.
 * It's based on socket.io.
 */
function Transport(Observable) {

	/**
	 * Defines the Transport
	 * @private
	 * @param {Object} $io socket.io's object
	 * @param {url} $url the url to connect Transport to
	 * @returns
	 */
	return function TransportConstructor($io, $url) {
		
		/**
		 * @private
		 * The socket.io's socket
		 */
		var _socket = null,
		
		/**
		 * @private
		 * The socket.io globally defined module
		 */
		_io = null,
		
		/**
		 * @private
		 * The Observable that is used for the listen function
		 */
		_observable = new Observable();
		
		/**
		 * Set the io handler (socket.io)
		 * @param {Object} io the socket.io object
		 * @returns true if it seems to be socket.io
		 */
		this.setIO = function setIO(io) {
			if (io && typeof io.connect == "function") {
				_io = io;
				return true;
			} else {
				return false;
			}
		};
		
		/**
		 * Get socket.io, for debugging purpose
		 * @private
		 * @param 
		 * @returns the handler
		 */
		this.getIO = function getIO() {
			return _io;
		};
		
		/**
		 * Connect Transport to an url
		 * @param {Url} url the url to connect Transport to
		 */
		this.connect = function connect(url) {
			if (typeof url == "string") {
				_socket = _io.connect(url);
				return true;	
			} else {
				return false;
			}
		},
		
		/**
		 * Get the socket, for debugging purpose
		 * @returns {Object} the socket
		 */
		this.getSocket = function getSocket() {
			return _socket;
		},
		
		/**
		 * Subscribe to a socket event
		 * @param {String} event the name of the event
		 * @param {Function} func the function to execute when the event fires
		 */
		this.on = function on(event, func) {
			_socket.on(event, func);
		},
		
		/**
		 * Subscribe to a socket event but disconnect as soon as it fires.
		 * @param {String} event the name of the event
		 * @param {Function} func the function to execute when the event fires
		 */
		this.once = function once(event, func) {
			_socket.once(event, func);
		};
		
		/**
		 * Publish an event on the socket
		 * @param {String} event the event to publish
		 * @param data
		 * @param {Function} callback is the function to be called for ack
		 */
		this.emit = function emit(event, data, callback) {
			_socket.emit(event, data, callback);
		};
		
		/**
		 * Make a request on the node server
		 * @param {String} channel watch the server's documentation to see available channels
		 * @param {Object} requestData the JSON that details the request
		 * @param {Function} func the callback that will get the response.
		 * @param {Object} scope the scope in which to execute the callback
		 */
		this.request = function request(channel, requestData, func, scope) {
			var eventId = Date.now() + Math.floor(Math.random()*1e6),
				boundCallback = function () {
					func && func.apply(scope || null, arguments);
				};
				
			_socket[requestData.keptAlive ? "on" : "once"](eventId, boundCallback);
			requestData.__eventId__ = eventId;
			_socket.emit(channel, requestData);
			if (requestData.keptAlive) {
				return function stop() {
						_socket.removeListener(eventId, boundCallback);
				};
			}
		};
		
		/**
		 * Listen to an url and get notified on new data
		 * @param {String} channel watch the server's documentation to see available channels
		 * @param {String} path the url on which to get new data
		 * @param {Function} func the callback that will get the data
		 * @param {Object} scope the scope in which to execute the callback
		 * @returns
		 */
		this.listen = function listen(channel, path, func, scope) {
			
			var topic = channel + "/" + path,
				handler,
				stop;
			
			// If no such topic
			if (!_observable.hasTopic(topic)) {
				// Listen to changes on this topic (an url actually)
				stop = this.request(channel, {
					path: path,
					method: "GET",
					keptAlive: true
				// Notify when new data arrives
				}, function (data) {
					_observable.notify(topic, data);
				}, this);
			}
			
			// Add the observer
			handler = _observable.watch(topic, func, scope);

			return {
				// If the observer is not interested anymore, unwatch
				stop: function () {
					_observable.unwatch(handler);
					// If no more observers
					if (!_observable.hasTopic(topic)) {
						// stop listening
						stop();
					}
				}
			};
		};
		
		/**
		 * This function is for debugging only
		 * @returns {Observable}
		 */
		this.getListenObservable = function getListenObservable() {
			return _observable;
		};
		
		/**
		 * Initializes the transport to the given url.
		 */
		this.setIO($io);
		this.connect($url);
	};
});/**
 * Olives
 * Copyright(c) 2012 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>
 * MIT Licensed
 */

define("Olives/Type-plugin", 
		
["Olives/OObject", "Tools"],
		
function (OObject, Tools) {
	
	return function TypePluginConstructor($uis) {
	
		var _uis = {};
		
		this.place = function place(node, name) {
			if (_uis[name] instanceof OObject) {
				_uis[name].place(node);
			} else {
				throw new Error(name + " is not an OObject UI in place:"+name);
			}
		};
		
		this.set = function set(name, ui) {
			if (typeof name == "string" && ui instanceof OObject) {
				_uis[name] = ui;
				return true;
			} else {
				return false;
			}
		};
		
		this.setAll = function setAll(uis) {
			Tools.loop(uis, function (ui, name) {
				this.set(name, ui);
			}, this);
		};
		
		this.get = function get(name) {
			return _uis[name];
		};
		
		this.setAll($uis);
		
	};
	
});