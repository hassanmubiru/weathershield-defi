import { useState, useEffect } from 'react'
import { 
  Cloud, 
  Droplets, 
  Thermometer, 
  Wind, 
  Sun,
  CloudRain,
  Snowflake,
  AlertTriangle,
  MapPin,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Loader2
} from 'lucide-react'
import { 
  getCurrentWeather, 
  getWeatherForecast, 
  getWeatherAlerts,
  getWeatherIconUrl,
  assessWeatherRisk 
} from '../services/weatherApi'

export default function WeatherWidget({ 
  latitude, 
  longitude, 
  showForecast = false,
  showAlerts = true,
  showRiskAssessment = false,
  compact = false,
  onWeatherLoad = null,
  className = ''
}) {
  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [risks, setRisks] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchWeatherData = async () => {
    if (!latitude || !longitude) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const weatherData = await getCurrentWeather(latitude, longitude)
      setWeather(weatherData)
      setLastUpdated(new Date())
      
      if (onWeatherLoad) {
        onWeatherLoad(weatherData)
      }

      if (showRiskAssessment) {
        const riskData = assessWeatherRisk(weatherData)
        setRisks(riskData)
      }

      if (showForecast) {
        const forecastData = await getWeatherForecast(latitude, longitude)
        setForecast(forecastData)
      }

      if (showAlerts) {
        const alertData = await getWeatherAlerts(latitude, longitude)
        setAlerts(alertData)
      }
    } catch (err) {
      setError('Failed to fetch weather data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWeatherData()
    
    // Refresh weather data every 10 minutes
    const interval = setInterval(fetchWeatherData, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [latitude, longitude])

  if (!latitude || !longitude) {
    return (
      <div className={`card bg-slate-800/50 ${className}`}>
        <div className="flex items-center justify-center text-gray-400 py-8">
          <MapPin className="h-5 w-5 mr-2" />
          <span>Enter coordinates to see weather data</span>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`card bg-slate-800/50 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary-400" />
          <span className="ml-2 text-gray-400">Loading weather data...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`card bg-slate-800/50 ${className}`}>
        <div className="flex items-center justify-center text-red-400 py-8">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <span>{error}</span>
          <button onClick={fetchWeatherData} className="ml-4 text-primary-400 hover:text-primary-300">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  if (compact) {
    return (
      <div className={`card bg-slate-800/50 p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src={getWeatherIconUrl(weather.icon)} 
              alt={weather.description}
              className="w-12 h-12"
            />
            <div>
              <div className="text-2xl font-bold text-white">{weather.temperature}°C</div>
              <div className="text-sm text-gray-400 capitalize">{weather.description}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <div className="flex items-center text-gray-400">
              <Droplets className="h-4 w-4 mr-1 text-blue-400" />
              {weather.humidity}%
            </div>
            <div className="flex items-center text-gray-400">
              <Wind className="h-4 w-4 mr-1 text-cyan-400" />
              {weather.windSpeed} km/h
            </div>
            <div className="flex items-center text-gray-400">
              <CloudRain className="h-4 w-4 mr-1 text-blue-500" />
              {weather.rainfall} mm
            </div>
            <div className="flex items-center text-gray-400">
              <MapPin className="h-4 w-4 mr-1 text-red-400" />
              {weather.location}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`card bg-slate-800/50 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Cloud className="h-5 w-5 text-primary-400" />
          <h3 className="text-lg font-semibold text-white">Current Weather</h3>
        </div>
        <button 
          onClick={fetchWeatherData}
          className="text-gray-400 hover:text-white transition-colors"
          title="Refresh weather data"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Location */}
      <div className="flex items-center text-gray-400 text-sm mb-4">
        <MapPin className="h-4 w-4 mr-1" />
        <span>{weather.location}, {weather.country}</span>
        <span className="mx-2">•</span>
        <span>{latitude.toFixed(4)}, {longitude.toFixed(4)}</span>
      </div>

      {/* Main Weather Display */}
      <div className="flex items-center gap-6 mb-6">
        <div className="flex items-center">
          <img 
            src={getWeatherIconUrl(weather.icon)} 
            alt={weather.description}
            className="w-20 h-20"
          />
          <div>
            <div className="text-4xl font-bold text-white">{weather.temperature}°C</div>
            <div className="text-gray-400 capitalize">{weather.description}</div>
            <div className="text-sm text-gray-500">Feels like {weather.feels_like}°C</div>
          </div>
        </div>
      </div>

      {/* Weather Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-700/50 rounded-lg p-3">
          <div className="flex items-center text-blue-400 mb-1">
            <Droplets className="h-4 w-4 mr-1" />
            <span className="text-xs">Humidity</span>
          </div>
          <div className="text-xl font-semibold text-white">{weather.humidity}%</div>
        </div>
        
        <div className="bg-slate-700/50 rounded-lg p-3">
          <div className="flex items-center text-cyan-400 mb-1">
            <Wind className="h-4 w-4 mr-1" />
            <span className="text-xs">Wind Speed</span>
          </div>
          <div className="text-xl font-semibold text-white">{weather.windSpeed} km/h</div>
        </div>
        
        <div className="bg-slate-700/50 rounded-lg p-3">
          <div className="flex items-center text-blue-500 mb-1">
            <CloudRain className="h-4 w-4 mr-1" />
            <span className="text-xs">Rainfall</span>
          </div>
          <div className="text-xl font-semibold text-white">{weather.rainfall} mm</div>
        </div>
        
        <div className="bg-slate-700/50 rounded-lg p-3">
          <div className="flex items-center text-gray-400 mb-1">
            <Cloud className="h-4 w-4 mr-1" />
            <span className="text-xs">Clouds</span>
          </div>
          <div className="text-xl font-semibold text-white">{weather.clouds}%</div>
        </div>
      </div>

      {/* Weather Alerts */}
      {showAlerts && alerts.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-white mb-2 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-1 text-yellow-400" />
            Weather Alerts
          </h4>
          <div className="space-y-2">
            {alerts.map((alert, index) => (
              <div 
                key={index}
                className={`rounded-lg p-3 border ${
                  alert.severity === 'warning' 
                    ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                    : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                }`}
              >
                <div className="font-medium">{alert.title}</div>
                <div className="text-sm opacity-80">{alert.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk Assessment */}
      {showRiskAssessment && risks && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-white mb-3">Insurance Risk Assessment</h4>
          <div className="space-y-2">
            {Object.entries(risks).map(([risk, value]) => (
              <div key={risk} className="flex items-center gap-3">
                <div className="w-24 text-sm text-gray-400 capitalize">{risk}</div>
                <div className="flex-1 bg-slate-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      value > 70 ? 'bg-red-500' : 
                      value > 40 ? 'bg-yellow-500' : 
                      'bg-green-500'
                    }`}
                    style={{ width: `${value}%` }}
                  />
                </div>
                <div className={`text-sm w-10 text-right ${
                  value > 70 ? 'text-red-400' : 
                  value > 40 ? 'text-yellow-400' : 
                  'text-green-400'
                }`}>
                  {value}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Forecast */}
      {showForecast && forecast && (
        <div>
          <h4 className="text-sm font-medium text-white mb-3">5-Day Forecast</h4>
          <div className="grid grid-cols-5 gap-2">
            {forecast.forecast.map((day, index) => (
              <div key={index} className="bg-slate-700/50 rounded-lg p-2 text-center">
                <div className="text-xs text-gray-400">
                  {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                </div>
                <img 
                  src={getWeatherIconUrl(day.icon)} 
                  alt={day.description}
                  className="w-10 h-10 mx-auto"
                />
                <div className="text-sm">
                  <span className="text-white">{Math.round(day.temperature.max)}°</span>
                  <span className="text-gray-500 ml-1">{Math.round(day.temperature.min)}°</span>
                </div>
                {day.rainfall > 0 && (
                  <div className="text-xs text-blue-400">{day.rainfall}mm</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last Updated */}
      {lastUpdated && (
        <div className="text-xs text-gray-500 mt-4 text-right">
          Updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}
    </div>
  )
}

// Mini version for inline display
export function WeatherMini({ latitude, longitude, className = '' }) {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (latitude && longitude) {
      getCurrentWeather(latitude, longitude)
        .then(setWeather)
        .finally(() => setLoading(false))
    }
  }, [latitude, longitude])

  if (loading || !weather) {
    return <span className="text-gray-400">--</span>
  }

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <img 
        src={getWeatherIconUrl(weather.icon)} 
        alt=""
        className="w-6 h-6"
      />
      <span className="text-white font-medium">{weather.temperature}°C</span>
    </span>
  )
}
