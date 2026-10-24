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
  let message = "Something went wrong";
  const errorSources: { path: string; message: string }[] = [];

  const joinSources = () =>
    errorSources
      .map((e) => (e.path ? `${e.path}: ${e.message}` : e.message))
      .join(", ");

  // mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    Object.values(err.errors).forEach((error: any) => {
      errorSources.push({ path: error.path, message: error.message });
    });
    message = joinSources() || "Validation failed";
  }
  // duplicate key error
  else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern ?? {})[0] ?? "field";
    message = `Duplicate ${field} found`;
  }
  // zod error
  else if (err.name === "ZodError") {
    statusCode = 400;
    err.issues.forEach((issue: any) => {
      errorSources.push({
        path: issue.path.join("."),
        message: issue.message,
      });
    });
    message = joinSources() || "Validation failed";
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
    message,
    errorSources,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
