({
    init: function(cmp) {
        cmp._storage = $A.storageService.initStorage("indexedDBCmp", true, false, 32768, 2000, 3000, true, false);
    },

    resetStorage: function(cmp) {
        cmp.set("v.status", "Resetting");
        cmp._storage.clear()
            .then(function() {
                cmp.set("v.status", "Done Resetting");
            }, function() {
                cmp.set("v.status", "Error during reset");
            });
    },

    getFromStorage: function(cmp) {
        cmp.set("v.status", "Getting");
        var key = cmp.get("v.key");
        cmp._storage.get(key)
            .then(function(item) {
                cmp.set("v.return", item.value);
                cmp.set("v.status", "Done Getting");
            }, function() {
                cmp.set("v.status", "Error during get");
            });
    },

    addToStorage: function(cmp) {
        cmp.set("v.status", "Adding");
        var key = cmp.get("v.key");
        var value = cmp.get("v.value");
        cmp._storage.put(key, value)
            .then(function(){
                cmp.set("v.status", "Done Adding");
            }, function() {
                cmp.set("v.status", "Error during add");
            });
    }
})