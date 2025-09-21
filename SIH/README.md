# Tourist Digital ID Registration System

A React.js multi-step form application for Tourist Digital ID generation, built with Tailwind CSS and react-hook-form.

## Features

- **Multi-step Form**: 4-step registration process for comprehensive data collection
- **Form Validation**: Client-side validation using react-hook-form
- **Responsive Design**: Clean, modern UI with Tailwind CSS
- **Progress Tracking**: Visual progress indicator for form completion
- **Data Persistence**: Form data is maintained across steps
- **Multi-language Support**: Integrated with existing language context

## Form Steps

### Step 1: Personal Information
- Full Name (required)
- Email Address (required)
- Phone Number (required)
- ID Type (dropdown: Aadhaar, Passport, Driving License, Voter ID) (required)
- ID Number (required)
- Nationality (dropdown) (required)
- Date of Birth (required)
- Gender (optional)
- Address (text input)

### Step 2: Travel Details
- Arrival Date (required)
- Departure Date (required)
- Purpose of Visit (dropdown: Tourism, Business, Medical, Education, Other) (required)
- Planned Itinerary (textarea, required)
- Accommodation Details (required)
- Mode of Transport (optional)
- Group Size (required)
- Travel Insurance Details (optional)

### Step 3: Emergency Contacts
- Primary Emergency Contact (Name, Phone, Email, Relationship, Address)
- Secondary Emergency Contact (optional, same fields)
- Local Contact (guide/tour operator, or local friend/relative)

### Step 4: Safety & Consent
- Medical Information (allergies, conditions, medications, blood group)
- Required Consent Checkboxes:
  - Real-time location tracking
  - Share location with emergency contacts
  - Receive safety alerts
  - Accept terms & conditions
  - Accept privacy policy
- Preferred Language for alerts (required)
- Special Requirements (optional)

## Project Structure

```
src/
├── components/
│   ├── Step1PersonalInfo.jsx
│   ├── Step2TravelDetails.jsx
│   ├── Step3EmergencyContacts.jsx
│   ├── Step4SafetyConsent.jsx
│   └── TouristFormLayout.jsx
├── contexts/
│   └── LanguageContext.jsx
├── App.jsx
├── LandingPage.jsx
├── main.jsx
└── index.css
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

4. Click on the "Tourist" button to access the registration form

## Usage

1. Navigate to the landing page
2. Click on the "Tourist" button
3. Complete the 4-step registration form:
   - Fill in personal information
   - Provide travel details
   - Add emergency contacts
   - Review and accept safety consents
4. Submit the form to generate your Tourist Digital ID

## Form Submission

Upon successful submission:
- All form data is merged and logged to the console
- A success alert is displayed: "Form Submitted! Tourist ID Generated."
- The form resets for new registrations

## Technologies Used

- **React.js** - Frontend framework
- **react-hook-form** - Form handling and validation
- **Tailwind CSS** - Styling and responsive design
- **React Router** - Navigation and routing
- **Vite** - Build tool and development server

## Dependencies

- react: ^18.2.0
- react-dom: ^18.2.0
- react-router-dom: ^6.15.0
- react-hook-form: ^7.47.0

## Development Dependencies

- @vitejs/plugin-react: ^4.0.0
- tailwindcss: ^3.3.0
- autoprefixer: ^10.4.14
- postcss: ^8.4.24
- vite: ^4.4.0
