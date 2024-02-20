(localStorage.getItem("token_uuid")) ? document.getElementById("token_uuid").value = localStorage.getItem("token_uuid") : console.log("Pas de Token UUID  en localstorage");
(localStorage.getItem("tenant_uuid")) ? document.getElementById("tenant_uuid").value = localStorage.getItem("tenant_uuid") : console.log("Pas de Tenant UUID en localstorage");
(localStorage.getItem("access_domain")) ? document.getElementById("access_domain").value = localStorage.getItem("access_domain") : console.log("Pas de Access Domain en localstorage");
let token = document.getElementById("token_uuid").value;
let tenant = document.getElementById("tenant_uuid").value;
let access_domain = document.getElementById("access_domain").value;

async function get_users() {
    let data_request = {
        method: 'GET',
        headers: {
            'accept': 'application/json',
            'Wazo-Tenant':tenant,
            'X-Auth-Token': token
        }
    }
    try {
        const request = await fetch(access_domain + "/api/confd/1.1/users?recurse=false", data_request).then(response => response.json());
        console.log(request);
        let results = request.items;
        for (let i = 0; i < results.length; i++) {
            console.log("CREATION MEVO pour "+ results[i].firstname + " " + results[i].lastname);
            let data_post_voicemail = {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    "Content-Type": "application/json",
                    'Wazo-Tenant': tenant,
                    'X-Auth-Token': token
                },
                body: JSON.stringify({
                    "language": "fr_FR",
                    "timezone": "fr-paris",
                    "ask_password": false,
                    "attach_audio": false,
                    "delete_messages": false,
                    "enabled": true,
                    "name": results[i].firstname,
                    "context": "default-key-t8mnW-internal",
                    "number": results[i].lines[0].extensions[0].exten,
                    "email": results[i].email
                })
            }
            const voicemail = await fetch(access_domain + "/api/confd/1.1/users/" + results[i].uuid + "/voicemails", data_post_voicemail).then(response => response.json());
            console.log(voicemail);
         }
        
        

    }catch (error) {
        console.error(error.body);
    }finally{
        
    }
}

async function create_fallbacks() {
    let data_request = {
        method: 'GET',
        headers: {
            'accept': 'application/json',
            'Wazo-Tenant':tenant,
            'X-Auth-Token': token
        }
    }
    try {
        const request = await fetch(access_domain + "/api/confd/1.1/voicemails?recurse=false", data_request).then(response => response.json());
        console.log(request);
        let results = request.items;
        for (let i = 0; i < results.length; i++) {
            console.log("CREATION Fallbacks pour "+ results[i].name);
            let user_uuid = results[i].users[0].uuid;
            let voicemail_id = results[i].id;
            console.log("Utilisateur : "+user_uuid);
            console.log("Voicemail ID : "+voicemail_id);

            let data_put_fallback = {
                method: 'PUT',
                headers: {
                    'accept': 'application/json',
                    "Content-Type": "application/json",
                    // 'Wazo-Tenant': tenant,
                    'X-Auth-Token': token
                },
                body: JSON.stringify({
                    "busy_destination": {
                      "type": "voicemail",
                      "voicemail_id": voicemail_id,
                      "greeting": "unavailable"
                    },
                    "congestion_destination": {
                      "type": "voicemail",
                      "voicemail_id": voicemail_id,
                      "greeting": "unavailable"
                    },
                    "fail_destination": {
                      "type": "voicemail",
                      "voicemail_id": voicemail_id,
                      "greeting": "unavailable"
                    },
                    "noanswer_destination": {
                      "type": "voicemail",
                      "voicemail_id": voicemail_id,
                      "greeting": "unavailable"
                    }
                  })
            }
            const fallback = await fetch(access_domain + "/api/confd/1.1/users/" + user_uuid + "/fallbacks", data_put_fallback);
            if (fallback == null || fallback.status == 204 || fallback.ok){
                console.log("Fallbacks créés");
                console.log(fallback);
              }else{
                console.log("Fallbacks ERRUR");
                console.log(fallback);
              }
        }
    }catch (error) {
        console.error(error.body);
    }
};

document.getElementById("create_mevo").addEventListener('click', function (e) {
    e.preventDefault;
    token = document.getElementById("token_uuid").value;
    tenant = document.getElementById("tenant_uuid").value;
    access_domain = document.getElementById("access_domain").value;

    localStorage.setItem("token_uuid", token);
    localStorage.setItem("tenant_uuid", tenant);
    localStorage.setItem("access_domain", access_domain);
    console.log("click Mevo");
    get_users()
})

document.getElementById("create_fallbacks").addEventListener('click', function (e) {
    e.preventDefault;
    token = document.getElementById("token_uuid").value;
    tenant = document.getElementById("tenant_uuid").value;
    access_domain = document.getElementById("access_domain").value;

    localStorage.setItem("token_uuid", token);
    localStorage.setItem("tenant_uuid", tenant);
    localStorage.setItem("access_domain", access_domain);
    console.log("click Fallback");
    create_fallbacks()
})

document.getElementById("reset_forms").addEventListener('click', function (e) {
    e.preventDefault;
    let elements = document.getElementsByTagName("input");
    for (var ii=0; ii < elements.length; ii++) {
        if (elements[ii].type == "text") {
            elements[ii].value = "";
        }
    }
    localStorage.clear();
    console.log("Cleared (Input and LocalStorage)");
})