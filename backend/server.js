const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const cron = require("node-cron");

const Event = require("./models/Event");
const User = require("./models/User");
const TicketClick = require("./models/TicketClick");
const scrapeTimeOut = require("./scraper/timeOutScraper");

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || "your-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
app.use(passport.initialize());
app.use(passport.session());

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ 
    message: "Sydney Events API is running!",
    status: "healthy",
    timestamp: new Date().toISOString()
  });
});

// Passport configuration
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || "demo-client-id",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || "demo-client-secret",
  callbackURL: process.env.GOOGLE_CALLBACK_URL || "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = await User.create({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        avatar: profile.photos[0].value
      });
    }
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Auth middleware
const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Authentication required" });
};

// Demo login route for testing (remove in production)
app.post("/auth/demo-login", async (req, res) => {
  try {
    let user = await User.findOne({ email: "demo@example.com" });
    if (!user) {
      user = await User.create({
        googleId: "demo-123",
        name: "Demo User",
        email: "demo@example.com",
        avatar: "https://via.placeholder.com/150"
      });
    }
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ error: "Login failed" });
      }
      res.json({ success: true, user });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Routes
app.get("/auth/google", (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === "demo-client-id") {
    return res.status(400).json({ 
      error: "Google OAuth not configured. Please set up GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in environment variables." 
    });
  }
  passport.authenticate("google", {
    scope: ["profile", "email"]
  })(req, res);
});

app.get("/auth/google/callback", 
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    res.redirect(`${frontendUrl}/dashboard`);
  }
);

app.get("/auth/logout", (req, res) => {
  req.logout(() => {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    res.redirect(frontendUrl);
  });
});

app.get("/auth/user", (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
});

// Public API - Events for frontend
app.get("/api/events", async (req, res) => {
  try {
    const { city = "Sydney", search, dateFrom, dateTo, page = 1, limit = 20 } = req.query;
    
    const query = { city };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { venueName: { $regex: search, $options: "i" } }
      ];
    }
    
    if (dateFrom || dateTo) {
      query.dateTime = {};
      if (dateFrom) query.dateTime.$gte = new Date(dateFrom);
      if (dateTo) query.dateTime.$lte = new Date(dateTo);
    }
    
    const events = await Event.find(query)
      .sort({ dateTime: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
      
    const total = await Event.countDocuments(query);
    
    res.json({
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ticket click tracking
app.post("/api/ticket-click", async (req, res) => {
  try {
    const { email, consent, eventId } = req.body;
    
    const ticketClick = await TicketClick.create({
      email,
      consent,
      eventId
    });
    
    res.json({ success: true, ticketClick });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dashboard API (protected)
app.get("/api/dashboard/events", requireAuth, async (req, res) => {
  try {
    const { city = "Sydney", search, dateFrom, dateTo, status } = req.query;
    
    const query = { city };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { venueName: { $regex: search, $options: "i" } }
      ];
    }
    
    if (dateFrom || dateTo) {
      query.dateTime = {};
      if (dateFrom) query.dateTime.$gte = new Date(dateFrom);
      if (dateTo) query.dateTime.$lte = new Date(dateTo);
    }
    
    if (status) {
      query.status = status;
    }
    
    const events = await Event.find(query)
      .populate("importedBy", "name email")
      .sort({ createdAt: -1 });
      
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/dashboard/events/:id/import", requireAuth, async (req, res) => {
  try {
    const { importNotes } = req.body;
    
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      {
        status: "imported",
        importedAt: new Date(),
        importedBy: req.user._id,
        importNotes
      },
      { new: true }
    ).populate("importedBy", "name email");
    
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stats endpoint
app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
  try {
    const stats = await Event.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);
    
    const totalEvents = await Event.countDocuments();
    const totalClicks = await TicketClick.countDocuments();
    
    res.json({
      statusCounts: stats,
      totalEvents,
      totalClicks
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Connect to MongoDB and start server
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sydneyEvents";

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log("MongoDB Connected");
    
    // Schedule scraping every 6 hours (only in production)
    if (process.env.NODE_ENV === 'production') {
      cron.schedule("0 */6 * * *", async () => {
        console.log("Running scheduled scrape...");
        try {
          await scrapeTimeOut();
        } catch (error) {
          console.error("Scheduled scrape error:", error.message);
        }
      });
    }
    
    // Run initial scrape (with delay and error handling)
    setTimeout(async () => {
      try {
        console.log("Starting initial scrape...");
        await scrapeTimeOut();
        console.log("Initial scrape completed");
      } catch (error) {
        console.error("Initial scrape error:", error.message);
      }
    }, 5000); // Wait 5 seconds before scraping
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    });
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
