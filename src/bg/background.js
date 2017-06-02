/* Copyright (C) Justin Richard - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Justin Richard <me@justinrichard.ca>, May 2017
 */

/*
*	Handles messages coming from the content script and relegates to appropriate method
*/ 
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse){

		// Detect what kind of message we are receiving and call corresponding method
		console.log("Recieved request to check or store for site: "+request.domain);

		var result;
		switch(request.action){
			case "check": checkSiteSafety(request.domain);
						  break;
			case "save":  storeNewKey(request.domain);
						  break;
			default: 	  break;
		}
	}
)

/*
*	Checks to see if a filled out form is safe to proceed, if we should prompt to add credentials,
*	or if we should warn the user they are about to enter on an incorrect site
* 	@Param site - The site that the credentials are for
* 	@Param pass - The unencrypted password
*	@Param stub - The unencrypted password stub (first 5 characters)
*/ 
function checkSiteSafety(domain){

	// Turn hostname into a proper name by removing subdomains
	var site = psl.get(domain);

	// Loop through our local storage and check against our known list of combo's
	// If on the list, return 1 for safe, if not, return 0 for warning
	chrome.storage.local.get(["domains", "admin"], function(sites){

		var result = 0;

		// First check if we got the data successfully
		if(chrome.runtime.lastError == undefined){

			var allSites = [];

			// First make sure sites list is not empty, if it is that's ok just don't loop it
			if(sites != {} && sites.domains != undefined){
				allSites = sites.domains;
			}

			// Add list of admin sites
			if(sites != {} && sites.admin != undefined){
				allSites = allSites.concat(sites.admin);
			}

			// Add default list to list of sites
			allSites = allSites.concat(defaultWhitelist);

			// Now see if this site is a stored one
			if(allSites.indexOf(site) != -1){
				result = 1
			}
		} else {

			// We failed to get data, this is a bad time.
			console.log("PhishingBuster: Unable to use local storage, unable to check form safety.");
			console.log(chrome.runtime.lastError);
			result = 1;
		}

		// Send message to content script with what they should do
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {"type": "check", "result": result}, null);
		});

	});
}

/*
*	Stores a new key into storage
* 	@Param domain - The target site
*	@Return success - 1/0
*/ 
function storeNewKey(domain){

	// Turn hostname into a proper name by removing subdomains
	var site = psl.get(domain);

	// Get the current values of domains/passwords
	chrome.storage.local.get("domains", function(data){

		// Save the domain
		if(data.domains == undefined) data.domains = [];
		data.domains.push(site);

		// Now write back the data
		chrome.storage.local.set(data, null);

		// Return success
		return 1;
	});

	// Return failed
	return 0;
}


// ----------------------------------------------------------
// Helper data
// ----------------------------------------------------------
var defaultWhitelist = ['google.com','youtube.com','facebook.com','amazon.com','amazon.ca','wikipedia.org','twitter.com','yahoo.com','ebay.com','reddit.com','yelp.com','adobe.com','buzzfeed.com','pinterest.com','bing.com','live.com','linkedin.com','netflix.com','wordpress.com','craigslist.org','walmart.com','wikia.com','nytimes.com','espn.com','intuit.com','shareably.net','weather.com','apple.com','urbandictionary.com','chase.com','quizlet.com','tripadvisor.com','instagram.com','msn.com','twentytwowords.com','legacy.com','webmd.com','whitepages.com','usatoday.com','indeed.com','paypal.com','bustle.com','stackexchange.com','imdb.com','zillow.com','ranker.com','fandango.com','quora.com','etsy.com','usps.com','glassdoor.com','spotify.com','bankofamerica.com','vimeo.com','target.com','giphy.com','mlb.com','wellsfargo.com','bestbuy.com','cbsnews.com','littlethings.com','dailymail.co.uk','businessinsider.com','imgur.com','xfinity.com','theguardian.com','groupon.com','thehill.com','aol.com','urbo.com','answers.com','cnet.com','homedepot.com','dailymotion.com','capitalone.com','thoughtcatalog.com','gizmodo.com','wikihow.com','cbssports.com','rumble.com','att.com','slate.com','microsoft.com','goodreads.com','merriam-webster.com','latimes.com','sbnation.com','nih.gov','comcast.net','ups.com','ticketmaster.com','thekitchn.com','theverge.com','uproxx.com','nydailynews.com','irs.gov','eonline.com','247sports.com','politico.com','express.co.uk','worldlifestyle.com','fedex.com','opentable.com','usmagazine.com','expedia.com','nfl.com','office.com','deviantart.com','topix.com','macys.com','liftable.com','inspiremore.com','trulia.com','iheart.com','lifehacker.com','city-data.com','hometalk.com','hulu.com','npr.org','southwest.com','rollingstone.com','healthyway.com','citi.com','azlyrics.com','gfycat.com','instructables.com','dmv.org','mozilla.org','about.com','discover.com','bleacherreport.com','usbank.com','creditkarma.com','lowes.com','kohls.com','sfgate.com','wikimedia.org','cnbc.com','snopes.com','thepennyhoarder.com','ca.gov','vox.com','drugs.com','nbcsports.com','fashionbeans.com','go.com','americanexpress.com','nbcnews.com','newegg.com','foodnetwork.com','drudgereport.com','shmoop.com','pagesix.com','rare.us','weather.gov','spanishdict.com','wunderground.com','trend-chaser.com','stackoverflow.com','yourdailydish.com','mapquest.com','mayoclinic.org','deadspin.com','instructure.com','refinery29.com','wayfair.com','patch.com','thegameraccess.com','photobucket.com','hp.com','androidcentral.com','office365.com','lifedaily.com','github.com','mentalfloss.com','walgreens.com','samsclub.com','dropbox.com','aliexpress.com','britannica.com','someecards.com','flickr.com','eater.com','stupiddope.com','blogger.com','seriouseats.com','yellowpages.com','cbslocal.com','distractify.com','nj.com','salon.com','retailmenot.com','coolmath-games.com','dailykos.com','activebeat.co','kbb.com','allrecipes.com','dailycaller.com','howtogeek.com','shopify.com','slideshare.net','cheatsheet.com','booking.com','nbc.com','tmz.com','wittyfeed.com','overstock.com','hotels.com','verizon.com','looper.com','vanityfair.com','ikea.com','miamiherald.com','msnbc.com','usnews.com','chron.com','costco.com','t-mobile.com','adp.com','moviepilot.com','roblox.com','polygon.com','jcpenney.com','gofundme.com','nickiswift.com','coupons.com','eventbrite.com','ancestry.com','healthline.com','jezebel.com','kayak.com','thechive.com','theblaze.com','patient.info','staples.com','ibt.com','comicbook.com','myrecipes.com','bodybuilding.com','delish.com','hellogiggles.com','popsugar.com','avclub.com','rawstory.com','medicalnewstoday.com','aa.com','ibtimes.com','ajc.com','kotaku.com','enotes.com','ozy.com','magiquiz.com','schwab.com','battle.net','delta.com','jalopnik.com','washingtonexaminer.com','inverse.com','force.com','medicinenet.com','kiwireport.com','inquisitr.com','medscape.com','westernjournalism.com','startribune.com','resistancereport.com','food.com','softorama.com','edmunds.com','imore.com','bp.blogspot.com','washingtontimes.com','curejoy.com','macrumors.com','mashable.com','collegehumor.com','camdolls.com','liveleak.com','chicagotribune.com','reuters.com','brightside.me','forever21.com','hgtv.com','pairade.com','nordstrom.com','axs.com','nextdoor.com','wellhello.com','mlive.com','theweek.com','upworthy.com','gamespot.com','nametests.com','gardeningknowhow.com','bravotv.com','medium.com','directv.com','hollywoodreporter.com','theroot.com','sportingnews.com','archive.org','pbs.org','sprint.com','priceline.com','good.is','draxe.com','cargurus.com','outlook.com','history.com','apartmenttherapy.com','tvguide.com','charlotteobserver.com','brit.co','thefreedictionary.com','thefederalistpapers.org','united.com','redfin.com','today.com','theonion.com','petfinder.com','informationvine.com','uscis.gov','nesn.com','romper.com','knowyourmeme.com','zimbio.com','ask.com','barnesandnoble.com','messenger.com','custhelp.com','tributes.com','ncaa.com','sears.com','ksl.com','gap.com','patheos.com','blackboard.com','yourtango.com','theodysseyonline.com','tomsguide.com','al.com','bandcamp.com','godaddy.com','livingly.com','citationmachine.net','ted.com','crimeonline.com','consumerreports.org','mirror.co.uk','timeanddate.com','purdue.edu','marriott.com','curbed.com','redbubble.com','dell.com','wow.com','cinemablend.com','nationalgeographic.com','superuser.com','telemundo.com','tickld.com','autotrader.com','usaa.com','pizzahut.com','cleveland.com','definition.org','heatst.com','coursehero.com','autozone.com','lifewire.com','pastemagazine.com','kickstarter.com','umblr.com','ssa.gov','fidelity.com','biblegateway.com','ebates.com','nba.com','healthgrades.com','discordapp.com','state.gov','pch.com','gamestop.com','patreon.com','techradar.com','hilton.com','newyorker.com','progressive.com','pearsoncmg.com','oregonlive.com','cars.com','foreverymom.com','viralthread.com','almanac.com','siriusxm.com','cdc.gov','wix.com','chegg.com','bedbathandbeyond.com','zappos.com','lonelyplanet.com','onlinevideoconverter.com','angieslist.com','khanacademy.org','prezi.com','wsbtv.com','timewarnercable.com','nike.com','tomshardware.com','getitfree.us','ew.com','wired.com','psychologytoday.com','mega.nz','baseball-reference.com','ny.gov','wfaa.com','bookingbuddy.com','brainjet.com','leafly.com','dickssportinggoods.com','skype.com','geico.com','workingmother.com','gradesaver.com','audible.com','lonny.com','alibaba.com','psu.edu','travelocity.com','cbs.com','findagrave.com','youngcons.com','narvar.com','citibankonline.com','thewhizproducts.com','babycenter.com','cc.com','livenation.com','buff.ly','flightaware.com','beliefnet.com','zerohedge.com','harvard.edu','papajohns.com','sciencealert.com','thekrazycouponlady.com','faithit.com','kinja.com','howstuffworks.com','docusign.net','everydayhealth.com','societyofrock.com','gunbroker.com','trivago.com','timeout.com','scribd.com','orbitz.com','study.com','tasteofhome.com','ellentube.com','bestdeals.today','apartments.com','ratemyprofessors.com','sharepoint.com','ebaumsworld.com','amzn.to','nasa.gov','bitmedianetwork.com','toysrus.com','wnd.com','nps.gov','researchgate.net','thrillist.com','wn.com','occupydemocrats.com','v2profit.com','motortrend.com','openload.co','watchfree.to','collegeconfidential.com','nbcdfw.com','bbt.com','evite.com','nola.com','infowars.com','fortune.com','mundohispanico.com','pnc.com','makeuseof.com','minq.com','cbc.ca','thegatewaypundit.com','allmusic.com','vrbo.com','starbucks.com','puu.sh','deseretnews.com','vitals.com','geeksvip.com','stanford.edu','sacbee.com','digitalprivacyalert.org','awm.com','emedicinehealth.com','careerbuilder.com','michaels.com','nasdaq.com','suggest.com','kansascity.com','wixsite.com','wgntv.com','americanmilitarynews.com','rottentomatoes.com','rei.com','cvent.com','carfax.com','thebalance.com','medallia.com','stubhub.com','spokeo.com','decider.com','alternet.org','rr.com','clark.com','education.com','grunge.com','grammarly.com','oprah.com','bostonglobe.com','4chan.org','allenbwest.com','salary.com','cornell.edu','pcgamer.com','wideopencountry.com','bettycrocker.com','scottrade.com','bizapedia.com','statefarm.com','meetup.com','observer.com','ziprecruiter.com','puckermob.com','pitchfork.com','chewy.com','qz.com','myshopify.com','softonic.com','sciencedirect.com','noaa.gov','sciencedaily.com','foursquare.com','taxact.com','billboard.com','greatist.com','nyc.gov','whatsapp.com','usda.gov','stylebistro.com','food52.com','kissanime.ru','excite.com','9news.com','king5.com','atlasobscura.com','underarmour.com','lifescript.com','kroger.com','spectrum.net','squareup.com','khou.com','spectrum.com','sparknotes.com','thelist.com','barclaycardus.com','wish.com','panerabread.com','google.de','ultimate-guitar.com','bhg.com','playboy.com','doodle.com','wiktionary.org','wtop.com','slader.com','mellowsurvey.com','elephantjournal.com','weddingwire.com','primagames.com','joinhoney.com','hayneedle.com','livescience.com','sendgrid.net','straightdope.com','qvc.com','thinkprogress.org','fitbit.com','truthfinder.com','tractorsupply.com','cheapoair.com','jetblue.com','experian.com','bzfd.it','ihg.com','tvtropes.org','lyft.com','intelius.com','mcclatchydc.com','click2houston.com','clickondetroit.com','synchronycredit.com','popsci.com','diynetwork.com','dorkly.com','ienjoyapps.com','gyazo.com','redbox.com','va.gov','brobible.com','engadget.com','11alive.com','leagueoflegends.com','kiplinger.com','ulta.com','onlyinyourstate.com','thestreet.com','thehollywoodgossip.com','mcdonalds.com','biblehub.com','usherald.com','microsoftstore.com','songmeanings.com','experienceproject.com','vanguard.com','laweekly.com','change.org','studyblue.com','basketball-reference.com','bhphotovideo.com','google.co.uk','4cdn.org','newsobserver.com','netfind.com','fodors.com','yourdictionary.com','google.ca','amctheatres.com','governmentjobs.com','hercampus.com','turbotax.com','chowhound.com','omglane.com','wikibuy.com','aaa.com','popularmechanics.com','westernunion.com','fox25boston.com','focuusing.com','attn.com','activebeat.com','iloveoldschoolmusic.com','411.com','gurl.com','pennlive.com','scout.com','bloomingdales.com','seccountry.com','horoscope.com','caranddriver.com','abc15.com','victoriassecret.com','star-telegram.com','ratemyjob.com','apartmentguide.com','ford.com','pof.com','trueactivist.com','box.com','geforce.com','metro.co.uk','thevideo.me','landof10.com','dallasnews.com','cox.net','lg.com','vidto.me','politifact.com','90min.com','theadvocate.com','myworkdayjobs.com','avvo.com','historyinorbit.com','writical.com','deviantart.net','amazon.co.uk','texas.gov','shutterstock.com','hiphopmyway.com','talkingpointsmemo.com','wordreference.com','astrology.com','androidauthority.com','therichest.com','petsmart.com','algebra.com','instantcheckmate.com','workingmothertv.com','qklnk.co','bbb.org','pastebin.com','techcrunch.com','allbreakingnews.com','thebrofessional.net','philly.com','grubhub.com','cancer.org','politicususa.com','seattletimes.com','dailysnark.com','mercola.com','campingworld.com','clicktripz.com','intuitcdn.net','nationalreview.com','wayport.net','mheducation.com','ask.fm','bloglovin.com','9gag.com','choicehotels.com','ecollege.com','medhelp.org','soup.io','tracfone.com','kare11.com','easypdfcombine.com','enterprise.com','snapguide.com','advanceautoparts.com','snapchat.com','duckduckgo.com','freedomdaily.com','jstor.org','ufl.edu','ndtv.com','warpedspeed.com','abcactionnews.com','berkeley.edu','mnn.com','umich.edu','hotwire.com','apost.com','carid.com','ncsecu.org','cbn.com','remax.com','ciuvo.com','acehardware.com','metafilter.com','whiskeyriff.com','mass.gov','nordstromrack.com','phys.org','wisc.edu','searchrally.com','indiewire.com','53.com','amtrak.com','creditonebank.com','snagajob.com','nbclosangeles.com','liveadexchanger.com','creditcards.com','vulture.com','glamour.com','hbogo.com','netdeals.com','syracuse.com','filehippo.com','famousfootwear.com','searchencrypt.com','thepoliticalinsider.com','alltrails.com','zapmeta.com','spendwithpennies.com','kmart.com','frontier.com','nolo.com','hotmail.com','news.com.au','epicurious.com','cabelas.com','newarena.com','starwoodhotels.com','wattpad.com','funnyordie.com','omaha.com','mit.edu','fixya.com','lds.org','reservations.com','collegeboard.org','mommypage.com','angryarcade.com','youtube-mp3.org','myappline.com','intellicast.com','homeaway.com','fb.com','bolde.com','scholastic.com','rxlist.com','countryrebel.com','backpage.com','partsgeek.com','turnitin.com','rt.com','purplemath.com','homes.com','newsner.com','treato.com','wa.gov','docusign.com','mercurynews.com','nadaguides.com','palmbeachpost.com','wcpo.com','dreamstime.com','masslive.com','xda-developers.com','marketrealist.com','ae.com','athletic.net','tesla.com','epymtservice.com','newsandpromotions.com','lenovo.com','springer.com','harborfreight.com','google.es','studentdoctor.net','popularscience.tv'];
