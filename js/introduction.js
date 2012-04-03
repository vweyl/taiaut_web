/**
 * Taïaut website
 * Copyright(c) 2012 Taïaut
 * 
 */
define("Introduction", ["Olives/OObject", "CouchDBStore", "Olives/Model-plugin", "Config"], 
        
function (OObject, CouchDBStore, ModelPlugin, Config) {
    
    /**
     * Defines the IntroUI.
     */
    return function IntroductionConstructor() {
        
        // The UI's model
        var couchDBStore = new CouchDBStore(),
        
        // Language
            lang = Config.get("lang"),
        
        // A listSuggestions UI that is based on a OObject
        // The OObject will have the couchDBStore as model
            introduction = new OObject(couchDBStore);
        
        // Adding a Model plugin to introduction UI to bind its dom with its model
        introduction.plugins.add("model", new ModelPlugin(introduction.model));

        // Set couchDBStore's transport
        couchDBStore.setTransport(Config.get("Transport"));
 
                
        // Synchronize the store with the "overview" view
        introduction.model.sync("website", "homepage", "overview", {
            key: lang
        });

        
        //console.log(introduction.model.get(""))
         
        test = introduction.model;
        // sync method should not erase pre-defined variables
        // introduction.model.set("vincent", "taiaut");
        
        // Make the dom alive
        introduction.alive(Config.get("introUI"));
        
        
        /** Declare an introduction route for displaying the intro
        *   Routing.set("intro", function () {
        *   Screens.show("intro");
        *   });
        *    
        *   // Declare the introduction UI
        *   Screens.add("introUI", introduction);
        **/

        // And return the new introduction UI
        return introduction;
    };
    
    
});