/**
 * Taïaut website
 * Copyright(c) 2012 Taïaut
 * 
 */
define("Innovation", ["Olives/OObject", "CouchDBStore", "Olives/Model-plugin", "Olives/Event-plugin", "Config", "Screens", "Routing"], 
        
function (OObject, CouchDBStore, ModelPlugin, EventPlugin, Config, Screens, Routing) {
    
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
        innovation.plugins.addAll({
            "model": new ModelPlugin(innovation.model),
            "event": new EventPlugin(innovation)
        });
        
        // Set couchDBStore's transport
        couchDBStore.setTransport(Config.get("Transport"));
 
                
        // Synchronize the store with the "overview" view
        innovation.model.sync("website", "homepage", "overview", {
            key: lang
        });

        
        // Make the dom alive
        innovation.alive(Config.get("innovationUI"));
        
        
        // Declare an innovation route for displaying the innovation UI
        Routing.set("innovation", function () {
        Screens.show("innovation");
        });
            
        // Declare the introduction UI
        Screens.add("innovation", innovation);
        

        // And return the new innovation UI
        return innovation;
    };
    
    
});