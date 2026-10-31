import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Institutions from "./pages/Institutions";
import FDRManagement from "./pages/FDRManagement";
import Documents from "./pages/Documents";
import Verification from "./pages/Verification";
import MaturityAlerts from "./pages/MaturityAlerts";
import RenewalRelease from "./pages/RenewalRelease";
import Reports from "./pages/Reports";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { getFDRRecords } from "./services/api";
import "./App.css";

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [fdrRecords, setFdrRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const token = localStorage.getItem("securedeposit_token");
      const user = JSON.parse(
        localStorage.getItem("securedeposit_current_user") || "null"
      );

      return token && user ? user : null;
    } catch {
      return null;
    }
  });

  const getAuthPageFromURL = () => {
    if (window.location.pathname === "/register") return "register";
    return "login";
  };

  const [authPage, setAuthPage] = useState(getAuthPageFromURL);

  function navigate(path) {
    if (window.location.pathname !== path) {
      window.history.pushState({}, "", path);
    }
  }

  useEffect(() => {
    function handlePopState() {
      const path = window.location.pathname;

      if (path === "/register") {
        setAuthPage("register");
      } else if (path === "/login") {
        setAuthPage("login");
      } else if (path === "/dashboard") {
        if (currentUser) {
          setActivePage("Dashboard");
        } else {
          setAuthPage("login");
          navigate("/login");
        }
      }
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    let cancelled = false;

    async function loadFDRRecords() {
      setLoading(true);
      setError("");

      try {
        const records = await getFDRRecords();

        if (!cancelled) {
          setFdrRecords(records);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            "Unable to load FDR records. Check that the backend server is running."
          );
          console.error(err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadFDRRecords();

    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  function handleLogin(user) {
    const safeUser = {
      name: user.name,
      email: user.email,
    };

    localStorage.setItem(
      "securedeposit_current_user",
      JSON.stringify(safeUser)
    );

    setCurrentUser(safeUser);
    setActivePage("Dashboard");
    setError("");
    navigate("/dashboard");
  }

  function handleRegister() {
    setAuthPage("login");
    navigate("/login");
  }

  function openRegister() {
    setAuthPage("register");
    navigate("/register");
  }

  function openLogin() {
    setAuthPage("login");
    navigate("/login");
  }

  function handleLogout() {
    localStorage.removeItem("securedeposit_current_user");
    localStorage.removeItem("securedeposit_token");

    setCurrentUser(null);
    setFdrRecords([]);
    setError("");
    setAuthPage("login");
    navigate("/login");
  }

  const renderPage = () => {
    if (loading) {
      return (
        <div className="page-content">
          <p>Loading FDR records...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="page-content">
          <p role="alert">{error}</p>
          <button onClick={() => window.location.reload()}>
            Try again
          </button>
        </div>
      );
    }

    switch (activePage) {
      case "Dashboard":
        return (
          <Dashboard
            fdrRecords={fdrRecords}
            setActivePage={setActivePage}
          />
        );

      case "Institutions":
        return <Institutions fdrRecords={fdrRecords} />;

      case "FDR Management":
        return (
          <FDRManagement
            fdrRecords={fdrRecords}
            setFdrRecords={setFdrRecords}
          />
        );

      case "Documents":
        return <Documents fdrRecords={fdrRecords} />;

      case "Verification":
        return (
          <Verification
            fdrRecords={fdrRecords}
            setFdrRecords={setFdrRecords}
          />
        );

      case "Maturity Alerts":
        return <MaturityAlerts fdrRecords={fdrRecords} />;

      case "Renewal & Release":
        return (
          <RenewalRelease
            fdrRecords={fdrRecords}
            setFdrRecords={setFdrRecords}
          />
        );

      case "Reports":
        return <Reports fdrRecords={fdrRecords} />;

      default:
        return (
          <Dashboard
            fdrRecords={fdrRecords}
            setActivePage={setActivePage}
          />
        );
    }
  };

  if (!currentUser) {
    if (
      window.location.pathname !== "/login" &&
      window.location.pathname !== "/register"
    ) {
      navigate("/login");
    }

    return authPage === "register" ? (
      <Register onRegister={handleRegister} onLogin={openLogin} />
    ) : (
      <Login onLogin={handleLogin} onRegister={openRegister} />
    );
  }

  if (
    window.location.pathname === "/login" ||
    window.location.pathname === "/register" ||
    window.location.pathname === "/"
  ) {
    navigate("/dashboard");
  }

  return (
    <div className="app-container">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      <main className="main-content">
        <Header activePage={activePage} />

        <div className="user-session-bar">
          <span>
            Logged in as <strong>{currentUser.name}</strong>
          </span>

          <button type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {renderPage()}
      </main>
    </div>
  );
}

export default App;