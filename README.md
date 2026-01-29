# Location Alarm

A web application that alerts you when you're within 1km of your selected destination. Built with Next.js, Google Maps API, and Tailwind CSS.

## Features

- 🗺️ **Interactive Google Map** - Click anywhere on the map to set a destination
- 🔍 **Location Search** - Search for places using Google Places Autocomplete
- 📍 **Live Location Tracking** - Real-time tracking of your current position
- 🔔 **Proximity Alarm** - Audio and visual alert when within 1km of destination
- 📱 **Responsive Design** - Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Google Maps API key with the following APIs enabled:
  - Maps JavaScript API
  - Places API
  - Geocoding API

### Installation

1. Clone the repository or navigate to the project folder:

   ```bash
   cd location-alarm
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory:

   ```bash
   cp .env.local.example .env.local
   ```

4. Add your Google Maps API key to `.env.local`:

   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

5. Run the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deploying to Vercel

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI:

   ```bash
   npm i -g vercel
   ```

2. Run the deploy command:

   ```bash
   vercel
   ```

3. Add your environment variable in the Vercel dashboard:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` with your API key

### Option 2: Deploy via GitHub

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add the environment variable `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` during setup
4. Deploy!

## Usage

1. **Select a Destination**:
   - Type in the search bar to find a location, or
   - Click directly on the map

2. **Start Tracking**:
   - Press the "Start Tracking" button to begin monitoring your location

3. **Receive Alert**:
   - When you're within 1km of your destination, an alarm will sound
   - A visual overlay will appear with a dismiss button

4. **Dismiss or Clear**:
   - Dismiss the alarm to continue tracking
   - Clear the destination to select a new one

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **@react-google-maps/api** - Google Maps React components
- **Geolocation API** - Browser's native location tracking

## Browser Permissions

This app requires:

- **Location Access** - To track your current position
- **Audio Playback** - To play the alarm sound

Make sure to allow these permissions when prompted.

## License

MIT
