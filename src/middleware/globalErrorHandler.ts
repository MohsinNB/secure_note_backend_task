/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";

import appError from "../utils/appError";

export const globalError = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  let statusCode = 500;
  let message = `something went wrong  from works`;

  const errorSources: any[] = [];
  // validation error handler
  if (err.name === "ValidationError") {
    statusCode = 400;
    const errors: any = Object.values(err.errors);

    errors.forEach((error: any) => {
      errorSources.push({
        path: error.path,
        message: error.message,
      });
    });
    // console.log("errorSources", errorSources);
    message = err.message;
  }
  // duplicate key error
  else if (err.code === 11000) {
    const matchArray = err.message.match(/"([^"]*)"/);
    console.log("matchArray", matchArray);
    statusCode = 409;
    message = `Duplicate ${matchArray[1]} found`;
  }
  // zod error
  else if (err.name === "ZodError") {
    statusCode = 400;
    const errors: any = err.issues;
    errors.forEach((element: any) => {
      errorSources.push({
        path: element.path[element.path.length - 1],
        message: element.message,
      });
    });

    message = err.message;
  }
  // cast error
  else if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid MongoDB objectId. Please provide a valid objectId";
  } else if (err instanceof appError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Error) {
    statusCode = 500;
    message = err.message;
  }
  res.status(statusCode).json({
    success: false,
    errorSources: errorSources,
    message: message,
    err,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
