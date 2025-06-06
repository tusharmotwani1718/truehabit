// middleware/extractClientIp.js
const extractClientIp = (req, res, next) => {
    // Extract the client IP address
    const clientIp =
      req.headers["x-forwarded-for"]?.split(",")[0] || // Use X-Forwarded-For header if available
      req.headers["x-real-ip"] || // Fallback to X-Real-IP header
      req.ip; // Fallback to the request IP
  
    // Attach the client IP to the request object
    req.clientIp = clientIp;
  
    // Log the client IP for debugging
    // console.log("Client IP:", clientIp);
  
    next(); // Proceed to the next middleware or route handler
  };
  
export default extractClientIp;