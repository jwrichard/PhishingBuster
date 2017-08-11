// Get the data to display in the above lists.
chrome.storage.local.get(["domains", "admin"], function(data){
	console.log(data);
	if(data != {}){

		// Draw admin whitelist
		if(data.admin != undefined){
			$('#pb_ext_admin_list').val(data.admin.join(','));
		}

		// Draw my domains
		if(data.domains != undefined){
			if(data.domains.length > 0){

				data.domains.forEach(function(item){

				});

				$("#pb_ext_domains").append(data.domains.join(', '));


			} else {
				$("#pb_ext_domains").append('<i>None</i>');
			}
		} else {
			$("#pb_ext_domains").append('<i>None</i>');
		}
		
		// Draw a small sample of default whitelist
		$("#pb_ext_default_wl").append('Contains top 1000 visited sites including: '+ defaultWhitelistSample.join(', '));
	}
});

// Handle open and closing of the admin section
$('#toggleAdvanced').on('click', function(){
	$('#advanced').toggle(500);
	$('#arrow').toggleClass('right down');
});

// Handle the Clear All option for users whitelisted domains
$("#pb_ext_delete").on("click", function(){
	data = {domains: []};
	chrome.storage.local.set(data, function(){
		console.log("Data writeback had error: "+chrome.runtime.lastError);
		$("#pb_ext_domains").html('<i>None</i>');
	});
});

// Handle entry of admin whitelist
$("#pb_ext_admin_list").on("change", function(){

	// Parse csv and get list of domains
	var arr = $("#pb_ext_admin_list").val().split(',');

	// Store into local storage
	data = {admin: arr};
	chrome.storage.local.set(data, null);
});

// A portion of the whole whitelist
var defaultWhitelistSample = ['google.com','youtube.com','facebook.com','amazon.com','wikipedia.org','twitter.com','yahoo.com','ebay.com','reddit.com','yelp.com','adobe.com','buzzfeed.com','pinterest.com','bing.com','live.com','linkedin.com','netflix.com','wordpress.com','craigslist.org'];