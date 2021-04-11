
function hideCity(city) {
	city.children[0].style.visibility = "hidden";
	city.children[1].style.visibility = "hidden";
	city.classList.add("cityLoadPlaceholder");
}
function showCity(city) {
	city.children[0].style.visibility = "visible";
	city.children[1].style.visibility = "visible";
	city.classList.remove("cityLoadPlaceholder");
}

function init() {
	getLocation();
	initOffline();
	initFavCityInput();
	loadFavCities();
}

function getLocation() {
    if (navigator.geolocation) {
		hideCity(document.getElementById("mainCity"));
		navigator.geolocation.getCurrentPosition(geoCity, defaultCity);
    } else { 
		alert("Geolocation is not supported by this browser.");
    }
}
function defaultCity() {
	let cityName = "Санкт-Петербург";
	let xhr = new XMLHttpRequest();
	xhr.open("GET", `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=395cea13dd1f22db118d27c7297923c3&units=metric`);
	updateMainCity(xhr);
}
function geoCity(geoData) {
	let lat = geoData.coords.latitude;
	let lon = geoData.coords.longitude;
	let xhr = new XMLHttpRequest();
	xhr.open("GET", `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=395cea13dd1f22db118d27c7297923c3&units=metric`);
	updateMainCity(xhr);
}
function updateMainCity(xhr) {
	xhr.send();
	xhr.onload = function() {
		let cityData = JSON.parse(xhr.response);
		let city = document.getElementById("mainCity");
		let header = city.children[0];
		header.children[0].innerHTML = cityData.name;
		header.children[1].src = `https://openweathermap.org/img/wn/${cityData.weather[0].icon}@4x.png`;
		header.children[2].innerHTML =  `${Math.round(cityData.main.temp)}°C`;

		updateWeatherList(city.children[1].children, cityData);
		showCity(city);
	}	
}

function updateWeatherList(list, cityData) {
	list[0].innerHTML = `<b>Ветер</b> ${cityData.wind.speed} м/с`;
	list[1].innerHTML = `<b>Облачность</b> ${cityData.weather[0].description}`;
	cityData.main.pressure *= 0.75; //turn from hpa to mm
	list[2].innerHTML = `<b>Давление</b> ${Math.round(cityData.main.pressure)} мм р.с.`;
	list[3].innerHTML = `<b>Влажность</b> ${cityData.main.humidity} %`;
	list[4].innerHTML = `<b>Координаты</b> [${cityData.coord.lon}, ${cityData.coord.lat}]`;
}

function initOffline() {
	window.addEventListener("offline", function (e) {
		alert("Соединение потеряно, перезагрузите страниицу!");
	});
}
function initFavCityInput() {
	const input = document.getElementById("favInputName");

	input.addEventListener("keyup", function(event) {
		if (event.keyCode === 13) {
			event.preventDefault();
			document.getElementById("favInputButton").click();
		}
	});
}
function loadFavCities() {
	for (let i = 0; i < window.localStorage.length; i++) {
		addCity("id", false, window.localStorage.key(i));
	}
}


function addCity(searchType, newCity, searchValue = document.getElementById('favInputName').value) {
    let xhr = new XMLHttpRequest();
	if (searchType == "name") {
		searchValue = searchValue.toLowerCase();
		xhr.open('GET', `https://api.openweathermap.org/data/2.5/weather?q=${searchValue}&appid=395cea13dd1f22db118d27c7297923c3&units=metric`);
    } else if (searchType == "id") {
		xhr.open('GET', `https://api.openweathermap.org/data/2.5/weather?id=${searchValue}&appid=395cea13dd1f22db118d27c7297923c3&units=metric`);
	}
	   
	xhr.send();
    
	let template = document.getElementById("favCityTemplate");
	let	clone = template.content.cloneNode(true);
	let city = clone.children[0];
	hideCity(city);
	document.getElementById("favList").appendChild(city);

    xhr.onload = function() {
      if (xhr.status != 200) {
        alert(`Город не найден!`);
		city.remove();
      } else {
        let cityData = JSON.parse(xhr.response);
		let cityName = cityData.name;
        if (newCity && window.localStorage.getItem(cityData.id) !== null) {
			alert(`Город ${cityName} уже есть в списке!`);
			city.remove();
			return;
		}
		let header = city.children[0];
		header.children[0].innerHTML = cityName;
		header.children[1].src = `https://openweathermap.org/img/wn/${cityData.weather[0].icon}@4x.png`;
		header.children[2].innerHTML =  `${Math.round(cityData.main.temp)}°C`;
		header.children[3].addEventListener('click', function(){deleteCity(header.children[3], cityData.id)}, false);
		
		updateWeatherList(city.children[1].children, cityData);

		showCity(city);

		if (newCity) {
			window.localStorage.setItem(cityData.id, cityData.id);
			document.getElementById('favInputName').value = '';
		}
      }
    };
}

function deleteCity(element, cityID) {
	window.localStorage.removeItem(cityID);
	element.parentElement.parentElement.remove();
}
