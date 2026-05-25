import type { UserProfile } from "../auth";

function ProfilePanel({ user }: { user: UserProfile }) {
  const displayName = user.fullname || user.fullName || user.username;

  return (
    <section className="dashboard-panel profile-grid">
      <h3>Profile</h3>
      <dl>
        <div>
          <dt>Full Name</dt>
          <dd>{displayName}</dd>
        </div>
        <div>
          <dt>Username</dt>
          <dd>{user.username}</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>{user.email}</dd>
        </div>
        {/* <div>
          <dt>Role</dt>
          <dd>{user.role}</dd>
        </div> */}
      </dl>
    </section>
  );
}

export default ProfilePanel;
