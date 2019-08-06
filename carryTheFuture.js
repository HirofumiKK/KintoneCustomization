(function(){
    kintone.events.on("app.record.index.show", function(event){
        "use strict";
        console.log(event);
        console.log(event.records);
        console.log(event.records[1]);
        console.log(event.records[1].Text.value);
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
            let result = false;
            for(let i = 0; i < donorList.length; i++){
                if(donorList[i].Link.value === payerEmail){ // "Link" is the field id of the email address
                    result = true;
                    break;
                }
            }
            return result;
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

       function addPayerToDonor(payerInfo){
           // I may need to come with a better structure than this for input variables
            var body = {
                'app': 17,
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


        var body = {
            "app": 17,
            "fields": ["Link"]
        };
            
        kintone.api(kintone.api.url('/k/v1/records', true), 'GET', body, function(resp) {
            // success
            console.log(resp);
            console.log(resp.records);
            console.log(resp.records[0]);
            console.log(resp.records[0].Link)
            console.log(resp.records[0].Link.value);
            console.log(resp.records.length);

            let payerEmail = "emailAddress@gmail.com";
            console.log(payerIsExistingDonor(payerEmail, resp.records));
            console.log(!payerIsExistingDonor(payerEmail, resp.records));
            //console.log("addPayerToDonorIfNew: ", addPayerToDonorIfNew());

            let newPayer = event.records[0];
            let newPayerEmail = newPayer.Link.value;
            if(!payerIsExistingDonor(newPayerEmail, resp.records)){
                addPayerToDonor(newPayer);
                console.log("The new payer is added as a new donor!");
            }else{
                console.log("The new payer already exists in donors list.");
            }

        }, function(error) {
            // error
            console.log(error);
        });            

        console.log("success");
    });

    /*
    kintone.events.on("app.record.create.submit.success", function(event) {
        var record = event.record;
        console.log("The record ID is " + record["$id"]["value"] + ".");
     });
     */
})();

