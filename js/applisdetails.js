/**
 * Taïaut website
 * Copyright(c) 2012 Taïaut
 * 
 */
define("ApplisDetails", ["Olives/OObject", "CouchDBStore", "Olives/Model-plugin", "Olives/Event-plugin", "Config", "Screens", "Routing"], 
        
function (OObject, CouchDBStore, ModelPlugin, EventPlugin, Config, Screens, Routing) {
    
    /**
     * Defines the applisDetailsUI.
     */
    return function ApplisDetailsConstructor() {
        
        // The UI's model
        var couchDBStore = new CouchDBStore(),
            applisList = new CouchDBStore(),
        
        // Language
            lang = Config.get("lang"),
            
          
            
            
        // An applisDetails UI that is based on a couchDBStore

            applisDetails = new OObject(applisList);
            
        
        // Adding a Model plugin to applisDetails UI to bind its dom with its model
        applisDetails.plugins.addAll({
            "model": new ModelPlugin(applisDetails.model),
            "event": new EventPlugin(applisDetails)
        });
        
        // Set couchDBStore's transport
        couchDBStore.setTransport(Config.get("Transport"));
        applisList.setTransport(Config.get("Transport"));
 
                
        // Synchronize the store with the "applis" view
        couchDBStore.sync("website", "homepage", "applis", {
            key: lang
        }).then(function(){
            applisList.sync("website", couchDBStore.get(0).value.content.applications)
            });
        

        // Make the dom alive
        applisDetails.alive(Config.get("applisDetailsUI"));
        
        
        // Declare an applisDetails route for displaying the applisDetails UI
        Routing.set("applisDetails", function () {
        Screens.show("applisDetails");
        console.log("coucou");
        });
            
        // Declare the applisDetails UI
        Screens.add("applisDetails", applisDetails);
        

        // And return the new applisDetails UI
        return applisDetails;
    };
    
    
});