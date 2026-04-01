import api from "./api";

/**
 * Team Management Service
 * Backend routes: /api/v1/users/team/*  (admin-only)
 */

// Get all employee/admin accounts
export const getTeamMembers = async () => {
    const response = await api.get("/users/team");
    return response.data;
};

// Create new employee account
export const createTeamMember = async (data) => {
    const response = await api.post("/users/team/create", data);
    return response.data;
};

// Update team member role or status
export const updateTeamMember = async (id, data) => {
    const response = await api.put(`/users/team/${id}`, data);
    return response.data;
};

// Delete / deactivate team member
export const deleteTeamMember = async (id) => {
    const response = await api.delete(`/users/team/${id}`);
    return response.data;
};

// Reset employee password (admin action)
export const resetTeamMemberPassword = async (id, newPassword) => {
    const response = await api.put(`/users/team/${id}/reset-password`, { newPassword });
    return response.data;
};
