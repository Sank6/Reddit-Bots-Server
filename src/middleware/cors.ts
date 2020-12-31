import {Request, Response, NextFunction} from 'express';

export default function(_: Request, res: Response, next: NextFunction) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    next();
}