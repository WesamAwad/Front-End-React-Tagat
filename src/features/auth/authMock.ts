/** Start all page Mock API */
import type { ClientLoginRequest, ClientLoginResponse, ClientLogoutResponse } from "../../types/authTypes";

const MOCK_DELAY = 800;

const delay = () => new Promise((r) => setTimeout(r, MOCK_DELAY));

export async function mockLogin(body: ClientLoginRequest): Promise<{ data: ClientLoginResponse } | { error: { status: number; data: unknown } }> {
  await delay();

  if (!body.email || !body.password) {
    return {
      error: {
        status: 422,
        data: {
          errors: {
            ...(!body.email ? { email: ["حقل البريد الإلكتروني مطلوب."] } : {}),
            ...(!body.password ? { password: ["حقل كلمة المرور مطلوب."] } : {}),
          },
        },
      },
    };
  }

  if (body.email !== "test@test.com" || body.password !== "123456") {
    return {
      error: {
        status: 401,
        data: { message: "بيانات تسجيل الدخول غير صحيحة" },
      },
    };
  }

  return {
    data: {
      message: "تم تسجيل الدخول بنجاح",
      data: { first_name: "أحمد", last_name: "محمد" },
      token: "mock-token-swiftfix",
    },
  };
}

export async function mockLogout(): Promise<{ data: ClientLogoutResponse }> {
  await delay();
  return { data: { message: "تم تسجيل الخروج بنجاح" } };
}
