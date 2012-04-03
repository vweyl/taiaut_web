/**
 * Taïaut website
 * Copyright(c) 2012 Taïaut
 * 
 */
define("Innovation", ["Olives/OObject", "CouchDBStore", "Olives/Model-plugin", "Config"], 
        
function (OObject, CouchDBStore, ModelPlugin, Config) {
    
    /**
     * Defines the innovationUI.
     */
    return function InnovationConstructor() {
        
        // The UI's model
        var couchDBStore = new CouchDBStore(),
        
        // Language
            lang = Config.get("lang"),
        
        // An innovation UI that is based on a OObject
        // The OObject will have the couchDBStore as model
            innovation = new OObject(couchDBStore);
        
        // Adding a Model plugin to innovation UI to bind its dom with its model
        innovation.plugins.add("model", new ModelPlugin(innovation.model));

        // Set couchDBStore's transport
        couchDBStore.setTransport(Config.get("Transport"));
 
                
        // Synchronize the store with the "overview" view
        innovation.model.sync("website", "homepage", "overview", {
            key: lang
        });

        
        // Make the dom alive
        innovation.alive(Config.get("innovationUI"));
        
        
        /** Declare an introduction route for displaying the intro
        *   Routing.set("intro", function () {
        *   Screens.show("intro");
        *   });
        *    
        *   // Declare the introduction UI
        *   Screens.add("introUI", introduction);
        **/

        // And return the new innovation UI
        return innovation;
    };
    
    
});