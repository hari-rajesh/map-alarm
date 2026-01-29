'use client'

import { Location, MIN_ALARM_RADIUS, MAX_ALARM_RADIUS } from './MapComponent'

interface AlarmPanelProps {
  selectedLocation: Location | null
  userLocation: Location | null
  distance: number | null
  isTracking: boolean
  alarmTriggered: boolean
  alarmRadius: number
  onAlarmRadiusChange: (radius: number) => void
  onStartTracking: () => void
  onStopTracking: () => void
  onDismissAlarm: () => void
  onClearDestination: () => void
}

// Format radius for display
function formatRadius(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`
  }
  return `${km} km`
}

export default function AlarmPanel({
  selectedLocation,
  userLocation,
  distance,
  isTracking,
  alarmTriggered,
  alarmRadius,
  onAlarmRadiusChange,
  onStartTracking,
  onStopTracking,
  onDismissAlarm,
  onClearDestination,
}: AlarmPanelProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
      <h2 className="text-lg font-bold text-gray-800">Destination</h2>

      {selectedLocation ? (
        <>
          {/* Destination Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="bg-red-100 text-red-600 p-2 rounded-lg mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {selectedLocation.address || 'Selected Location'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                </p>
              </div>
            </div>
          </div>

          {/* Distance Display */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 text-white">
            <div className="text-sm opacity-90">Distance to destination</div>
            <div className="text-3xl font-bold mt-1">
              {distance !== null ? (
                distance < 1 ? (
                  `${Math.round(distance * 1000)} m`
                ) : (
                  `${distance.toFixed(2)} km`
                )
              ) : (
                '--'
              )}
            </div>
            {isTracking && (
              <div className="flex items-center gap-2 mt-2 text-sm">
                <span className="relative flex h-2 w-2">
                  <span className="ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                Live tracking active
              </div>
            )}
          </div>

          {/* Alarm Radius Control */}
          <div className="bg-amber-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="text-sm font-medium text-gray-700">Alarm Radius</span>
              </div>
              <span className="text-sm font-bold text-indigo-600">{formatRadius(alarmRadius)}</span>
            </div>
            <input
              type="range"
              min={MIN_ALARM_RADIUS}
              max={MAX_ALARM_RADIUS}
              step={0.1}
              value={alarmRadius}
              onChange={(e) => onAlarmRadiusChange(parseFloat(e.target.value))}
              disabled={isTracking}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{formatRadius(MIN_ALARM_RADIUS)}</span>
              <span>{formatRadius(MAX_ALARM_RADIUS)}</span>
            </div>
            {isTracking && (
              <p className="text-xs text-amber-600 mt-2">Stop tracking to adjust radius</p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Min 100m for GPS accuracy
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {!isTracking ? (
              <button
                onClick={onStartTracking}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Start Tracking
              </button>
            ) : (
              <button
                onClick={onStopTracking}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
                Stop Tracking
              </button>
            )}

            <button
              onClick={onClearDestination}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-xl transition-colors text-sm"
            >
              Clear Destination
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-2">No destination selected</p>
          <p className="text-sm text-gray-400">
            Click on the map or search for a location
          </p>
        </div>
      )}

      {/* User Location */}
      {userLocation && (
        <div className="border-t pt-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Your Location</div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
            <span>{userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
