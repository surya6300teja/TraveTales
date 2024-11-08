document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('search-form');
    const itineraryResult = document.getElementById('itinerary-result');
    console.log("hited");
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const destination = document.getElementById('destination').value;
        const duration = parseInt(document.getElementById('duration').value);

        // Show loading animation
        itineraryResult.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Generating your itinerary...</p>
            </div>
        `;

        // Make API call
        fetchItinerary(destination, duration)
            .then(displayItinerary)
            .catch(displayError); 
    });

    async function fetchItinerary(destination, duration) {
        const apiKey = 'AIzaSyC5FdOLLPFtyDUq71DOidN8tX9WPqpXHIs';
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

        const prompt = `Create a ${duration}-day travel itinerary for ${destination}. For each day, provide a brief description and list 3 activities or attractions to visit. Also, suggest 3 hotels in ${destination}. Format the response as a JSON object with the following structure:
        {
          "destination": "${destination}",
          "itinerary": [
            {
              "day": 1,
              "description": "Day 1 description",
              "activities": ["Activity 1", "Activity 2", "Activity 3"]
            },
            ...
          ],
          "hotels": [
            {
              "name": "Hotel Name 1",
              "description": "Brief description of the hotel"
            },
            {
              "name": "Hotel Name 2",
              "description": "Brief description of the hotel"
            },
            {
              "name": "Hotel Name 3",
              "description": "Brief description of the hotel"
            }
          ]
        }`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch itinerary: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        const itineraryText = data.candidates[0].content.parts[0].text;
        
        // Extract JSON from the response
        const jsonMatch = itineraryText.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
            try {
                return JSON.parse(jsonMatch[1]);
            } catch (error) {
                console.error("Error parsing JSON:", error);
                throw new Error("Failed to parse itinerary data");
            }
        } else {
            console.error("No valid JSON found in the response");
            throw new Error("Invalid itinerary data format");
        }
    }

    function displayItinerary(data) {
        // Clear the loading animation
        itineraryResult.innerHTML = '';

        if (!data || !data.destination || !data.itinerary || !Array.isArray(data.itinerary) || !data.hotels || !Array.isArray(data.hotels)) {
            itineraryResult.innerHTML = '<p class="error">Error: Invalid itinerary data received</p>';
            return;
        }

        let html = '<div class="itinerary-container">';
        
        // Display itinerary
        html += '<h2>Your Itinerary for ' + data.destination + '</h2>';
        data.itinerary.forEach((day, index) => {
            html += `
                <div class="day-card" style="animation-delay: ${index * 0.1}s">
                    <div class="day-header">
                        <h3>Day ${day.day}</h3>
                        <div class="day-icon"><i class="fas fa-calendar-day"></i></div>
                    </div>
                    <p class="day-description">${day.description}</p>
                    <ul class="activities-list">
                        ${day.activities.map(activity => `
                            <li>
                                <i class="fas fa-check-circle"></i>
                                <span>${activity}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        });

        // Display hotel suggestions
        html += '<div class="hotel-suggestions">';
        html += '<h2>Suggested Hotels</h2>';
        data.hotels.forEach(hotel => {
            const searchQuery = encodeURIComponent(`${hotel.name} in ${data.destination}`);
            const searchUrl = `https://www.google.com/search?q=${searchQuery}`;
            html += `
                <div class="hotel-card">
                    <h3><a href="${searchUrl}" target="_blank" rel="noopener noreferrer">${hotel.name}</a></h3>
                    <p>${hotel.description}</p>
                </div>
            `;
        });
        html += '</div>';

        html += '</div>';
        itineraryResult.innerHTML = html;
    }

    function displayError(error) {
        // Clear the loading animation
        itineraryResult.innerHTML = '';

        itineraryResult.innerHTML = `<p class="error">Error: ${error.message}</p>`;
    }
});

function fetchHotels(destination) {
    return new Promise((resolve, reject) => {
        const service = new google.maps.places.PlacesService(document.createElement('div'));
        const request = {
            query: `hotels in ${destination}`,
            type: ['lodging']
        };

        service.textSearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                const hotels = results.slice(0, 3).map(hotel => ({
                    name: hotel.name,
                    rating: hotel.rating,
                    address: hotel.formatted_address
                }));
                resolve(hotels);
            } else {
                reject(new Error(`Failed to fetch hotels: ${status}`));
            }
        });
    });
}
