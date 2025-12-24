export const isAdmin = (req, res, next) => {
    if(req.user.role?.toLowerCase() !== "admin") return res.status(403).json({ success: false, message: "Not allowed" });
    next()
}