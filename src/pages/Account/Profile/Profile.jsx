import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../../features/auth/authSlice";
import "./Profile.css";

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/");
  };

  const initialProfile = {
    fullName: user?.name || "Not Provided",
    email: user?.email || "Not Provided",
    mobile: user?.phone || "+91 XXXXX XXXXX",
    password: "••••••••••••",
    dob: "1998-05-24", // Placeholder
    gender: "Not Specified",
  };

  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(initialProfile);
  const [draft, setDraft] = useState(initialProfile);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDraft({ ...draft, [name]: value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    setProfile(draft);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraft(profile);
    setIsEditing(false);
  };

  return (
    <section className="profile-page">
      {/* 🏛️ HEADER */}
      <div className="profile-page-header">
        <h2 className="profile-page-title">Identity Registry</h2>
        <p className="profile-page-subtitle">
          {isEditing
            ? "Modification in progress. Ensure data integrity before synchronization."
            : "Authorized access to personal parameters and security protocols."}
        </p>
      </div>

      {/* 📑 DATA CARD */}
      <div className="profile-card">
        <h3 className="profile-card-title">Principal Parameters</h3>

        {!isEditing ? (
          /* ================= VIEW MODE ================= */
          <>
            <div className="profile-grid">
              <ViewField label="Identity Index" value={profile.fullName} />
              <ViewField label="Communication Node" value={profile.email} />
              <ViewField label="Mobile Signal" value={profile.mobile} />
              <ViewField label="Access Protocol" value={profile.password} />
              <ViewField
                label="Existence Timestamp"
                value={new Date(profile.dob).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              />
              <ViewField label="Genetic Trait" value={profile.gender} />
            </div>

            <div className="profile-actions-view">
              <button
                className="profile-action-btn"
                onClick={() => setIsEditing(true)}
              >
                <span className="material-symbols-outlined">edit_note</span>
                Modify Registry
              </button>

              <button className="profile-action-btn">
                <span className="material-symbols-outlined">shield_lock</span>
                Reset Protocol
              </button>

              <button className="profile-action-btn danger ml-auto" onClick={handleLogout}>
                <span className="material-symbols-outlined">logout</span>
                Terminal Shutdown
              </button>
            </div>

          </>
        ) : (
          /* ================= EDIT MODE ================= */
          <form onSubmit={handleSave}>
            <div className="profile-grid">
              <EditField
                label="Identity Index"
                name="fullName"
                value={draft.fullName}
                onChange={handleChange}
              />

              <EditField
                label="Communication Node"
                value={draft.email}
                disabled
              />

              <EditField
                label="Mobile Signal"
                name="mobile"
                value={draft.mobile}
                onChange={handleChange}
              />

              <EditField
                label="Access Protocol"
                value={draft.password}
                disabled
                type="password"
              />

              <EditField
                label="Existence Timestamp"
                type="date"
                name="dob"
                value={draft.dob}
                onChange={handleChange}
              />

              <div className="profile-field">
                <label>Genetic Trait</label>
                <select
                  name="gender"
                  value={draft.gender}
                  onChange={handleChange}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Redacted">Redacted</option>
                </select>
              </div>
            </div>

            <div className="profile-actions">
              <button type="submit" className="profile-save-btn">
                SYNCHRONIZE
              </button>
              <button
                type="button"
                className="profile-cancel-btn"
                onClick={handleCancel}
              >
                ABORT
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 🔐 OPTIONS */}
      {!isEditing && (
        <div className="profile-options">
          <div className="option-card">
            <div className="option-head">
              <div className="option-icon">
                <span className="material-symbols-outlined">alternate_email</span>
              </div>
              <h4>Signal Preferences</h4>
            </div>

            <p>
              Control incoming data regarding marketing synchronizations and transaction alerts.
            </p>
            <a href="#">Configure Signals</a>
          </div>

          <div className="option-card">
            <div className="option-head">
              <div className="option-icon">
                <span className="material-symbols-outlined">fingerprint</span>
              </div>
              <h4>Biometric Security</h4>
            </div>

            <p>
              Multi-factor authentication and management of active session traces across nodes.
            </p>
            <a href="#">Verify Identity</a>
          </div>
        </div>
      )}
    </section>
  );
};

/* ================= HELPERS ================= */

const ViewField = ({ label, value }) => (
  <div className="profile-field view">
    <span className="field-label">{label}</span>
    <span className="field-value">{value}</span>
  </div>
);

const EditField = ({ label, ...props }) => (
  <div className="profile-field">
    <label>{label}</label>
    <input {...props} />
  </div>
);

export default Profile;
