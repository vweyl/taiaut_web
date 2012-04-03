/**
 * Taïaut website
 * Copyright(c) 2012 Taïaut
 * 
 */
define("Techno", ["Olives/OObject", "CouchDBStore", "Olives/Model-plugin", "Config"], 
        
function (OObject, CouchDBStore, ModelPlugin, Config) {
    
    /**
     * Defines the technology UI.
     */
    return function TechnoConstructor() {
        
        // The UI's model
        var couchDBStore = new CouchDBStore(),
        
        // Language
            lang = Config.get("lang"),
        
        // A technology UI that is based on a OObject
        // The OObject will have the couchDBStore as model
            techno = new OObject(couchDBStore);
        
        // Adding a Model plugin to technology UI to bind its dom with its model
        techno.plugins.add("model", new ModelPlugin(techno.model));

        // Set couchDBStore's transport
        couchDBStore.setTransport(Config.get("Transport"));
 
                
        // Synchronize the store with the "overview" view
        techno.model.sync("website", "homepage", "techno", {
            key: lang
        });

        
        // Make the dom alive
        techno.alive(Config.get("technoUI"));
        

        // And return the new technology UI
        return techno;
    };
    
    
});