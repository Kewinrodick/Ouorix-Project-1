import React, { createContext, useContext, useState } from 'react'

const LanguageContext = createContext()

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

const translations = {
  en: {
    // Header
    logo: 'LOGO',
    lang: 'LANG',
    
    // Hero Section
    safety: 'Your Safety',
    priority: 'Our Priority',
    heroSubtitle: 'Ensuring security and peace of mind for everyone',
    
    // Buttons Section
    choosePortal: 'Choose Your Portal',
    accessServices: 'Access the services you need with just one click',
    tourist: 'TOURIST',
    touristDesc: 'Travel Information & Safety',
    police: 'POLICE',
    policeDesc: 'Emergency & Law Enforcement',
    tourismDept: 'TOURISM DEPT',
    tourismDeptDesc: 'Government Services & Support',
    
    // Footer
    copyright: '© 2024 Safety Portal. All rights reserved.',
    footerSubtitle: 'Your safety is our top priority',
    
    // Placeholder Pages
    touristPage: 'Tourist Page',
    policePage: 'Police Page',
    tourismDeptPage: 'Tourism Department Page'
  },
  ta: {
    // Header
    logo: 'லோகோ',
    lang: 'மொழி',
    
    // Hero Section
    safety: 'உங்கள் பாதுகாப்பு',
    priority: 'எங்கள் முன்னுரிமை',
    heroSubtitle: 'அனைவருக்கும் பாதுகாப்பு மற்றும் மன அமைதியை உறுதி செய்கிறோம்',
    
    // Buttons Section
    choosePortal: 'உங்கள் போர்டலை தேர்ந்தெடுக்கவும்',
    accessServices: 'உங்களுக்குத் தேவையான சேவைகளை ஒரு கிளிக்கில் அணுகவும்',
    tourist: 'சுற்றுலா',
    touristDesc: 'பயண தகவல் மற்றும் பாதுகாப்பு',
    police: 'காவல்துறை',
    policeDesc: 'அவசரகால மற்றும் சட்ட அமலாக்கம்',
    tourismDept: 'சுற்றுலா துறை',
    tourismDeptDesc: 'அரசு சேவைகள் மற்றும் ஆதரவு',
    
    // Footer
    copyright: '© 2024 பாதுகாப்பு போர்டல். அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.',
    footerSubtitle: 'உங்கள் பாதுகாப்பே எங்கள் முதல் முன்னுரிமை',
    
    // Placeholder Pages
    touristPage: 'சுற்றுலா பக்கம்',
    policePage: 'காவல்துறை பக்கம்',
    tourismDeptPage: 'சுற்றுலா துறை பக்கம்'
  },
  hi: {
    // Header
    logo: 'लोगो',
    lang: 'भाषा',
    
    // Hero Section
    safety: 'आपकी सुरक्षा',
    priority: 'हमारी प्राथमिकता',
    heroSubtitle: 'सभी के लिए सुरक्षा और मन की शांति सुनिश्चित करना',
    
    // Buttons Section
    choosePortal: 'अपना पोर्टल चुनें',
    accessServices: 'एक क्लिक में आपकी आवश्यक सेवाओं तक पहुंचें',
    tourist: 'पर्यटक',
    touristDesc: 'यात्रा जानकारी और सुरक्षा',
    police: 'पुलिस',
    policeDesc: 'आपातकाल और कानून प्रवर्तन',
    tourismDept: 'पर्यटन विभाग',
    tourismDeptDesc: 'सरकारी सेवाएं और सहायता',
    
    // Footer
    copyright: '© 2024 सुरक्षा पोर्टल। सभी अधिकार सुरक्षित।',
    footerSubtitle: 'आपकी सुरक्षा हमारी सर्वोच्च प्राथमिकता है',
    
    // Placeholder Pages
    touristPage: 'पर्यटक पृष्ठ',
    policePage: 'पुलिस पृष्ठ',
    tourismDeptPage: 'पर्यटन विभाग पृष्ठ'
  },
  kn: {
    // Header
    logo: 'ಲೋಗೋ',
    lang: 'ಭಾಷೆ',
    
    // Hero Section
    safety: 'ನಿಮ್ಮ ಸುರಕ್ಷತೆ',
    priority: 'ನಮ್ಮ ಆದ್ಯತೆ',
    heroSubtitle: 'ಎಲ್ಲರಿಗೂ ಸುರಕ್ಷತೆ ಮತ್ತು ಮನಸ್ಸಿನ ಶಾಂತಿಯನ್ನು ಖಚಿತಪಡಿಸುವುದು',
    
    // Buttons Section
    choosePortal: 'ನಿಮ್ಮ ಪೋರ್ಟಲ್ ಆಯ್ಕೆಮಾಡಿ',
    accessServices: 'ಒಂದು ಕ್ಲಿಕ್ನಲ್ಲಿ ನಿಮಗೆ ಬೇಕಾದ ಸೇವೆಗಳನ್ನು ಪ್ರವೇಶಿಸಿ',
    tourist: 'ಪ್ರವಾಸಿ',
    touristDesc: 'ಪ್ರವಾಸ ಮಾಹಿತಿ ಮತ್ತು ಸುರಕ್ಷತೆ',
    police: 'ಪೊಲೀಸ್',
    policeDesc: 'ತುರ್ತು ಮತ್ತು ಕಾನೂನು ಜಾರಿ',
    tourismDept: 'ಪ್ರವಾಸೋದ್ಯಮ ಇಲಾಖೆ',
    tourismDeptDesc: 'ಸರ್ಕಾರಿ ಸೇವೆಗಳು ಮತ್ತು ಬೆಂಬಲ',
    
    // Footer
    copyright: '© 2024 ಸುರಕ್ಷತೆ ಪೋರ್ಟಲ್. ಎಲ್ಲಾ ಹಕ್ಕುಗಳು ಕಾಪಾಡಲಾಗಿದೆ.',
    footerSubtitle: 'ನಿಮ್ಮ ಸುರಕ್ಷತೆ ನಮ್ಮ ಮೊದಲ ಆದ್ಯತೆ',
    
    // Placeholder Pages
    touristPage: 'ಪ್ರವಾಸಿ ಪುಟ',
    policePage: 'ಪೊಲೀಸ್ ಪುಟ',
    tourismDeptPage: 'ಪ್ರವಾಸೋದ್ಯಮ ಇಲಾಖೆ ಪುಟ'
  },
  te: {
    // Header
    logo: 'లోగో',
    lang: 'భాష',
    
    // Hero Section
    safety: 'మీ భద్రత',
    priority: 'మా ప్రాధాన్యత',
    heroSubtitle: 'అందరికీ భద్రత మరియు మనస్సు శాంతిని నిర్ధారించడం',
    
    // Buttons Section
    choosePortal: 'మీ పోర్టల్‌ను ఎంచుకోండి',
    accessServices: 'ఒక క్లిక్‌తో మీకు అవసరమైన సేవలను యాక్సెస్ చేయండి',
    tourist: 'పర్యాటకుడు',
    touristDesc: 'ప్రయాణ సమాచారం మరియు భద్రత',
    police: 'పోలీసు',
    policeDesc: 'అత్యవసర మరియు చట్ట అమలు',
    tourismDept: 'పర్యాటక శాఖ',
    tourismDeptDesc: 'ప్రభుత్వ సేవలు మరియు మద్దతు',
    
    // Footer
    copyright: '© 2024 భద్రత పోర్టల్. అన్ని హక్కులు రక్షించబడ్డాయి.',
    footerSubtitle: 'మీ భద్రత మా మొదటి ప్రాధాన్యత',
    
    // Placeholder Pages
    touristPage: 'పర్యాటకుడు పేజీ',
    policePage: 'పోలీసు పేజీ',
    tourismDeptPage: 'పర్యాటక శాఖ పేజీ'
  }
}

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు', flag: '🇮🇳' }
]

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en')
  
  const changeLanguage = (langCode) => {
    setCurrentLanguage(langCode)
  }
  
  const t = (key) => {
    return translations[currentLanguage][key] || translations.en[key] || key
  }
  
  const value = {
    currentLanguage,
    changeLanguage,
    t,
    languages
  }
  
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}
