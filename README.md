<p align="center">
  <img src="https://raw.githubusercontent.com/wtwildnateis/unit-2-project-the-riders-almanac/refs/heads/main/ReadMeMedia/RAHeader.gif" 
    alt="The Rider's Almanac Banner"
    width="2000"
    />
</p>


<p align="center"><em>A full-stack cycling community platform with events, maps, and message boards.</em></p>


<p align="center">
  <img src="https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" />
  <img src="https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" />
  <img src="https://img.shields.io/badge/Lombok-CA2C92?style=for-the-badge&logo=lombok&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=000000" />
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=000000" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=ffffff" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=ffffff" />
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=ffffff" />
  <img src="https://img.shields.io/badge/Google_Maps-4285F4?style=for-the-badge&logo=googlemaps&logoColor=ffffff" />
  <img src="https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=ffffff" />
  <img src="https://img.shields.io/badge/EmailJS-FFB300?style=for-the-badge&logo=maildotru&logoColor=ffffff" />
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=ffffff" />
  <img src="https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=ffffff" />
  <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=ffffff" />
</p>

---

# 📚 **Table of Contents**
- [🚴‍♂️ The Rider’s Almanac](#%E2%80%8D%EF%B8%8F-the-riders-almanac)
- [🧰 Tech Stack](#-tech-stack)
- [🔑 API Setup](#-api-setup-required-before-running-the-app)
- [📦 Installation & Setup](#-installation--setup)
  - [🛠 Backend Setup](#-backend-setup-spring-boot)
  - [🎨 Frontend Setup](#-frontend-setup-react--vite)
- [🖥️ Preview](#️-preview)
- [🗺️ Wireframes](#️-wireframes)
- [🗃️ ER Diagram](#%EF%B8%8F-er-diagram)
- [🚀 Core Features](#-core-features)
- [🔮 Future Features](#-future-features)
- [🧩 Known Issues / Unsolved Problems](#-known-issues--unsolved-problems)

---

# 🚴‍♂️ **The Rider’s Almanac**

**The Rider’s Almanac** is a full-stack cycling community platform built to help riders plan faster, discover new locations, and stay connected through events, interactive maps, and a dedicated message board. Riders can explore upcoming group rides, BMX jams, MTB events, and meetups, browse a custom dark-themed Google Map with filterable layers, and share content through a modern forum with image uploads and trending posts.

This project was developed as the capstone for LaunchCode’s Unit 2 Full-Stack Program and demonstrates production-level UI polish, solid backend architecture, and real-world problem solving. Every feature — from JWT-secured accounts to Cloudinary image hosting to responsive design — was built with intention, showcasing both engineering capability and visual design strength.

---

# 🧰 **Tech Stack**

### **Languages**
- Java  
- JavaScript  

### **Backend**
- Spring Boot (3.5.x)  
- JPA / Hibernate  
- MySQL  
- Maven  
- JWT Authentication
- Lombok

### **Frontend**
- React (Vite)  
- React Router  
- React-Big-Calendar  
- Tailwind CSS

### **Cloud & APIs**
- Google Maps Platform  
- Cloudinary (image uploads)  
- EmailJS (contact form)  

### **Developer Tools**
- Git & GitHub  
- IntelliJ IDEA  
- VS Code  
- MySQL Workbench  

---

# 🔑 **API Setup (Required Before Running the App)**

> [!NOTE]
> All required APIs offer free usage tiers — you won’t be charged to run this project locally.

Before starting the application, create accounts and API keys for the following services:

### **Google Maps Platform**
Enable:
- Maps JavaScript API  
- Places API  
- Geocoding API  
🔗 https://developers.google.com/maps/documentation/javascript/get-api-key

### **Cloudinary (Image Uploads)**
Your dashboard will provide:  
- `cloud_name`  
- `api_key`  
- `api_secret`  
🔗 https://cloudinary.com/documentation

### **EmailJS (Contact Form)**
You will need:  
- Service ID  
- Template ID  
- Public Key  
🔗 https://www.emailjs.com/docs/

You will place these keys in the `.env` files during installation.

---

# 📦 **Installation & Setup**

Below are instructions for setting up **both the backend and frontend** locally.

---

## 🛠 **Backend Setup (Spring Boot)**

> [!NOTE]  
> The backend uses Lombok for generating getters, setters, and constructors. Make sure your IDE has the Lombok plugin installed and annotation processing enabled, or you may see errors where Lombok-generated code is used.

### **1. Clone the Repository**
```bash
git clone https://github.com/wtwildnateis/unit-2-project-the-riders-almanac
cd unit-2-project-the-riders-almanac
cd Backend/riders-almanac
```

### **2. Open `/Backend` in IntelliJ IDEA**

### **3. Create a MySQL Database**
```sql
CREATE DATABASE riders_almanac;
```

### **4. Configure Application Properties**
Create `application.properties` or use environment variables:

```
spring.datasource.url=jdbc:mysql://localhost:3306/riders_almanac
spring.datasource.username=YOUR_DB_USER
spring.datasource.password=YOUR_DB_PASSWORD

spring.jpa.hibernate.ddl-auto=update

jwt.secret=YOUR_JWT_SECRET

cloudinary.cloud_name=YOUR_CLOUD_NAME
cloudinary.api_key=YOUR_CLOUD_KEY
cloudinary.api_secret=YOUR_CLOUD_SECRET
```

### **5. Run the Backend**
Run:
```
RidersAlmanacApplication
```

Backend available at:  
➡ http://localhost:8080

---

## 🎨 **Frontend Setup (React / Vite)**

### **6. Install Dependencies**
```bash
cd unit-2-project-the-riders-almanac
cd Frontend/the-riders-almanac
npm install
```

### **7. Create `.env` inside `/Frontend`**
```
VITE_GOOGLE_MAPS_API_KEY=YOUR_MAPS_API_KEY
VITE_API_BASE_URL=http://localhost:8080
VITE_EMAILJS_PUBLIC=YOUR_EMAIL_PUBLIC_KEY
VITE_EMAILJS_SERVICE=YOUR_EMAILJS_SERVICE_ID
VITE_EMAILJS_TEMPLATE=YOUR_EMAILJS_TEMPLATE_ID
```

### **8. Start the Dev Server**
```bash
npm run dev
```

Frontend available at:  
➡ http://localhost:5173

---

# 🖥️ **Preview**

**Home Page**

 <img src="https://raw.githubusercontent.com/wtwildnateis/unit-2-project-the-riders-almanac/refs/heads/main/ReadMeMedia/RAHome.gif" 
    alt="Home Page Preview"
    width="2000"
    />

**Events Page**

 <img src="https://raw.githubusercontent.com/wtwildnateis/unit-2-project-the-riders-almanac/refs/heads/main/ReadMeMedia/RACalendar.gif" 
    alt="Events Calendar Preview"
    width="2000"
    />

**Maps Page**

  <img src="https://raw.githubusercontent.com/wtwildnateis/unit-2-project-the-riders-almanac/refs/heads/main/ReadMeMedia/RAMaps.gif" 
    alt="Map Preview"
    width="2000"
    />   

**Community Page**

  <img src="https://raw.githubusercontent.com/wtwildnateis/unit-2-project-the-riders-almanac/refs/heads/main/ReadMeMedia/RAForum.gif" 
    alt="Community Forums Preview"
    width="2000"
    />   
    
---

# 🗺️ **Wireframes**

**Wireframe:**  [Riders Almanac Wireframe](https://drive.google.com/file/d/1bg3MryWXTMra3gUr6yDfx5d2KUbSATAI/view?usp=sharing)

<div align="center">

![Wireframe Preview](https://raw.githubusercontent.com/wtwildnateis/unit-2-project-the-riders-almanac/refs/heads/main/ReadMeMedia/RAWireframe.png)

</div>

---

# 🗃️ **ER Diagram**

**ERD:**  [Riders Almanac ERD](https://drive.google.com/file/d/1n1anVMrgUAtzwci0cIXNDArgGRpWP7c5/view?usp=sharing)

<div align="center">

![ERD Preview](https://raw.githubusercontent.com/wtwildnateis/unit-2-project-the-riders-almanac/refs/heads/main/ReadMeMedia/RAERD.png)

</div>

---

# 🚀 **Core Features**

### 🗓️ Event Calendar
- Create / edit / delete events  
- Strict user ownership  
- Flyer thumbnails + modal previews  
- Auto-refreshing “Upcoming Events” sidebar  

### 🗺️ Interactive Google Map
- Custom dark mode map style  
- Toggleable layers: shops, trails, skateparks, MTB  
- Custom markers & info windows  
- Scroll-lock UX for mobile  

### 💬 Community Message Board
- Full CRUD  
- Tag-based filtering  
- Trending posts algorithm  
- Cloudinary image uploads  
- Responsive lightbox viewer  

### 🔐 Authentication
- JWT-secured login/register  
- Protected routes  
- Ownership-based permissions  

### 📱 Responsive UI
- Custom layout grid  
- Tailwind-inspired theme  
- Film-grain / urban cycling aesthetic  
- Smooth modals, carousels, and transitions  

---

# 🔮 **Future Features**

- User-created map pins (street spots, skate spots, graffiti walls)  
- Event RSVP & attendance system  
- User profiles with ride logs and galleries  
- User generated routes

---

# 🧩 **Known Issues / Unsolved Problems**

- Certain small-screen dimensions require layout tweaks  
- Scroll-lock behavior on modals can be finicky  
- User ability to change info (username, password, etc) currently not wired.
- Admin controls for forum (lock, hide post, ban user) not functional.
- Occasional duplicate trending queries under heavy load
