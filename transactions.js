/*
current bugs:
- when multiple records are scaned from transactions and added to donors list for an update,
duplicated donors are added to donors list if they appear for the first time
- mismatched numbers for the total number of the donors list records between transactions and donors list
- automatic duplication of some existing records in the Final Donor List file (not due to this file)
*/


(function(){
    kintone.events.on("app.record.index.show", function(event){
        "use strict";
        console.log(event);

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


       // app id of the donors app and field id of the emails
        var body = {
            "app": 17,
            "fields": "Link"
        };
        kintone.api(kintone.api.url('/k/v1/records', true), 'GET', body, function(resp) {
            // success
            console.log("donor list length = ", resp.records.length);
            console.log(event);
            /*
            // maybe try the api call within api call?
            // such as repeated api calls for each new creation of records/updating the final donor
            // following is the structure:
            // apiCall{
                for loop{
                    apiCall{
                        add a record and update the final donor list
                    }
                }
            } 
            */
            updateTheFinalDonorList(event, resp);
        }, function(error) {
            // error
            console.log(error);
        });            
        buttonToRedirectToDonorList();
        console.log("success");
    });

    // listening event for when a new record is created

})();
