/**
 * Taïaut website
 * Copyright(c) 2012 Taïaut
 * 
 */
define("TechnoDetails", ["Olives/OObject", "CouchDBStore", "Olives/Model-plugin", "Olives/Event-plugin", "Config", "Screens", "Routing"], 
        
function (OObject, CouchDBStore, ModelPlugin, EventPlugin, Config, Screens, Routing) {
    
    /**
     * Defines the technoDetailsUI.
     */
    return function TechnoDetailsConstructor() {
        
        // The UI's model
        var couchDBStore = new CouchDBStore(),
        
        // Language
            lang = Config.get("lang"),
            
          
            
            
        // A technoDetails UI that is based on a couchDBStore

            technoDetails = new OObject(couchDBStore);
            
        
        // Adding a Model plugin to technoDetails UI to bind its dom with its model
        technoDetails.plugins.addAll({
            "model": new ModelPlugin(technoDetails.model),
            "event": new EventPlugin(technoDetails)
        });
        
        // Set couchDBStore's transport
        couchDBStore.setTransport(Config.get("Transport"));
 
                
        // Synchronize the store with the "techno" view
        couchDBStore.sync("website", "homepage", "techno", {
            key: lang
        });
        

        // Make the dom alive
        technoDetails.alive(Config.get("technoDetailsUI"));
        
        
        // Declare a technoDetails route for displaying the technoDetails UI
        Routing.set("technoDetails", function () {
        Screens.show("technoDetails");
        });
            
        // Declare the technoDetails UI
        Screens.add("technoDetails", technoDetails);
        

        // And return the new technoDetails UI
        return technoDetails;
    };
    
    
});