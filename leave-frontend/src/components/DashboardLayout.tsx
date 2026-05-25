import { useState } from "react";
import type { UserProfile } from "../auth";
import type { DashboardTab } from "./DashboardPage";
import DashboardTabPanel from "./DashboardTabPanel";

function DashboardLayout({
  activeTab,
  tabs,
  title,
  user,
  onLogout,
  onSelectTab,
}: {
  activeTab: string;
  tabs: DashboardTab[];
  title: string;
  user: UserProfile;
  onLogout: () => void;
  onSelectTab: (tab: string) => void;
}) {
  const displayName = user.fullname || user.fullName || user.username;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  function handleSelectTab(tab: string) {
    onSelectTab(tab);
    setIsSidebarOpen(false);
  }

  function handleConfirmLogout() {
    setIsLogoutConfirmOpen(false);
    onLogout();
  }

  return (
    <main className="dashboard-shell">
      <aside className={`dashboard-sidebar ${isSidebarOpen ? "is-open" : ""}`}>
        <div className="dashboard-sidebar-header">
          <div>
            <p className="dashboard-eyebrow">Leave Management</p>
            <h1>{title}</h1>
          </div>

          <button
            type="button"
            className="dashboard-menu-button"
            aria-label={
              isSidebarOpen ? "Close dashboard menu" : "Open dashboard menu"
            }
            aria-controls="dashboard-tabs"
            aria-expanded={isSidebarOpen}
            onClick={() => setIsSidebarOpen((isOpen) => !isOpen)}
          >
            <span aria-hidden="true" className="dashboard-menu-icon">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>

        <nav
          id="dashboard-tabs"
          className="dashboard-tabs"
          aria-label="Dashboard tabs"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={activeTab === tab.id ? "active" : ""}
              onClick={() => handleSelectTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setIsSidebarOpen(false);
              setIsLogoutConfirmOpen(true);
            }}
          >
            Logout
          </button>
        </nav>
      </aside>

      <section className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-eyebrow">{user.role}</p>
            <h2>{displayName}</h2>
          </div>
          <span>{user.email}</span>
        </header>

        <DashboardTabPanel activeTab={activeTab} user={user} />
      </section>

      {isLogoutConfirmOpen ? (
        <div
          className="logout-modal-backdrop"
          role="presentation"
          onClick={() => setIsLogoutConfirmOpen(false)}
        >
          <div
            className="logout-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 id="logout-modal-title">Log out?</h3>
            <p>Are you sure you want to log out?</p>

            <div className="logout-modal-actions">
              <button
                type="button"
                className="logout-modal-cancel"
                onClick={() => setIsLogoutConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="logout-modal-confirm"
                onClick={handleConfirmLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

export default DashboardLayout;
