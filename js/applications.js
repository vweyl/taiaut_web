/**
 * Taïaut website
 * Copyright(c) 2012 Taïaut
 * 
 */
define("Applications", ["Olives/OObject", "CouchDBStore", "Olives/Model-plugin", "Config"], 
        
function (OObject, CouchDBStore, ModelPlugin, Config) {
    
    /**
     * Defines the applications UI.
     */
    return function ApplicationsConstructor() {
        
        // The UI's model
        var couchDBStore = new CouchDBStore(),
        
        // Language
            lang = Config.get("lang"),
        
        // A n applications UI that is based on a OObject
        // The OObject will have the couchDBStore as model
            applications = new OObject(couchDBStore);
        
        // Adding a Model plugin to applications UI to bind its dom with its model
        applications.plugins.add("model", new ModelPlugin(applications.model));

        // Set couchDBStore's transport
        couchDBStore.setTransport(Config.get("Transport"));
 
                
        // Synchronize the store with the "applis" view
        applications.model.sync("website", "homepage", "applis", {
            key: lang
        });

        
        // Make the dom alive
        applications.alive(Config.get("applisUI"));
        

        // And return the new applications UI
        return applications;
    };
    
    
});