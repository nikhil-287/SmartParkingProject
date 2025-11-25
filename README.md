# 🅿️ Smart Parking Finder

A cross-platform mobile application built with React Native and Expo that helps users find, filter, and reserve parking spots in urban areas like San Jose. Features AI-powered natural language search, real-time availability, and offline caching.

## 🎯 Features

### Core Features

- **Real-time Parking Search**: Find available parking spots using Geoapify API
- **Interactive Map View**: Visualize parking locations with color-coded availability
- **Advanced Filtering**: Filter by price, distance, availability, and features
- **Detailed Information**: View capacity, pricing, safety ratings, and amenities
- **Favorites System**: Save frequently used parking spots
- **Search History**: Quick access to recent searches with offline caching

### Advanced Features

- **AI Assistant**: Natural language queries like "Find cheapest parking near SJSU"
- **Smart Recommendations**: AI-powered parking suggestions based on preferences
- **Offline Mode**: Cached data for recent searches when offline
- **Safety Ratings**: Security information including cameras, lighting, and patrols
- **Multi-Platform**: Works on iOS, Android, and Web

## 🏗️ Technology Stack

### Frontend (Mobile App)

- **Framework**: React Native with Expo
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **Maps**: React Native Maps
- **Storage**: AsyncStorage for offline caching
- **HTTP Client**: Axios

### Backend (API Server)

- **Runtime**: Node.js
- **Framework**: Express.js
- **External APIs**:
  - Geoapify Places API (parking data)
  - OpenAI GPT (natural language processing)
- **Architecture**: RESTful API with service-controller pattern

## 📁 Project Structure

```
SmartParkingProject/
├── backend/                    # Node.js + Express backend
│   ├── config/                 # Configuration files
│   ├── controllers/            # Request handlers
│   ├── routes/                 # API routes
│   ├── services/               # Business logic (Geoapify, OpenAI)
│   ├── utils/                  # Utilities and mock data
│   ├── .env                    # Environment variables
│   ├── package.json            # Backend dependencies
│   └── server.js               # Server entry point
│
├── src/                        # React Native frontend
│   ├── components/             # Reusable UI components
│   ├── screens/                # Screen components
│   ├── navigation/             # Navigation configuration
│   ├── store/                  # Redux store and slices
│   │   └── slices/             # Redux slices (parking, ai, user)
│   ├── services/               # API service layer
│   ├── constants/              # Constants and configuration
│   ├── hooks/                  # Custom React hooks
│   ├── utils/                  # Utility functions
│   └── styles/                 # Global styles
│
├── assets/                     # Images, fonts, icons
├── App.js                      # Main app component
├── package.json                # Frontend dependencies
└── .env                        # Frontend environment variables
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator
- Expo Go app (for physical devices)

### Installation

1. **Clone or navigate to the project**

   ```bash
   cd /Users/nikhilkoli/Downloads/SmartParkingProject
   ```

2. **Install frontend dependencies**

   ```bash
   npm install
   ```

3. **Install backend dependencies**

   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Configure environment variables**

   Frontend (`.env`):

   ```
   BACKEND_URL=http://localhost:3000
   GEOAPIFY_API_KEY=your_geoapify_key
   ```

   Backend (`backend/.env`):

   ```
   PORT=3000
   GEOAPIFY_API_KEY=your_geoapify_key
   OPENAI_API_KEY=your_openai_api_key_here
   NODE_ENV=development
   ```

   **Note**: Replace `your_openai_api_key_here` with your actual OpenAI API key for AI features.

### Running the Application

#### Option 1: Run Both (Recommended)

```bash
npm run dev
```

This starts both the backend server and Expo dev server concurrently.

#### Option 2: Run Separately

**Terminal 1 - Backend:**

```bash
npm run backend
# or
cd backend && node server.js
```

**Terminal 2 - Frontend:**

```bash
npm start
```

### Testing on Devices

#### Physical Device (Recommended)

1. Install Expo Go app:

   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Android Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Scan the QR code from terminal:
   - iOS: Use Camera app
   - Android: Use Expo Go app

#### Emulator/Simulator

- Press `a` for Android emulator
- Press `i` for iOS simulator (Mac only)

## 🔑 API Keys Setup

### Geoapify API (Required)

Already configured with a demo key. For production:

1. Sign up at [https://www.geoapify.com/](https://www.geoapify.com/)
2. Get your API key
3. Update `GEOAPIFY_API_KEY` in both `.env` files

### OpenAI API (Required for AI Features)

1. Sign up at [https://platform.openai.com/](https://platform.openai.com/)
2. Create an API key
3. Add to `backend/.env` as `OPENAI_API_KEY`
4. **Note**: AI features will use fallback parser if not configured

## 📱 Usage

### 1. Search for Parking

- **Current Location**: Tap the location button to search nearby
- **By Address**: Enter an address or place name
- **By AI Query**: Use natural language like "Find cheap parking near SJSU"

### 2. Filter Results

- Price range (cheap, moderate, expensive)
- Features (covered, EV charging, disabled access, etc.)
- Availability threshold
- Sort by distance, price, availability, or safety

### 3. View Details

- Tap any parking spot to see:
  - Full address and directions
  - Pricing (hourly, daily, monthly)
  - Capacity and real-time availability
  - Features and amenities
  - Safety rating and security info

### 4. AI Assistant

- Open AI chat interface
- Ask questions naturally:
  - "Where's the safest parking near downtown?"
  - "Find overnight parking with EV charging"
  - "Show me the top 5 cheapest spots around SJSU"

### 5. Favorites

- Star parking spots to save them
- Quick access from Favorites tab
- Persists between app sessions

## 🧪 API Endpoints

### Parking Endpoints

```
GET  /api/parking/search?lat=37.3352&lon=-121.8811&radius=5000&limit=20
GET  /api/parking/search-by-address?address=SJSU&limit=20
GET  /api/parking/:id
POST /api/parking/filter
```

### AI Endpoints

```
POST /api/ai/query              # Process natural language query
GET  /api/ai/suggestions        # Get query suggestions
```

### Health Check

```
GET  /health                    # Server health check
```

## 🎨 UI/UX Features

- **Material Design** principles for Android
- **Apple HIG** guidelines for iOS
- **Responsive layouts** for different screen sizes
- **Loading states** and **error handling**
- **Pull-to-refresh** functionality
- **Smooth animations** and transitions
- **Accessibility** support

## 📊 Data Structure

### Parking Spot Object

```javascript
{
  id: string,
  name: string,
  address: string,
  coordinates: { latitude: number, longitude: number },
  type: 'surface' | 'multi-storey' | 'underground',
  capacity: number,
  availableSpots: number,
  availability: number, // percentage
  pricing: {
    hourly: number,
    daily: number,
    monthly: number,
    currency: 'USD'
  },
  features: {
    covered: boolean,
    security: boolean,
    ev_charging: boolean,
    disabled_access: boolean,
    bike_parking: boolean
  },
  safetyRating: {
    score: number, // 0-5
    lighting: boolean,
    security_cameras: boolean,
    security_patrol: boolean
  },
  distance: number // km from user
}
```

## 🔄 Offline Mode

The app automatically caches:

- Last search results
- Favorite parking spots
- Recent search queries
- User preferences

Data is stored using AsyncStorage and persists between sessions.

## 🐛 Troubleshooting

### Backend won't start

```bash
cd backend
rm -rf node_modules package-lock.json
npm install
node server.js
```

### Maps not showing

- Ensure location permissions are granted
- Check that React Native Maps is properly installed
- For iOS: `cd ios && pod install`

### AI features not working

- Verify OpenAI API key is set in `backend/.env`
- Check backend logs for AI-related errors
- App will use fallback parser if OpenAI is unavailable

### Can't connect to backend

- Ensure backend is running on port 3000
- Update `BACKEND_URL` in `.env` if using different port
- For physical devices, use your computer's IP instead of localhost

## 🚧 Future Enhancements

- [ ] Real-time availability updates via WebSocket
- [ ] In-app navigation to parking spots
- [ ] Payment integration for reservations
- [ ] User reviews and ratings
- [ ] Push notifications for parking availability
- [ ] AR view for finding spots in garages
- [ ] Multi-language support
- [ ] Dark mode theme

## 📝 Development Notes

### Adding New Features

1. Backend: Add route → controller → service
2. Frontend: Add slice → service → component → screen
3. Update types/constants as needed
4. Test offline functionality

### Testing

```bash
# Frontend
npm test

# Backend
cd backend && npm test
```

## 📄 License

This project is for educational purposes (SJSU CMPE 277 project).

## 👥 Contributors

- Nikhil Koli - Full Stack Development

## 🙏 Acknowledgments

- Geoapify for parking data API
- OpenAI for natural language processing
- React Native and Expo communities
- San Jose State University CMPE 277

---

**Need Help?** Check the troubleshooting section or review the API documentation in the backend code.

update config jsj with backend url if running on this mac run: ipconfig getifaddr en0 || ipconfig getifaddr en1
to get the ipaddress and replace in config.js

npx kill-port 3000 : if anythin runnin on port 3000
