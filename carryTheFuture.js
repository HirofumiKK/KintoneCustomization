(function(){
    kintone.events.on("app.record.index.show", function(event){
        "use strict";
        console.log(event);
        let  payerInfo = event.records[1];
        console.log(payerInfo.Link_1.value); // phone number
        console.log(payerInfo.Link.value); // email
        console.log(payerInfo.Text_1.value); // street address        
        console.log(payerInfo.Text_3.value); // city
        console.log(payerInfo.Text_4.value); // state
        console.log(payerInfo.Text_5.value); // zip
        console.log(payerInfo.Drop_down_0.value); // country 


        // returns a bool
        // true if payer's email is in donor's list, else false
        function payerIsExistingDonor(payerEmail, donorList){
            for(let i = 0; i < donorList.length; i++){
                if(donorList[i].Link.value === payerEmail){ // "Link" is the field id of the email address
                    return true;
                }
            }
            return false;
        }


        /*
        now I need to do the following:
            listen for event when a record is added
            check if payerIsExistingDonor
            if false, add the new donor into the existing donor
            else do nothing
        */
       /*
       function addPayerToDonorIfNew(){
           // Display the record ID published after saving.
           kintone.events.on("app.record.create.submit.success", function(event) {
               var record = event.record;
               console.log("The record ID is " + record["$id"]["value"] + ".");
            });
       }
       console.log("addPayerToDonorIfNew: ", addPayerToDonorIfNew());
       //*/
       /*
       since I am not sure if the event listner for app.record.create.submit.success is 
       working well as I cannot see the console log, I will first create the function to 
       add the record to donor with assumption that event is listened correctly
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


       // adds a button to reload the page, updating the Final Donor List
       function reloadButton(){
            //Prevent duplication of the button
            if (document.getElementById ('my_index_button') != null) {
                return;
            }　　　
            // Set a button
            var myIndexButton = document.createElement('button');
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
            var myIndexButton = document.createElement('button');
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
            console.log(resp);
            console.log(event);
            console.log(event.records.length);
            //console.log("addPayerToDonorIfNew: ", addPayerToDonorIfNew());

            // update the Final Donor List app by adding a new record for payers not in the donor list
            for(let i = 0; i < event.records.length; i++){
                let newPayer = event.records[i];
                let newPayerEmail = newPayer.Link.value;
                if(!payerIsExistingDonor(newPayerEmail, resp.records)){
                    addPayerToDonor(newPayer);
                    console.log(newPayerEmail, " is added as a new donor!");
                }else{
                    console.log(newPayerEmail, " already exists in donors list.");
                }
            }

        }, function(error) {
            // error
            console.log(error);
        });            
        buttonToRedirectToDonorList();
        console.log("success");
    });
    /*
    kintone.events.on("app.record.create.submit.success", function(event) {
        var record = event.record;
        console.log("The record ID is " + record["$id"]["value"] + ".");
     });
     */
})();
