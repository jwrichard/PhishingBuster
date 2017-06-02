/* Copyright (C) Justin Richard - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Justin Richard <me@justinrichard.ca>, May 2017
 */

var target = null;	// Remember which input to give focus to
var payload = null; // Remember the previous request

// Default boilerplate to wait until page ready
chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);

		$('html').on('keydown', 'input:password', function(e){

			// Store the input for later
			target = $(this);

			// User has touched password field, lets create message to send to extension
			// to check if the site domain is safe
			payload = {
				action: "check",
				domain: window.location.hostname,
			};

			// Now send the message to extension to analyze data, result will come as message
			chrome.runtime.sendMessage(payload, null);
		});

		// Event listener for saving sites and finishing the requests
		$('html').on('click', '#phisherBusterWarningSave', function(){

			// User is happy anyways, lets save the form data 
			// Send request to save the credentials
			payload.action = "save";
			chrome.runtime.sendMessage(payload, function(response) {

				// Hide the modal
				$('#phisherBusterWarning').modal('hide');
				$('#phisherBusterWarning').remove();
				target.focus();
			});
		});

		// Event listener for hitting cancel on the prompt
		$('body').on('click', '#phisherBusterWarningCancel', function(){
			$('#phisherBusterWarning').modal('hide');
			$('#phisherBusterWarning').remove();
			target.focus();
		});
	}
	}, 10);
});

// Handle messages recieved from the extension background
// Will contain a type, and corresponding data for that type
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse){

		// Detect what kind of message we are receiving and call corresponding method
		if(request.type == "check"){
			if(request.result == 0){

				// Unknown site! Create a warning prompt
				console.log("PhishingBuster deemed unsafe/unknown.");
				createNewPassModal();
			}
		}
	}
)

// Creates and shows a modal to the user asking if they should proceed
// Should destroy self on close
// On accept, should send message to ext so save credentials/site
function createNewPassModal(){

	// Assemble a string of HTML code for the modal
	// Hard code css to ensure pages can't fiddle with it
	var modalStr = `<div id="phisherBusterWarning" data-backdrop="static" data-keyboard="false" style="overflow-x: hidden;overflow-y: auto;position: fixed;top: 0px;right: 0px;bottom: 0px;left: 0px;z-index: 99999999;outline: 0px;">
				        <div style="transform: translate(0px, 0px);transition: transform 0.3s ease-out;width: 600px;margin: 30px auto;position: relative;">
				            <div style="box-shadow: rgba(0, 0, 0, 0.5) 0px 5px 15px;position: relative;background-color: rgb(255, 255, 255);box-shadow: rgba(0, 0, 0, 0.5) 0px 3px 9px;-webkit-background-clip: padding-box;background-clip: padding-box;border-width: 1px;border-style: solid;border-color: rgba(0, 0, 0, 0.2);border-image: initial;border-radius: 6px;outline: 0px;">
				                <div style="min-height: 16.4286px;padding: 15px;border-bottom: 1px solid rgb(229, 229, 229);">
				                    <img style="margin-top: -10px;margin-bottom: -18px;" src="data:image/png;base64,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"/>
				                    <h2 style="display: inline-block;font-size: 22px;line-height: 1.42857;margin: 0px;color:black;font-family:sans-serif;">PhisherBuster Warning</h2>
				                </div>
				                <div style="position: relative;padding: 15px;color: black;font-family: sans-serif;">
				                    <p style="font-size: 14px;">Are you sure you are on the correct domain? We have detected you are entering a password on an unknown site.</p>
				                    <h2 style="font-family: monospace;color: black;font-size:18px;">`+psl.get(window.location.hostname)+`</h2>
				                </div>
				                <div style="text-align: right;padding: 15px;border-top: 1px solid rgb(229, 229, 229);   ">
				                    <input type="button" id="phisherBusterWarningCancel" style="display: inline-block;margin-bottom: 0px;font-weight: normal;text-align: center;vertical-align: middle;touch-action: manipulation;cursor: pointer;background-image: none;white-space: nowrap;font-size: 14px;line-height: 1.42857;user-select: none;border-width: 1px;border-style: solid;border-color: transparent;border-image: initial;padding: 6px 12px;border-radius: 4px;color: rgb(255, 255, 255);background-color: rgb(92, 184, 92);border-color: rgb(76, 174, 76);" value="No! Let me out of here" />
				                    <input type="button" id="phisherBusterWarningSave" style="display: inline-block;margin-bottom: 0px;font-weight: normal;text-align: center;vertical-align: middle;touch-action: manipulation;cursor: pointer;background-image: none;white-space: nowrap;font-size: 14px;line-height: 1.42857;user-select: none;border-width: 1px;border-style: solid;border-color: transparent;border-image: initial;padding: 6px 12px;border-radius: 4px;color: rgb(255, 255, 255);background-color: rgb(217, 83, 79);border-color: rgb(212, 63, 58);margin-left: 5px;margin-bottom: 0px;" value="Yes, save as trusted site" />
				                </div>
				            </div>
				        </div>
				    </div>`;

	// Open a modal to check with user if we should proceed
	$('body').append(modalStr);
	$('#phisherBusterWarning').modal('show');
	$('#phisherBusterWarningCancel').focus();
	$('#phisherBusterWarningCancel').blur();
}