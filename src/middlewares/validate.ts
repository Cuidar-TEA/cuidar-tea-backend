import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodError, ZodIssue } from "zod";

const validate =
  (schema: ZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((issue: ZodIssue) => ({
          path: issue.path.join("."),
          message: issue.message,
        }));
        return res.status(400).json({ errors: formattedErrors });
      }
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  };

export default validate;
