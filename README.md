# E-Cure Earth | Full-Stack E-Waste Management SaaS

E-Cure Earth is a premium, state-of-the-art SaaS platform designed to tackle the global e-waste crisis. It connects e-waste generators (individuals and businesses) with certified recyclers, providing a seamless marketplace for used electronics and a robust tracking system for environmental impact.

## ✨ Key Features

- **💎 Premium Dark Glassmorphism UI**: A stunning, modern interface built with smooth animations and high-depth glass effects.
- **🔒 Secure Authentication**: Full JWT-based authentication system with encrypted password storage.
- **📊 Impact Dashboard**: Real-time visualization of recycled devices, CO₂ emissions prevented, and Green Points earned.
- **🏪 Electronics Marketplace**: Peer-to-peer platform to buy and sell used electronics, extending device lifecycles.
- **🚛 Pickup Scheduling**: Integrated system to find nearby certified collectors and book doorstep pickups.
- **💳 SaaS Pricing Model**: Tiered subscription plans (Free, Pro, Business) to support platform scaling.

## 🏗️ Technical Architecture

### Frontend
- **Languages**: HTML5, Vanilla CSS3, Modern JavaScript (ES6+)
- **Design System**: Custom CSS Glassmorphism framework
- **Logic**: Centralized API layer (`app.js`) handling all REST communications

### Backend
- **Engine**: Node.js & Express.js
- **Database**: JSON-based file storage (optimized for speed and zero-config setup)
- **Security**: JWT (JSON Web Tokens) for sessions, Bcrypt for password hashing
- **Port**: Defaulting to `3001` to avoid common development conflicts

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v14 or higher)
- npm (Node Package Manager)

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Yash-Choubey09/e-waste-frontend.git
   ```

2. **Navigate to the backend**
   ```bash
   cd e-waste-frontend/backend
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start the server**
   ```bash
   node server.js
   ```

5. **Access the platform**
   Open your browser and navigate to: `http://localhost:3001/index.html`

## 📂 Project Structure

```
e-waste-frontend/
├── backend/            # Node.js Express server
│   ├── data/           # JSON Database files
│   ├── middleware/     # Auth & validation logic
│   └── routes/         # API Endpoints
├── styles.css          # Core Design System
├── app.js              # Frontend API Integration
├── index.html          # Hero & Landing
├── auth.html           # Login & Registration
├── dashboard.html      # User Metrics
├── marketplace.html    # P2P Commerce
├── collectors.html     # Partner Finder
└── pricing.html        # SaaS Tiering
```

## 🌍 Future Roadmap
- [ ] Integration with MongoDB for production-grade scaling.
- [ ] Live payment gateway integration (Stripe/Razorpay) on the Pricing page.
- [ ] AI-powered e-waste classification from photos.
- [ ] Real-time Leaflet.js map integration for collectors.

---
Developed with 💚 for a sustainable future.
