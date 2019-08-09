/*
current bugs:
- when multiple records are scaned from transactions and added to donors list for an update,
duplicated donors are added to donors list if they appear for the first time
*/


(function(){
    kintone.events.on("app.record.index.show", function(event){
        "use strict";

        // returns a bool
        // true if payer's email is in donor's list, else false
        function payerIsExistingDonor(payerEmail, donorList){
            for(let i = 0; i < donorList.length; i++){
                //console.log("donorList.length = ", donorList.length);
                if(donorList[i].Link.value === payerEmail){ // "Link" is the field id of the email address
                    return true;
                }
            }
            return false;
        }


        /*
        I wanna have a function that takes either
             a payer email and outputs a boolean for if it can be added as donor, meaning not duplicate 
             a list of transactions and outputs a list of transactions that can be added as donor
        */


       // takes payer info from Transactions app and adds a new record in Final Donors List app
       function addPayerToDonor(payerInfo){
            var body = {
                'app': 17, // app id of the Final Donor List app
                'record':{
                    "Text": {"value": payerInfo.Text.value}, // Name
                    // "Monthly Donor Status" and "Donor Type" cannot be identified from the transactions app
                    "Link": {"value": payerInfo.Link.value}, // email
                    "Link_0": {"value": payerInfo.Link_1.value}, // phone
                    "Text_0": {"value": payerInfo.Text_1.value}, // street address
                    "Text_1": {"value": payerInfo.Text_3.value}, // city
                    "Text_2": {"value": payerInfo.Text_4.value}, // state
                    "Text_3": {"value": payerInfo.Text_5.value}, // zip
                    "Drop_down_0": {"value": payerInfo.Drop_down_0.value} // country
                }
            }
            kintone.api(kintone.api.url("/k/v1/record", true), "POST", body, function(resp) {
                console.log(resp);
            }), function(error){
                console.log(error);
            }
       }


       // traverse through all the transactions and donor list to compare them to update donor list
       // update the Final Donor List app by adding a new record for payers not in the donor list
       // an issue about this function is that after a new record is created,
       // the Final Donor List does not immediately update, which makes payerIsExisingDonor malfunction
       function updateTheFinalDonorList(transactions, donorList){
           let totalTransactions = transactions.records.length;
           //for(let i = totalTransactions - 1; i >= 0; i--){
            for(let i = 0; i < totalTransactions; i++){
               let payer = transactions.records[i];
               let payerEmail = payer.Link.value;
               if(!payerIsExistingDonor(payerEmail, donorList.records)){
                   console.log("donorList = ", donorList);
                   console.log("donorList.records.length = ", donorList.records.length);
                   addPayerToDonor(payer);
                   console.log("donorList = ", donorList);
                   console.log("donorList.records.length = ", donorList.records.length);
                   console.log(payerEmail, " is added as a new donor!");
                }else{
                    console.log(payerEmail, " already exists in donors list.");
                }
            }
        }


       // adds a button to reload the page, updating the Final Donor List
       function reloadButton(){
            //Prevent duplication of the button
            if (document.getElementById ('my_index_button') != null) {
                return;
            }　　　
            // Set a button
            let myIndexButton = document.createElement('button');
            myIndexButton.id = 'my_index_button';
            myIndexButton.innerHTML = 'Update Final Donor List';
        
            // Button onclick function
            myIndexButton.onclick = function() {
                location.reload();
                window.alert('Updated Final Donor List!');
            }
            // Retrieve the header menu space element and set the button there
            kintone.app.getHeaderMenuSpaceElement().appendChild(myIndexButton);
       }


       // adds a button to redirect to the Final Donor List app
       function buttonToRedirectToDonorList(){
            //Prevent duplication of the button
            if (document.getElementById ('my_index_button') != null) {
                return;
            }　　　
            // Set a button
            let myIndexButton = document.createElement('button');
            myIndexButton.id = 'my_index_button';
            myIndexButton.innerHTML = 'View Updated Final Donor List';
            // Button onclick function
            myIndexButton.onclick = function() {
                let donorListURL = "https://carrythefuture.kintone.com/k/17/";
                window.location = donorListURL;
            }
            // Retrieve the header menu space element and set the button there
            kintone.app.getHeaderMenuSpaceElement().appendChild(myIndexButton);
       }


       async function fetchTransactions(){
            var params = {
                'app': 18
            };
            let result = await new kintone.Promise(async function(resolve){
                let promise = await kintone.api('/k/v1/records', 'GET', params).then(async function(resp) {
                    console.log(resp);
                    await resolve(resp);
                    return resp;
                }); 
                return promise;
            });
            return result;
       }
       console.log(fetchTransactions());

       function getTransactions(){
           var params = {
               'app': 18
           };
           return kintone.api('/k/v1/records', 'GET', params).then(function(resp) {
               console.log(resp);
               console.log(event);
               return resp;
           });
       }
       console.log(getTransactions());


       // app id of the donors app and field id of the emails
        let donorBody = {
            "app": 17,
            "fields": "Link"
        };
        let transactionsBody = {"app": 18}; // app id of the transactions app
        kintone.api(kintone.api.url('/k/v1/records', true), 'GET', donorBody, function(donorResp) {
            console.log("donor list length = ", donorResp.records.length);
            kintone.api(kintone.api.url('/k/v1/records', true), 'GET', transactionsBody, function(transactionsResp) {
                console.log(donorResp);
                console.log(transactionsResp);
                let transactions = fetchTransactions();
                console.log(transactions);
                //updateTheFinalDonorList(transactionsResp, donorResp);
            }, function(error) {
                console.log(error);
            });
        }, function(error) {
            console.log(error);
        });            

        kintone.api(kintone.api.url('/k/v1/records', true), 'GET', donorBody, function(donorResp) {
            console.log("donor list length = ", donorResp.records.length);
        }, function(error) {
            console.log(error);
        });            
        
        buttonToRedirectToDonorList();
        console.log("success");
    });

    // listening event for when a new record is created

})();




// return new kintone.Promise(function(resolve, reject) {
//     kintone.api('/k/v1/records', 'GET', params, function(resp) {
//        return something;
//     })

// }).then(function(){
//    dosomethingelse()
// }).then(function({});

/*
function dosomething(param1, callback) {
    console.log(param1)
}
*/