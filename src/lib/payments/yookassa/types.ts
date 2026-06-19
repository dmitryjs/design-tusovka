export type YookassaAmount = {
  value: string;
  currency: string;
};

export type YookassaConfirmation = {
  type: string;
  confirmation_url?: string;
  return_url?: string;
};

export type YookassaPayment = {
  id: string;
  status: string;
  paid: boolean;
  amount: YookassaAmount;
  confirmation?: YookassaConfirmation;
  description?: string;
  metadata?: Record<string, string>;
  created_at?: string;
  test?: boolean;
};

export type YookassaNotification = {
  type: "notification";
  event: string;
  object: YookassaPayment;
};

export type CreateYookassaPaymentResult =
  | {
      ok: true;
      code: "redirect" | "existing";
      redirectUrl: string;
      paymentId: string;
    }
  | {
      ok: false;
      code:
        | "payments_not_configured"
        | "unauthenticated"
        | "not_found"
        | "forbidden"
        | "invalid_status"
        | "empty_order"
        | "api_error";
      message: string;
    };

export type StartPaymentActionResult = CreateYookassaPaymentResult;
