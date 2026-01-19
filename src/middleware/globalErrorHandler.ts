import { NextFunction, Request, Response } from "express"
import { Prisma } from "../../generated/prisma/client";

function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) {
    return next(err)
  }
  let statusCode = 500;
  let errorMessage = "Internel server error";
  let errorDetails = err;

  // PrismaClientValidationError
  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    errorMessage = "You provide incorrect field type or missing fields";
  }

  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      statusCode = 400;
      errorMessage = "An operation failed"
    }
    else if(err.code === "P2002"){
      statusCode = 400
      errorMessage = "Duplicate key constrainet.."
    }
  }

  else if(err instanceof Prisma.PrismaClientUnknownRequestError){
    statusCode = 500;
    errorMessage = "Error occured during query execution"
  }


  res.status(statusCode)
  res.json({
    message: errorMessage,
    error: errorDetails
  })
}

export default errorHandler;
