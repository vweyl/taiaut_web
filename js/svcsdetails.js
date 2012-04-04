/**
 * Taïaut website
 * Copyright(c) 2012 Taïaut
 * 
 */
define("SvcsDetails", ["Olives/OObject", "CouchDBStore", "Olives/Model-plugin", "Olives/Event-plugin", "Config", "Screens", "Routing"], 
        
function (OObject, CouchDBStore, ModelPlugin, EventPlugin, Config, Screens, Routing) {
    
    /**
     * Defines the svcsDetailsUI.
     */
    return function SvcsDetailsConstructor() {
        
        // The UI's model
        var couchDBStore = new CouchDBStore(),
            svcsList = new CouchDBStore(),
        
        // Language
            lang = Config.get("lang"),
            
          
            
            
        // A svcsDetails UI that is based on a couchDBStore

            svcsDetails = new OObject(svcsList);
            
        
        // Adding a Model plugin to svcsDetails UI to bind its dom with its model
        svcsDetails.plugins.addAll({
            "model": new ModelPlugin(svcsDetails.model),
            "event": new EventPlugin(svcsDetails)
        });
        
        // Set couchDBStore's transport
        couchDBStore.setTransport(Config.get("Transport"));
        svcsList.setTransport(Config.get("Transport"));
 
                
        // Synchronize the store with the "svcs" view
        couchDBStore.sync("website", "homepage", "svcs", {
            key: lang
        }).then(function(){
            svcsList.sync("website", couchDBStore.get(0).value.content)
            });
        

        // Make the dom alive
        svcsDetails.alive(Config.get("svcsDetailsUI"));
        
        
        // Declare an svcsDetails route for displaying the applisDetails UI
        Routing.set("svcsDetails", function () {
        Screens.show("svcsDetails");
        });
            
        // Declare the applisDetails UI
        Screens.add("svcsDetails", svcsDetails);
        

        // And return the new innovation UI
        return svcsDetails;
    };
    
    
});