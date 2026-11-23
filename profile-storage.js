/* The demo account has one profile on this device, including user-selected photos. */
(() => {
  let connection;
  function database() {
    if (!connection) {
      connection = new Promise((resolve,reject)=>{
        const request = indexedDB.open("moven-profile",1);
        request.onupgradeneeded = () => request.result.createObjectStore("profiles");
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        request.onblocked = () => reject(new Error("Profile storage is blocked"));
      }).catch(error=>{connection = null;throw error;});
    }
    return connection;
  }

  async function profileRecord(value) {
    const db = await database();
    return new Promise((resolve,reject)=>{
      const transaction = db.transaction("profiles",value ? "readwrite" : "readonly");
      const profiles = transaction.objectStore("profiles");
      const request = value ? profiles.put(value,"local") : profiles.get("local");
      transaction.oncomplete = () => resolve(request.result);
      transaction.onabort = () => reject(transaction.error);
    });
  }

  window.KGProfileStorage = {
    read:() => profileRecord().catch(()=>null),
    write:profile => profileRecord(profile)
  };
})();
