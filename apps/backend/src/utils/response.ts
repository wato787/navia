import type { Context } from "hono";

import type { AppBindings } from "../types/app";

type SuccessBody<TData, TMeta> = TMeta extends undefined
  ? {
      data: TData;
    }
  : {
      data: TData;
      meta: TMeta;
    };

export const ok = <TData, TMeta = undefined>(
  c: Context<AppBindings>,
  data: TData,
  meta?: TMeta,
) => {
  const body = (
    meta === undefined
      ? { data }
      : {
          data,
          meta,
        }
  ) as SuccessBody<TData, TMeta>;
  return c.json(body, 200);
};

export const created = <TData>(c: Context<AppBindings>, data: TData) =>
  c.json({ data }, 201);

export const accepted = <TData>(c: Context<AppBindings>, data: TData) =>
  c.json({ data }, 202);

export const noContent = (c: Context<AppBindings>) => c.body(null, 204);
