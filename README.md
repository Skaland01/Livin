# Livin - Shared Household Cleaning App

A minimal, professional, cross-platform mobile app for fair rotation of cleaning responsibilities among housemates, particularly student collectives.

## Features

### ✅ Implemented
- **Authentication**: Email/password authentication with Firebase Auth
- **Rotation Algorithm**: Deterministic, fair task assignment system
- **Core Architecture**: React Native + Expo with TypeScript
- **State Management**: Zustand for global state
- **UI Components**: Reusable components with minimalist design
- **Navigation**: Stack and bottom tab navigation
- **Testing**: Jest unit tests for core rotation algorithm
- **Theme System**: Dark/light theme support with design tokens

### 🚧 In Progress / Placeholder
- **Household Management**: Create/join households, admin controls
- **Room Configuration**: Add/edit rooms with preset task lists
- **Task Completion**: Mark tasks as done, track progress
- **Notifications**: Weekly reminders and late-day nudges
- **Shopping List**: Placeholder for future feature
- **Profile Management**: User settings and preferences

## Tech Stack

- **Frontend**: React Native + Expo (TypeScript)
- **Backend**: Firebase (Authentication, Firestore, Cloud Functions, Storage)
- **State Management**: Zustand
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **Styling**: NativeWind (Tailwind CSS)
- **Forms**: React Hook Form + Zod validation
- **Date/Time**: Day.js with timezone support
- **Testing**: Jest + React Native Testing Library
- **Notifications**: Expo Notifications

## Project Structure

```
src/
├── app/                    # Main app components
│   ├── navigation/         # Navigation setup
│   └── screens/           # Screen components
│       ├── AuthScreens/   # Authentication screens
│       └── ...            # Other screens
├── components/            # Reusable UI components
│   └── Tabs/             # Tab-related components
├── config/               # Configuration files
├── hooks/                # Custom React hooks
├── lib/                  # Core utilities and types
├── services/             # Firebase service functions
├── state/                # Zustand store
├── theme/                # Design system
└── tests/                # Unit tests
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- Firebase project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Livin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Setup**
   - Create a Firebase project
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Enable Cloud Functions
   - Enable Storage

4. **Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

5. **Run the app**
   ```bash
   npm start
   ```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Core Features

### Rotation Algorithm

The app uses a deterministic rotation algorithm that ensures fair task assignment:

- **Fair Distribution**: Handles cases where N ≠ M (members ≠ rooms)
- **Deterministic**: Same inputs always produce same outputs
- **Week-based**: Assignments rotate weekly
- **Robust**: Handles member/room changes gracefully

```typescript
// Example usage
const assignments = computeAssignments(
  ['user1', 'user2', 'user3'],  // members
  ['kitchen', 'bathroom'],      // rooms
  0                             // week index
);
```

### Data Model

**Users**: Profile information, notification settings
**Households**: Group information, admin controls, join codes
**Rooms**: Room configuration with preset task lists
**Assignments**: Weekly task assignments using rotation algorithm
**Completions**: Task completion tracking and history

### UI/UX Design

- **Minimalist**: Clean, uncluttered interface
- **Accessible**: High contrast, readable typography
- **Responsive**: Works on various screen sizes
- **Dark Theme**: Primary theme with light theme support
- **Rounded Corners**: Modern, friendly appearance

## Development Guidelines

### Code Style

- **TypeScript**: Strict typing throughout
- **Functional Components**: Use React hooks
- **Custom Hooks**: Encapsulate business logic
- **Component Composition**: Reusable, composable components
- **Error Handling**: Comprehensive error boundaries

### Testing Strategy

- **Unit Tests**: Core business logic (rotation algorithm)
- **Integration Tests**: Firebase service functions
- **Component Tests**: UI component behavior
- **E2E Tests**: Critical user flows (future)

### State Management

- **Zustand**: Lightweight, simple state management
- **Local State**: Component-specific state
- **Global State**: User, household, theme data
- **Computed State**: Derived values (admin status, assignments)

## Deployment

### Expo EAS Build

1. **Install EAS CLI**
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Configure EAS**
   ```bash
   eas build:configure
   ```

3. **Build for platforms**
   ```bash
   eas build --platform ios
   eas build --platform android
   ```

### Firebase Deployment

1. **Deploy Cloud Functions**
   ```bash
   firebase deploy --only functions
   ```

2. **Update Security Rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or issues, please open a GitHub issue or contact the development team.

---

**Note**: This is a work in progress. Some features are implemented as placeholders and will be completed in future iterations.
