/**
 * Utility function to log admin activity
 * @param {Object} options
 * @param {Object} options.req - Express request object
 * @param {String} options.action - Action performed (e.g., "CREATE_ADMIN", "SUSPEND_USER")
 * @param {String} options.targetType - Type of target entity ("Admin", "User", "Worker", "Complaint", "Department")
 * @param {String} options.targetId - Optional: ID of target entity
 * @param {String} options.remarks - Optional: Human-readable explanation
 * @param {Boolean} options.success - Whether action succeeded (default: true)
 * @param {Object} options.details - Optional: Additional context data
 */
const AdminActivity = require("../models/AdminActivity");

const logAdminActivity = async ({
  req,
  action,
  targetType,
  targetId = null,
  remarks = null,
  success = true,
  details = {},
}) => {
  try {
    // Extract admin info from request
    const adminId = req.admin?._id;
    const performedByRole = req.admin?.role || "admin"; // "admin" or "superadmin"

    // Validate required fields
    if (!adminId || !action || !targetType) {
      console.warn("⚠️ logAdminActivity: Missing required fields", {
        adminId,
        action,
        targetType,
      });
      return;
    }

    // Create activity log entry
    await AdminActivity.create({
      adminId,
      action,
      targetType,
      targetId,
      remarks,
      success,
      performedByRole,
      userAgent: req.headers["user-agent"] || null,
      details,
    });

    console.log(`✅ Activity logged: ${action} on ${targetType}`, {
      adminId,
      role: performedByRole,
      success,
    });
  } catch (error) {
    console.error("❌ Failed to log admin activity:", error);
    // Don't throw - activity logging should not break the main flow
  }
};

module.exports = logAdminActivity;

