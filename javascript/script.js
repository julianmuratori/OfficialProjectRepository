// FOURSQUARE 
// - 1. User inputs their location into "where are you" input field || clicks on the "Find where I am" button
// - 2. Make ajax request from foursqare to find patios near them based off of their location
// - 3. Return 5 patios. Display the name, address, price range, a photo, and a rating of the patio, and the restaurant/bar url

//SPOTIFY 
// - 1. User inputs their favourite artist into input field
// - 2. Ajax request from Spotify to generate a playlist. Display name of artist, the song, photo of artist, song duration. 


const dotpApp = {}

// below this is all the foursquare functionality

dotpApp.clientId = 'HPIIHWSG4NJMA3IGF4H33WT0DQQDK5FLQWMZB4CFMUH422Q4';
dotpApp.clientSecret = 'Q1FVDO1ISJGD32TFCAQQFSVTWS4SWNEW3AJK0NOU2SBH2WHH';

userInput = "";
$(".locationForm").on('submit', function(e){
	e.preventDefault();
	 userInput = $("#userLocation").val();
	 dotpApp.getPatios(userInput);
})

dotpApp.getPatios = function(userInput){
	$.ajax({
		url: "http://api.foursquare.com/v2/venues/explore",
		method: "GET",
		dataType: "json",
		data: {
			near: userInput,
			client_id: dotpApp.clientId,
			client_secret: dotpApp.clientSecret,
			v: "20150201",
			limit: 10,
			query: "restaurants",
			venuePhotos: 1
		}

	// 1. Return data
	}).then(function(data){
		const objectsArray = data.response.groups[0].items;
		let venuesArray = [];
		objectsArray.forEach(function(object){
			venuesArray.push(object.venue);
		})
		dotpApp.displayInfo(venuesArray);
	});
}

dotpApp.displayInfo = function(items) {
	$('#patioResults').empty();
	items.forEach(function(item){

		if (item.verified === true) {
			const foursquareVerified = item.verified;
		}

		const foursquareName = item.name;
		const foursquareRating = item.rating;
		const foursquareLocation = item.location.address + "," + " " + item.location.city + "," + " " + item.location.country;
		const foursquarePhone = item.contact.formattedPhone;
		const foursquarePrice = item.price.tier;
		const foursquareUrl = item.url;

		const foursquareNameElement = $('<h2>').addClass('venueName').text(foursquareName);
		const foursquareRatingElement = $('<p>').addClass('venueRating').text(foursquareRating);
		const foursquareLocationElement = $('<p>').addClass('venueLocation').text(foursquareLocation);
		const foursquarePhoneElement = $('<p>').addClass('venuePhone').text(foursquarePhone);
		const foursquarePriceElement = $('<p>').addClass('venuePrice').text(foursquarePrice);
		const foursquareUrlElement = $('<p>').addClass('venueUrl').text(foursquareUrl);

		const patioSuggestion = $('<div>').addClass('suggestedPatio').append(foursquareNameElement, foursquareRating, foursquareLocationElement, foursquarePhoneElement, foursquarePriceElement, foursquareUrlElement);

		console.log(patioSuggestion);
            $('#patioResults').append(patioSuggestion);
	})

};




// Below this line is all Spotify functionality
dotpApp.spotifyUrl = 'https://api.spotify.com/v1';
var spotifyArray = [];

dotpApp.spotifyEvents = function() {
	$('.musicForm').on('submit', function(e){
		e.preventDefault();
		$("input[type=search]").each(function() {
   			spotifyArray.push($(this).val());
		})
		let search = spotifyArray.map(artistName => dotpApp.searchArtist(artistName));
		console.log("idkjhaskjdhksa");
		dotpApp.retrieveArtistInfo(search);
	})
}

// Makes a request to get artist info from API
dotpApp.searchArtist = (artistName) => $.ajax({
	url: `${dotpApp.spotifyUrl}/search`,
	method: 'GET',
	dataType: 'json',
	data: {
		q: artistName,
		type: 'artist'
	}
})


dotpApp.retrieveArtistInfo = function(search){
	$.when(...search)
		.then((...results) => {
				results = results.map(getFirstElement)
					.map((res) =>  res.artists.items[0].id)
					.map(id => dotpApp.getArtistAlbums(id));

					dotpApp.retrieveArtistTracks(results)
		})
}

// Makes an AJAX call to retrieve albums based on the artist's Spotify id
dotpApp.getArtistAlbums = (artistId) => $.ajax({
	url: `${dotpApp.spotifyUrl}/artists/${artistId}/albums`,
	method: 'GET',
	dataType: 'json',
	data: {
		album_type: 'album'
	}
})

// Gets artist's album ids and sends that info to the AJAX request
dotpApp.retrieveArtistTracks = function(artistAlbums) {
	$.when(...artistAlbums)
		.then((...albums) => {
			albumIds = albums.map(getFirstElement)
				.map(res => res.items)
				.reduce(flatten,[])
				.map(album => album.id)
				.map(ids => dotpApp.getArtistTracks(ids))
			dotpApp.buildPlaylist(albumIds); 
		});
}

// Makes the call to retrieve artist tracks based on id
dotpApp.getArtistTracks = (id) => $.ajax({
	url: `${dotpApp.spotifyUrl}/albums/${id}/tracks`,
	method: 'GET',
	dataType: 'json'
});

const getFirstElement = (item) => item[0];

const flatten = (prev,curr) => [...prev,...curr];

const getRandomTrack = (trackArray) => {
	const randoNum = Math.floor(Math.random() * trackArray.length)
	return trackArray[randoNum]
}

// Makes a playlist based on returned tracks and sends it to the page
dotpApp.buildPlaylist = (tracks) => {
	$.when(...tracks)
		.then((...trackResults) => {
			trackResults = trackResults.map(getFirstElement)
				.map(item => item.items)
				.reduce(flatten, [])
				.map(item => item.id);

			const randomTracks = [];
			for(let i = 0; i <= 30; i++) {
				randomTracks.push(getRandomTrack(trackResults));
			}
			randomTracks.join();
			const baseUrl = `https://embed.spotify.com/?theme=white&uri=spotify:trackset:Patio Party:${randomTracks.join()}`;

			$('.playlist').html(`<iframe src="${baseUrl}" height="350"></iframe>`)
			
		})
}

 

dotpApp.init = function(){

	dotpApp.getPatios();
	dotpApp.spotifyEvents();
};


// // smooth scroll


$(function() {
  dotpApp.init();
});


