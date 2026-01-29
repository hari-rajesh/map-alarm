'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Circle,
} from '@react-google-maps/api'
import SearchBox from './SearchBox'
import AlarmPanel from './AlarmPanel'
import { calculateDistance } from '@/utils/distance'

const libraries: ('places')[] = ['places']

const mapContainerStyle = {
  width: '100%',
  height: '100%',
}

const defaultCenter = {
  lat: 40.7128,
  lng: -74.006,
}

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: true,
  fullscreenControl: true,
}

export interface Location {
  lat: number
  lng: number
  address?: string
}

// Alarm sound player using custom MP3 file
// To change the alarm sound, replace /alarm.mp3 in the public folder
const ALARM_SOUND_PATH = '/loud.mp3'

class AlarmSound {
  private audio: HTMLAudioElement | null = null
  private isPlaying = false

  start() {
    if (this.isPlaying) return
    
    this.audio = new Audio(ALARM_SOUND_PATH)
    this.audio.loop = true
    this.audio.volume = 0.8
    this.isPlaying = true
    
    this.audio.play().catch((error) => {
      console.error('Failed to play alarm sound:', error)
    })
  }

  stop() {
    this.isPlaying = false
    if (this.audio) {
      this.audio.pause()
      this.audio.currentTime = 0
      this.audio = null
    }
  }
}

// Minimum 100m (0.1km) for GPS accuracy, Maximum 10km
export const MIN_ALARM_RADIUS = 0.1 // km
export const MAX_ALARM_RADIUS = 10 // km
export const DEFAULT_ALARM_RADIUS = 1 // km

export default function MapComponent() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [userLocation, setUserLocation] = useState<Location | null>(null)
  const [distance, setDistance] = useState<number | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [alarmTriggered, setAlarmTriggered] = useState(false)
  const [alarmDismissed, setAlarmDismissed] = useState(false)
  const [mapCenter, setMapCenter] = useState(defaultCenter)
  const [mapZoom, setMapZoom] = useState(12)
  const [alarmRadius, setAlarmRadius] = useState(DEFAULT_ALARM_RADIUS) // in km
  const watchIdRef = useRef<number | null>(null)
  const alarmSoundRef = useRef<AlarmSound | null>(null)

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  })

  // Initialize alarm sound
  useEffect(() => {
    alarmSoundRef.current = new AlarmSound()
    return () => {
      if (alarmSoundRef.current) {
        alarmSoundRef.current.stop()
      }
    }
  }, [])

  // Get user's initial location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setUserLocation(loc)
          setMapCenter(loc)
        },
        (error) => {
          console.log('Error getting initial location:', error)
        }
      )
    }
  }, [])

  // Calculate distance when locations change
  useEffect(() => {
    if (selectedLocation && userLocation) {
      const dist = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        selectedLocation.lat,
        selectedLocation.lng
      )
      setDistance(dist)

      // Check if within alarm radius and alarm hasn't been dismissed
      if (dist <= alarmRadius && isTracking && !alarmDismissed) {
        setAlarmTriggered(true)
        if (alarmSoundRef.current) {
          alarmSoundRef.current.start()
        }
      } else if (dist > alarmRadius) {
        // Reset alarm dismissed state when user moves away
        setAlarmDismissed(false)
      }
    }
  }, [selectedLocation, userLocation, isTracking, alarmDismissed, alarmRadius])

  // Start/stop tracking
  useEffect(() => {
    if (isTracking && selectedLocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error('Error watching position:', error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 1000,
        }
      )
    } else {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [isTracking, selectedLocation])

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const location = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      }
      setSelectedLocation(location)
      setAlarmTriggered(false)
      setAlarmDismissed(false)
      if (alarmSoundRef.current) {
        alarmSoundRef.current.stop()
      }

      // Reverse geocode to get address
      const geocoder = new google.maps.Geocoder()
      geocoder.geocode({ location }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          setSelectedLocation((prev) =>
            prev ? { ...prev, address: results[0].formatted_address } : null
          )
        }
      })
    }
  }, [])

  const handlePlaceSelect = useCallback((location: Location) => {
    setSelectedLocation(location)
    setMapCenter({ lat: location.lat, lng: location.lng })
    setMapZoom(15)
    setAlarmTriggered(false)
    setAlarmDismissed(false)
    if (alarmSoundRef.current) {
      alarmSoundRef.current.stop()
    }
  }, [])

  const handleStartTracking = useCallback(() => {
    setIsTracking(true)
    setAlarmTriggered(false)
    setAlarmDismissed(false)
  }, [])

  const handleStopTracking = useCallback(() => {
    setIsTracking(false)
    setAlarmTriggered(false)
    if (alarmSoundRef.current) {
      alarmSoundRef.current.stop()
    }
  }, [])

  const handleDismissAlarm = useCallback(() => {
    setAlarmTriggered(false)
    setAlarmDismissed(true)
    if (alarmSoundRef.current) {
      alarmSoundRef.current.stop()
    }
  }, [])

  const handleClearDestination = useCallback(() => {
    setSelectedLocation(null)
    setIsTracking(false)
    setAlarmTriggered(false)
    setAlarmDismissed(false)
    setDistance(null)
    if (alarmSoundRef.current) {
      alarmSoundRef.current.stop()
    }
  }, [])

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Map Loading Error</h2>
          <p className="text-gray-600">
            Failed to load Google Maps. Please check your API key and try again.
          </p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 text-white p-2 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-800">Location Alarm</h1>
            </div>
            <div className="flex-1">
              <SearchBox onPlaceSelect={handlePlaceSelect} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Map */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl overflow-hidden h-[500px] lg:h-[600px]">
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={mapCenter}
              zoom={mapZoom}
              onClick={handleMapClick}
              options={mapOptions}
            >
              {/* User Location Marker */}
              {userLocation && (
                <Marker
                  position={userLocation}
                  icon={{
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: '#4F46E5',
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 3,
                  }}
                  title="Your Location"
                />
              )}

              {/* Selected Destination Marker */}
              {selectedLocation && (
                <>
                  <Marker
                    position={selectedLocation}
                    icon={{
                      path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                      scale: 8,
                      fillColor: '#EF4444',
                      fillOpacity: 1,
                      strokeColor: '#ffffff',
                      strokeWeight: 2,
                    }}
                    title="Destination"
                  />
                  {/* Alarm radius circle */}
                  <Circle
                    center={selectedLocation}
                    radius={alarmRadius * 1000}
                    options={{
                      fillColor: alarmTriggered ? '#EF4444' : '#4F46E5',
                      fillOpacity: 0.15,
                      strokeColor: alarmTriggered ? '#EF4444' : '#4F46E5',
                      strokeOpacity: 0.8,
                      strokeWeight: 2,
                    }}
                  />
                </>
              )}
            </GoogleMap>
          </div>

          {/* Control Panel */}
          <div className="space-y-4">
            <AlarmPanel
              selectedLocation={selectedLocation}
              userLocation={userLocation}
              distance={distance}
              isTracking={isTracking}
              alarmTriggered={alarmTriggered}
              alarmRadius={alarmRadius}
              onAlarmRadiusChange={setAlarmRadius}
              onStartTracking={handleStartTracking}
              onStopTracking={handleStopTracking}
              onDismissAlarm={handleDismissAlarm}
              onClearDestination={handleClearDestination}
            />

            {/* Instructions */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="font-semibold text-gray-800 mb-3">How to use</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600">1.</span>
                  Search for a location or click on the map
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600">2.</span>
                  Press "Start Tracking" to begin monitoring
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600">3.</span>
                  An alarm will sound when you're within the set radius
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Alarm Overlay */}
      {alarmTriggered && (
        <div className="fixed inset-0 bg-red-500/20 backdrop-blur-sm z-50 flex items-center justify-center animate-pulse">
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-sm mx-4 alarm-active">
            <div className="text-6xl mb-4">🔔</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">You've Arrived!</h2>
            <p className="text-gray-600 mb-6">
              You are within {alarmRadius < 1 ? `${Math.round(alarmRadius * 1000)}m` : `${alarmRadius}km`} of your destination
            </p>
            <button
              onClick={handleDismissAlarm}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Dismiss Alarm
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
