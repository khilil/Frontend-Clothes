import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../../features/auth/authSlice";

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
    <section className="w-full text-[#1a1a1a]">
      {/* 🏛️ HEADER */}
      <div className="mb-10 md:mb-[60px] border-b border-black/[0.03] pb-10">
        <h2 className="text-5xl font-impact tracking-tight mb-3 text-black">Identity Registry</h2>
        <p className="text-black/30 text-[10px] uppercase tracking-[0.4em] font-black">
          {isEditing
            ? "Update your personal information"
            : "Manage your personal information"}
        </p>
      </div>

      {/* 📑 DATA CARD */}
      <div className="relative bg-white border border-black/[0.03] shadow-[0_40px_100px_rgba(0,0,0,0.03)] rounded-[2.5rem] p-6 sm:p-10 md:p-14 overflow-hidden group/card before:content-[''] before:absolute before:top-0 before:left-0 before:w-[2px] before:h-full before:bg-[#8b7e6d] before:shadow-[0_0_20px_rgba(139,126,109,0.2)] before:opacity-30">
        <h3 className="text-2xl font-impact tracking-tight text-black mb-12 uppercase">Personal Details</h3>

        {!isEditing ? (
          /* ================= VIEW MODE ================= */
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 md:gap-x-20 gap-y-8 md:gap-y-10">
              <ViewField label="Full Name" value={profile.fullName} />
              <ViewField label="Email Address" value={profile.email} />
              <ViewField label="Mobile Number" value={profile.mobile} />
              <ViewField label="Password" value={"••••••••"} />
              <ViewField
                label="Date of Birth"
                value={profile.dob ? new Date(profile.dob).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }) : "N/A"}
              />
              <ViewField label="Gender" value={profile.gender || "N/A"} />
            </div>

            <div className="mt-14 pt-10 border-t border-black/[0.03] flex flex-wrap gap-10">
              <button
                className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-[#8b7e6d] hover:text-black transition-all group/btn"
                onClick={() => setIsEditing(true)}
              >
                <span className="material-symbols-outlined text-xl group-hover/btn:rotate-12 transition-transform">edit_note</span>
                Edit Profile
              </button>

              <button className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-black/30 hover:text-black transition-all group/btn">
                <span className="material-symbols-outlined text-xl group-hover/btn:scale-110 transition-transform">shield_lock</span>
                Security Reset
              </button>

              <button className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-rose-500/60 hover:text-rose-600 transition-all group/btn ml-auto" onClick={handleLogout}>
                <span className="material-symbols-outlined text-xl group-hover/btn:translate-x-1 transition-transform">logout</span>
                Logout
              </button>
            </div>

          </>
        ) : (
          /* ================= EDIT MODE ================= */
          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 md:gap-x-20 gap-y-8 md:gap-y-10">
              <EditField
                label="Full Name"
                name="fullName"
                value={draft.fullName}
                onChange={handleChange}
              />

              <EditField
                label="Email Address"
                value={draft.email}
                disabled
              />

              <EditField
                label="Mobile Number"
                name="mobile"
                value={draft.mobile}
                onChange={handleChange}
              />

              <EditField
                label="Password"
                value={"••••••••"}
                disabled
                type="password"
              />

              <EditField
                label="Date of Birth"
                type="date"
                name="dob"
                value={draft.dob}
                onChange={handleChange}
              />

              <div className="flex flex-col gap-4">
                <label className="text-[9px] font-black uppercase tracking-[0.4em] text-[#8b7e6d]">Gender</label>
                <select
                  name="gender"
                  value={draft.gender}
                  onChange={handleChange}
                  className="appearance-none w-full bg-black/[0.02] border border-black/5 text-black px-6 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-[0.1em] transition-all duration-300 focus:outline-none focus:border-[#8b7e6d] focus:bg-black/[0.04]"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Rather not say">Rather not say</option>
                </select>
              </div>
            </div>

            <div className="mt-8 md:mt-[60px] pt-10 border-t border-black/[0.03] flex flex-col md:flex-row items-center gap-5 md:gap-8">
              <button type="submit" className="w-full md:w-auto bg-black text-white px-12 py-4.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-all duration-500 hover:bg-[#8b7e6d] hover:-translate-y-0.5 hover:shadow-[0_15px_35px_rgba(139,126,109,0.3)]">
                Save Changes
              </button>
              <button
                type="button"
                className="w-full md:w-auto bg-transparent border border-black/10 text-black/40 px-12 py-4.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] cursor-pointer transition-all duration-300 hover:border-black hover:text-black hover:bg-black/[0.02]"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 🔐 OPTIONS */}
      {!isEditing && (
        <div className="mt-10 md:mt-[60px] grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
          <div className="bg-white border border-black/[0.03] rounded-3xl md:rounded-[32px] p-8 md:p-10 relative overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.02)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_30px_70px_rgba(0,0,0,0.05)] hover:border-black/[0.06] group/opt">
            <div className="flex items-center gap-5 mb-6">
              <div className="w-[52px] h-[52px] bg-black/[0.02] border border-black/[0.03] rounded-xl flex items-center justify-center text-[#8b7e6d] transition-all duration-500 group-hover/opt:bg-black group-hover/opt:border-black group-hover/opt:text-white group-hover/opt:rotate-12">
                <span className="material-symbols-outlined">alternate_email</span>
              </div>
              <h4 className="font-impact text-xl uppercase tracking-[0.05em] text-black">Notification Preferences</h4>
            </div>

            <p className="text-[11px] text-black/30 leading-[1.8] mb-8 uppercase font-bold tracking-[0.1em]">
              Manage your marketing and order update emails.
            </p>
            <a href="#" className="text-[9px] font-black tracking-[0.3em] uppercase text-[#8b7e6d] flex items-center gap-3 transition-all duration-300 group-hover/opt:text-black group-hover/opt:gap-4 after:content-['→'] after:text-[14px]">Manage Notifications</a>
          </div>

          <div className="bg-white border border-black/[0.03] rounded-3xl md:rounded-[32px] p-8 md:p-10 relative overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.02)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_30px_70px_rgba(0,0,0,0.05)] hover:border-black/[0.06] group/opt">
            <div className="flex items-center gap-5 mb-6">
              <div className="w-[52px] h-[52px] bg-black/[0.02] border border-black/[0.03] rounded-xl flex items-center justify-center text-[#8b7e6d] transition-all duration-500 group-hover/opt:bg-black group-hover/opt:border-black group-hover/opt:text-white group-hover/opt:rotate-12">
                <span className="material-symbols-outlined">fingerprint</span>
              </div>
              <h4 className="font-impact text-xl uppercase tracking-[0.05em] text-black">Account Security</h4>
            </div>

            <p className="text-[11px] text-black/30 leading-[1.8] mb-8 uppercase font-bold tracking-[0.1em]">
              Manage your login sessions and account security.
            </p>
            <a href="#" className="text-[9px] font-black tracking-[0.3em] uppercase text-[#8b7e6d] flex items-center gap-3 transition-all duration-300 group-hover/opt:text-black group-hover/opt:gap-4 after:content-['→'] after:text-[14px]">Manage Security</a>
          </div>
        </div>
      )}
    </section>
  );
};

/* ================= HELPERS ================= */

const ViewField = ({ label, value }) => (
  <div className="flex flex-col gap-3">
    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-black/20">{label}</span>
    <span className="text-xl font-impact tracking-tight text-black uppercase leading-none">{value}</span>
  </div>
);

const EditField = ({ label, ...props }) => (
  <div className="flex flex-col gap-4">
    <label className="text-[9px] font-black uppercase tracking-[0.4em] text-[#8b7e6d]">{label}</label>
    <input {...props} className="bg-black/[0.02] border border-black/10 rounded-2xl px-8 py-5 text-black text-[12px] font-bold tracking-[0.1em] focus:border-[#8b7e6d] focus:bg-black/[0.04] transition-all outline-none" />
  </div>
);

export default Profile;
