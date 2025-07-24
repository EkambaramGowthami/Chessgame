
import jwt from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken";
const jwtSecret = process.env.JWT_SECRET as string;
export const VerityUser = (req: any, res: any, next: any) => {
    const token = req.cookies.authToken;
    console.log("Cookies received:", req.cookies);
    console.log("Auth token:", req.cookies.authToken);

    if (!token) {
        return res.status(401).json({ message: "Not authenticated" });

    }
    try {
        const decoded = jwt.verify(token, jwtSecret) as JwtPayload
        req.user = decoded;
        next();
    }
    catch (err) {
        res.status(403).json({ message: "Invalid token" });
    }

}