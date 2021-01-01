import {Request, Response, NextFunction} from 'express';

export default function(req: Request, res: Response, next: NextFunction) {
    if (!req.isAuthenticated()) return res.status(403).json({success: false, error: "You aren't signed in."});
    else next()
}