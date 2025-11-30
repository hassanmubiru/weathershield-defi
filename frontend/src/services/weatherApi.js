// Weather API Service - Fetches real weather data from OpenWeatherMap

const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const BASE_URL = 'https://api.openweathermap.org/data/2.5'

/**
 * Get current weather for a location
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} Weather data
 */
export async function getCurrentWeather(lat, lon) {
  if (!OPENWEATHER_API_KEY) {
    throw new Error('OpenWeatherMap API key not configured')
  }

  try {
    const response = await fetch(
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
    )
    
    if (!response.ok) {
      throw new Error('Weather API request failed')
    }

    const data = await response.json()
    
    return {
      temperature: Math.round(data.main.temp * 100) / 100, // °C
      humidity: data.main.humidity, // %
      rainfall: data.rain?.['1h'] || data.rain?.['3h'] || 0, // mm
      windSpeed: Math.round(data.wind.speed * 3.6 * 100) / 100, // km/h (convert from m/s)
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      location: data.name,
      country: data.sys.country,
      timestamp: data.dt * 1000,
      feels_like: data.main.feels_like,
      pressure: data.main.pressure,
      clouds: data.clouds.all,
    }
  } catch (error) {
    console.error('Weather API error:', error)
    throw error
  }
}

/**
 * Get weather forecast for a location (5 days / 3 hour intervals)
 * @param {number} lat - Latitude  
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} Forecast data
 */
export async function getWeatherForecast(lat, lon) {
  if (!OPENWEATHER_API_KEY) {
    throw new Error('OpenWeatherMap API key not configured')
  }

  try {
    const response = await fetch(
      `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
    )
    
    if (!response.ok) {
      throw new Error('Forecast API request failed')
    }

    const data = await response.json()
    
    // Group by day and calculate daily averages
    const dailyData = {}
    data.list.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString()
      if (!dailyData[date]) {
        dailyData[date] = {
          temps: [],
          humidity: [],
          rainfall: [],
          windSpeed: [],
          icons: [],
          descriptions: [],
        }
      }
      dailyData[date].temps.push(item.main.temp)
      dailyData[date].humidity.push(item.main.humidity)
      dailyData[date].rainfall.push(item.rain?.['3h'] || 0)
      dailyData[date].windSpeed.push(item.wind.speed * 3.6)
      dailyData[date].icons.push(item.weather[0].icon)
      dailyData[date].descriptions.push(item.weather[0].description)
    })

    const forecast = Object.entries(dailyData).slice(0, 5).map(([date, values]) => ({
      date,
      temperature: {
        min: Math.min(...values.temps),
        max: Math.max(...values.temps),
        avg: values.temps.reduce((a, b) => a + b, 0) / values.temps.length,
      },
      humidity: Math.round(values.humidity.reduce((a, b) => a + b, 0) / values.humidity.length),
      rainfall: values.rainfall.reduce((a, b) => a + b, 0),
      windSpeed: Math.round(values.windSpeed.reduce((a, b) => a + b, 0) / values.windSpeed.length),
      icon: values.icons[Math.floor(values.icons.length / 2)], // Middle of day icon
      description: values.descriptions[Math.floor(values.descriptions.length / 2)],
    }))

    return {
      location: data.city.name,
      country: data.city.country,
      forecast,
    }
  } catch (error) {
    console.error('Forecast API error:', error)
    throw error
  }
}

/**
 * Get weather alerts for a location (requires One Call API 3.0)
 * Falls back to analysis of current conditions
 */
export async function getWeatherAlerts(lat, lon) {
  const current = await getCurrentWeather(lat, lon)
  const alerts = []

  // Analyze current conditions for potential alerts
  if (current.temperature > 35) {
    alerts.push({
      type: 'heat',
      severity: 'warning',
      title: 'Heat Wave Alert',
      description: `Temperature is ${current.temperature}°C. Consider heat protection coverage.`,
    })
  }
  
  if (current.temperature < 0) {
    alerts.push({
      type: 'frost',
      severity: 'warning', 
      title: 'Frost Alert',
      description: `Temperature is ${current.temperature}°C. Frost protection recommended.`,
    })
  }
  
  if (current.rainfall > 50) {
    alerts.push({
      type: 'flood',
      severity: 'warning',
      title: 'Heavy Rain Alert',
      description: `Rainfall of ${current.rainfall}mm detected. Consider flood protection.`,
    })
  }
  
  if (current.windSpeed > 50) {
    alerts.push({
      type: 'storm',
      severity: 'warning',
      title: 'High Wind Alert',
      description: `Wind speed is ${current.windSpeed} km/h. Storm protection advised.`,
    })
  }
  
  if (current.humidity < 30 && current.rainfall === 0) {
    alerts.push({
      type: 'drought',
      severity: 'info',
      title: 'Dry Conditions',
      description: 'Low humidity and no recent rainfall. Monitor for drought conditions.',
    })
  }

  return alerts
}

/**
 * Get location name from coordinates (reverse geocoding)
 */
export async function getLocationName(lat, lon) {
  if (!OPENWEATHER_API_KEY) {
    throw new Error('OpenWeatherMap API key not configured')
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${OPENWEATHER_API_KEY}`
    )
    
    if (!response.ok) throw new Error('Geocoding failed')
    
    const data = await response.json()
    if (data.length > 0) {
      return {
        name: data[0].name,
        country: data[0].country,
        state: data[0].state,
      }
    }
    return { name: 'Unknown', country: '' }
  } catch (error) {
    console.error('Geocoding error:', error)
    return { name: 'Unknown', country: '' }
  }
}

/**
 * Search for locations by name
 */
export async function searchLocations(query) {
  if (!OPENWEATHER_API_KEY) {
    throw new Error('OpenWeatherMap API key not configured')
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${OPENWEATHER_API_KEY}`
    )
    
    if (!response.ok) throw new Error('Search failed')
    
    const data = await response.json()
    return data.map(item => ({
      name: item.name,
      country: item.country,
      state: item.state,
      lat: item.lat,
      lon: item.lon,
    }))
  } catch (error) {
    console.error('Location search error:', error)
    return []
  }
}

// Weather icon URL helper
export function getWeatherIconUrl(icon) {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`
}

// Risk assessment based on weather data
export function assessWeatherRisk(weather) {
  const risks = {
    drought: 0,
    flood: 0,
    frost: 0,
    heatwave: 0,
    storm: 0,
  }

  // Drought risk
  if (weather.humidity < 30) risks.drought += 30
  if (weather.rainfall === 0) risks.drought += 20
  if (weather.temperature > 30) risks.drought += 20
  
  // Flood risk
  if (weather.rainfall > 20) risks.flood += 40
  if (weather.rainfall > 50) risks.flood += 30
  if (weather.humidity > 80) risks.flood += 15

  // Frost risk
  if (weather.temperature < 5) risks.frost += 30
  if (weather.temperature < 0) risks.frost += 50
  if (weather.temperature < -5) risks.frost += 20

  // Heat wave risk
  if (weather.temperature > 30) risks.heatwave += 30
  if (weather.temperature > 35) risks.heatwave += 40
  if (weather.temperature > 40) risks.heatwave += 30

  // Storm risk
  if (weather.windSpeed > 30) risks.storm += 30
  if (weather.windSpeed > 50) risks.storm += 40
  if (weather.windSpeed > 70) risks.storm += 30

  // Normalize to 0-100
  Object.keys(risks).forEach(key => {
    risks[key] = Math.min(100, risks[key])
  })

  return risks
}

export default {
  getCurrentWeather,
  getWeatherForecast,
  getWeatherAlerts,
  getLocationName,
  searchLocations,
  getWeatherIconUrl,
  assessWeatherRisk,
}
