/**
 * Taïaut website
 * Copyright(c) 2012 Taïaut
 * 
 */
define("Svcs", ["Olives/OObject", "CouchDBStore", "Olives/Model-plugin", "Config"], 
        
function (OObject, CouchDBStore, ModelPlugin, Config) {
    
    /**
     * Defines the services UI.
     */
    return function SvcsConstructor() {
        
        // The UI's model
        var couchDBStore = new CouchDBStore(),
        
        // Language
            lang = Config.get("lang"),
        
        // A services UI that is based on a OObject
        // The OObject will have the couchDBStore as model
            svcs = new OObject(couchDBStore);
        
        // Adding a Model plugin to services UI to bind its dom with its model
        svcs.plugins.add("model", new ModelPlugin(svcs.model));

        // Set couchDBStore's transport
        couchDBStore.setTransport(Config.get("Transport"));
 
                
        // Synchronize the store with the "svcs" view
        svcs.model.sync("website", "homepage", "svcs", {
            key: lang
        });

        
        // Make the dom alive
        svcs.alive(Config.get("svcsUI"));
        

        // And return the new svcs UI
        return svcs;
    };
    
    
});