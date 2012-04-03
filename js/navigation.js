/**
 * Taïaut website
 * Copyright(c) 2012 Taïaut
 * MIT Licensed
 */
define("Navigation", ["Olives/Event-plugin", "Olives/Model-plugin", "CouchDBStore", "Olives/OObject", "Routing", "Config"],
		
function (EventPlugin, ModelPlugin, CouchDBStore, OObject, Routing, Config) {
	
	/**
	 * Defines the navigation bar UI
	 * The template is taken from the dom and given by the main app
	 */
	return function NavigationConstructor() {
		
		// An OObject based UI built from a CouchDBStore
		var couchDBStore = new CouchDBStore(),
		    navigation = new OObject(couchDBStore),
		    lang=Config.get("lang");
  
        // Set couchDBStore's transport
        couchDBStore.setTransport(Config.get("Transport"));
        
        
        
        // Synchronize the store with the "library" view
        navigation.model.sync("website", "homepage", "navbar", {
            key:lang
        });
        

		// The function called by the navigation bar when a menu is clicked
		navigation.show = function (event, node) {
			Routing.get(node.href.split("#").pop());
		};
		
		// The function that messes with the .active class, triggered on location change
		Routing.watch(function (menu) {
			var toActivate = this.template.querySelector("li a[href='#" + menu + "']"),
				activated = this.template.querySelector("li.active");
			
			activated && activated.classList.remove("active");
			toActivate && toActivate.parentNode.classList.add("active");
		}, navigation);
		
		// The dom requires an EventPlugin to handle clicks
		navigation.plugins.addAll({
		    "event" : new EventPlugin(navigation),
		    "model" : new ModelPlugin(navigation.model)
		   });
		
		// And finally create the UI from the dom
		navigation.alive(Config.get("navbarUI"));
		
		return navigation;
		
	};
	
});